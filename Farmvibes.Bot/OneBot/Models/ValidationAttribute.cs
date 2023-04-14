using Newtonsoft.Json.Linq;

namespace OneBot.Models
{
    public class ValidationAttribute
    {
        public string description { get; set; }
        public string errorMessage { get; set; }        
        public string expression { get; set; }
        public JObject translations { get; set; }
        public string type { get; set; }
    }

}
