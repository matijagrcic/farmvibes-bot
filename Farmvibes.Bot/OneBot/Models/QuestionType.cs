using Newtonsoft.Json.Linq;
using System;

namespace OneBot.Models
{

    public class QuestionType
    {
        public bool isPublished { get; set; }
        public DateTime? createdAt { get; set; }
        public DateTime? updatedAt { get; set; }
        public string icon { get; set; }
        public bool hasOptions { get; set; }
        public JArray attributes { get; set; }
        public JArray validations { get; set; }
        public string name { get; set; }
        public string description { get; set; }
        public JObject translations { get; set; }
    }
}


