using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace OneBot.Database
{
    public interface IDatabaseClientInterface
    {
        public T GetConnection<T>();
        public int ExecuteCommand(string query, Dictionary<string, object> Parameters = null);
        public DataTable Select(string query, Dictionary<string, object> Parameters = null);

    }
}
