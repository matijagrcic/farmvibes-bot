using OneBot.Interfaces;
using OneBot.Services;
using System.Threading.Tasks;

namespace OneBot
{
    public class CreateDatabaseStartupTask : IStartupTask
    {
        private readonly ContentService _contentService;
        
        public CreateDatabaseStartupTask(ContentService contentService)
        {
            _contentService = contentService;
        }
        
        public async Task Execute()
        {
            
            //Load content into table
            await _contentService.AddContentToDB();
        }
    }
}
