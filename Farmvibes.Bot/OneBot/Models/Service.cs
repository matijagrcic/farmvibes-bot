using Newtonsoft.Json.Linq;
using OneBot.Models;
using System.Collections.Generic;

namespace OneBot
{

    public class Service
    {
        public string id { get; set; }
        public List<Question> questions { get; set; }
        public string name { get; set; }
        public string type { get; set; }
        public bool isPublished { get; set; }
        public bool backAfterCompletion { get; set; }
        public bool singleAccess { get; set; }
        public Subtype subtype { get; set; }
        public JObject translations { get; set; }
    }
}