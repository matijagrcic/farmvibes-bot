// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using OneBot.Models;
using OneBot.Singletons;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Timers;

namespace OneBot.Services
{
    public class ContentService
    {
        private readonly IConfiguration _config;
        private readonly PortalService _portalService;
        private readonly ContentCache _contentCache;
        private bool _timeElapsed;
        private DateTime _signalTime;

        public ContentService(IConfiguration config, PortalService portalService, ContentCache contentCache)
        {
            _config = config;
            _portalService = portalService;
            _contentCache = contentCache;
        }

        /// <summary>
        /// Fetchs the content 
        /// </summary>
        /// <param name="id"> Content item Id to fetch content data from. </param>
        /// <param name="language"> User's language definition.</param>
        /// <param name="currentContentId"></param>
        /// <returns> A dictionary object having content data if found otherwise a default error text message. </returns>
        public Dictionary<string, dynamic> GetContent(string id, string language, int currentContentId)
        {
            var contentResults = GetContentUsingId(currentContentId, "content").Values.First();
            var results = contentResults;
            var response = new Dictionary<string, dynamic>();
            var item = results.Where(x => x.Value<string>("id").Equals(id)).First();

            if (item != null)
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
                        object textItem;
                        var translations = text.SelectToken("contentTextVariants").FirstOrDefault()
                            .Children<JProperty>().FirstOrDefault(x => x.Name == "translations").Value[language];

                        textItem = translations != null
                            ? translations.SelectToken("text").Value<string>()
                            : DefaultsContainer.GetSingleObject().Value<JObject>("unavailable_content")
                                .Value<string>("en");
                        textItems.Add(textItem);
                    }

                    response.Add("text", textItems);
                }
            }

            return response;
        }

        /// <summary>
        /// Get the updated content that will be used to replace the current content from the cronjob data folder 
        /// To be used to get the data from the apis. 
        /// </summary>
        /// <param name="contentGroups">Type of content to be fetched</param>
        /// <returns>Content required to be added into the dictionary</returns>
        private async Task<Dictionary<string, JArray>> GetContentFromApi(List<string> contentGroups)
        {
            try
            {
                var content = new Dictionary<string, JArray>();
                foreach (var name in contentGroups)
                {
                    string contentType;

                    if (name == "menu_nodes")
                    //get parent menu nodes
                    {
                        contentType = $"menu_nodes?isPublished=true&type={_config["RootMenuNodeTypeId"]}&";
                    }
                    else if (Guid.TryParse(name, out _))
                    {
                        contentType = $"menu_nodes/{name}/nodes?";
                    }
                    else
                    {
                        contentType = $"{name}?";
                    }

                    JArray resultArray;
                    var endResult = new JArray();
                    var pageCount = 1;

                    do
                    {
                        resultArray = await _portalService.GetAsync<JArray>(
                            $"{contentType}groups%5B%5D=onebot%3Aread&groups%5B%5D=translations&itemsPerPage=10&_page={pageCount}");
                        if (resultArray != null)
                        {
                            foreach (var obj in resultArray)
                            {
                                endResult.Add(obj);
                            }

                            pageCount++;
                        }
                    } while (resultArray != null && resultArray.Count >= 10);

                    contentType = !Guid.TryParse(name, out _) ? name : "trees";

                    if (contentType != null)
                    {
                        if (content.ContainsKey(contentType))
                        {
                            content[contentType].Add(endResult);

                        }
                        else
                        {
                            content.Add(contentType, endResult);

                        }
                    }
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
        private async Task<Dictionary<string, string>> ProcessData()
        {
            try
            {
                var contentName = new List<string>() {
                    "menu_nodes", "contents", "services", "service_types", "administrative_units", "channels",
                    "languages", "locations"
                };

                var list = await GetContentFromApi(contentName);
                var contentDict = new Dictionary<string, string>();

                if (list != null)
                {
                    foreach (var key in list.Keys)
                    {
                        contentDict.TryAdd(key == "menu_nodes" ? "menu" : key, list[key].ToString());
                    }

                    //get trees for each menu
                    var defaultMenuNodeId = list["menu_nodes"].ToObject<List<Menu>>()
                        .FirstOrDefault(x => x.isDefault)
                        ?.id;

                    //We need to flatten the list of lists in the results to one list
                    var content = GetContentFromApi(new List<string> { defaultMenuNodeId }).Result;

                    var trees = content.Values.First().Where(tree => tree != null).ToList();
                    contentDict.TryAdd("trees", JArray.FromObject(trees).ToString());
                }

                return contentDict;
            }
            catch (Exception ex)
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
            _timeElapsed = false;
            if (e.SignalTime != _signalTime)
            {
                _signalTime = e.SignalTime;
                _timeElapsed = true;
            }

            await AddContentToDB();

            //clear db if we have a lot of data
            DeleteUnusedContent();
        }

        /// <summary>
        /// Push the content files into the db as json strings for easy retrieval
        /// </summary>
        public async Task AddContentToDB()
        {
            try
            {
                //Create local tables for data-handling
                _contentCache.CreateTables();

                var processedContent = await ProcessData();
                var dict = new Dictionary<string, object>();

                if (processedContent != null)
                {
                    foreach (var contentType in processedContent.Keys)
                    {
                        if (!dict.ContainsKey(contentType))
                            dict.Add("$" + contentType, processedContent[contentType]);
                    }
                    dict.Add("$createAt", DateTime.UtcNow);
                }

                //insert the content into the db
                _contentCache.InsertContent(dict);
            }
            catch (Exception ex)
            {
                var exception =
                    new Exception(
                        message:
                        $"Stack trace - {ex.StackTrace} -- Failed to add content to db - method --addcontenttodb---",
                        ex);
                throw exception;
            }
        }

        /// <summary>
        /// Get the content/service that is related to the menu item that the user is currently on
        /// </summary>
        /// <param name="id">used to get the entire row for that particular id for that row in the db</param>
        /// <param name="contentType"> eg service/content</param>
        /// <returns></returns>
        public Dictionary<long, List<JObject>> GetContentUsingId(int id, string contentType)
        {
            try
            {
                string query;
                var dict = new Dictionary<string, object>();

                if (_timeElapsed || id == 0)
                {
                    query = string.Format("SELECT id, {0} FROM ContentTable ORDER BY createAt DESC LIMIT 1",
                        contentType);
                }
                else
                {
                    query = string.Format("SELECT id, {0} FROM ContentTable WHERE id = $id", contentType);
                }

                if (id != 0)
                {
                    dict.Add("$id", id.ToString());
                }

                var content = _contentCache.Select(query, dict);

                var res = new Dictionary<long, List<JObject>>();
                foreach (var row in content.Select())
                {
                    res.Add(Convert.ToInt64(row["id"]),
                        JsonConvert.DeserializeObject<List<JObject>>(row[contentType].ToString()));
                }

                return res;
            }
            catch (Exception ex)
            {
                var exception =
                    new Exception(message: $"Failed getting {contentType} using id - {id} from the sqlite db", ex);
                throw exception;
            }
        }

        /// <summary>
        /// Method for getting trees from the db as trees have a different data type
        /// </summary>
        /// <param name="id"></param>
        /// <param name="contentType"></param>
        /// <returns></returns>
        public Dictionary<Int64, List<List<JObject>>> GetMenuTrees(int id, string contentType)
        {
            try
            {
                var query = string.Format($"SELECT id, {contentType} FROM ContentTable ORDER BY createAt DESC LIMIT 1");
                var content = _contentCache.Select(query, null);
                var result = new Dictionary<Int64, List<List<JObject>>>();

                foreach (var row in content.Select())
                {
                    result.Add(Convert.ToInt64(row["id"]),
                        new List<List<JObject>>()
                            { JsonConvert.DeserializeObject<List<JObject>>(row[contentType].ToString()) });
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
        private void DeleteUnusedContent()
        {
            var count = _contentCache.CountRecords();

            //only deletes if we have more than one item in the db
            if (count > 2)
                _contentCache.DeleteRecords(count);
        }


        /// <summary>
        /// This method retrieves the locale definition of the given language
        /// </summary>
        /// <param name="language">language to fetch the locale for </param>
        /// <param name="state"> bot state</param>
        /// <returns></returns>
        public string GetLocaleFromAvailableLanguages(string language, JObject state = null)
        {
            try
            {
                string replacedInput = Regex.Replace(language, "^[0-9]+", string.Empty);

                var languages = GetAvailableLanguages(state);
                if (languages.Where(x =>
                        x.ContainsKey("name") && x.GetValue("name").Value<string>().ToLowerInvariant() ==
                        replacedInput.TrimStart('.').ToLowerInvariant()).Any())
                    return languages
                        .Where(x => x.ContainsKey("name") && x.GetValue("name").Value<string>().ToLowerInvariant() ==
                            replacedInput.TrimStart('.').ToLowerInvariant()).First().Value<string>("code");
                else
                    return null;
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
        public List<JObject> GetAvailableLanguages(JObject state = null)
        {
            try
            {
                var currentContentId = 0;
                if (state != null && state.ContainsKey("currentContentId"))
                {
                    currentContentId = state.Value<int>("currentContentId");
                }

                return GetContentUsingId(currentContentId, "languages").FirstOrDefault().Value.Where(x => x.Value<bool>("isEnabled")).ToList<JObject>();
            }
            catch (Exception ex)
            {
                var exception = new Exception(message: $"Failed to get available languages. ", ex);
                throw exception;
            }
        }

        /// <summary>
        /// This function returns the reference identifier for channels as assigned in the content management portal
        /// </summary>
        /// <returns></returns>
        public string GetChannelId(string channelName)
        {
            try
            {
                var channels = GetContentUsingId(0, "channels").First().Value;
                return channels.FirstOrDefault(channel =>
                        channel.Value<string>("name").ToLowerInvariant().Equals(channelName.ToLowerInvariant()))
                    .Value<string>("id");
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message + " - failed to get channels", ex);
            }
        }
    }
}