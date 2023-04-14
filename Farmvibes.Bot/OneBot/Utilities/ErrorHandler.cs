// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using Microsoft.Extensions.Configuration;
using OneBot.Modules;
using OneBot.Singletons;
using System;
using System.IO;
using System.Net;

namespace OneBot.Utilities
{
    public class ErrorHandler
    {
        private readonly IConfiguration _config;
       
        public ErrorHandler(IConfiguration config)
        {
            _config = config;
        }
        public string SendErrorMessage(string language)
        {
            //Send notification to user that we have a problem
            return DefaultsContainer.GetDefaultsContainerMessages("error_message", language);
        }
        public void ErrorLogging(Exception ex, string convoId, string botId = "")
        {
            try
            {
                var htmlContent = "" +
                    "<html>" +
                    "<head>" +
                    "</head>" +
                    "<body>" +
                    "<p>=============Error Logging ===========</p>" +
                    "<p>===========Start=============" + DateTime.Now + "</p>" +
                    "<p>Bot: " + botId + "</p>" +
                    "<p>Error Message: " + ex.Message + "</p>" +
                    "<p>Stack Trace: " + ex.StackTrace + "</p>" +
                    "<p>Inner Exception: " + ex.InnerException + "</p>";

                htmlContent = htmlContent + "</body> </html>";
                htmlContent = htmlContent + "<p> =========== End ============= </p>";

                var date = DateTime.Now.Date;
                var file = AppContext.BaseDirectory + $"/logs/errors/{convoId} {date.Day}-{date.Month}-{date.Year}.html";
                var fileInfo = new FileInfo(file);
                if (!fileInfo.Directory.Exists) fileInfo.Directory.Create();
                File.WriteAllText(file, htmlContent);

                var uploadFileFunctions = new UploadFileFunctions(_config, this);
                //Upload interaction
                uploadFileFunctions.UploadToAzureStorage(file, "logs");
                SendTeamNotificationMessage(htmlContent);
            }
            catch
            {
                Console.WriteLine(ex.Message);
            }
        }
        /// <summary>
        /// Sends notifications when an error is thrown
        /// </summary>
        /// <param name="text"></param>
        /// <returns></returns>
        public string SendTeamNotificationMessage(string text)
        {

            var apilToken = _config.GetValue<string>("ApiToken");
            var destId = _config.GetValue<string>("ChatID");
            var urlString = string.Format(_config.GetValue<string>("Url"), apilToken, destId, text);

            var webclient = new WebClient();

            return webclient.DownloadString(urlString);

        }
    }
}
