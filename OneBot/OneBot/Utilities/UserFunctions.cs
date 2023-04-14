// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using Microsoft.AspNetCore.Routing.Template;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using OneBot.Database;
using OneBot.Models;
using OneBot.State;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OneBot.Utilities
{
    public class UserFunctions
    {
        public static IConfiguration _config;

        public UserFunctions(IConfiguration config)
        {
            _config = config;
        }

        /// <summary>
        /// Completes user registration one all questions have been successfully completed
        /// </summary>
        /// <param name="prompts">All registration questions complete with respones</param>
        /// <param name="channel">User's channel</param>
        /// <param name="channelId">Id of the user in the current communication channel</param>
        /// <returns>Positive integer if transaction was succesful</returns>
        public static JObject CompleteRegistration(JArray prompts, UserData userProfile)
        {
            var questions = prompts.ToObject<List<Question>>();
            var apiHelper = new APIHelper(_config["ContentAppUrl"], "application/json", PortalFunctions.GetToken().Result);
            var channel = userProfile.Get<string>("channel");
            var channelId = userProfile.Get<string>("channelId");
            var botUserObject = new JObject() { { "status", "completedRegistration" } };
            var profile = new JArray();
            try
            {
                Dictionary<string, JArray> tag = new Dictionary<string, JArray>();

                foreach (var question in questions)
                {
                    //match the question description with the user field
                    if (question.value != null && question.isSystem)
                    {
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
                                botUserObject[question.description] = question.value;
                        }
                    }
                    else if (question.value != null && !question.isSystem)
                    {
                        var obj = new JObject();
                        obj["questionId"] = question.id;
                        obj["questionValueId"] = question.value;
                        profile.Add(obj);
                    }

                    if (!userProfile.Has(question.description))
                    {
                        userProfile.Set(question.description, question.value);
                    }

                }

                botUserObject.Add("profile", profile);
                userProfile.Set("profile", profile);

                //Channel data
                var channelObj = new JObject() { { "value", channelId }, { "channel", $"/api/channels/{userProfile.Get<string>("channelPortalId")}" } };
                botUserObject.Add("botUserContacts", new JArray() { channelObj });
                userProfile.Set("firstname", userProfile.Get<string>("fullname").Split(' ').First().ToString());
                var result = apiHelper.Post<JObject>("/api/bot_users", botUserObject).Result;
                userProfile.Set("id", result.Value<string>("id"));

                return result;
                //We need to group tagged fields, e.g. administrative areas and save them in a single object

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
        /// <param name="userChannelId"></param>
        /// <returns></returns>
        public static async Task<JArray> GetUser(string userChannelValue, string channelId)
        {
            try
            {
                var apiHelper = new APIHelper(_config["ContentAppUrl"], "application/json", PortalFunctions.GetToken().Result);
                var url = $"bot_users?botUserContacts.value={userChannelValue}&botUserContacts.channel_id={channelId}";
                var result = await apiHelper.Get<JArray>(url);
                return result.Count == 0 ? null : result;
            }

            catch (Exception ex)
            {
                //If user doesn't exist, result will be 404
                if (ex.Message.Contains("404"))
                {
                    return null;
                }
                else
                {
                    var exception = new Exception(ex.Message, ex);
                    throw exception;
                }
            }
        }

        /// <summary>
        /// Checks whether user is registered or not. If registered, profile is loaded into bot context
        /// </summary>
        /// <param name="context">Bot context</param>
        /// <returns>Boolean whether user is registered or not</returns>
        public static bool IsRegistered(UserData userProfile, string status = null)
        {
            try
            {
                var userCheck = GetUser(userProfile.Get<string>("channelId"), (userProfile.Get<string>("channelPortalId"))).Result;

                if (userCheck == null)
                {
                    userProfile.Set("registered", false);
                    return false;
                }
                var user = userCheck.FirstOrDefault().ToObject<JObject>();

                foreach (var userProp in user.Properties())
                {
                    userProfile.Set(userProp.Name, userProp.Value);
                }
                userProfile.Set("registered", true);
                var name = userProfile.Get<string>("fullname").Split(' ');
                userProfile.Set("firstname", name.First().ToString());
                userProfile.Set("surname", name.Last().ToString());

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
        public static long ConvertToUnixTime(DateTime datetime)
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
        public static bool UserLastActivityTimeStampElapsed(UserData userProfile)
        {
            var TimeElapsed = false;

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
                        TimeElapsed = true;
                        //The key value property 'UserFirstInteractionState' is updated
                        userProfile.Set("userfirstinteractionstate", TimeElapsed);
                        userProfile.Set("userlastinteractiontimestamp", ConvertToUnixTime(DateTime.Now));
                    }
                    userProfile.Set("userfirsttimevisittoday", TimeElapsed);
                }

            }
            catch (Exception ex)
            {
                var exception = new Exception(ex.Message, ex);

                throw exception;
            }
            return TimeElapsed;
        }
    }
}
