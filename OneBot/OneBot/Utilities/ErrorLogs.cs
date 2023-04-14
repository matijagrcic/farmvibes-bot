// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using Microsoft.Extensions.Configuration;
using OneBot.Modules;
using System;
using System.IO;

namespace OneBot.Utilities
{
    public class ErrorLogs
    {
        private readonly IConfiguration _config;

        public ErrorLogs(IConfiguration config)
        {
            _config = config;
        }
        public ErrorLogs() { }

        public string SendErrorMessage(string language)
        {
            //Send notification to user that we have a problem
            return Utils.GetDefaultsContainerMessages("error_message", language);
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

                var uploadFileFunctions = new UploadFileFunctions(_config);

                //Upload interaction
                uploadFileFunctions.UploadToAzureStorage(file, "logs");

                var messaging = new Messaging(_config);
                messaging.SendTeamNotificationMessage(htmlContent);
            }
            catch
            {
                Console.WriteLine(ex.Message);
            }
        }
    }
}
