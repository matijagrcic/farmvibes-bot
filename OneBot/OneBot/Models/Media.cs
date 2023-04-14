using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OneBot.Models
{
	public class Media
	{
		public string id { get; set; }
		public string filetype { get; set; }
		public string filename { get; set; }
		public string caption { get; set; }
		public DateTime createdAt { get; set; }
		public DateTime? updatedAt { get; set; }
		public List<JObject> translations { get; set; }
		public List<string> questions { get; set; }
		public List<string> contents { get; set; }
		public string timezone { get; set; }
	}
}
