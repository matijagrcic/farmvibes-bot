using Newtonsoft.Json.Linq;
using OneBot.State;
using OneBot.Utilities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OneBot.Services
{
    public class InteractionsService
    {
        private readonly PortalService _portalService;
        
        public InteractionsService(PortalService portalService)
        {
            _portalService = portalService;
        }

        /// <summary>
        /// Create interaction object in bot state for concise logging for graphing purposes
        /// </summary>
        /// <param name="conversationId"></param>
        /// <param name="userProfile">User state</param>
        /// <param name="conversationData">Conversation state</param>
        public int CreateInteraction(string conversationId, UserData userProfile, ConversationData conversationData)
        {
            try
            {
                string branchId;
                var responses = new JObject();

                if (TextFunctions.GetBotConfig("logging").Value<bool>("interactions"))
                {
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
                    branchId = conversationData.Get<JObject>("state").Value<bool>("newBranch") ? userProfile.Get<string>("branchId") : conversationData.Get<JObject>("state").Value<string>("nodeId");

                    InteractionsUpdateField(userProfile, "branchId", branchId);
                    InteractionsUpdateField(userProfile, "responses", responses);
                    InteractionsUpdateField(userProfile, "end_at", DateTime.Now.ToLocalTime().ToString("yyyy-MM-dd H:mm:ss"));
                }
                return -1;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message + "thrown at CreateInteractionAsync()", ex);
            }
        }

        /// <summary>
        /// Update interaction log after user selection
        /// </summary>
        /// <param name="values"></param>
        /// <returns></returns>
        public async Task<int> UpdateInteractionAsync(UserData userProfile, ConversationData conversationData)
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

                    var state = conversationData.Get<JObject>("state");

                    //upload to db after survey                    
                    if (conversationData.Get<JObject>("state").Value<bool>("updateInteraction"))
                    {
                        if (state.Value<string>("state").Equals("mainMenu"))
                        {
                            // add responses from log survey data 
                            JObject surveyData = conversationData.Get<JObject>("state").Value<JObject>("surveyObject");
                            InteractionsUpdateField(userProfile, "responses", surveyData);

                            var interactionObj = userProfile.Get<JObject>("interactions");
                            await _portalService.PostAsync("interactions", interactionObj);
                            
                            conversationData.Get<JObject>("state").Remove("surveyObject");
                            conversationData.Get<JObject>("state").Remove("finalMenu");
                        }

                        conversationData.Get<JObject>("state").Remove("updateInteraction");
                    }
                }
                return -1;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message + "thrown at UpdateInteractionAsync()", ex);
            }

        }

        /// <summary>
        /// Interaction fields key values for the user are updated in this method.
        /// </summary>
        /// <param name="userProfile"> User profile object where to update the interactions.</param>
        /// <param name="key"></param>
        /// <param name="value"></param>
        private void InteractionsUpdateField(UserData userProfile, string key, object value)
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
                throw new Exception(ex.Message + "thrown at InteractionsUpdateField()", ex);

            }
        }
    }
}

