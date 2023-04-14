using Microsoft.Extensions.Configuration;
using OneBot.Interfaces;
using OneBot.Modules;
using OneBot.Utilities;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace OneBot
{
    public class CreateDatabaseStartupTask : IStartupTask
    {
        private IConfiguration _config;
        private IHttpClientFactory _httpClientFactory;
        public CreateDatabaseStartupTask(IConfiguration config, IHttpClientFactory httpClientFactory)
        {
            _config = config;
            _httpClientFactory = httpClientFactory;
        }
        public async Task Execute()
        {
            var _portalFunctions = new PortalFunctions(_config);

            //Create local tables for data-handling
            PortalFunctions.CreateLocalTables();

            //Load content into table
            var _contentFetch = new ContentFetch(_config, _httpClientFactory);
            await _contentFetch.AddContentToDB();
        }
    }
}
