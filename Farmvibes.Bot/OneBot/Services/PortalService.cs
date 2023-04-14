// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using Newtonsoft.Json;
using System;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace OneBot.Services
{
    public class PortalService
    {
        private readonly HttpClient _httpClient;

        public PortalService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }
        
        public async Task<T> GetAsync<T>(string url)
        {
            try
            {
                var httpResponseMessage = await _httpClient.GetAsync(url);
                return await HandleResponseMessage<T>(httpResponseMessage);
            }
            catch(Exception ex) { throw new Exception(ex.Message, ex); }
        }

        public async Task<T> PostAsync<T>(string url, T content) where T : class
        {
            try
            {
                var contentString = JsonConvert.SerializeObject(content);
                using var jsonContent = new StringContent(contentString, Encoding.UTF8, "application/json");
                var httpResponseMessage = await _httpClient.PostAsync(url, jsonContent);
                return await HandleResponseMessage<T>(httpResponseMessage);
            }
            catch(Exception ex) { throw new Exception(ex.Message, ex); }
        }

        private async Task<T> HandleResponseMessage<T>(HttpResponseMessage httpResponseMessage)
        {
            var stream = await httpResponseMessage.Content.ReadAsStreamAsync();

            using var streamReader = new StreamReader(stream);
            using JsonReader reader = new JsonTextReader(streamReader);
            var serializer = new JsonSerializer();

            // read the json from a stream
            // json size doesn't matter because only a small piece is read at a time from the HTTP request
            return serializer.Deserialize<T>(reader);
        }

        /// <summary>
        /// This function deletes a bot user from portal database. 
        /// </summary>
        /// <param name="id">Bot user identifer to use for deleting the user from the database.</param>
        /// <returns></returns>
        public async Task DeleteBotUserAsync(string id)
        {
            if (id != null)
            {
                await _httpClient.DeleteAsync($"/api/bot_users/{id}");
            }
        }

    }
}
