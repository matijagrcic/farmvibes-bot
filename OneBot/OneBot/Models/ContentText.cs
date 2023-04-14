using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OneBot.Models
{
    public class ContentText
    {
        public string text { get; set; }
        public List<ContentTextConstraint> contentTextConstraints { get; set; }
    }
    public class ContentTextConstraint
    {
    }
}
