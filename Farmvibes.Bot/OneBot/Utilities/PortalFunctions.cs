// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using OneBot.Database;
using OneBot.Modules;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace OneBot.Utilities
{
    public class PortalFunctions
    {
        static private IConfiguration _config;
        static APIHelper _apiHelper;
        static private DatabaseUtil _dbUtil;
        public PortalFunctions(IConfiguration config)
        {
            _config = config;
            _dbUtil = new DatabaseUtil("Data Source=InMemory;Mode=Memory;Cache=Shared", "System.Data.SQLite");
        }
        /// <summary>
        /// Gets the bearer token for authorization on the portal
        /// </summary>
        /// <returns>token string to be used for authentication for the other api calls</returns>
        public static async Task<string> GetToken()
        {
            try
            {
                //Let's check if we have a valid token, if not we retrieve a new one
                var query = String.Format("SELECT token FROM TokenTable WHERE datetime(tokenExpiration) > datetime('now', '-{0} Hour')", _config["TokenExpiry"]);
                var tokenResult = _dbUtil.Select(query);
                if (tokenResult.Rows.Count > 0)
                    return tokenResult.Rows[0]["token"].ToString();

                _apiHelper = new APIHelper(_config["ContentAppUrl"]);
                var loginResponse = await _apiHelper.Post<JObject>("login_check", contentValue: new JObject() { { "username", _config["BotUsername"] }, { "password", _config["BotPassword"] } });
                if (loginResponse.ContainsKey("token"))
                {
                    _dbUtil.ExecuteCommand($"DELETE FROM TokenTable");
                    _dbUtil.ExecuteCommand($"INSERT INTO TokenTable (token) VALUES ('{loginResponse.Value<string>("token")}')");
                    return loginResponse.Value<string>("token");
                }
                return null;
            }
            catch(Exception e)
            {
                Console.WriteLine(e);
                return null;
            }            
        }

        /// <summary>
        /// Creates the sqlite inmemory for data used accross the bot
        /// </summary>
        /// <returns>column rows in the db </returns>
        public static void CreateLocalTables()
        {
            try
            {
                //Create token handling table so that we only fetch token on expiry
                //This should perhaps be moved into it's own function
                _dbUtil.ExecuteCommand("CREATE TABLE IF NOT EXISTS TokenTable ([id] INTEGER PRIMARY KEY, [token] TEXT NOT NULL, [tokenExpiration] timestamp NOT NULL DEFAULT current_timestamp);");

                //create Table for holding content
                _dbUtil.ExecuteCommand("CREATE TABLE IF NOT EXISTS ContentTable " +
                    "(id INTEGER PRIMARY KEY, service TEXT, menu TEXT, content TEXT, service_types TEXT, trees TEXT, locations TEXT, administrative_units TEXT, channels TEXT, languages TEXT, constraints TEXT, createAt TEXT);");
            }
            catch (Exception ex)
            {
                var exception = new Exception(message: $"Stack trace - {ex.StackTrace} -- Failed to create table or/and add content initially", ex);

                throw exception;
            }
        }

        /// <summary>
        /// This function returns the reference identifier for channels as assigned in the content management portal
        /// </summary>
        /// <returns></returns>
        public static string GetChannelId(string channelName)
        {
            var channels = ContentFetch.GetContentUsingId(0, "channels").First().Value;
            return channels.FirstOrDefault(channel => channel.Value<string>("name").ToLowerInvariant().Equals(channelName)).Value<string>("id");
        }
        /// <summary>
        /// This function deletes a bot user from portal database. 
        /// </summary>
        /// <param name="id">Bot user identifer to use for deleting the user from the database.</param>
        /// <returns></returns>
        public static async Task DeleteBotUserAsync(string id)
        {
            if (id != null)
            {
                var contentEndPoint = _config["ContentAppUrl"];
                _apiHelper = new APIHelper(contentEndPoint, "application/json", GetToken().Result);
                await _apiHelper.Delete($"/api/bot_users/{id}");
            }
        }
    }
}
