// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using Newtonsoft.Json;
using System;
using System.IO;
using System.Security.Cryptography;

namespace OneBot.Utilities
{
    public static class FileFunctions
    {
        public static T ReadContentFile<T>(string filename)
        {
            try
            {
                var path = AppContext.BaseDirectory + $"/Data/{filename}";
                var result = default(T);
                if (File.Exists(path))
                {
                    result = JsonConvert.DeserializeObject<T>(File.ReadAllText(path));
                }
                return result;
            }
            catch
            {
                throw;
            }

        }

        /// <summary>
        /// Creates hashstring to compare both files after hashing
        /// </summary>
        /// <param name="filename"></param>
        /// <returns></returns>
        public static string CreateHashString(string filename)
        {
            try
            {
                using (var md5 = MD5.Create())
                {
                    using (var stream = File.OpenRead(filename))
                    {
                        var hash = md5.ComputeHash(stream);
                        return BitConverter.ToString(hash).ToLowerInvariant();
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
                throw;
            }

        }
    }
}
