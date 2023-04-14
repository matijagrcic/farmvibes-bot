using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace OneBot.Models
{

    public class BotUser
    {
        [Key]
        public Guid id { get; set; }
        public DateTime created_at { get; set; }
        public string gender { get; set; }
        public string status { get; set; }
        public string language { get; set; }
        public string location { get; set; }
        public string age { get; set; }
        public string fullname { get; set; }
        [JsonIgnore]
        public List<BotUserContact> botUserContacts { get; set; }

    }
}
