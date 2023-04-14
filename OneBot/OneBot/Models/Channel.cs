using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OneBot.Models
{
    public class Channel
    {
        public string id { get; set; }
        public string name { get; set; }
        public bool is_enabled { get; set; }
        public DateTime created_at { get; set; }
        public DateTime updated_at { get; set; }
    }
}
