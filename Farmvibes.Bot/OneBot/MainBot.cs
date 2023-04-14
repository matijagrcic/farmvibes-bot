// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using Microsoft.Bot.Builder;
using Microsoft.Bot.Schema;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using OneBot.Modules;
using OneBot.State;
using System.Linq;
using OneBot.Singletons;
using OneBot.Utilities;
using OneBot.Models;
using Microsoft.Extensions.Configuration;
using OneBot.Services;

namespace OneBot
{
    public class MainBot : ActivityHandler
    {
        private readonly BotState _conversationState;
        private readonly BotState _userState;
        private readonly IConfiguration _config;
        private readonly ContentService _contentService;
        private readonly UserService _userService;
        private readonly Navigation _navigation;
        private readonly InteractionsService _utilitiesService;
        private readonly PromptsHandlerService _promptsHandlerService;
        private readonly Messaging _messaging;

        public MainBot(ConversationState conversationState, UserState userState, IConfiguration config, 
            ContentService contentService, UserService userService, InteractionsService utilitiesService, PromptsHandlerService promptsHandlerService)
        {
            _conversationState = conversationState;
            _userState = userState;
            _config = config;
            _contentService = contentService;
            _userService = userService;
            _navigation = new Navigation(utilitiesService, contentService, promptsHandlerService);
            _utilitiesService = utilitiesService;
            _promptsHandlerService = promptsHandlerService;
            _messaging = new Messaging(config);
        }

        protected async override Task OnMessageActivityAsync(ITurnContext<IMessageActivity> turnContext, CancellationToken cancellationToken)
        {
            var conversationStateAccessors = _conversationState.CreateProperty<ConversationData>(nameof(ConversationData));
            var conversationData = await conversationStateAccessors.GetAsync(turnContext, () => new ConversationData(new JObject()));

            var userStateAccessors = _userState.CreateProperty<UserData>(nameof(UserData));
            var userProfile = await userStateAccessors.GetAsync(turnContext, () => new UserData(new JObject()));
            var response = new Dictionary<string, dynamic>();

            try
            {
                //If we received a string
                if (turnContext.Activity.Type == ActivityTypes.Message && !string.IsNullOrEmpty(turnContext.Activity.Text))
                {
                    string userInput;

                    //Let's check whether we need to re-authenticate
                    if (conversationData.Has("isAuthenticated") && conversationData.Get<bool>("isAuthenticated"))
                    {
                        string channel = turnContext.Activity.ChannelId;

                        if (_userService.ResetAuth(conversationData, response, userProfile, channel))
                        {
                            await SendContent(turnContext, cancellationToken, response, userProfile);
                            return;
                        }
                    }

                    //Lets check if we have options in state, that would mean that we sent user options and need to get input 
                    if (conversationData.Has("suggestedOptions") && conversationData.Get<JArray>("suggestedOptions").Count > 0)
                    {
                        var suggestedOptions = conversationData.Get<JArray>("suggestedOptions");
                        userInput = turnContext.Activity.Text;
                        userInput = TextFunctions.GetSelectedOption(suggestedOptions, userInput, userProfile, _contentService);
                        if (userInput != null)
                        {
                            conversationData.Remove("suggestedOptions");
                        }
                        else
                        {
                            userInput = turnContext.Activity.Text;
                        }
                    }
                    else
                    {
                        userInput = turnContext.Activity.Text;
                    }

                    var navigationDirection = userInput.ToLowerInvariant().Equals("reset") ? "reset" : _navigation.NavigationDirection(userInput.ToLowerInvariant(), userProfile.Get<string>("language"));

                    //We need to check whether we have a user object in state, if we don't, then we should check whether user is registered
                    //if user not in state                   
                    if (conversationData.Has("state"))
                    {
                        //If we're in registration and we asked user language, we should assign the value to be used from here henceforth
                        if (userProfile.language == null && conversationData.Get<JObject>("state").ContainsKey("subtype") && conversationData.Get<JObject>("state").Value<string>("subtype").Equals("registration"))
                        {
                            if (navigationDirection == "reset")
                            {
                                response = await HandleInteraction(conversationData, userProfile, userInput, navigationDirection);
                            }
                            else
                            {
                                var locale = _contentService.GetLocaleFromAvailableLanguages(userInput, conversationData.Get<JObject>("state"));
                                userProfile.Set("language", locale);
                                userProfile.language = locale;
                                userInput = userProfile.language;
                            }
                        }

                        if (userProfile.Get<string>("language") == null && userProfile.language != string.Empty)
                        {
                            userProfile.Set("language", userProfile.language);
                        }

                        //Does user want to navigate to main menu, go back, reset etc?
                        response = await HandleInteraction(conversationData, userProfile, userInput, navigationDirection);
                    }
                    else
                    {
                        //Let's set the channel information to state
                        ExtractChannelDetails(turnContext, userProfile);

                        if (conversationData.Has("isRegistered"))
                        {
                            if (conversationData.Has("isAuthenticating"))
                            {
                                string channel = turnContext.Activity.ChannelId;
                                string channelInfo = turnContext.Activity.From.Name;

                                _userService.AuthenticateUser(conversationData, channel, channelInfo, userProfile, userInput, response);
                                await SendContent(turnContext, cancellationToken, response, userProfile);

                                if (conversationData.Has("isAuthenticating"))
                                {
                                    return;
                                }
                            }

                            //User is navigating menu
                            response = _navigation.GetMenu(userInput, null, userProfile, conversationData.Get<bool>("hasBeenWelcomed"));
                            conversationData.Set("hasBeenWelcomed", response["state"].Value<bool>("hasBeenWelcomed"));
                        }
                        else//We have user in state. Here the user can only do three things 1. navigating menu, interacting with service or selected content so let us see where we re
                        {
                            //check if registered
                            if (_userService.IsRegistered(userProfile))
                            {
                                userProfile.Remove("service");

                                //Checks if we're authenticating a user
                                if (conversationData.Has("isAuthenticating"))
                                {
                                    string channel = turnContext.Activity.ChannelId;
                                    string channelInfo = turnContext.Activity.From.Name;

                                    _userService.AuthenticateUser(conversationData, channel, channelInfo, userProfile, userInput, response);
                                    await SendContent(turnContext, cancellationToken, response, userProfile);

                                    if (conversationData.Has("isAuthenticating"))
                                    {
                                        return;
                                    }

                                }
                                else if (!conversationData.Has("isAuthenticated") && turnContext.Activity.ChannelId != "emulator")
                                {
                                    response.Add("text",
                                        turnContext.Activity.ChannelId == "directline"
                                            ? DefaultsContainer.GetSingleObject()
                                                .Value<JObject>("authentication_details_sms")
                                                .Value<string>(userProfile.Get<string>("language"))
                                            : DefaultsContainer.GetSingleObject()
                                                .Value<JObject>("authentication_details_socials")
                                                .Value<string>(userProfile.Get<string>("language")));

                                    conversationData.Set("isAuthenticating", true);
                                    conversationData.Set("isRegistered", true);

                                    await SendContent(turnContext, cancellationToken, response, userProfile);
                                    return;
                                }

                                //if registration complete, show menu
                                response = _navigation.GetMenu(userInput, null, userProfile, conversationData.Get<bool>("hasBeenWelcomed"));
                                conversationData.Set("hasBeenWelcomed", response["state"].Value<bool>("hasBeenWelcomed"));
                            }
                            else
                            {
                                //Are we already in registration?
                                userProfile.Set("service", "UserRegistration");
                                response = _promptsHandlerService.GetServicePrompts(null, null);
                            }
                        }
                    }

                    //Let's update state data as a result of the operations that happened aove
                    if (response.ContainsKey("state"))
                    {
                        if (!conversationData.Has("hasBeenWelcomed") && response.ContainsKey("hasBeenWelcomed"))
                            conversationData.Set("hasBeenWelcomed", true);
                        conversationData.Set("state", response["state"]);
                    }

                    await SendContent(turnContext, cancellationToken, response, userProfile);

                    //Delete state values after user deletes themselves
                    if (response.ContainsKey("state") && response["state"].ContainsKey("userDeleted"))
                    {
                        response.Clear();
                        conversationData.RemoveAll();
                        userProfile.Clear();
                    }

                    //Do we need to show final menu?
                    if (response.ContainsKey("finalMenu"))
                    {
                        response["options"] = response["finalMenu"];
                        response.Remove("media");
                        var outgoingText = DefaultsContainer.GetSingleObject().Value<JObject>("final_menu_messages").Value<JArray>(userProfile.Get<string>("language")).OrderBy(qu => Guid.NewGuid()).First().ToString();
                        response["text"] = TextFunctions.PrepareOutput(outgoingText, userProfile);
                        conversationData.Set("suggestedOptions", JArray.FromObject(response["options"]));
                        conversationData.Get<JObject>("state").Remove("finalMenu");
                        await SendContent(turnContext, cancellationToken, response, userProfile);
                    }
                    //Are we going back to the main menu?
                    else if (response.ContainsKey("mainMenu"))
                    {
                        conversationData.Get<JObject>("state").Remove("finalMenu");
                        response = await HandleInteraction(conversationData, userProfile, userInput, navigationDirection);
                        await SendContent(turnContext, cancellationToken, response, userProfile);
                    }

                    //If we have options in response object, let's add items to state and also append back button option
                    if (response.ContainsKey("options"))
                    {
                        var options = JArray.FromObject(response["options"]);
                        conversationData.Set("suggestedOptions", options);
                    }

                }
            }
            catch(Exception ex)
            {
               var errorLogs = new ErrorHandler(_config);

                errorLogs.ErrorLogging(ex, turnContext.Activity.Conversation.Id, turnContext.Activity.ChannelId);

                if (userProfile.Get<string>("language") != null)
                {
                    response["text"] = errorLogs.SendErrorMessage(userProfile.Get<string>("language"));
                }
                else
                {
                    response["text"] = errorLogs.SendErrorMessage("en");
                }

                conversationData.Clear();
                userProfile.Clear();

                await SendContent(turnContext, cancellationToken, response, userProfile);

            }
        }
        /// <summary>
        /// Sends output to user in form of card with multimedia or text
        /// </summary>
        /// <param name="turnContext">TurnContext object that has sending messages</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <param name="content">Object that has various elements that determine the how the outgoing message will look like e.g. text, media, options</param>
        /// <param name="language">User's language which would determine factors like back button text</param>
        /// <returns></returns>
        public async Task SendContent(ITurnContext<IMessageActivity> turnContext, CancellationToken cancellationToken, Dictionary<string, dynamic> content, UserData userProfile)
        {
            try
            {
                if (content.ContainsKey("options") || content.ContainsKey("media"))
                {
                    //If we have any audio / video or images to send
                    var attachments = new List<Attachment>();
                    var output = MessageFactory.Attachment(attachments);
                    if (content.ContainsKey("media") && content["media"].Count > 0)
                    {
                        output = _messaging.SetMedia(userProfile, content);
                    }

                    if (content.ContainsKey("text") && content["text"] != null)
                    {
                        userProfile.Set("content", _messaging.SetText(content, userProfile));
                        output.Text = _messaging.SetText(content, userProfile);
                    }

                    //Do we have options for the user to select from?
                    if (content.ContainsKey("options") && content["options"].Count > 0)
                    {
                        var options = _messaging.SetOptions(content, userProfile, true);

                        output.SuggestedActions = _messaging.MessageActions(options, userProfile, true);
                    }
                    await turnContext.SendActivityAsync(output, cancellationToken: cancellationToken);
                }
                else
                {
                    //Do we have text to return to user?
                    if (!content.ContainsKey("text") || content["text"] == null)
                        return;

                    if (content["text"] is string)
                    {
                        await turnContext.SendActivityAsync(MessageFactory.Text(TextFunctions.PrepareOutput(content["text"], userProfile)), cancellationToken: cancellationToken);
                    }
                    else
                    {
                        foreach (string output in content["text"])
                        {
                            await turnContext.SendActivityAsync(MessageFactory.Text(TextFunctions.PrepareOutput(output, userProfile)), cancellationToken: cancellationToken);
                        }
                    }

                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message + "thrown at SendContent()", ex);
            }
        }

        public override async Task OnTurnAsync(ITurnContext turnContext, CancellationToken cancellationToken = default(CancellationToken))
        {
            try
            {
                await base.OnTurnAsync(turnContext, cancellationToken);
                await LogInteractionAsync(turnContext);
                // Save any state changes that might have occurred during the turn.
                await _conversationState.SaveChangesAsync(turnContext, false, cancellationToken);
                await _userState.SaveChangesAsync(turnContext, false, cancellationToken);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message + "thrown at OnTurnAsync()", ex);
            }

        }


        /// <summary>
        /// This function parses user input according to state and direction of navigation and returns response from the functions
        /// </summary>
        /// <param name="conversationData">Current conversation state</param>
        /// <param name="userProfile">Current user profile</param>
        /// <param name="input">user input</param>
        /// <param name="direction">Direction the user has decided to move with the interaction, this can be back, forward or menu</param>
        /// <returns></returns>
        public async Task<Dictionary<string, dynamic>> ParseInput(ConversationData conversationData, UserData userProfile, string input, string direction)
        {
            try
            {
                Dictionary<string, dynamic> response;
                var state = conversationData.Get<JObject>("state").Value<string>("state");
                var treeId = "";
                if (conversationData.Get<JObject>("state").ContainsKey("treeId"))
                    treeId = conversationData.Get<JObject>("state").Value<string>("treeId");

                switch (state)
                {
                    //User has selected a node that has content from the dynamic menu
                    case "content":
                        switch (direction)
                        {
                            case "back":
                                //We need to go to the preceeding branch
                                response = _navigation.NavigateBackFromContent(conversationData.Get<JObject>("state"), userProfile.Get<string>("language"));
                                break;
                            default:
                                response = _contentService.GetContent(conversationData.Get<JObject>("state").Value<JObject>("contentObj").Value<string>("id"), userProfile.Get<string>("language"), conversationData.Get<JObject>("state").Value<int>("currentContentId"));
                                userProfile.Set("contentId", conversationData.Get<JObject>("state").Value<JObject>("contentObj").Value<string>("id"));
                                break;
                        }
                        break;
                    //User selected a service node and is already going interacting with a service 
                    case "service":
                        if (conversationData.Get<JObject>("state").Value<bool>("finalMenu"))
                        {
                            response = _navigation.GetMenu(input, conversationData.Get<JObject>("state"), userProfile);
                            conversationData.Get<JObject>("state").Remove("finalMenu");
                        }
                        else
                        {
                            response =  await _promptsHandlerService.EvaluatePrompts(input, conversationData.Get<JObject>("state"), direction, userProfile);

                            if (response != null && response["state"].ContainsKey("logging") && response["state"].Value<bool>("logging"))
                            {
                                conversationData.data["SurveyResponses"] = true;
                                _utilitiesService.CreateInteraction("id", userProfile, conversationData);
                            }

                            //User is going back to the main menu
                            if (response["state"].Value<string>("state") == "menu")
                                response = _navigation.NavigateBackFromContent(response["state"], userProfile.Get<string>("language"));

                        }
                        break;
                    default:
                        switch (direction)
                        {
                            case "back":
                                //We need to go to the preceeding branch
                                response = _navigation.NavigateBackFromContent(conversationData.Get<JObject>("state"), userProfile.Get<string>("language"));
                                break;
                            default:
                                //User is navigating menu
                                response = _navigation.GetMenu(input, conversationData.Get<JObject>("state"), userProfile, conversationData.Get<bool>("hasBeenWelcomed"));
                                conversationData.Set("state", response["state"]);
                                if (!conversationData.Has("hasBeenWelcomed"))
                                    conversationData.Set("hasBeenWelcomed", response["state"].Value<bool>("hasBeenWelcomed"));

                                if (conversationData.Get<JObject>("state").ContainsKey("contentObj"))
                                {
                                    userProfile.Set("branchId", conversationData.Get<JObject>("state").Value<JObject>("contentObj").Value<string>("id"));
                                    if (!conversationData.Get<JObject>("state").ContainsKey("newBranch"))
                                    {
                                        conversationData.Get<JObject>("state").Add("newBranch", true);
                                    }
                                    else
                                    {
                                        conversationData.Get<JObject>("state")["newBranch"] = false;
                                    }
                                }

                                if (conversationData.Get<JObject>("state").ContainsKey("contentObj"))
                                    userProfile.Set("branchId", conversationData.Get<JObject>("state").Value<JObject>("contentObj").Value<string>("id"));

                                if (!response.ContainsKey("state"))
                                    response.Remove("state");
                                break;
                        }
                        break;
                }
                if (response.ContainsKey("state") &&
                    ((JObject)response["state"]).HasValues &&
                    response["state"]["treeId"] == null &&
                    !response["state"]["service"].ToString().ToLowerInvariant().Equals("registration"))
                {
                    response["state"].Add("treeId", treeId);
                    conversationData.Set("state", response["state"]);
                }
                return response;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message + "thrown at ParseInput()", ex);

            }
        }

        /// <summary>
        /// Handles user interaction with input after the first user response is received
        /// </summary>
        /// <param name="conversationData">Current conversation state</param>
        /// <param name="userProfile">Current user object</param>
        /// <param name="userInput">Input from user</param>
        /// <returns>Returns a response object which will have "text", "options", "media" and other custom keys to handle conversation</returns>
        public async Task<Dictionary<string, dynamic>> HandleInteraction(ConversationData conversationData, UserData userProfile, string userInput, string navigationDirection)
        {
            try
            {
                _userService.UserLastActivityTimeStampElapsed(userProfile);

                var response = new Dictionary<string, dynamic>();

                switch (navigationDirection)
                {
                    case "reset":
                        if (conversationData.Get<JObject>("state").Value<string>("state") == "service" && conversationData.Get<JObject>("state").Value<string>("serviceType") == "Registration")
                            userProfile.Clear();

                        conversationData.Clear();
                        //resets to main menu
                        response = new Dictionary<string, dynamic>() { { "text", "Conversation has been reset" } };
                        break;
                    case "menu":
                        conversationData.Clear();
                        //resets to main menu
                        response = _navigation.GetMenu(userInput, null, userProfile, conversationData.Get<bool>("hasBeenWelcomed"));
                        break;
                    case "back":
                        response = await ParseInput(conversationData, userProfile, userInput, navigationDirection);
                        break;
                    default:
                        if (conversationData.Has("suggestedOptions") && conversationData.Get<JArray>("suggestedOptions").Count > 0)
                        {
                            var suggestedOptions = conversationData.Get<JArray>("suggestedOptions");
                            userInput = TextFunctions.GetSelectedOption(suggestedOptions, userInput, userProfile, _contentService);
                        }
                        if (userInput != null)
                        {
                            var parseInput = true;

                            if (conversationData.Has("state") && conversationData.Get<JObject>("state").Count > 0)
                            {
                                var state = conversationData.Get<JObject>("state");
                                //check if we have any prompts to validate users input against.
                                if (state.ContainsKey("prompts"))
                                {
                                    var prompts = state.Value<JArray>("prompts").ToObject<List<Question>>();
                                    var validationResults = TextFunctions.ValidateInput(prompts, userInput, userProfile.Get<string>("language"));

                                    //Do we have error messages to show the user?
                                    if (validationResults.Count > 0)
                                    {
                                        response.Add("text", validationResults);
                                        parseInput = false;
                                    }
                                }
                            }
                            if (parseInput)
                            {
                                response = await ParseInput(conversationData, userProfile, userInput, navigationDirection);
                            }
                        }
                        else
                        {
                            response.Add("text", DefaultsContainer.GetSingleObject().Value<JObject>("index_outof_range").Value<string>(userProfile.Get<string>("language")));

                            if (conversationData.Has("suggestedOptions"))
                                response.Add("options", conversationData.Get<JArray>("suggestedOptions"));
                            response["state"] = conversationData.Get<JObject>("state");
                        }
                        break;
                }
                return response;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message + "thrown at HandleInteraction()", ex);
            }
        }

        /// <summary>
        /// This extracts channel information and appends it to the user profile object
        /// </summary>
        /// <param name="turnContext">Turn context</param>
        /// <param name="userData">User object</param>
        public void ExtractChannelDetails(ITurnContext<IMessageActivity> turnContext, UserData userData)
        {
            try
            {
                userData.Set("channelId", turnContext.Activity.From.Id);
                var channel = turnContext.Activity.ChannelId == "directline" ? turnContext.Activity.From.Name : turnContext.Activity.ChannelId.ToLowerInvariant();

                userData.Set("channel", channel);

                //Get internal portal Id for channel
                userData.Set("channelPortalId", _contentService.GetChannelId(channel));
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message + "thrown at ExtractChannelDetails()", ex);
            }
        }


        /// <summary>
        /// Interaction logs are updated to the database here.
        /// </summary>
        /// <param name="turnContext"></param>
        /// <returns></returns>
        public async Task<int> LogInteractionAsync(ITurnContext turnContext)
        {
            try
            {
                var conversationStateAccessors = _conversationState.CreateProperty<ConversationData>(nameof(ConversationData));
                var conversationData = await conversationStateAccessors.GetAsync(turnContext, () => new ConversationData(new JObject()));

                var userStateAccessors = _userState.CreateProperty<UserData>(nameof(UserData));
                var userProfile = await userStateAccessors.GetAsync(turnContext, () => new UserData(new JObject()));
                
                if (!userProfile.Has("id"))
                    return -1;

                if (conversationData.Has("state"))
                {
                    // just update interaction if the interaction object has already been created. 
                    if (conversationData.Get<JObject>("state").ContainsKey("completed") || (userProfile.Has("interactions") && userProfile.Get<JObject>("interactions").ContainsKey("branchId")))
                    {
                        conversationData.Get<JObject>("state").Add("updateInteraction", true);
                        await _utilitiesService.UpdateInteractionAsync(userProfile, conversationData);
                    }
                    else
                    {
                        _utilitiesService.CreateInteraction(turnContext.Activity.Conversation.Id, userProfile, conversationData);
                    }
                }

                userProfile.Remove("service");

                return -1;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message + "thrown at LogInteractionAsync()", ex);
            }

        }
    }
}