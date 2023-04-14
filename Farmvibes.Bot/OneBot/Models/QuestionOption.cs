using Newtonsoft.Json.Linq;

namespace OneBot.Models
{ 
    public class QuestionOption
    {
        public string value { get; set; }
        public string id { get; set; }
        public JObject translations { get; set; }
    }
}

