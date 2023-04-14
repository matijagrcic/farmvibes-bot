using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using OneBot.State;
using OneBot.Singletons;

namespace OneBot.Utilities
{
    public class Utils
    {
        /// <summary>
        /// Create interaction object in botstate for concise logging for graphing purposes
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="service"></param>
        /// <param name="conversationEntry"></param>
        public async Task<int> CreateInteractionAsync(string conversationId, UserData userProfile, ConversationData conversationData)
        {
            try
            {
                string branchId;
                var responses = new JObject();

                if (TextFunctions.GetBotConfig("logging").Value<bool>("interactions"))
                {
                    var interaction = new JObject();

                    var activityObj = userProfile.Has("interactions") ? userProfile.Get<JObject>("interactions").ToObject<Dictionary<string, object>>() : new Dictionary<string, object>();

                    if (activityObj.Count == 0)
                    {
                        InteractionsUpdateField(userProfile, "created_at", DateTime.Now.ToLocalTime().ToString("yyyy-MM-dd H:mm:ss"));
                    }

                    InteractionsUpdateField(userProfile, "conversationId", conversationId);

                    //user is not registered
                    if (!activityObj.ContainsKey("user"))
                    {
                        InteractionsUpdateField(userProfile, "userId", userProfile.Get<string>("id"));
                        InteractionsUpdateField(userProfile, "language", userProfile.Get<string>("language"));
                        InteractionsUpdateField(userProfile, "channel", userProfile.Get<string>("channel"));
                    }
                    if (conversationData.Get<JObject>("state").Value<bool>("newBranch"))
                    {
                        branchId = userProfile.Get<string>("branchId");
                    }

                    branchId = conversationData.Get<JObject>("state").Value<string>("nodeId");

                    InteractionsUpdateField(userProfile, "branchId", branchId);
                    InteractionsUpdateField(userProfile, "responses", responses);
                    InteractionsUpdateField(userProfile, "end_at", DateTime.Now.ToLocalTime().ToString("yyyy-MM-dd H:mm:ss"));

                    activityObj = userProfile.Get<JObject>("interactions").ToObject<Dictionary<string, object>>();

                    var columnsArray = activityObj.Keys.ToArray();
                }

                return -1;
            }
            catch (Exception ex)
            {
                var exception = new Exception(ex.Message, ex);

                throw exception;

            }
        }


        /// <summary>
        /// Update interaction log after user selection
        /// </summary>
        /// <param name="values"></param>
        /// <returns></returns>
        public async Task<int> UpdateInteractionAsync(string conversationId, UserData userProfile, ConversationData conversationData)
        {
            try
            {
                var values = conversationData.Get<JObject>("values");
                if (TextFunctions.GetBotConfig("logging").Value<bool>("interactions"))
                {
                    JObject interaction = userProfile.data.Value<JObject>("interactions");

                    if (conversationData.Get<JObject>("state").ContainsKey("state") && !conversationData.Get<JObject>("state").Value<string>("state").Equals("mainMenu"))
                        interaction["branchId"] = conversationData.Get<JObject>("state").Value<string>("nodeId");

                    if (values != null)
                    {
                        foreach (var value in values)
                        {
                            interaction.Value<JObject>("responses").Add(value.Key, value.Value);
                        }
                    }

                    userProfile.data["interactions"] = interaction;
                    InteractionsUpdateField(userProfile, "end", DateTime.Now.ToLocalTime().ToString("yyyy-MM-dd H:mm:ss"));

                    //upload to db after survey
                    if (conversationData.Get<JObject>("state").Value<bool>("finalMenu"))
                    {
                        // add responses from log survey data 
                        JObject surveyData = conversationData.Get<JObject>("state").Value<JObject>("surveyObject");
                        InteractionsUpdateField(userProfile, "responses", surveyData);

                        var interactionObj = userProfile.Get<JObject>("interactions");
                        var apiHelper = new APIHelper(UserFunctions._config["ContentAppUrl"], "application/json", PortalFunctions.GetToken().Result);
                        var result = apiHelper.Post<JObject>("interactions", interactionObj).Result;
                        conversationData.Get<JObject>("state").Remove("surveyObject");
                        conversationData.Get<JObject>("state").Remove("finalMenu");
                    }
                }
                return -1;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                throw;
            }

        }

        /// <summary>
        /// Interaction fields key values for the user are updated in this method.
        /// </summary>
        /// <param name="userProfile"> User profile object where to update the interactions.</param>
        /// <param name="key"></param>
        /// <param name="value"></param>
        public static void InteractionsUpdateField(UserData userProfile, string key, object value)
        {
            try
            {
                var dict = userProfile.Has("interactions") ? userProfile.Get<JObject>("interactions").ToObject<Dictionary<string, object>>() : new Dictionary<string, object>();

                if (!dict.ContainsKey(key))
                {
                    dict.Add(key, value);
                }
                dict[key] = value;

                userProfile.Set("interactions", JObject.FromObject(dict));
            }
            catch (Exception ex)
            {
                var exception = new Exception(ex.Message, ex);

                throw exception;
            }
        }

        /// <summary>
        /// this function collects input from surveys and builds a data object that will be added to the interactions file
        /// </summary>
        /// <param name="state">current state</param>
        /// <param name="input">user's entry</param>
        /// <param name="userProfile">User profile object where to update the interactions</param>
        public static void LogSurveyData(JObject state, string input, UserData userProfile)
        {
            try
            {
                var prompt = state.Value<JArray>("prompts").Where(prompt => prompt.Value<bool>("isCompleted")).Last();
                var question_id = prompt.Value<string>("id");
                if (state.ContainsKey("surveyObject"))
                {
                    if (!state.Value<JObject>("surveyObject").ContainsKey(question_id))
                        state.Value<JObject>("surveyObject").Add(question_id, input);
                    else
                        state.Value<JObject>("surveyObject")[question_id] = input;
                }
                else
                {
                    var data = new JObject();
                    data.Add(question_id, input);
                    state.Add("surveyObject", data);
                }
            }
            catch (Exception ex)
            {
                var exception = new Exception(ex.Message, ex);
                throw exception;
            }
        }


        /// <summary>
        /// Get messages from defaults file and if it doesn't exist we default to English.
        /// </summary>
        /// <param name="key"></param>
        /// <param name="language"></param>
        /// <returns></returns>
        public static string GetDefaultsContainerMessages(string key, string language)
        {
            var message = string.Empty;
            var random = new Random();

            var defaultsObject = DefaultsContainer.GetSingleObject().Value<JObject>(key)[language];

            if (defaultsObject != null)
            {
                if (defaultsObject.Type == JTokenType.String)
                {
                    string text = (string)defaultsObject;
                    message = text;
                }
                else
                {
                    var defaultsArr = defaultsObject.ToObject<JArray>();

                    var randomMessage = defaultsArr[random.Next(0, defaultsArr.Count)];
                    message = randomMessage.ToString();
                }
            }
            else
            {
                var defaultsObjectInEnglish = DefaultsContainer.GetSingleObject().Value<JObject>(key)["en"];

                if (defaultsObjectInEnglish.Type == JTokenType.String)
                {
                    message = (string)defaultsObjectInEnglish;
                }
                else
                {
                    var defaultsArr = defaultsObjectInEnglish.ToObject<JArray>();

                    var randomMessage = defaultsArr[random.Next(0, defaultsArr.Count)];
                    message = randomMessage.ToString();
                }
            }

            return message;
        }

        /// <summary>
        /// Checks if a node has children
        /// </summary>
        /// <param name="node"></param>
        /// <returns>Boolean value</returns>
        public static Boolean BranchHasChildren(JObject node)
        {
            if (node.SelectToken("type").Value<string>("name") == "branch" && !node["children"].HasValues)
                return false;

            return true;
        }
    }
}

