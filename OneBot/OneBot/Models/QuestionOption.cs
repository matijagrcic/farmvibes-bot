using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using OneBot.Models;

namespace OneBot.Models
{ 
    public class QuestionOption
    {
        public string value { get; set; }
        public string id { get; set; }
        public JObject translations { get; set; }
    }
}

