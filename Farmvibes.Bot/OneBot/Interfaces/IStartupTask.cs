using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OneBot.Interfaces
{
    public interface IStartupTask
    {
        Task Execute();
    }
}
