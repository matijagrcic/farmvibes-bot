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
using System.Threading.Tasks;

namespace OneBot.Services
{
    public class UserService
    {
        private readonly PortalService _portalService;

        public UserService(PortalService portalService)
        {
            _portalService = portalService;
        }

        /// <summary>
        /// Completes user registration one all questions have been successfully completed
        /// </summary>
        /// <param name="prompts">All registration questions complete with respones</param>
        /// <param name="userProfile">User data</param>
        /// <returns>Positive integer if transaction was succesful</returns>
        public async Task<JObject> CompleteRegistration(JArray prompts, UserData userProfile)
        {
            var questions = prompts.ToObject<List<Question>>();
            var channelId = userProfile.Get<string>("channelId");
            var botUserObject = new JObject() { { "status", "completedRegistration" } };
            var profile = new JArray();
            try
            {
                var tag = new Dictionary<string, JArray>();

                if (questions != null)
                {
                    foreach (var question in questions)
                    {
                        if (question.value != null)
                        {
                            if (question.isSystem)
                            {
                                if (question.questionTag != null)
                                {
                                    var tagName = question.questionTag.Value<string>("name");
                                    var obj = new JObject();
                                    obj["questionId"] = question.id;
                                    obj["questionValueId"] = question.value;

                                    if (tag.ContainsKey(tagName))
                                    {
                                        tag[tagName].Add(question.value);
                                    }
                                    else
                                    {
                                        tag.Add(tagName, new JArray());
                                        tag[tagName].Add(obj);
                                    }
                                }
                                else
                                {
                                    botUserObject[question.description] = question.value;
                                }
                            }
                            else
                            {
                                var profileObj = new JObject();
                                profileObj["questionId"] = question.id;
                                profileObj["questionValueId"] = question.value;
                                profile.Add(profileObj);
                            }
                        }

                        if (question.description != null && !userProfile.Has(question.description))
                        {
                            userProfile.Set(question.description, question.value);
                        }
                    }
                }

                botUserObject.Add("profile", profile);
                userProfile.Set("profile", profile);

                //Channel data
                var channelObj = new JObject() { { "value", channelId }, { "channel", $"/api/channels/{userProfile.Get<string>("channelPortalId")}" } };
                botUserObject.Add("botUserContacts", new JArray() { channelObj });
                userProfile.Set("firstname", userProfile.Get<string>("fullname").Split(' ').First());
                
                var result = await _portalService.PostAsync("/api/bot_users", botUserObject);
                userProfile.Set("id", result.Value<string>("id"));

                return result;

            }
            catch (Exception ex)
            {
                var exception = new Exception(ex.Message, ex);

                throw exception;
            }
        }

        /// <summary>
        /// Get's the user object data
        /// </summary>
        /// <param name="userChannelValue">User identifier from channel</param>
        /// <param name="channelId"></param>
        /// <returns></returns>
        private async Task<JArray> GetUser(string userChannelValue, string channelId)
        {
            try
            {
                var url = $"bot_users?botUserContacts.value={userChannelValue}&botUserContacts.channel_id={channelId}";
                var result = await _portalService.GetAsync<JArray>(url);
                return result.Count == 0 ? null : result;
            }

            catch (Exception ex)
            {
                //If user doesn't exist, result will be 404
                if (ex.Message.Contains("404"))
                {
                    return null;
                }
                
                var exception = new Exception(ex.Message, ex);
                throw exception;
            }
        }

        /// <summary>
        /// Checks whether user is registered or not. If registered, profile is loaded into bot context
        /// </summary>
        /// <returns>Boolean whether user is registered or not</returns>
        public bool IsRegistered(UserData userProfile, string status = null)
        {
            if (userProfile == null)
            {
                throw new ArgumentNullException(nameof(userProfile));
            }

            try
            {
                var userCheck = GetUser(userProfile.Get<string>("channelId"), (userProfile.Get<string>("channelPortalId"))).Result;

                if (userCheck == null)
                {
                    userProfile.Set("registered", false);
                    return false;
                }
                var user = userCheck.FirstOrDefault()?.ToObject<JObject>();

                foreach (var userProp in user.Properties())
                {
                    userProfile.Set(userProp.Name, userProp.Value);
                }
                
                userProfile.Set("registered", true);
                var name = userProfile.Get<string>("fullname").Split(' ');
                userProfile.Set("firstname", name.First());
                userProfile.Set("surname", name.Last());

                return true;
            }
            catch (Exception ex)
            {
                var exception = new Exception(ex.Message, ex);

                throw exception;
            }
        }
        /// <summary>
        /// Convert datetime object to unix time stamp
        /// </summary>
        /// <param name="datetime">DateTime object</param>
        /// <returns></returns>
        private long ConvertToUnixTime(DateTime datetime)
        {
            var sTime = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);

            return (long)(datetime - sTime).TotalSeconds;
        }

        /// <summary>
        /// Convert unix timestamp to C# DateTime Object
        /// </summary>
        /// <param name="unixtime">Timestamp</param>
        /// <returns></returns>
        public static DateTime UnixTimeToDateTime(long unixtime)
        {
            var sTime = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            return sTime.AddSeconds(unixtime);
        }
        /// <summary>
        /// Checks if time difference in seconds between two consecutive user activities is greater than the specified time in seconds.
        /// </summary>
        /// <param name="userProfile">UserData userProfile</param>
        /// <returns>True if activity time window difference is greater than seconds otherwise False</returns>
        public bool UserLastActivityTimeStampElapsed(UserData userProfile)
        {
            var timeElapsed = false;

            try
            {
                //Time in seconds to check elapsed time against
                var seconds = TextFunctions.GetBotConfig("logging").Value<int>("interactionsinterval");

                if (userProfile.Get<bool>("registered"))
                {
                    var unixseconds = ConvertToUnixTime(DateTime.Now);
                    if (!userProfile.Has("userlastinteractiontimestamp"))
                    {
                        userProfile.Set("userlastinteractiontimestamp", unixseconds);
                    }
                    else
                    {
                        unixseconds = userProfile.Get<long>("userlastinteractiontimestamp");
                    }

                    var result = ConvertToUnixTime(DateTime.Now) - unixseconds;

                    if (result >= seconds)
                    {
                        timeElapsed = true;
                        //The key value property 'UserFirstInteractionState' is updated
                        userProfile.Set("userfirstinteractionstate", timeElapsed);
                        userProfile.Set("userlastinteractiontimestamp", ConvertToUnixTime(DateTime.Now));
                    }
                    userProfile.Set("userfirsttimevisittoday", timeElapsed);
                }

            }
            catch (Exception ex)
            {
                var exception = new Exception(ex.Message, ex);

                throw exception;
            }
            return timeElapsed;
        }

        /// <summary>
        /// Compares the input value given during authentication with the user contact value in the db
        /// </summary>
        /// <param name="userProfile"></param>
        /// <param name="channel"></param>
        /// <param name="authenticationInput"></param>
        /// <param name="channelInfo"></param>
        /// <returns></returns>
        private bool Authenticate(UserData userProfile, string channel, string authenticationInput, string channelInfo)
        {
            var isAuthenticated = false;

            if (channel == "directline")
            {
                var userDigits = userProfile.Get<JObject>("botUserContacts").Value<string>("value");

                if (authenticationInput.Trim().ToLower() == userDigits.Substring(userDigits.Length - 4))
                {
                    isAuthenticated = true;
                }
            }
            else
            {
                if (authenticationInput.Trim() == channelInfo)
                {
                    isAuthenticated = true;
                }
            }

            return isAuthenticated;
        }

        /// <summary>
        /// User needs to be reauthenticated after every hour, so this resets the status if the user's timer has elapsed
        /// </summary>
        /// <param name="conversationData"></param>
        /// <param name="response"></param>
        /// <param name="userProfile"></param>
        /// <returns></returns>
        internal bool ResetAuth(ConversationData conversationData, dynamic response, UserData userProfile, string channel)
        {

            var span = DateTime.UtcNow - conversationData.Get<DateTime>("lastAuthenticatedAt");

            if (span.Hours < 1)
            {
                return false;
            }
            
            conversationData.Remove("isAuthenticated");
            conversationData.Remove("lastAuthenticatedAt");
            conversationData.Remove("state");

            response.Add("text",
                channel == "directline"
                    ? DefaultsContainer.GetSingleObject().Value<JObject>("authentication_details_sms")
                        .Value<string>(userProfile.Get<string>("language"))
                    : DefaultsContainer.GetSingleObject().Value<JObject>("authentication_details_socials")
                        .Value<string>(userProfile.Get<string>("language")));

            conversationData.Set("isAuthenticating", true);
            return true;
        }
        
        /// <summary>
        /// Checks whether a user is authenticated and sets the state to either authenticated or currently authenticating
        /// </summary>
        /// <param name="conversationData"></param>
        /// <param name="channel"></param>
        /// <param name="channelInfo"></param>
        /// <param name="userProfile"></param>
        /// <param name="userInput"></param>
        /// <param name="response"></param>
        internal void AuthenticateUser(ConversationData conversationData, string channel, string channelInfo, UserData userProfile, string userInput, dynamic response)
        {
            var isAuthenticated = Authenticate(userProfile, channel, userInput, channelInfo);

            if (isAuthenticated)
            {
                conversationData.Set("isAuthenticated", true);
                conversationData.Set("lastAuthenticatedAt", DateTime.UtcNow);
                conversationData.Remove("isAuthenticating");
            }
            else
            {
                response.Add("text",
                    channel == "directline"
                        ? DefaultsContainer.GetSingleObject().Value<JObject>("unsuccessful_authentication_sms")
                            .Value<string>(userProfile.Get<string>("language"))
                        : DefaultsContainer.GetSingleObject().Value<JObject>("unsuccessful_authentication_socials")
                            .Value<string>(userProfile.Get<string>("language")));

                conversationData.Set("isAuthenticating", true);
            }
        }

    }
}
