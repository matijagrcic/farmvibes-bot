// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SQLite;
using System.Linq;
using System.Timers;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using OneBot.Models;
using OneBot.Utilities;
using OneBot.Database;
using OneBot.State;
using OneBot.Singletons;
using System.IO.Pipelines;
using System.Security.Policy;

namespace OneBot.Modules
{

    public class ContentFetch
    {

       //have sqlite db to have a connection for each user
        public static SQLiteConnection _connection;
        public readonly IConfiguration _config;
        private static bool timeElapsed;
        private static DateTime signalTime;
        public APIHelper _apiHelper;
        static private DatabaseUtil _dbUtil;

        public ContentFetch(IConfiguration config, IHttpClientFactory httpClientFactory)
        {
            _config = config;
            _apiHelper = new APIHelper(_config["ContentAppUrl"]);
            _dbUtil = new DatabaseUtil("Data Source=InMemory;Mode=Memory;Cache=Shared", "System.Data.SQLite");
        }

        /// <summary>
        /// Fetchs the content 
        /// </summary>
        /// <param name="id"> Content item Id to fetch content data from. </param>
        /// <param name="language"> User's language definition.</param>
        /// <returns> A dictionary object having content data if found otherwise a default error text message. </returns>
        public static Dictionary<string, dynamic> GetContent(string id, string language, int stateContentId, string channel, UserData userProfile = null)
        {
            var contentResults = GetContentUsingId(stateContentId, "content").Values.First();
            var results = contentResults;
            var response = new Dictionary<string, dynamic>();

            foreach (var item in results)
            {
                if (item.ContainsKey("id"))
                {
                    // check for the exact id match passed in as the method argument.
                    if ((item.Value<string>("id").CompareTo(id) == 0))
                    {
                        var itemProperties = item.Children<JProperty>();

                        if (item.ContainsKey("media") && item.Value<JArray>("media").Count > 0)
                        {
                            var mediums = itemProperties.FirstOrDefault(x => x.Name == "media").Value;
                            var mediaItems = new JArray();
                            foreach (var media in mediums)
                            {
                                {
                                    mediaItems.Add(media);
                                }
                            }
                            response.Add("media", mediaItems);
                        }
                        if (item.ContainsKey("text"))
                        {
                            var textItems = new JArray();
                            foreach (var text in itemProperties.FirstOrDefault(x => x.Name == "text").Value)
                            {
                                var channelId = userProfile.data["channelPortalId"];

                                var channelEnabled = true;
                                //var channelEnabled = text.SelectToken("contentTextVariants").FirstOrDefault().Value<JArray>("channels").ToObject<List<string>>().Any(y => y.Last().ToString().Equals(channelId.ToString()));

                                var textItem = new Object();

                                if(channelEnabled)
                                {
                                    var translations = text.SelectToken("contentTextVariants").FirstOrDefault().Children<JProperty>().FirstOrDefault(x => x.Name == "translations").Value[language];

                                    if (translations != null)
                                    { 
                                        textItem = translations.SelectToken("text").Value<string>(); 
                                    }
                                    else
                                    {
                                        textItem = DefaultsContainer.GetSingleObject().Value<JObject>("unavailable_content").Value<string>("en");
                                    }
                                }
                                textItems.Add(textItem);
                            }
                            response.Add("text", textItems);
                        }
                        break;                        
                    }
                }
            }

           return response;
        }
        
        /// <summary>
        /// Get the updated content that will be used to replace the current content from the cronjob data folder 
        /// To be used to get the data from the apis. 
        /// </summary>
        /// <param name="contentType"></param>
        /// <returns>Content required to be added into the dictionary</returns>
        public async Task<Dictionary<string, JArray>> GetContentFromApi(List<string> contentNames)
        {
            try
            {
                var contentEndPoint = _config["ContentAppUrl"];
                _apiHelper = new APIHelper(contentEndPoint, "application/json", PortalFunctions.GetToken().Result);
                var content = new Dictionary<string, JArray>();

                foreach (var name in contentNames)
                {
                    var contentType = string.Empty;

                    if (name == "menu_nodes")
                        //get parent menu nodes
                        contentType = $"menu_nodes?isPublished=true&type={_config["RootMenuNodeTypeId"]}&";
                    else if (Guid.TryParse(name, out var newGuid))
                        contentType = $"menu_nodes/{name}/nodes?";
                    else
                        contentType = $"{name}?";

                    var resultArray = new JArray();
                    var endResult = new JArray();
                    var pageCount = 1;

                    do
                    {
                        var endpointResult = await _apiHelper.Get<JArray>($"{contentType}groups%5B%5D=onebot%3Aread&groups%5B%5D=translations&itemsPerPage=100&_page={pageCount}");
                        if (endpointResult != null)
                        {
                                foreach (var obj in endpointResult)
                                {
                                    endResult.Add(obj);
                                }
                                pageCount++;                           
                        }
                    }
                    while (resultArray != null && resultArray.Count >= 100);

                    if (Guid.TryParse(name, out var treeGuid))
                    {
                        contentType = "trees";
                    }
                    else
                    {
                        contentType = name;
                    }

                    if (content.ContainsKey(contentType))
                        content[contentType].Add(endResult);
                    else
                        content.Add(contentType, endResult);
                }
                return content;
            }
            catch (Exception ex)
            {
                var exception = new Exception(message: "Failed to get data from the API", ex);
                throw exception;
            }
        }
        /// <summary>
        /// Get data from api and process it to push it into the sqlite db
        /// </summary>
        /// <returns>dictionary with key as contenttype and the matching content</returns>
        public async Task<Dictionary<string, string>> ProcessData()
        {
            try
            {
                var contentName = new List<string>() { "menu_nodes", "contents", "services", "service_types", "administrative_units", "channels", "languages", "locations" };

                var list = await GetContentFromApi(contentName);
                var contentDict = new Dictionary<string, string>();

                if (list != null)
                {
                    foreach (var key in list.Keys)
                    {
                        if (key == "menu_nodes")
                        {
                            contentDict.TryAdd("_menu", list[key].ToString());
                        }
                        else
                        {
                            contentDict.TryAdd(key, list[key].ToString());
                        }
                    }

                    //get trees for each menu
                    var menuNodesList = list["menu_nodes"];
                    var defaultMenuNodeId = list["menu_nodes"].ToObject<List<Menu>>().Where(x => x.isDefault).FirstOrDefault().id;                    

                    //We need to flatten the list of lists in the results to one list
                    var gc = GetContentFromApi(new List<string> { defaultMenuNodeId }).Result;

                    var trees = gc.Values.First().Where(tree => tree != null).ToList();
                    contentDict.TryAdd("_trees", JArray.FromObject(trees).ToString());

                    //ToDO - Handle no menu/content setup
                    //else {}
                }   
                return contentDict;
            }
            catch(Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }

        }


        /// <summary>
        /// Event that is triggered by the timer which triggers the getting 
        /// of Content from the Content api and into the sqlite db
        /// </summary>
        /// <param name="source"></param>
        /// <param name="e"></param>
        public async void OnTimedEvent(Object source, ElapsedEventArgs e)
        {
                timeElapsed = false;

                if (e.SignalTime != signalTime)
                {
                    signalTime = e.SignalTime;
                    timeElapsed = true;
                }

            var contentAdded = 0;
            while (contentAdded == 0)
            {
                contentAdded = await AddContentToDB();
            }
            //clear db if we have a lot of data
            DeleteUnusedContent();
        }

        /// <summary>
        /// Push the content files into the db as json strings for easy retrieval
        /// </summary>
        public async Task<int> AddContentToDB()
        {
            try
            {
                var result = 0;
                var processedContent = await ProcessData();
                var dict = new Dictionary<string, object>();

                if (processedContent != null)
                {
                    //add parameter values to the insertQuery query
                    dict.Add("$service", processedContent["services"]);
                    dict.Add("$menu", processedContent["_menu"]);
                    dict.Add("$content", processedContent["contents"]);
                    dict.Add("$service_types", processedContent["service_types"]);
                    dict.Add("$trees", processedContent["_trees"]);
                    dict.Add("$locations", processedContent["locations"]);
                    dict.Add("$administrative_units", processedContent["administrative_units"]);
                    dict.Add("$channels", processedContent["channels"]);
                    dict.Add("$languages", processedContent["languages"]);
                    dict.Add("$createAt", DateTime.UtcNow);

                    //insert the content into the db
                    var insertQuery = "INSERT INTO ContentTable (service, menu, content, service_types, trees, locations, administrative_units, channels, languages, createAt) VALUES($service, $menu, $content, $service_types, $trees, $locations, $administrative_units, $channels, $languages, $createAt)";
                    result = _dbUtil.ExecuteCommand(insertQuery, dict);
                }
                return result;
            }
            catch (Exception ex)
            {
                var exception = new Exception(message: $"Stack trace - { ex.StackTrace } -- Failed to add content to db - method --addcontenttodb---", ex);                
                throw exception;
            }
        }

        /// <summary>
        /// Get the content/service that is related to the menu item that the user is currently on
        /// </summary>
        /// <param name="id">used to get the entire row for that particular id for that row in the db</param>
        /// <param name="contentType"> eg service/content</param>
        /// <returns></returns>
        public static Dictionary<Int64, List<JObject>> GetContentUsingId(int id, string contentType)
        {
            try
            {
                string query;
                var dict = new Dictionary<string, object>();

                if (timeElapsed || id == 0)
                {
                    query = string.Format("SELECT id, {0} FROM ContentTable ORDER BY createAt DESC LIMIT 1", contentType);
                }
                else
                {
                    query = string.Format("SELECT id, {0} FROM ContentTable WHERE id = $id", contentType);
                }

                if (contentType == "content")
                {
                    timeElapsed = false;
                }

                if (id != 0)
                {
                    dict.Add("$id", id.ToString());
                }

                var content = _dbUtil.Select(query, dict);
                var res = new Dictionary<Int64, List<JObject>>();
                foreach(var row in content.Select())
                {
                    res.Add(Convert.ToInt64(row["id"]),JsonConvert.DeserializeObject<List<JObject>>(row[contentType].ToString()));
                }
                return res;
            }
            catch (Exception ex)
            {
                var exception = new Exception(message: $"Failed getting {contentType} using id - {id} from the sqlite db", ex);
                throw exception;
            }
        }
        /// <summary>
        /// Method for getting trees from the db as trees have a different data type
        /// </summary>
        /// <param name="id"></param>
        /// <param name="contentType"></param>
        /// <returns></returns>
        public static Dictionary<Int64, List<List<JObject>>> GetMenuTrees(int id, string contentType)
        {
            try
            {
                var query = string.Format($"SELECT id, {contentType} FROM ContentTable ORDER BY createAt DESC LIMIT 1");
                var content = _dbUtil.Select(query, null);
                var result = new Dictionary<Int64, List<List<JObject>>>();

                foreach (var row in content.Select())
                {
                    result.Add(Convert.ToInt64(row["id"]), new List<List<JObject>>() { JsonConvert.DeserializeObject<List<JObject>>(row[contentType].ToString()) });
                }

                return result;
            }
            catch (Exception ex)
            {
                var exception = new Exception(message: $"Failed to get menu trees for id - {id}", ex);
                throw exception;
            }
        }
        /// <summary>
        /// Called in intervals to delete data that is not being used in the db to free up memory
        /// </summary>
        public void DeleteUnusedContent()
        {
            
                var countQuery = "SELECT COUNT(id) FROM ContentTable";
                var count = _dbUtil.Select(countQuery).Rows.Count;

                //only deletes if we have more than one item in the db
                if (count > 2)
                {                    
                    var query = $"DELETE FROM ContentTable ORDER BY createAt ASC LIMIT {count - 2}";
                    _dbUtil.ExecuteCommand(query, null);
                }
        }         
        /// <summary>
        /// This method retrieves the locale definition of the given language
        /// </summary>
        /// <param name="language">language to fetch the locale for </param>
        /// <param name="state"> bot state</param>
        /// <returns></returns>
        public static string GetLocaleFromAvailableLanguages(string language, JObject state = null)
        {
            try
            {
                var languages = GetAvailableLanguages(state);

                return languages.Where(x => x.ContainsKey("name") && x.GetValue("name").Value<string>() == language).First().Value<string>("code");
            }
            catch (Exception ex)
            {
                var exception = new Exception(message: $"Failed to get locale for {language} language. ", ex);
                throw exception;
            }
        }
        /// <summary>
        /// Get a list of available languages.
        /// </summary>
        /// <param name="state"></param>
        /// <returns></returns>
        public static List<JObject> GetAvailableLanguages(JObject state = null)
        {
            try
            {
                var stateContentId = 0;
                if (state != null && state.ContainsKey("stateContentId"))
                {
                    stateContentId = state.Value<int>("stateContentId");
                }
                var contentDict = new Dictionary<Int64, List<JObject>>();
                return ContentFetch.GetContentUsingId(stateContentId, "languages").FirstOrDefault().Value.ToList<JObject>();                
            }
            catch (Exception ex)
            {
                var exception = new Exception(message: $"Failed to get available languages. ", ex);
                throw exception;
            }
        }
    }
}