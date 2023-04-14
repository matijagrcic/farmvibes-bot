using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OneBot.Models
{
    public class QuestionValidation
    {
        public string errorMessage { get; set; }
        public ValidationAttribute validationAttribute { get; set; }
        public JObject translations { get; set; }
        public DateTime createdAt { get; set; }
        public DateTime ? updatedAt { get; set; }
        public string expectedInput { get; set; }
        public string expression { get; set; }
    }


}
