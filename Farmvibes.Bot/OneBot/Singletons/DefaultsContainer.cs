// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System;
using System.IO;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace OneBot.Singletons
{
    [Serializable]
    public static class DefaultsContainer
    {
         static JObject _content = null;
        public static JObject GetSingleObject()
        {               

            try
            {
                if (_content != null)
                    return _content;

                var path = AppContext.BaseDirectory + $"/Data/defaults.json";
                if (File.Exists(path))
                {
                    _content = JsonConvert.DeserializeObject<JObject>(File.ReadAllText(path));
                }
            }
            catch(Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }

            return _content;
        }

        /// <summary>
        /// Get messages from defaults file and if it doesn't exist we default to English.
        /// </summary>
        /// <param name="key"></param>
        /// <param name="language"></param>
        /// <returns></returns>
        public static string GetDefaultsContainerMessages(string key, string language)
        {
            try
            {
                string message;
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
            catch (Exception ex)
            {
                throw new Exception(ex.Message + " thrown at GetDefaultsContainerMessages()", ex);
            }

        }
    }
}