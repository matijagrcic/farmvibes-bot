// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System;
using System.IO;
using Newtonsoft.Json.Linq;
using OneBot.Modules;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using Newtonsoft.Json;
using System.Configuration;
using System.Threading.Tasks;
using System.Threading;
using Microsoft.Extensions.Configuration;

namespace OneBot.Utilities
{
    public class UploadFileFunctions
    {
        private readonly IConfiguration _config;

        public UploadFileFunctions(IConfiguration config)
        {
            _config = config;
        }
        public static string GetConversationFileName(string convoId)
        {
            var date = DateTime.Now.Date;
            if (convoId.Contains("livechat"))
            {
                convoId = convoId.Replace("|", "");
            }
            var filePath = AppContext.BaseDirectory + $"/logs/conversations/{convoId} {date.Day}-{date.Month}-{date.Year}.json";
            return filePath;
        }
        static void NewConversationLog(string filePath)
        {
            try
            {
                var file = new FileInfo(filePath);
                file.Directory.Create();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message); throw;
            }
        }
       
        static FileStream WaitForFile(string fullPath, FileMode mode, FileAccess access, FileShare share)
        {
            for (var numTries = 0; numTries < 10; numTries++)
            {
                FileStream fs = null;
                try
                {
                    fs = new FileStream(fullPath, mode, access, share);
                    return fs;
                }
                catch (IOException ex)
                {
                    Console.WriteLine(ex.Message);
                    if (fs != null)
                    {
                        fs.Dispose();
                    }
                    Thread.Sleep(50);
                }
            }

            return null;
        }
        public void UploadToAzureStorage(string file, string container)
        {
            var retries = 3;
            do
            {
                try
                {
                    var storageAccount = CloudStorageAccount.Parse(ConfigurationManager.AppSettings["AzureWebJobsStorage"]);
                    var client = storageAccount.CreateCloudBlobClient();
                    var blobContainer = client.GetContainerReference(container);
                    blobContainer.CreateIfNotExistsAsync();
                    var blockBlob = blobContainer.GetBlockBlobReference(file.Substring(file.LastIndexOf('/') + 1));
                    using (var fileStream = WaitForFile(file, FileMode.Open, FileAccess.Read, FileShare.Read))
                    {
                        blockBlob.UploadFromStreamAsync(fileStream);
                        fileStream.Close();
                    }
                    break;
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                    Task.Delay(2000).Wait();
                    if (retries == 1)
                    {
                        //Notfy ream that couldn't update file
                        //var subject = "Caawiye Error Notification";
                        var plainTextContent = $"Unable to upload {file} into {container} container on Azure Storage";
                        var htmlContent = $"<html><head></head><body><p>I am unable to upload <strong>{file}</strong> into <strong>{container}</strong> container on Azure Storage after 16 retries</p>";
                        htmlContent = htmlContent + $"<p>Stack trace: {ex.StackTrace}</p><p>Message: {ex.Message}</p><p>Inner exception: {ex.InnerException}</p></body></html>";
                        var messaging = new Messaging(_config);
                        messaging.SendTeamNotificationMessage(htmlContent);

                    }
                }
            } while (retries-- > 0);

        }
    }
}
