using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace OneBot.Models
{
    public class BotUserContact
    {
        [Key]
        public string id { get; set; }
        public string value { get; set; }
        public int channel_id { get; set; } 
        public Guid user_id { get; set; }
        public BotUser botUser { get; set; }
    }
}
