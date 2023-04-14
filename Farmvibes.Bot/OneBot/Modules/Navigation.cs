// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System.Collections.Generic;
using OneBot.Singletons;
using Newtonsoft.Json.Linq;
using System.Linq;
using System.Text;
using System;
using OneBot.Utilities;
using OneBot.Models;
using OneBot.Services;
using OneBot.State;

namespace OneBot.Modules
{
    public class Navigation
    {
        private readonly ContentService _contentService;
        private readonly PromptsHandlerService _promptsHandlerService;

        public Navigation(InteractionsService utilitiesService, ContentService contentService, PromptsHandlerService promptsHandlerService)
        {
            _contentService = contentService;
            _promptsHandlerService = promptsHandlerService;
        }
        
        //Get menu options
        /// <summary>
        /// This functions returns content to display which could be either menu options or content if the user selected a node.
        /// </summary>
        /// <param name="input">Users' input</param>
        /// <param name="state">State object tracking users' navigation</param>
        /// <param name="userProfile"></param>
        /// <param name="hasBeenWelcomed">Flag checking whether user has been welcomed so that we do not greet them twice</param>
        /// <returns></returns>
        public Dictionary<string, dynamic> GetMenu(string input, JObject state, UserData userProfile, bool hasBeenWelcomed = true)
        {
            try
            {
                var currentContentId = 0;
                string treeId;
                var finalState = new JObject();

                if (state != null)
                {
                    currentContentId = state.Value<int>("currentContentId");
                    treeId = state.Value<string>("treeId") != null ? state.Value<string>("treeId") : null;
                    finalState = state;
                }

                var menuDict = _contentService.GetContentUsingId(currentContentId, "menu");
                var treeDict = _contentService.GetMenuTrees(currentContentId, "trees");
                var response = new Dictionary<string, dynamic>();

                var output = new StringBuilder();
                var menu = new JObject();

                currentContentId = (int)menuDict.First().Key;

                //If state is null, we show the main menu
                if (state == null || !state.HasValues)
                {

                    var tree = treeDict.First().Value;
                    //We need to welcome user, if they've been greeted before, we do not need to do it again 
                    if (!hasBeenWelcomed)
                    {
                        output.Append(DefaultsContainer.GetDefaultsContainerMessages("intro", userProfile.Get<string>("language")));
                        finalState.Add("hasBeenWelcomed", true);
                    }
                    output.Append(DefaultsContainer.GetDefaultsContainerMessages("intro_tail", userProfile.Get<string>("language")));

                    //TO DO: if we have multiple menus, we need to filter correct menu
                    menu = tree.FirstOrDefault().FirstOrDefault();

                    //user is navigating menu
                    finalState.Add("state", "mainMenu");
                    finalState.TryAdd("treeId", menu.Value<string>("id"));
                }
                //User selected branch
                else
                {
                    treeId = state.Value<string>("treeId");
                    var tree = treeDict.FirstOrDefault().Value.First().Where(item => item.Value<string>("id").Equals(treeId)).ToList();
                    finalState["treeId"] = treeId;

                   if (state.Value<string>("nodeId") != null)
                    {
                        var parent = new JObject();
                        //get the menu that the user is traversing
                        var currentNode = GetNode(tree, state.Value<string>("nodeId"));

                        if (state.ContainsKey("backAfterCompletion") && state.Value<bool>("backAfterCompletion"))
                        {
                            menu = GetNode(tree, state.Value<string>("nodeId"), true);
                        }
                        else
                        {
                            if (currentNode == null)
                            {
                                parent = GetNode(tree, state.Value<string>("nodeId"));
                            }

                            if (parent.Count > 0)
                            {
                                //get the menu being traversed by the user
                                menu = currentNode != null && currentNode.Value<JToken>("translations").Value<JToken>(userProfile.Get<string>("language")).Value<string>("label").ToLowerInvariant().Equals(input.ToLowerInvariant()) ? parent : null;
                            }
                            else
                            {
                                //check for branches
                                var children = currentNode?.Value<JArray>("children").Where(c => c.Value<JToken>("translations").Value<JToken>(userProfile.Get<string>("language")).Value<string>("label").ToLowerInvariant() == input.ToLowerInvariant()).ToList();

                                if (children != null && children.Count > 0)
                                {
                                    menu = children.First().ToObject<JObject>();
                                }
                            }
                        }

                        //check for content
                        if (menu == null || menu.Count < 1)
                        {
                            if(currentNode != null && currentNode.Value<JArray>("children").Count > 0)
                            {
                                var contentNode = currentNode.Value<JArray>("children")
                                    .First(c => c.Value<string>("id") == state.Value<string>("nodeId")).Value<JArray>("children")
                                    .First(c => c.Value<JToken>("translations").Value<JToken>(userProfile.Get<string>("language"))
                                        .Value<string>("label").ToLowerInvariant() == input.ToLowerInvariant()).Value<JArray>("children").First()
                                    .ToObject<JObject>();

                                if (contentNode != null || contentNode.Count > 0)
                                {
                                    menu = contentNode;
                                }
                            }
                            else
                            {
                                menu = null;
                            }
                        }
                    }

                    string nodeType;
                    if (menu == null || menu.Count == 0)
                    {
                        menu = tree.FirstOrDefault();
                        finalState.Add("state", "mainMenu");
                        finalState.Add("currentContentId", currentContentId);
                        if (!finalState.ContainsKey("language"))
                            finalState.Add("language", userProfile.Get<string>("language"));
                        output.Append(DefaultsContainer.GetDefaultsContainerMessages("intro_tail", userProfile.Get<string>("language")));
                    }
                    else
                    {
                        nodeType = menu.SelectToken("type")?.Value<string>("name");

                        switch (nodeType)
                        {
                            case "content":
                                var contentId = menu.Value<JToken>("content").Value<string>("id");
                                response = _contentService.GetContent(contentId, userProfile.Get<string>("language"), currentContentId);
                                finalState["state"] = "content";
                                finalState["contentObj"] = menu;
                                finalState["contentId"] = contentId;
                                finalState["completed"] = true;
                                finalState.Remove("newBranch");
                                finalState["nodeId"] = menu["id"];
                                finalState["finalMenu"] = true;
                                response["state"] = finalState;

                                var finalMenuoptions = DefaultsContainer.GetSingleObject().Value<JObject>("final_menu_options").Value<JArray>(userProfile.Get<string>("language")).ToList();
                                var optionList = new List<QuestionOption>();
                                foreach (var text in finalMenuoptions)
                                {
                                    optionList.Add(new QuestionOption { value = text.ToString() });
                                }

                                response.Add("finalMenu", optionList);
                                return response;
                            case "service":
                                finalState["nodeId"] = menu.Value<string>("id");
                                response = _promptsHandlerService.GetServicePrompts(menu.Value<JToken>("service").Value<string>("id"), userProfile, finalState);
                                output.Append(response["text"].ToString());
                                break;
                            default:
                                //Let's append a random message accompanying the options
                                finalState["type"] = "branch";
                                finalState["currentContentId"] = currentContentId;
                                finalState["contentObj"] = menu;
                                finalState["state"] = "branch";
                                response["state"] = finalState;

                                var menuOption = DefaultsContainer.GetDefaultsContainerMessages("menu_options", userProfile.Get<string>("language"));

                                output.Append(menuOption);
                                break;
                        }
                    }
                }

                //We need to get the menu options. 
                if (menu != null && (!menu.HasValues || (response.ContainsKey("state") && response.ContainsKey("text") && response.ContainsKey("options"))))
                {
                    return response;
                }

                //Filter using constraints
                var validMenu = TextFunctions.ValidateAgaistConstraints(menu, userProfile);

                var options = new List<QuestionOption>();

                if (validMenu && menu.Value<JArray>("children").Count > 0)
                {
                    foreach (var child in menu.Value<JArray>("children"))
                    {
                        var validChild = TextFunctions.ValidateAgaistConstraints((JObject)child, userProfile, currentContentId) && BranchHasChildren((JObject)child);

                        if (!validChild)
                        {
                            child["display"] = false;
                        }
                        else
                        {
                            child["display"] = true;
                        }
                    }

                    foreach (var child in menu.Value<JArray>("children"))
                    {
                        if (!child.Value<bool>("display"))
                        {
                            continue;
                        }

                        foreach (var c in child.Children<JProperty>())
                        {

                            if (String.Compare(c.Name, "translations", StringComparison.Ordinal) == 0)
                            {
                                options.Add(new QuestionOption { value = c.Value[userProfile.Get<string>("language")]?.Value<string>("label") });
                            }
                        }
                    }
                }
                else
                {
                    if (menu != null)
                    {
                        foreach (var c in menu.Children<JProperty>())
                        {
                            if (String.Compare(c.Name, "translations", StringComparison.Ordinal) == 0)
                            {
                                options.Add(new QuestionOption
                                    { value = c.Value[userProfile.Get<string>("language")]?.Value<string>("label") });
                            }
                        }
                    }
                }
                finalState["nodeId"] = menu.Value<string>("id");

                return new Dictionary<string, dynamic>() { { "text", output.ToString() }, { "options", options }, { "state", finalState } };
            }
            catch(Exception ex)
            {
                throw new Exception(ex.Message + "thrown at GetMenu()", ex);
            }
        }

        /// <summary>
        /// Navigate back to the last node before content item was shown to the user. This will fetch the children of the parent node to the current chosen content node.
        /// </summary>
        /// <param name="nodeId">Identifier of the content node displayed to user</param>
        /// <param name="language">User language</param>
        /// <returns></returns>
        public Dictionary<string, dynamic> NavigateBackFromContent(JObject state, string language)
        {
            try
            {
                var treeDict = _contentService.GetMenuTrees(state.Value<int>("currentContentId"), "trees");
                var tree = treeDict.First().Value;
                var menus = tree.First();
                var nodeId = state.Value<string>("nodeId");
                var output = new StringBuilder();
                var finalState = new JObject();
                var menuOptions = DefaultsContainer.GetDefaultsContainerMessages("menu_options", language);
                var options = new List<QuestionOption>();

                output.Append(menuOptions);
                var jContainer = GetNode(menus, nodeId).Parent;

                if (jContainer != null)
                {
                    var currentNode = jContainer.Parent;

                    if (currentNode != null)
                    {
                        var children = currentNode.First().OrderBy(item => item.Value<int>("lvl"));
                        foreach (var child in children)
                        {
                            var validChild = BranchHasChildren((JObject)child);

                            if (validChild)
                            {
                                options.Add((new QuestionOption {
                                    value = child.Value<JObject>("translations").SelectToken(language)
                                        .Value<string>("label")
                                }));
                            }
                        }
                    }

                    finalState.Add("treeId", state.Value<string>("treeId"));
                    if (currentNode != null && currentNode.Parent != null)
                    {
                        finalState.Add("nodeId", currentNode.Parent.Value<string>("id"));
                        var nodeType = currentNode.Parent.SelectToken("type")?.Value<string>("name");
                        finalState.Add("state", nodeType != null && nodeType.Equals("main") ? "mainMenu" : nodeType);
                    }
                }
                return new Dictionary<string, dynamic>() { { "text", output.ToString() }, { "options", options }, { "state", finalState } };
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message + "thrown at NavigateBackFromContent()", ex);
            }
        }

        /// <summary>
        /// This function determines which direction the user intents to move with the interaction, this can be forward, back or menu
        /// </summary>
        /// <param name="input">user input for evaluation</param>
        /// <param name="language">languade of user interaction</param>
        /// <returns></returns>
        public string NavigationDirection(string input, string language = null)
        {
            try
            {
                var navigation = DefaultsContainer.GetSingleObject().Value<JObject>("navigation");
                var direction = "forward";

                if (language == null)
                    return direction;

                foreach (var item in navigation.Properties())
                {
                    if (item.Value.ToObject<JObject>().Properties().FirstOrDefault(x => x.Name == language).Value.ToObject<List<string>>().Any(tag => TextFunctions.FuzzyMatchingStrings(tag.ToLowerInvariant(), input) || tag.ToLowerInvariant().Contains(input) || input.Contains(tag.ToLowerInvariant())))
                    {
                        direction = item.Name;
                    }
                }
                return direction;
            }
            catch(Exception ex)
            {
                throw new Exception(ex.Message + "thrown at NavigationDirection()", ex);
            }

        }

        /// <summary>
        /// This function navigates throught the nested menu to find the node through nodeId whose options were presented to the user
        /// </summary>
        /// <param name="menus">Menu object from which the users' options have been presented</param>
        /// <param name="nodeId">Id of the node to return</param>
        /// <returns></returns>
        private JObject GetNode(List<JObject> menus, string nodeId, bool parent = false)
        {
            try
            {
                var jtoken = JToken.FromObject(menus);
                var reader = jtoken.CreateReader();
                while (reader.Read())
                {
                    var value = reader.Value;
                    if (value != null && value.ToString() == nodeId)
                    {
                        var path = reader.Path.Replace("[0].value", "[1].value");
                        if (parent)
                            return (JObject)jtoken.SelectToken(path.Substring(0, path.LastIndexOf('.'))).Parent.Parent;
                        else
                            return (JObject)jtoken.SelectToken(path.Substring(0, path.LastIndexOf('.')));
                    }
                }
                return null;
            }
            catch  (Exception ex)
            {
                throw new Exception(ex.Message + "thrown at GetNode()", ex);
            }
        }

        /// <summary>
        /// Checks if a node has children
        /// </summary>
        /// <param name="node"></param>
        /// <returns>Boolean value</returns>
        private Boolean BranchHasChildren(JObject node)
        {
            try
            {
                if (node.SelectToken("type").Value<string>("name") == "branch" && !node["children"].HasValues)
                    return false;

                return true;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message + " thrown at BranchHasChildren()", ex);
            }

        }
    }
}