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
using OneBot.Database;
using Microsoft.Extensions.Configuration;
using OneBot.Models;
using System.Net.Http;
using Microsoft.Extensions.Logging;
using System.Text;

namespace OneBot
{
    public class MainBot : ActivityHandler
    {
        private BotState _conversationState;
        private BotState _userState;
        private readonly IConfiguration _config;
        private ILogger<MainBot> _logger;

        public MainBot(ConversationState conversationState, UserState userState, IConfiguration config, ILogger<MainBot> logger)
        {
            _conversationState = conversationState;
            _userState = userState;
            _config = config;
            _logger = logger;
        }

        protected override async Task OnMessageActivityAsync(ITurnContext<IMessageActivity> turnContext, CancellationToken cancellationToken)
        {
            var conversationStateAccessors = _conversationState.CreateProperty<ConversationData>(nameof(ConversationData));
            var conversationData = await conversationStateAccessors.GetAsync(turnContext, () => new ConversationData(new JObject()));

            var userStateAccessors = _userState.CreateProperty<UserData>(nameof(UserData));
            var userProfile = await userStateAccessors.GetAsync(turnContext, () => new UserData(new JObject()));
            var userFunctions = new UserFunctions(_config);
            var response = new Dictionary<string, dynamic>();

            try
            {
                //If we received a string
                if (turnContext.Activity.Type == ActivityTypes.Message && !string.IsNullOrEmpty(turnContext.Activity.Text))
                {

                    var userInput = turnContext.Activity.Text;

                    //Lets check if we have options in state, that would mean that we sent user options and need to get input 
                    if (conversationData.Has("suggestedOptions") && conversationData.Get<JArray>("suggestedOptions").Count > 0)
                    {
                        var suggestedOptions = conversationData.Get<JArray>("suggestedOptions");
                        userInput = TextFunctions.GetSelectedOption(suggestedOptions, userInput, userProfile);
                        if (userInput != null)
                        {
                            conversationData.Remove("suggestedOptions");
                        }
                        else
                        {
                            userInput = turnContext.Activity.Text;
                        }
                    }

                    var navigationDirection = userInput.ToLowerInvariant().Equals("reset") ? "reset" : Navigation.NavigationDirection(userInput.ToLowerInvariant(), userProfile.Get<string>("language"));

                    //We need to check whether we have a user object in state, if we don't, then we should check whether user is registered
                    //if user not in state                   
                    if (conversationData.Has("state"))
                    {
                        //If we're in registration and we asked user language, we should assign the value to be used from here henceforth
                        if (userProfile.language == null && conversationData.Get<JObject>("state").ContainsKey("subtype") && conversationData.Get<JObject>("state").Value<string>("subtype").Equals("registration"))
                        {
                            if (navigationDirection == "reset")
                            {
                                response = HandleInteraction(conversationData, userProfile, userInput, navigationDirection);
                            }
                            else
                            {
                                var locale = ContentFetch.GetLocaleFromAvailableLanguages(userInput, conversationData.Get<JObject>("state"));
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
                        response = HandleInteraction(conversationData, userProfile, userInput, navigationDirection);
                    }
                    else
                    {
                        //Let's set the channel information to state
                        ExtractChannelDetails(turnContext, userProfile);

                        if (conversationData.Has("isRegistered"))
                        {
                            //ct.CreateConnectionInstance();
                            //User is navigating menu
                            response = Navigation.GetMenu(userInput, null, userProfile, conversationData.Get<bool>("hasBeenWelcomed"));
                            conversationData.Set("hasBeenWelcomed", response["state"].Value<bool>("hasBeenWelcomed"));
                        }
                        else//We have user in state. Here the user can only do three things 1. navigating menu, interacting with service or selected content so let us see where we re
                        {
                            //check if registered
                            if (UserFunctions.IsRegistered(userProfile))
                            {
                                userProfile.Remove("service");

                                //if registration complete, show menu
                                response = Navigation.GetMenu(userInput, null, userProfile, conversationData.Get<bool>("hasBeenWelcomed"));
                                conversationData.Set("hasBeenWelcomed", response["state"].Value<bool>("hasBeenWelcomed"));
                                conversationData.Set("isRegistered", true);
                            }
                            else
                            {
                                //Are we already in registration?
                                userProfile.Set("service", "UserRegistration");
                                response = PromptsHandler.GetServicePrompts(null, null);
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

                    //Do we need to show final menu?
                    if (response.ContainsKey("finalMenu"))
                    {
                        response["options"] = response["finalMenu"];
                        response.Remove("media");
                        var outgoingText = DefaultsContainer.GetSingleObject().Value<JObject>("final_menu_messages").Value<JArray>(userProfile.Get<string>("language")).OrderBy(qu => Guid.NewGuid()).First().ToString();
                        response["text"] = TextFunctions.PrepareOutput(outgoingText, userProfile);
                        conversationData.Set("suggestedOptions", JArray.FromObject(response["options"]));
                        await SendContent(turnContext, cancellationToken, response, userProfile);
                    }
                    //Are we going back to the main menu?
                    else if (response.ContainsKey("mainMenu"))
                    {
                        response = HandleInteraction(conversationData, userProfile, userInput, navigationDirection);
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
            catch (Exception ex)
            {
                var exception = new Exception(ex.Message, ex);

                var errorLogs = new ErrorLogs();
                response["text"] = errorLogs.SendErrorMessage(userProfile.Get<string>("language"));
                await SendContent(turnContext, cancellationToken, response, userProfile);

                throw exception;
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
            if (content.ContainsKey("options") || content.ContainsKey("media"))
            {
                //If we have any audio / video or images to send
                var attachments = new List<Attachment>();
                var output = MessageFactory.Attachment(attachments);
                if (content.ContainsKey("media") && content["media"].Count > 0)
                {
                    output = Messaging.SetMedia(userProfile, content);
                }

                if (content.ContainsKey("text") && content["text"] != null)
                {
                    userProfile.Set("content", Messaging.SetText(content, userProfile));
                    output.Text = Messaging.SetText(content, userProfile);
                }

                //Do we have options for the user to select from?
                if (content.ContainsKey("options") && content["options"].Count > 0)
                {
                    var options = Messaging.SetOptions(content, userProfile, true);

                    output.SuggestedActions = Messaging.MessageActions(options, userProfile, true);
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

        public override async Task OnTurnAsync(ITurnContext turnContext, CancellationToken cancellationToken = default(CancellationToken))
        {
            await base.OnTurnAsync(turnContext, cancellationToken);

            await LogInteractionAsync(turnContext);

            // Save any state changes that might have occurred during the turn.
            await _conversationState.SaveChangesAsync(turnContext, false, cancellationToken);
            await _userState.SaveChangesAsync(turnContext, false, cancellationToken);
        }


        /// <summary>
        /// This function parses user input according to state and direction of navigation and returns response from the functions
        /// </summary>
        /// <param name="conversationData">Current conversation state</param>
        /// <param name="userProfile">Current user profile</param>
        /// <param name="input">user input</param>
        /// <param name="direction">Direction the user has decided to move with the interaction, this can be back, forward or menu</param>
        /// <returns></returns>
        public Dictionary<string, dynamic> ParseInput(ConversationData conversationData, UserData userProfile, string input, string direction)
        {
            var response = new Dictionary<string, dynamic>();
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
                            response = Navigation.NavigateBackFromContent(conversationData.Get<JObject>("state"), userProfile.Get<string>("language"));
                            break;
                        default:
                            response = ContentFetch.GetContent(conversationData.Get<JObject>("state").Value<JObject>("contentObj").Value<string>("id"), userProfile.Get<string>("language"), conversationData.Get<JObject>("state").Value<int>("stateContentId"), userProfile.Get<string>("channel"));
                            userProfile.Set("contentId", conversationData.Get<JObject>("state").Value<JObject>("contentObj").Value<string>("id"));
                            break;
                    }
                    break;
                //User selected a service node and is already going interacting with a service 
                case "service":
                    if (conversationData.Get<JObject>("state").Value<bool>("finalMenu"))
                    {
                        response = Navigation.GetMenu(input, conversationData.Get<JObject>("state"), userProfile);
                        conversationData.Get<JObject>("state").Remove("finalMenu");
                    }
                    else
                    {
                        response = PromptsHandler.EvaluatePrompts(input, conversationData.Get<JObject>("state"), direction, userProfile);
                        if (response["state"].Value<bool>("logging"))
                        {
                            conversationData.data["SurveyResponses"] = true;

                            var utils = new Utils();
                            utils.CreateInteractionAsync("id", userProfile, conversationData);
                        }

                        //User is going back to the main menu
                        if (response["state"].Value<string>("state") == "menu")
                            response = Navigation.NavigateBackFromContent(response["state"], userProfile.Get<string>("language"));

                    }
                    break;
                default:
                    switch (direction)
                    {
                        case "back":
                            //We need to go to the preceeding branch
                            response = Navigation.NavigateBackFromContent(conversationData.Get<JObject>("state"), userProfile.Get<string>("language"));
                            break;
                        default:
                            //User is navigating menu
                            response = Navigation.GetMenu(input, conversationData.Get<JObject>("state"), userProfile, conversationData.Get<bool>("hasBeenWelcomed"));
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

        /// <summary>
        /// Handles user interaction with input after the first user response is received
        /// </summary>
        /// <param name="conversationData">Current conversation state</param>
        /// <param name="userProfile">Current user object</param>
        /// <param name="userInput">Input from user</param>
        /// <returns>Returns a response object which will have "text", "options", "media" and other custom keys to handle conversation</returns>
        public Dictionary<string, dynamic> HandleInteraction(ConversationData conversationData, UserData userProfile, string userInput, string navigationDirection)
        {
            UserFunctions.UserLastActivityTimeStampElapsed(userProfile);
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
                    response = Navigation.GetMenu(userInput, null, userProfile, conversationData.Get<bool>("hasBeenWelcomed"));
                    break;
                case "back":
                    response = ParseInput(conversationData, userProfile, userInput, navigationDirection);
                    break;
                default:
                    if(conversationData.Has("suggestedOptions") && conversationData.Get<JArray>("suggestedOptions").Count > 0)
                    {
                        var suggestedOptions = conversationData.Get<JArray>("suggestedOptions");
                        userInput = TextFunctions.GetSelectedOption(suggestedOptions, userInput, userProfile);
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
                            response = ParseInput(conversationData, userProfile, userInput, navigationDirection);
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

        /// <summary>
        /// This extracts channel information and appends it to the user profile object
        /// </summary>
        /// <param name="turnContext">Turn context</param>
        /// <param name="userData">User object</param>
        public void ExtractChannelDetails(ITurnContext<IMessageActivity> turnContext, UserData userData)
        {
            userData.Set("channelId", turnContext.Activity.From.Id);
            string channel;
            if (turnContext.Activity.ChannelId == "directline")
                channel = turnContext.Activity.From.Name;
            else
                channel = turnContext.Activity.ChannelId.ToLowerInvariant();

            userData.Set("channel", channel);

            //Get internal portal Id for channel
            userData.Set("channelPortalId", PortalFunctions.GetChannelId(channel));
        }


        /// <summary>
        /// Interaction logs are updated to the database here.
        /// </summary>
        /// <param name="turnContext"></param>
        /// <returns></returns>
        public async Task<int> LogInteractionAsync(ITurnContext turnContext)
        {
            var conversationStateAccessors = _conversationState.CreateProperty<ConversationData>(nameof(ConversationData));
            var conversationData = await conversationStateAccessors.GetAsync(turnContext, () => new ConversationData(new JObject()));

            var userStateAccessors = _userState.CreateProperty<UserData>(nameof(UserData));
            var userProfile = await userStateAccessors.GetAsync(turnContext, () => new UserData(new JObject()));

            string serviceId;
            string branchId;
            string contentId;

            Utils utils = new Utils();

            if (!userProfile.Has("id"))
                return -1;

            if (userProfile.Has("service"))
                serviceId = userProfile.Get<string>("serviceId");
            else if (userProfile.Has("contentId"))
                contentId = userProfile.Get<string>("contentId");
            else if (userProfile.Has("branchId"))
                branchId = userProfile.Get<string>("branchId");
            // just update interaction if the interaction object has already been created. 
            else if (conversationData.Get<JObject>("state").ContainsKey("completed") || (userProfile.Has("interactions") && userProfile.Get<JObject>("interactions").ContainsKey("branchId")))
                await utils.UpdateInteractionAsync(turnContext.Activity.Conversation.Id, userProfile, conversationData);
            else
                await utils.CreateInteractionAsync(turnContext.Activity.Conversation.Id, userProfile, conversationData);

            userProfile.Remove("service");

            return -1;
        }
    }
}