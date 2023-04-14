using System;
using System.Collections.Generic;

namespace OneBot.Models
{
    public class Menu
    {
        public string id { get; set; }
        public string position { get; set; }
        public DateTime createdAt { get; set; }
        public DateTime updatedAt { get; set; }
        public int lft { get; set; }
        public int lvl { get; set; }
        public int rgt { get; set; }
        public bool isPublished { get; set; }
        public bool isDefault { get; set; }
        public MenuNodeType type { get; set; }
        #nullable enable
        public MenuTranslation? translations { get; set; }
        public List<Menu>? children { get; set; }
    }
}
