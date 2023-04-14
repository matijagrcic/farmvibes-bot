// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using Newtonsoft.Json;
using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;

namespace OneBot.Utilities
{
    public class APIHelper
    {
        static HttpClient httpClient;
        public APIHelper(string url, string contentTye = "application/json", string token = null)
        {
            httpClient = new HttpClient();
            httpClient.BaseAddress = new Uri(url);
            httpClient.DefaultRequestHeaders.Clear();
            httpClient.DefaultRequestHeaders.ConnectionClose = false;
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue(contentTye));

            if (token != null)
                httpClient.DefaultRequestHeaders.Add("Authorization", string.Format("Bearer {0}", token));
        }

        /// <summary>
        /// Update values in API
        /// </summary>
        /// <typeparam name="T">Type of object expected back</typeparam>
        /// <param name="url">Link to resource on API</param>
        /// <param name="stringValue">Value to update on API</param>
        /// <returns></returns>
        public async Task Put<T>(string url, T stringValue)
        {
            var content = new StringContent(JsonConvert.SerializeObject(stringValue), Encoding.UTF8, "application/json");
            var result = await httpClient.PutAsync(url, content);
            result.EnsureSuccessStatusCode();
        }


        /// <summary>
        /// Post data to a post endpoint on the URL
        /// </summary>
        /// <typeparam name="T">Type of object</typeparam>
        /// <param name="url">Endpoint of resource on API. This is appended to base address</param>
        /// <param name="contentValue">The content to be serialised to JSON before posting</param>
        /// <returns></returns>
        public async Task<T> Post<T>(string url, T contentValue)
        {
            try
            {
                var content = new StringContent(JsonConvert.SerializeObject(contentValue), Encoding.UTF8, "application/json");
                int retries = 0;
                var result = new HttpResponseMessage();
                
                while (retries <= 3)
                {
                    result = await httpClient.PostAsync(url, content);
                    if (result.IsSuccessStatusCode) break;

                    retries++;                   
                }

                T response = JsonConvert.DeserializeObject<dynamic>(result.Content.ReadAsStringAsync().ConfigureAwait(false).GetAwaiter().GetResult());
                return response; ;
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }

        /// <summary>
        /// Interact with external API through GET method
        /// </summary>
        /// <typeparam name="T">Type of expected response</typeparam>
        /// <param name="url">Address of the resource at the base address</param>
        /// <returns></returns>
        public async Task<T> Get<T>(string url)
        {
            var result = new HttpResponseMessage();
            int retries = 0;
            while(retries <= 3)
            {
                result = await httpClient.GetAsync(url);
                if(result.IsSuccessStatusCode) break;  
                retries++;
            }

            T response = JsonConvert.DeserializeObject<dynamic>(result.Content.ReadAsStringAsync().ConfigureAwait(false).GetAwaiter().GetResult());
            return response;
        }

        /// <summary>
        /// Delete item at the endpoint
        /// </summary>
        /// <param name="url">The URL of the resource at the endpoint. This should include id of item to be deleted</param>
        /// <returns></returns>
        public async Task Delete(string url)
        {
            var result = await httpClient.DeleteAsync(url);
            result.EnsureSuccessStatusCode();
        }
    }
}
