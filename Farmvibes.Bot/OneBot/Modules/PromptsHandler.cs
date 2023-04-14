// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using Newtonsoft.Json.Linq;
using OneBot.Models;
using OneBot.Singletons;
using OneBot.State;
using OneBot.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using Org.BouncyCastle.Asn1.Ocsp;

namespace OneBot.Modules
{
    public class PromptsHandler
    {

        /// <summary>
        /// Gets the prompts of the service with the parsed ID
        /// </summary>
        /// <param name="id">Service ID from when a user selects a service</param>
        /// <param name="userProfile">User's profile data to the user's preferred language</param>
        /// <param name="state">Current state if exists</param>
        /// <returns>Response object with prompts</returns>
        public static Dictionary<string, dynamic> GetServicePrompts(string id, UserData userProfile, JObject state = null)
        {
            Service service;
            int stateContentId = 0;
            string language = null;
            var contentDict = new Dictionary<Int64, List<JObject>>();
            var conclusion = new JObject();
            var outgoing = new StringBuilder();
            var serviceType = string.Empty;

            if (state != null && state.ContainsKey("stateContentId"))
            {
                stateContentId = state.Value<int>("stateContentId");
            }

            try
            {
                contentDict = ContentFetch.GetContentUsingId(stateContentId, "service");
                stateContentId = (int)contentDict.FirstOrDefault().Key;

                if (userProfile != null && userProfile.Has("language"))
                {
                    language = userProfile.Get<string>("language");
                }

                var serviceTypesDict = ContentFetch.GetContentUsingId(stateContentId, "service_types");

                //check if we're in registration
                if (id == null || id == "Registration")
                {
                    serviceType = "Registration";
                    var userRegId = serviceTypesDict.FirstOrDefault().Value.FirstOrDefault(x => x.Value<string>("name").Equals(serviceType)).Value<string>("id");
                    service = contentDict.FirstOrDefault().Value.FirstOrDefault(item => item.Value<string>("type").Substring(item.Value<string>("type").LastIndexOf('/') + 1).ToString().Equals(userRegId)).ToObject<Service>();
                }
                else
                {
                    service = contentDict.FirstOrDefault().Value.FirstOrDefault(item => item.Value<string>("id").Equals(id)).ToObject<Service>();
                    serviceType = serviceTypesDict.FirstOrDefault().Value.FirstOrDefault(x => x.Value<string>("id").Equals(service.type.Substring(service.type.LastIndexOf('/') + 1).ToString())).Value<string>("name");
                }

                if (service == null)
                {
                    return null;
                }

                if (state == null)
                {
                    state = new JObject();
                }

                service.questions = service.questions.OrderBy(question => question.position).ToList();

                state["prompts"] = JArray.FromObject(service.questions);
                state["state"] = "service";
                state["subtype"] = service.subtype.name;
                state["serviceType"] = serviceType;
                state["service"] = service.name;
                state["singleAccess"] = service.singleAccess;
                state["backAfterCompletion"] = service.backAfterCompletion;
                state["questionId"] = service.questions.First<Question>().id;
                state["stateContentId"] = stateContentId;

                if (language != null)
                {
                    outgoing.AppendLine(service.translations.Value<JObject>(language).Value<string>("introduction"));
                    outgoing.AppendLine(service.questions.First<Question>().translations.Value<JObject>().Value<JObject>(language).Value<string>("question"));
                    conclusion.Add(language, service.translations.Value<JObject>(language).Value<string>("conclusion"));
                }
                else
                {
                    foreach (var intro in service.translations.Properties())
                    {
                        outgoing.AppendLine(intro.Value.Value<string>("introduction"));
                        outgoing.AppendLine(service.questions.First<Question>().translations.Value<JObject>(intro.Name).Value<string>("question"));
                        conclusion.Add(intro.Name, service.translations.Value<JObject>(intro.Name).Value<string>("conclusion"));
                    }
                }
                state["conclusionMessage"] = conclusion;

                var options = new List<QuestionOption>();

                //We need to check if question option type is of look-up type.
                if (service.questions.First<Question>().contentLookUp != null && service.questions.First<Question>().contentLookUp.First != null)
                {
                    options = QuestionOptionsFromLookup(service.questions.First<Question>().contentLookUp.ToObject<JArray>(), state, userProfile);
                }
                else
                {
                    options = service.questions.First<Question>().questionOptions;
                }

                return new Dictionary<string, dynamic>() { { "text", outgoing.ToString() }, { "options", options }, { "media", service.questions.First<Question>().media }, { "state", state } };
            }

            catch (Exception ex)
            {
                var exception = new Exception(ex.Message, ex);
                throw exception;
            }
        }

        /// <summary>
        /// Evaluate user response and determine the next prompt that will be presented to the user
        /// </summary>
        /// <param name="input">User input</param>
        /// <param name="state">Current state object</param>
        /// <param name="direction">Direction which the user intends to move</param>
        /// <param name="userProfile">User profile object</param>
        /// <returns></returns>
        public static Dictionary<string, dynamic> EvaluatePrompts(string input, JObject state, string direction, UserData userProfile)
        {
            try
            {
                var response = new Dictionary<string, dynamic>();
                if (state.ContainsKey("prompts"))
                {
                    var prompts = state.Value<JArray>("prompts").ToObject<List<Question>>();
                    var evaluations = PresentPrompts(prompts, direction, input, userProfile, state);

                    if (evaluations.ContainsKey("direction") && evaluations.ContainsKey("state") && evaluations.Value<string>("state") == "menu")
                    {
                        var treeId = state.Value<string>("treeId");
                        var nodeId = state.Value<string>("nodeId");

                        state = new JObject();

                        state["treeId"] = treeId;
                        state["nodeId"] = nodeId;
                        state["state"] = "menu";
                        response["state"] = state;
                    }
                    else
                    {
                        //If we did not update state, let's use the previous
                        if (!evaluations.ContainsKey("state"))
                            evaluations.Add("state", state.Value<string>("state"));

                        evaluations.Properties().ToList().ForEach(property =>
                        {
                            state[property.Name] = property.Value;
                        });

                        if (evaluations["currentPrompt"] != null && evaluations["currentPrompt"].HasValues)
                        {
                            //As in registration before we have language selected, we have a temporary placeholder. So let's get the correct object
                            if (evaluations.Value<JObject>("currentPrompt").ContainsKey("temp"))
                            {
                                evaluations["currentPrompt"] = GeneratePromptObject(evaluations.Value<JObject>("currentPrompt").Value<JArray>("temp"), userProfile.Get<string>("language"), evaluations.Value<JObject>("currentPrompt"), evaluations.Value<JObject>("currentPrompt").Value<string>("lookup"));
                            }

                            //Options could be external lookups so if empty, and we have a look-up key, let's get them
                            if (evaluations.Value<JObject>("currentPrompt").ContainsKey("lookup") && evaluations.Value<JObject>("currentPrompt").Value<string>("lookup") != null)
                            {
                                var jsonOptions = GetSuggestionsFromJson(evaluations.Value<List<Question>>("prompts"), userProfile.Get<string>("language"));

                                evaluations["currentPrompt"]["options"] = JArray.FromObject(jsonOptions);
                            }

                            var sanitized = ReplacePromptPlaceholders(evaluations["currentPrompt"].ToObject<Question>().translations.Value<JObject>(userProfile.Get<string>("language")).Value<string>("question"), evaluations["prompts"].ToObject<List<Question>>());
                            response.Add("text", sanitized);

                            if (state.ContainsKey("invalidOption"))
                            {
                                var text = Utils.GetDefaultsContainerMessages("selectedoption_error", userProfile.Get<string>("language"));
                                response["text"] = text;
                                state.Remove("invalidOption");
                                state.Add("direction", "back");
                            }

                            if (evaluations["currentPrompt"].ToObject<Question>().questionOptions.Count > 0)
                                response.Add("options", JArray.FromObject(evaluations["currentPrompt"].ToObject<Question>().questionOptions));

                            if (evaluations["currentPrompt"].ToObject<Question>().media.Count > 0)
                                response.Add("media", JArray.FromObject(evaluations["currentPrompt"].ToObject<Question>().media));

                            if (evaluations["currentPrompt"].ToObject<Question>().contentLookUp != null && evaluations["currentPrompt"].ToObject<Question>().contentLookUp.Count != 0)
                            {
                                var info = evaluations["currentPrompt"].ToObject<Question>().contentLookUp;

                                if (response.ContainsKey("options"))
                                    response.Remove("options");

                                response.Add("options", QuestionOptionsFromLookup(info, state, userProfile));
                            }

                            response.Add("state", state);

                            // log survey data if node subtype is survey
                            if (state.Value<string>("subtype") == "default" && !state.ContainsKey("direction"))
                            {
                                Utils.LogSurveyData(state, input, userProfile);
                            }

                            if (state.ContainsKey("direction"))
                            {
                                state.Remove("direction");
                            }
                        }
                        else
                        {
                            //We need to reach out to service file to perform any action required after the completion of prompts
                            switch (state.Value<string>("subtype"))
                            {
                                case "registration":
                                    var user = UserFunctions.CompleteRegistration(state.Value<JArray>("prompts"), userProfile);
                                    if (user != default)
                                    {
                                        response["isRegistered"] = true;
                                        response["hasBeenWelcomed"] = true;
                                        state["state"] = "menu";
                                        state.Remove("finalMenu");
                                        state.Remove("service");
                                        state.Remove("treeId");
                                    }
                                    break;
                                default:
                                    // log survey data for survey subtype                                 
                                    Utils.LogSurveyData(state, input, userProfile);
                                    break;
                            }

                            response["text"] = state.Value<JObject>("conclusionMessage").Value<string>(userProfile.Get<string>("language"));

                            if (state.Value<bool>("backAfterCompletion"))
                            {
                                var finalMenuoptions = DefaultsContainer.GetSingleObject().Value<JObject>("final_menu_options").Value<JArray>(userProfile.Get<string>("language")).ToList();
                                var optionList = new List<QuestionOption>();
                                foreach (var text in finalMenuoptions)
                                {
                                    optionList.Add(new QuestionOption { value = text.ToString() });
                                }
                                optionList.Add(new QuestionOption { value = state.Value<string>("service") });
                                response.Add("finalMenu", optionList);
                            }
                            else
                            {
                                state.Remove("conclusionMessage");
                                state.Remove("serviceType");
                                state.Remove("subtype");
                                state.Remove("backAfterCompletion");
                                state.Remove("singleAccess");
                                state.Remove("state");
                                state.Remove("nodeId");
                            }

                            state.Remove("currentPrompt");
                            state.Remove("stateContentId");
                            state.Remove("prompts");
                            state.Remove("questionId");
                            response["mainMenu"] = true;
                            response["state"] = state;
                            return response;
                        }
                        if (state != null && state.ContainsKey("treeId"))
                            response["treeId"] = state.Value<string>("treeId");
                    }
                }
                return response.Count() > 0 ? response : null;
            }
            catch (Exception ex)
            {
                var exception = new Exception(ex.Message, ex);

                throw exception;
            }
        }

        /// <summary>
        /// This function replaces placeholders in outgoing text with the values provided by the user. 
        /// The placeholders are in the for of $[promptname] where [promptname] is the name of the prompt from which value will be retrieved
        /// </summary>
        /// <param name="textItems">Array of text going out to the user</param>
        /// <param name="prompts">List of prompts from where we will need to get values</param>
        /// <returns></returns>
        public static string ReplacePromptPlaceholders(string textItem, List<Question> prompts)
        {
            try
            {
                var output = new StringBuilder();

                if (textItem.Contains("$"))
                {
                    var placeholders = Regex.Matches(textItem, @"\$\w+").ToList();
                    placeholders.ForEach(placeholder =>
                    {
                        //We have to skip if placeholder is name because that's the placeholder for name and we are only interested in values
                        if (prompts.Any(prompt => prompt.isCompleted && prompt.isEnabled && prompt.question.Equals(placeholder.ToString().Substring(1))))
                        {
                            var promptValue = prompts.FirstOrDefault(prompt => prompt.isCompleted && prompt.isEnabled && prompt.question.Equals(placeholder.ToString().Substring(1))).value;
                            var replacedText = textItem.ToString().Replace(placeholder.ToString(), promptValue);
                            output.Append(replacedText);
                        }
                        else
                        {
                            output.Append(textItem);
                        }
                    });
                }
                else
                {
                    output.Append(textItem);
                }

                return output.ToString();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                throw;
            }
        }


        /// <summary>
        /// Presents prompts in order of question
        /// Checks whether the prompt has been answered and in which direction the user is navigating towards
        /// </summary>
        /// <param name="prompts">Question prompts</param>
        /// <param name="direction">User's navigation, which can be either back or front</param> 
        /// <param name="input">User'sinput</param> 
        /// <returns></returns>
        public static JObject PresentPrompts(List<Question> prompts, string direction, string input, UserData userProfile, JObject state)
        {
            var finalState = new JObject();
            var currentPrompt = prompts.Where(prompt => !prompt.isCompleted).FirstOrDefault();
            var language = userProfile.Get<string>("language");
            var currentIndex = prompts.IndexOf(currentPrompt);

            if (language == input)
                currentPrompt.questionOptions.Clear();

            if (direction == "back")
            {
                finalState.Add("direction", "back");

                if (currentIndex > 0)
                {
                    prompts[currentIndex - 1].isCompleted = false;
                    prompts[currentIndex - 1].isEnabled = true;
                }
                else
                {
                    finalState.Add("state", "menu");
                    return finalState;
                }
            }
            else
            {

                // check if user selected multiple options separated by a comma to know how to set the current prompt value
                var chosenOptions = input.Split(",");
                bool multipleOptions = false;

                if (chosenOptions.Length > 1)
                {
                    foreach (string option in chosenOptions)
                    {
                        if (currentPrompt.questionOptions.Any(x => x.translations.SelectToken(language).Value<string>("value").ToLowerInvariant().Equals(option.ToLowerInvariant())))
                            multipleOptions = true;
                        else
                            multipleOptions = false;
                    }
                }

                if (currentPrompt.questionOptions.Count > 0 && !multipleOptions)
                {
                    if (currentPrompt.questionOptions.Where(x => x.translations != null &&
                    x.translations.SelectToken(language).Value<string>("value").ToLowerInvariant() == input.ToLowerInvariant()).Any())
                    {
                        currentPrompt.value = currentPrompt.questionOptions.Where(x => x.translations != null &&
                        x.translations.SelectToken(language).Value<string>("value").ToLowerInvariant() == input.ToLowerInvariant()).First().id.ToString();
                    }
                    else
                    {
                        finalState.Add("invalidOption", true);
                        finalState.Add("prompts", JArray.FromObject(prompts));
                        finalState["currentPrompt"] = JObject.FromObject(prompts.Where(prompt => !prompt.isCompleted).FirstOrDefault());
                        return finalState;
                    }
                }
                else if (currentPrompt.contentLookUp != null && currentPrompt.contentLookUp.Count > 0 &&
                    currentPrompt.contentLookUp.Value<string>("entity") == "locations")
                {
                    int stateContentId = state.ContainsKey("stateContentId") ? state.Value<int>("stateContentId") : 0;

                    var locationId = ContentFetch.GetContentUsingId(stateContentId, "locations").First().Value.Where(x =>
                    x.Value<string>("name").ToLowerInvariant().Replace(" ", "").Replace("-", "").Trim() ==
                    input.ToLowerInvariant().Replace(" ", "").Replace("-", "").Trim()).First().Value<string>("id");

                    currentPrompt.value = locationId;
                }
                else
                {
                    currentPrompt.value = input;
                }

                currentPrompt.isCompleted = true;

                //Let's check if we're at the end
                if (prompts.Last() == currentPrompt)
                    finalState.Add("finalMenu", true);
                else
                    //Check whether conditions have been met for the field to be asked.
                    prompts = ValidatePromptConditions(prompts);
            }

            finalState.Add("prompts", JArray.FromObject(prompts));

            if (!finalState.Value<bool>("finalMenu"))
                finalState["currentPrompt"] = JObject.FromObject(prompts.Where(prompt => !prompt.isCompleted && prompt.isEnabled).FirstOrDefault());

            return finalState;
        }

        /// <summary>
        /// This functions validates prompt conditions to confirm if the prompt will be enabled and therefore presented to the user or not
        /// </summary>
        /// <param name="prompts">List of prompts</param>
        /// <returns></returns>
        private static List<Question> ValidatePromptConditions(List<Question> prompts)
        {
            foreach (var field in prompts.Where(x => !x.isCompleted))
            {
                if (!ValidateFieldConditions(prompts, field))
                    field.isEnabled = false;
                else
                    field.isEnabled = true;
            }
            return prompts;
        }

        /// <summary>
        /// Validates conditions to be met before displaying prompt fields within an intent 
        /// </summary>
        /// <param name="fields"> prompts within the intents</param>
        /// <param name="field">conditions set for the prompt</param>
        /// <returns></returns>
        public static bool ValidateFieldConditions(List<Question> fields, Question field)
        {
            var conditions = field.questionValidations;

            if (conditions == null || conditions.Count == 0 || fields.All(x => !x.isCompleted))
                return true;

            var matches = new List<bool>();

            //Match conditions from prompt responses
            //if (conditions.ContainsKey("fields")
            //{
            //   matches = MatchByFieldValues(conditions.Value<JArray>("fields"), field);
            //}

            return true;
            // return matches.Count > 0 && matches.All(x => x == true);
        }

        public static JObject GeneratePromptObject(JArray prompts, string language, JObject promptObj, string lookup = null)
        {
            var prompt = prompts.FirstOrDefault(item => item.Value<string>("language").Equals(language));
            if (prompt != null)
            {
                if (prompt.Value<JArray>("options").Count > 0)
                {
                    promptObj.Add("options", prompt.Value<JArray>("options"));
                }
                if (prompt.Value<JArray>("media").Count > 0)
                {
                    promptObj.Add("media", prompt.Value<JArray>("media"));
                }

                promptObj.Add("text", new JArray() { prompt.Value<string>("text") });

                if (promptObj.ContainsKey("temp"))
                    promptObj.Remove("temp");
            }
            return promptObj;
        }

        /// <summary>
        /// Get content suggestion for user properties e.g. location. This function will check for properties filtered any existing user profile field except name and telephone number
        /// </summary>
        /// <param name="context">Bost state</param>
        /// <param name="column">Column to be returned</param>
        /// <returns></returns>
        public static List<string> GetSuggestionsFromJson(List<Question> prompts, string language)
        {
            try
            {
                //Get current prompt
                var currentPrompt = prompts.FirstOrDefault(prompt => !prompt.isCompleted && prompt.isEnabled);

                var file = currentPrompt.questionValidations.Where(x => x.Equals("lookup"));

                //Lets open file to be looked up
                var results = FileFunctions.ReadContentFile<List<JObject>>(file + ".json");

                //If user is not registered, we cannot filter values by profile so let's try prompts
                var validPrompts = prompts.Where(x => x.isEnabled && x.isCompleted && ValidateFieldConditions(prompts, x)).ToList();

                if (validPrompts != null)
                {
                    foreach (var child in validPrompts)
                    {
                        JArray values = values = JArray.FromObject(child.value.ToLowerInvariant().Split(','));
                        if (values.Count > 0 && results.Any(y => y.ContainsKey(child.question)))
                        {
                            results = results.Where(y => y.ContainsKey(child.question)).Where(x =>
                             x[child.question].Type.ToString().Equals("String") ?
                                 values.ToList().Contains(x.Value<string>(child.question).ToLowerInvariant())
                                 :
                                 values.ToList().Contains(x.Value<JObject>(child.question).Value<string>(language).ToLowerInvariant())

                                 ).ToList();
                        }
                    }
                }
                //Let's also filter content from information in the user's property

                return results.Select(item => item.Value<string>(currentPrompt.question)).Distinct().ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                throw;
            }
        }

        /// <summary>
        /// This method is used to run a search query on a list of objects and returns list
        /// of objects matching the condition in the query argument. 
        /// </summary>
        /// <param name="query">Query which will be parsed for conditions to match</param>
        /// <param name="obj">JObject object to look for the conditons to match</param>
        /// <returns>JObject list having items that have a matched condition</returns>
        private static List<JObject> EvaluateLookUpQuery(List<JObject> obj, string query)
        {

            if (query != null && obj.Count > 0)
            {

                var filters = query.Split('&');

                foreach (var filter in filters)
                {
                    var condition = filter.Split('=');
                    obj = obj.Where(x => x.ContainsKey(condition[0]) && x.GetValue(condition[0]).Value<string>() == condition[1]).ToList();
                }
            }

            return obj;
        }
        /// <summary>
        /// This function retrieves a list of question option from an entity.
        /// </summary>
        /// <param name="info">Json object having key and value to be used for quering data</param>
        /// <param name="state">Json object for passing the latest updated database index</param>
        /// <returns></returns>
        private static List<QuestionOption> QuestionOptionsFromLookup(JArray info, JObject state, UserData userProfile)
        {
            var options = new List<QuestionOption>();
            int stateContentId = 0;
            string language = null;

            if (userProfile != null && userProfile.Has("language"))
            {
                language = userProfile.Get<string>("language");
            }

            var filterQuery = info.Value<string>("filters");

            if (state != null && state.ContainsKey("stateContentId"))
            {
                stateContentId = state.Value<int>("stateContentId");
            }

            var root = ContentFetch.GetContentUsingId(stateContentId, info.Value<string>("entity")).FirstOrDefault().Value.ToList<JObject>();

            var previousQuestionId = string.Empty;

            //check if we need to get the value from the previous question
            if (info.First.ToObject<JObject>().ContainsKey("field") && info.Value<string>("field") != null)
            {
                previousQuestionId = info.Value<string>("field");
            }

            var userValue = string.Empty;

            if (previousQuestionId != string.Empty)
            {
                JArray prompts = state.Value<JArray>("prompts");

                userValue = prompts.Where(x => x.Value<string>("id") == previousQuestionId).FirstOrDefault().Value<string>("value");
            }

            if (userValue != string.Empty)
            {
                filterQuery = filterQuery + userValue;
            }
            //check if the query string passed is empty
            if ((filterQuery != null) && (filterQuery.Length > 0))
            {
                root = EvaluateLookUpQuery(root, filterQuery);
            }

            foreach (var child in root)
            {
                //does this object have translations?
                if (child.ContainsKey("translations") && language != null)
                {
                    //extract the translated object based on the user's languge.
                    var item = child.SelectToken("translations").SelectToken(language);
                    options.Add(new QuestionOption { value = item.SelectToken(info.Value<string>("key")).ToString() });
                }
                else
                {
                    options.Add(new QuestionOption { value = child.SelectToken(info.Value<string>("key")).ToString() });
                }
            }
            return options;
        }
    }
}
