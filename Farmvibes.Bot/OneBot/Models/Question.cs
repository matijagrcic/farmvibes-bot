using System;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;

namespace OneBot.Models
{
    public class Question
    {
        public string id { get; set; }
        public string question { get; set; }
        public string description { get; set; }
        public string hint { get; set; }
        public DateTime createdAt { get; set; }
        public DateTime? updatedAt { get; set; }
        public QuestionType questionType { get; set; }
        public List<Media> media { get; set; }
        public List<QuestionOption> questionOptions { get; set; }
        public List<QuestionValidation> questionValidations { get; set; }
        public JObject translations { get; set; }
        public JArray attributes { get; set; }
        #nullable enable
        public JObject? contentLookUp { get; set; }
        #nullable enable
        public JObject questionTag { get; set; }
        public int position { get; set; }
        public bool isPublished { get; set; }
        public bool isSystem { get; set; }
        public bool isCompleted { get; set; }
        #nullable enable
        public string? value { get; set; }
        public bool isEnabled { get; set; }
    }
}
