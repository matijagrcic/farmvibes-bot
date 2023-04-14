namespace OneBot.Models
{
    public class MenuTranslation
    {
        public string id { get; set; }
        public string label { get; set; }
        #nullable enable
        public string? description { get; set; }
        public string locale { get; set; }
    }
}
