// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
//
// Generated with Bot Builder V4 SDK Template for Visual Studio EmptyBot v4.13.2

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using OneBot.Services;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace OneBot
{
    public class TimedHostedService : IHostedService
    {

        private System.Timers.Timer timer;
        private readonly ILogger<TimedHostedService> _logger;
        private readonly ContentService _contentService;
        private readonly IConfiguration _config;
        
        public TimedHostedService(IConfiguration config, ILogger<TimedHostedService> logger, ContentService contentService)
        {
            _config = config;
            _logger = logger;
            _contentService = contentService;
        }

        /// <summary>
        /// Set up the timer that will run every 3hrs then trigger the timed event 
        /// needed to get the data from the content piece to the db
        /// </summary>
        public Task StartAsync(CancellationToken cancellationToken)              
        {
            timer = new System.Timers.Timer();

            timer.Interval = Convert.ToInt32(_config["TimerInterval"]);
            // Hook up the Elapsed event for the timer. 
            timer.Elapsed += _contentService.OnTimedEvent;

            // Have the timer fire repeated events (true is the default)
            timer.AutoReset = true;

            // Start the timer
            timer.Enabled = true;

            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Timed Hosted Service is stopping.");

            timer?.Stop();

            return Task.CompletedTask;
        }
    }
}