// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Linq;

namespace OneBot.State
{
    /// <summary>
    /// This class maintains user data within the state.
    /// We have generic properties which would apply accross any partner bot.
    /// Additional specific information such as gender and age which will not be required by all bots will be stored in the data object.
    /// </summary>
    public class UserData
    {
        public UserData(JObject data)
        {
            this.data = data;
        }

        public string language { get; set; }
        /// <summary>
        /// Data object that will hold various data items required within the bot
        /// </summary>
        /// <value></value>
        public JObject data { get; set; }

        /// <summary>
        /// Retrieve data with the specified key
        /// </summary>
        /// <param name="key">Key to be retrieved</param>
        /// <typeparam name="T">Return type of the data</typeparam>
        /// <returns></returns>
        public T Get<T>(string key)
        {
            if (!data.ContainsKey(key))
                return default(T);

            return data.Value<T>(key);
        }

        /// <summary>
        /// Checks whether the data object contains key
        /// </summary>
        /// <param name="key">Key to check if exists</param>
        /// <returns></returns>
        public bool Has(string key)
        {
            return data.ContainsKey(key);
        }

        /// <summary>
        /// Sets the value of the provided key in the data object
        /// </summary>
        /// <param name="key">Reference key of the data being stored</param>
        /// <param name="item">Data value being stored</param>
        public void Set(string key, dynamic item)
        {
            if (!data.ContainsKey(key))
                data.Add(key, item);
            else
                data[key] = item;
        }

        /// <summary>
        /// Remove a single item with specified key from the data object
        /// </summary>
        /// <param name="key">Key representing item to be removed from data object</param>
        /// <returns></returns>
        public bool Remove(string key)
        {
            if (!data.ContainsKey(key))
                return false;

            return data.Remove(key);
        }

        /// <summary>
        /// Remove multiple items in the list of keys from the data object
        /// </summary>
        /// <param name="keys">List of keys to be removed from the data object</param>
        /// <returns></returns>
        public bool Remove(List<string> keys)
        {
            if (keys.Count < 1)
                return false;

            foreach (var key in keys)
            {
                if (!data.ContainsKey(key))
                    continue;

                data.Remove(key);
            }

            return true;
        }

        public void RemoveAll(List<string> exclusion = null)
        {
            if (exclusion == null)
            {
                data.RemoveAll();
                return;
            }

            var toRemove = data.Properties().Where(property => !exclusion.Contains(property.Name)).Select(propertyName => propertyName.Name).ToList();
            toRemove.ForEach(key => data.Remove(key));
        }

        /// <summary>
        /// Clears all tokens from state object data
        /// </summary>
        public void Clear()
        {
            //We need to save certain keys e.g. hasbeenwelcomed
            var exclusionList = new List<string>() { "hasBeenWelcomed" };
            language = null;
            RemoveAll(exclusionList);
        }
    }
}