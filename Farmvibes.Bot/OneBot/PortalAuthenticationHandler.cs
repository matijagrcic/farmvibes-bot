// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using Azure.Identity;
using Microsoft.Extensions.Configuration;
using System;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace OneBot;

public class PortalAuthenticationHandler : DelegatingHandler
{
    private readonly IConfiguration _config;
    private readonly ClientSecretCredential _clientSecretCredential;
    
    public PortalAuthenticationHandler(IConfiguration config)
    {
        _config = config;
        _clientSecretCredential = new ClientSecretCredential(_config["AzureADTenantId"], _config["AzureADClientId"], _config["AzureADClientSecret"]);
    }
    
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage httpRequestMessage,
        CancellationToken cancellationToken)
    {
        string token = await GetTokenAsync();
        httpRequestMessage.Headers.Add("Authorization", string.Format("Bearer {0}", token));
        return await base.SendAsync(httpRequestMessage, cancellationToken);
    }
    
    /// <summary>
    /// Gets the bearer token for authorization on the portal
    /// </summary>
    /// <returns>token string to be used for authentication for the other api calls</returns>
    private async Task<string> GetTokenAsync()
    {
        try
        {
            string[] scopes = { _config["AzureADScope"] };
            var token = await _clientSecretCredential.GetTokenAsync(new Azure.Core.TokenRequestContext(scopes));
            return token.Token;
        }
        catch (Exception ex)
        {
            throw new Exception(ex.Message + " thrown at GetToken()", ex);
        }
    }
}