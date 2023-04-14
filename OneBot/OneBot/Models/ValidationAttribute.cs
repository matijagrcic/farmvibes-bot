using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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
