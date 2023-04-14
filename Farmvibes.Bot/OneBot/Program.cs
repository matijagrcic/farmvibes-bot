// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
//
// Generated with Bot Builder V4 SDK Template for Visual Studio EmptyBot v4.13.2

using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using OneBot.Interfaces;
using System.Threading.Tasks;

namespace OneBot
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var host = CreateHostBuilder(args).Build();

            var startupTasks = host.Services.GetServices<IStartupTask>();

            foreach(var startuptask in startupTasks)
            {
                await startuptask.Execute();
            }

            await host.RunAsync();
        }

        private static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
             
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.ConfigureServices(s => s.AddHttpClient())
                    .UseStartup<Startup>();
                })
            .ConfigureServices(services =>
            {
                services.AddHostedService<TimedHostedService>();
            });
    }
}
