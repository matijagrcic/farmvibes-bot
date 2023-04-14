// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
//
// Generated with Bot Builder V4 SDK Template for Visual Studio EmptyBot v4.13.2

using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using OneBot.Interfaces;
using Polly;
using Polly.Extensions.Http;
using System;
using System.Net.Http;
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

        public static IHostBuilder CreateHostBuilder(string[] args) =>
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


        /// <summary>
        /// The circuit breaker policy is configured so it breaks or opens the circuit when there have been five consecutive faults when retrying the Http requests. 
        /// When that happens, the circuit will break for 30 seconds: in that period, calls will be failed immediately by the circuit-breaker rather than actually be placed
        /// </summary>
        /// <returns></returns>
        static IAsyncPolicy<HttpResponseMessage> GetCircuitBreakerPolicy()
        {
            return HttpPolicyExtensions
                .HandleTransientHttpError()
                .CircuitBreakerAsync(5, TimeSpan.FromSeconds(30));
        }

        /// <summary>
        ///  In this case, the policy is configured to try six times with an exponential retry, starting at two seconds.
        /// </summary>
        /// <returns></returns>
        static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy()
        {
            return HttpPolicyExtensions
                .HandleTransientHttpError()
                .OrResult(msg => msg.StatusCode == System.Net.HttpStatusCode.NotFound)
                .WaitAndRetryAsync(6, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2,
                                                                            retryAttempt)));
        }
    }
}
