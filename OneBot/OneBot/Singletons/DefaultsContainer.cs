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
    }
}