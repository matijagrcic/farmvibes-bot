// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System;
using System.IO;
using OneBot.Modules;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using System.Threading.Tasks;
using System.Threading;
using Microsoft.Extensions.Configuration;

namespace OneBot.Utilities
{
    public class UploadFileFunctions
    {
        private readonly IConfiguration _config;
        private readonly ErrorHandler _errorHandler;

        public UploadFileFunctions(IConfiguration config, ErrorHandler errorHandler)
        {
            _config = config;
            _errorHandler = errorHandler;
        }

        //To-DO
        //Log conversation data to blob/local storage

        private FileStream WaitForFile(string fullPath, FileMode mode, FileAccess access, FileShare share)
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
                    var storageAccount = CloudStorageAccount.Parse(_config["AzureWebJobsStorage"]);
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
                        //Notify team that couldn't update file
                        var htmlContent = $"<html><head></head><body><p>I am unable to upload <strong>{file}</strong> into <strong>{container}</strong> container on Azure Storage after 16 retries</p>";
                        htmlContent = htmlContent + $"<p>Stack trace: {ex.StackTrace}</p><p>Message: {ex.Message}</p><p>Inner exception: {ex.InnerException}</p></body></html>";
                        _errorHandler.SendTeamNotificationMessage(htmlContent);
                    }
                }
            } while (retries-- > 0);

        }
    }
}
