// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using DuoVia.FuzzyStrings;
using NCalc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using OneBot.Singletons;
using OneBot.State;
using OneBot.Models;
using OneBot.Services;

namespace OneBot.Utilities
{
    public static class TextFunctions
    {
        
        /// <summary>
        /// Get user selected option from either presented options or internal options.
        /// Determines whether user input is a repetition of menu items or integer representing menu index of preffered choice
        /// </summary>
        /// <param name="input"></param>
        /// <param name="items"></param>
        /// <param name="presentedOptions"></param>
        /// <returns></returns>
        public static string GetSelectedOption(JArray items, string input, UserData userData, ContentService contentService)
        {
            try
            {
                var index = -1;

                //Ignore these character in input if we're to find an index with typo entry
                var toIgnore = new List<char>() { ',', '%' };

                //Let's check whether we have a typo when trying to enter a number
                //The length of the input should be atleast two and one of the characters must be an integer
                if (input.Length >= 2 && input.Any(Char.IsDigit) && !input.All(Char.IsDigit) && (input.Count(c => Char.IsDigit(c)) < 3 && input.Count(c => Char.IsLetter(c)) < 3 && !input.Any(x => toIgnore.Contains(x))))
                    index = input.FirstOrDefault(Char.IsDigit) - '0';

                //User entered number
                if ((index > -1 || int.TryParse(input, out index)) && items.Count > 1)
                {
                    if (!index.Equals(0) && items.Count() >= index)
                    {
                        var selectedItem = items.ElementAt(index - 1);
                        return GetCurrentOption(selectedItem, "value");
                    }
                    else
                    {
                        return null;
                    }
                    //To do: We may need to update tags in cases like search or diagnosis if user entered number.
                }
                else
                {
                    var itemsScore = new Dictionary<string, int>();
                    string match = null;

                    var language = userData.Has("language") ? userData.Get<string>("language") : contentService.GetAvailableLanguages().Where(x => x.Value<bool>("isDefault")).First().Value<string>("code");

                    foreach (var suggestion in items)
                    {
                        string comparisonItem;

                        if (suggestion.Value<string>("value") != null && suggestion.Value<JObject>("translations") == null)
                        {
                            comparisonItem = suggestion.Value<string>("value");
                        }
                        else if (suggestion.Value<JObject>("translations") == null && suggestion.Value<string>("id") == null)
                        {
                            comparisonItem = suggestion.Value<string>("value");
                        }
                        else
                        {
                            comparisonItem = suggestion.Value<JObject>("translations").SelectToken(language).Value<string>("value");
                        }

                        if (input.ToLowerInvariant().Equals(comparisonItem.ToLowerInvariant()))
                        {
                            match = comparisonItem;
                            break;
                        }
                        else
                            if (comparisonItem.ToLowerInvariant().Contains(input.ToLowerInvariant()) || input.ToLowerInvariant().Contains(comparisonItem.ToLowerInvariant()) || FuzzyMatchingStrings(comparisonItem.ToLowerInvariant(), input.ToLowerInvariant()))
                            itemsScore.Add(comparisonItem, GetDamerauLevenshteinDistance(input, comparisonItem));
                    }

                    if (match == null && itemsScore.Count > 0)
                    {
                        var sorted = from pair in itemsScore
                                     orderby pair.Value ascending
                                     select pair.Key;
                        match = sorted.First();
                    }

                    //We could be here because user made comma separated multiple selections. Lets check for that
                    if (match == null && Regex.IsMatch(input, "(\\d+)(,\\s*\\d+)*"))
                    {
                        var selections = new List<string>();
                        foreach (var item in input.Split(','))
                        {
                            int idx;
                            if (int.TryParse(item.Trim(), out idx))
                            {
                                if (idx.Equals(0) || idx > items.Count())
                                    return null;

                                selections.Add(items.ElementAt(idx - 1).Value<string>("value"));
                            }
                        }
                        if (selections.Count > 0)
                            match = string.Join(",", selections);
                    }
                    return match;
                }
            }
            catch (Exception ex)
            {
                var exception = new Exception(ex.Message, ex);

                throw exception;

            }
        }

        private static string GetCurrentOption(dynamic option, string field = null)
        {
            string output;

            try
            {
                if (option is JToken && option.Value is string)
                {
                    output = option.Value;
                }
                else
                {
                    output = option.Value<string>(field);
                }

                if (output == null)
                {
                    output = option.Value<string>("value");
                }

                return output;

            }
            catch (Exception ex)
            {
                var exception = new Exception(ex.Message, ex);

                throw exception;
            }

        }

        /// <summary>
        /// Finds user selected option from user provided string input
        /// Performs spellchecks if there string provided and no straight match amongst the options
        /// </summary>
        /// <param name="suggestedOptions">List of menu options presented to user</param>
        /// <param name="input">User response to prompt for menu choice</param>
        /// <returns></returns>
        private static string GetOptionsByInput(IEnumerable<string> suggestedOptions, string input)
        {
            try
            {
                string match = null;

                //Lets check whether any of the suggestions has a single character options when user input is single character
                if (input.Length == 1 && !suggestedOptions.Any(x => x.Length == 1))
                    return match;
                if (suggestedOptions.Any(x => FuzzyMatchingStrings(x.ToLowerInvariant(), input) || x.ToLowerInvariant().Contains(input) || input.Contains(x.ToLowerInvariant())))
                {
                    var itemsScore = new Dictionary<string, int>();
                    foreach (var suggestion in suggestedOptions)
                    {
                        var item = suggestion.ToLowerInvariant();
                        if (input.Equals(item))
                        {
                            match = item;
                            break;
                        }
                        else
                            if (item.Contains(input) || input.Contains(item) || FuzzyMatchingStrings(item, input))
                            itemsScore.Add(item, GetDamerauLevenshteinDistance(input, item));
                    }

                    if (match == null && itemsScore.Count > 0)
                    {
                        var sorted = from pair in itemsScore
                                     orderby pair.Value ascending
                                     select pair.Key;
                        match = sorted.First();
                    }
                }

                //We could be here because user made comma separated multiple selections. Lets check for that
                if (match == null && Regex.IsMatch(input, "(\\d+)(,\\s*\\d+)*"))
                {
                    var selections = new List<string>();
                    foreach (var index in input.Split(','))
                    {
                        int idx;
                        if (int.TryParse(index.Trim(), out idx))
                        {
                            if (idx.Equals(0) || idx > suggestedOptions.Count())
                                return null;

                            selections.Add(suggestedOptions.ElementAt(idx - 1));
                        }
                    }
                    if (selections.Count > 0)
                        match = string.Join(",", selections);

                }
                return match;
            }
            catch (Exception ex)
            {
                var exception = new Exception(ex.Message, ex);
                throw exception;
            }
        }

        private static int GetDamerauLevenshteinDistance(string s, string t)
        {
            try
            {
                var bounds = new { Height = s.Length + 1, Width = t.Length + 1 };

                var matrix = new int[bounds.Height, bounds.Width];

                for (var height = 0; height < bounds.Height; height++) { matrix[height, 0] = height; }

                for (var width = 0; width < bounds.Width; width++) { matrix[0, width] = width; }

                for (var height = 1; height < bounds.Height; height++)
                {
                    for (var width = 1; width < bounds.Width; width++)
                    {
                        var cost = (s[height - 1] == t[width - 1]) ? 0 : 1;
                        var insertion = matrix[height, width - 1] + 1;
                        var deletion = matrix[height - 1, width] + 1;
                        var substitution = matrix[height - 1, width - 1] + cost;

                        var distance = Math.Min(insertion, Math.Min(deletion, substitution));

                        if (height > 1 && width > 1 && s[height - 1] == t[width - 2] && s[height - 2] == t[width - 1])
                        {
                            distance = Math.Min(distance, matrix[height - 2, width - 2] + cost);
                        }

                        matrix[height, width] = distance;
                    }
                }
                return matrix[bounds.Height - 1, bounds.Width - 1];
            }

            catch (Exception ex)
            {
                var exception = new Exception(ex.Message, ex);
                throw exception;
            }

        }

        /// <summary>
        /// Run various NLP algoriths to determine whether strings could be related. Useful for spellchecking
        /// </summary>
        /// <param name="first"></param>
        /// <param name="last"></param>
        /// <returns>boolean whether two strings could be similar or not</returns>
        public static bool FuzzyMatchingStrings(string first, string last)
        {
            var matchScore = StringExtensions.FuzzyEquals(first, last);
            var coefficient = StringExtensions.FuzzyMatch(first, last);
            if (!matchScore && coefficient > 0.548)
                matchScore = true;
            return matchScore;
        }


        /// <summary>
        /// Compare user input to description presented to user
        /// </summary>
        /// <param name="presentedOptions">Descriptions presented from user</param>
        /// <param name="input">User input</param>
        /// <returns></returns>
        private static string GetSelectedOption(List<JObject> presentedOptions, string input)
        {
            try
            {
                var option = GetOptionsByInput(presentedOptions.Select(option => option.Value<string>("text")).ToArray(), input);
                return presentedOptions.FirstOrDefault(item => item.Value<string>("text").Equals(option)).Value<string>("value");
            }
            catch (Exception ex)
            {
                var exception = new Exception(ex.Message, ex);

                throw exception;
            }
        }

        /// <summary>
        /// Validate user input against list of formats
        /// </summary>
        /// <param name="validations">Array of validation objects</param>
        /// <param name="userInput">user input</param>
        /// <param name="language">user language</param>
        /// <returns></returns>
        public static List<string> ValidateInput(List<Question> prompts, string userInput, string language)
        {
            var errorMessages = new List<string>();

            var currentPrompt = prompts.Where(prompt => !prompt.isCompleted).FirstOrDefault();
            var currentIndex = prompts.IndexOf(currentPrompt);
            var currentValidation = JArray.FromObject(prompts[currentIndex].questionValidations);

            foreach (var validation in currentValidation)
            {
                bool isValid;
                var validationAttribute = validation.SelectToken("validationAttribute");
                var validationType = validationAttribute.Value<string>("type");
                var expression = validation.Value<string>("expression");

                if (validationType != null)
                {
                    if (validationType.Equals("Regex"))
                    {
                        isValid = Regex.Match(userInput, expression).Success;
                    }
                    else if (validationType.Equals("Expression"))
                    {
                        try
                        {
                            isValid = (bool)new Expression(expression.Replace("#expectedInput#", userInput)).Evaluate();
                        }
                        catch (Exception)
                        {
                            //Ignore the expression evaluation exception as is caused by an external script.
                            //This will be reported back to the user as an input validation error message.                        
                        }
                    }
                }

                //temporary by pass for validations
                isValid = true;

                if (!isValid)
                {
                    var translations = validationAttribute.SelectToken("translations");
                    if (translations != null && language != null)
                    {
                        //extract the translated error message to display to the user's language.
                        errorMessages.Add(translations.SelectToken(language).Value<string>("errorMessage"));
                    }
                    else
                    {
                        errorMessages.Add(validation.SelectToken("errorMessage").Value<string>());
                    }

                }
            }

            return errorMessages;
        }

        /// <summary>
        /// Replace time of day in output string
        /// </summary>
        /// <param name="input">String to be sent out to user</param>
        /// <param name="language">language of conversion</param>
        /// <returns></returns>
        private static string ReplaceTimeOfDay(string input, string language)
        {
            try
            {
                var str = new StringBuilder(input);
                var eat = LocalDateTime(GetBotConfig("properties").Value<string>("timezone"));
                var timeofday = GetTimeOfDay(eat.Hour, language);
                str.Replace("$timeofday", timeofday);
                return str.ToString();
            }
            catch (Exception ex)
            {
                var exception = new Exception(ex.Message, ex);

                throw exception;
            }
        }

        /// <summary>
        /// Return time according the provided timezone
        /// </summary>
        /// <param name="timezone"></param>
        /// <returns></returns>
        private static DateTime LocalDateTime(string timezone)
        {
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.Now.ToLocalTime().ToUniversalTime(), TimeZoneInfo.FindSystemTimeZoneById(timezone));
        }

        /// <summary>
        /// Return descriptive time of day by language 
        /// e.d. morning, afternoon
        /// </summary>
        /// <param name="hour"></param>
        /// <param name="language"></param>
        /// <returns></returns>
        private static string GetTimeOfDay(int hour, string language)
        {
            var timeofday = DefaultsContainer.GetSingleObject().Value<JObject>("timeofday").Value<JArray>(language);
            return hour > 16 ? timeofday[2].ToString() : hour > 11 ? timeofday[1].ToString() : timeofday[0].ToString();
        }

        /// <summary>
        /// Get configuration settings for the customisation of operations on the bot
        /// </summary>
        /// <param name="column">Specific column to be retrieved</param>
        /// <returns></returns>
        public static JObject GetBotConfig(string column = null)
        {
            if (column != null)
                return JsonConvert.DeserializeObject<JObject>(File.ReadAllText(AppContext.BaseDirectory + @"/Data/config.json")).Value<JObject>(column);
            else
                return JsonConvert.DeserializeObject<JObject>(File.ReadAllText(AppContext.BaseDirectory + @"/Data/config.json"));
        }

        /// <summary>
        /// This function replaces all placeholders in text before it is sent out to the user.
        /// Some of the placeholders include, user's name as in the state, time of day when it comes to greetings etc.
        /// </summary>
        /// <param name="output">outgoing string</param>
        /// <param name="user">user profile from where we can get additional information</param>
        /// <returns>string with placeholders removed</returns>
        public static string PrepareOutput(string output, UserData user = null)
        {
            try
            {
                output = PrepareOutput(output, user.Get<string>("language"));

                //Replace user properties
                if (user == null)
                    return output;

                foreach (var property in Regex.Matches(output, @"\#\w+\#"))
                {
                    var placeholder = property.ToString().Substring(1, property.ToString().Length - 2);
                    if (user.Has(placeholder))
                    {
                        output = output.Replace(property.ToString(), user.Get<string>(placeholder));
                    }
                    else if (user.Has("profile") && user.Get<JObject>("profile").ContainsKey(placeholder))
                    {
                        output = output.Replace(property.ToString(), user.Get<JObject>("profile").Value<string>(placeholder));
                    }
                }

                output = output.Trim();
                return output != string.Empty ? string.Concat(output[0].ToString().ToUpperInvariant(), output.AsSpan(1)) : string.Empty;
            }
            catch (Exception ex)
            {
                var exception = new Exception(ex.Message, ex);

                throw exception;
            }
        }

        /// <summary>
        /// Replaces known placeholders from outgoing text 
        /// </summary>
        /// <param name="output">Outgoing message</param>
        /// <param name="language">User's language</param>
        /// <returns>string with replaced message</returns>
        private static string PrepareOutput(string output, string language)
        {
            //replace greeting
            if (output.Contains("$greeting"))
                output = output.Replace("$greeting", GetGreeting(language));

            //replace time of day
            if (output.Contains("$timeofday"))
                output = ReplaceTimeOfDay(output, language);

            return output;
        }

        private static string GetGreeting(string language)
        {
            var greetings = DefaultsContainer.GetSingleObject().Value<JObject>("greetings").Value<JArray>(language).ToObject<string[]>();
            var randomGreeting = greetings.OrderBy(x => Guid.NewGuid()).ToArray().First().ToLowerInvariant();
            return randomGreeting;
        }

        /// <summary>
        /// Format an array of strings into a list presented to the user with last ',' replaced by a delimiter e.g. "and", "or"
        /// </summary>
        /// <param name="array">List of strings</param>
        /// <param name="delimiter">delimiter between last two words</param>
        /// <param name="formated">Surround output with brackets()</param>
        /// <returns></returns>
        public static string ArrayToString(List<string> array, string delimiter = null, bool formated = true, string joiner = ", ", bool numbered = false)
        {
            try
            {
                var words = " \n\n\n\n ";
                if (array.Count() < 1)
                    return words;

                if (!formated)
                    words = array.Aggregate((current, next) => numbered ? $"{(array.IndexOf(next) < 2 ? $"{array.IndexOf(current) + 1}." : "")} {current} {joiner} {array.IndexOf(next) + 1}. {next}" : $"{current} {joiner} {next}");
                else
                {
                    var sb = new StringBuilder();
                    sb.Append("   ");
                    foreach (var item in array)
                    {
                        sb.Append($" ({array.IndexOf(item) + 1}. {item.ToUpperInvariant()}), ");
                    }
                    sb.Remove(sb.ToString().LastIndexOf(','), 1);
                    words = sb.ToString().Trim();
                }

                if (delimiter != null)
                {
                    words = Conjunction(words, delimiter);
                }

                return words;
            }
            catch (Exception ex)
            {
                var exception = new Exception(ex.Message, ex);

                throw exception;
            }
        }
        /// <summary>
        /// TO be Done - Match content with tags
        /// </summary>
        /// <param name="userInput"></param>
        /// <param name="content"></param>
        /// <param name="userProfile"></param>
        /// <returns></returns>
        public static dynamic MatchingContent(string userInput, List<JObject> content, UserData userProfile, ContentService contentService)
        {
            
            try
            {
                //Add the title to the tags list to expand search
                Dictionary<string, HashSet<string>> contentLabels = new Dictionary<string, HashSet<string>>();
                

                foreach (var item in content)
                {
                    foreach (var translation in item.Value<JObject>("translations"))
                    {
                        var labels = translation.Value.Value<string>("label").Trim().Split(' ').ToHashSet<string>();

                        var id = item.Value<string>("id");

                        if (!contentLabels.ContainsKey(id))
                        {
                            contentLabels.Add(id, new HashSet<string>(labels, StringComparer.OrdinalIgnoreCase));
                        }
                        else
                            contentLabels[id].UnionWith(labels);
                    }
                }

                string contentId = SearchedContentId(userInput, content, contentLabels);

                if (contentId == null)
                    return null;

                var contentText = contentService.GetContent(contentId, userProfile.data.Value<string>("language"), 0);

                return contentText;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message + " thrown at MatchingContent", ex);
            }

        }

        /// <summary>
        /// To be done - gets content id from tagged content
        /// </summary>
        /// <param name="userInput"></param>
        /// <param name="content"></param>
        /// <returns></returns>
        private static string SearchedContentId(string input, List<JObject> contentList, Dictionary<string, HashSet<string>> contentLabels)
        {
            try
            {
                string contentId;
                int maxScoreIndex = 0;

                int length = contentList.Count;
                int[] score = new int[length];
                string[] words = input.TrimEnd('?').ToLower().Split(' ');

                int maxScore = 0;
                int i = 0;

                foreach (var content in contentList)
                {
                    if (content.ContainsKey("tags"))
                    {
                        //Search through the tags list with the content labels included to expand search
                        var tags = contentLabels[content.Value<string>("id")];
                        var tagsList = content.Value<JArray>("tags");
                        tags.UnionWith(tagsList.ToObject<List<string>>());

                        foreach (string word in words)
                        {
                            if (tags.Contains(word))
                            {
                                score[i]++;
                            }
                            if (score[i] > maxScore)
                            {
                                maxScore = score[i];
                                maxScoreIndex = i;
                            }
                        }
                        i++;
                    }
                }

                contentId = contentList[maxScoreIndex].Value<string>("id");

                return contentId;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message + " thrown at SearchedContentId", ex);
            }

        }

        /// <summary>
        /// Add a conjunction between comma separated words in a string
        /// </summary>
        /// <param name="word">comma separated string</param>
        /// <param name="delimiter">string to use as conjunction</param>
        /// <returns>string with last comma replaced by a conjunction e.g. "and", "or" or "au" </returns>
        private static string Conjunction(string word, string delimiter)
        {
            const string searchStr = ",";
            var lastIndex = word.LastIndexOf(',');
            if (lastIndex >= 0)
            {
                word = word.Substring(0, lastIndex) + " " + delimiter + word.Substring(lastIndex + searchStr.Length);
            }
            return word;
        }

        /// <summary>
        /// get the filters in a particular content/service and checks whether the content should be displayed or not. 
        /// </summary>
        /// <param name="constraints"></param>
        /// <param name="result"></param>
        /// <returns></returns>
        private static Dictionary<string, HashSet<string>> GetFilters(JArray constraints, Dictionary<string, HashSet<string>> result)
        {

            foreach (var constraintItem in constraints)
            {
                if (!result.ContainsKey(constraintItem.Value<JObject>("constraintItem").Value<string>("entity")))
                {
                    if (constraintItem.Value<JArray>("filters").Count > 0)
                        result.Add(constraintItem.Value<JObject>("constraintItem").Value<string>("entity"), new HashSet<string>());
                }

                if (constraintItem.Value<JArray>("filters").Count > 0)
                {
                    foreach (var filter in constraintItem.Value<JArray>("filters").ToObject<HashSet<string>>())
                        result[constraintItem.Value<JObject>("constraintItem").Value<string>("entity")].Add(filter);
                }
            }

            return result;
        }

        /// <summary>
        /// Gets the constraint items in a lookup dictionary that will be used to 
        /// get the filters in a particular content/service and checks whether the content should be displayed or not. 
        /// </summary>
        /// <param name="content"></param>
        /// <returns></returns>
        private static Dictionary<string, HashSet<string>> GetConstraints(JObject menu, int currentContentId)
        {
            Dictionary<string, HashSet<string>> constraintItems = new Dictionary<string, HashSet<string>>();

            constraintItems = GetFilters(menu.Value<JArray>("constraints"), constraintItems);

            if (constraintItems.Count > 0)
                return constraintItems;

            return new Dictionary<string, HashSet<string>>();

        }
        /// <summary>
        /// Check if the content should be displayed to the user at the point where we get the services and content 
        /// </summary>
        /// <param name="content"></param>
        /// <param name="userdata"></param>
        /// <returns></returns>
        public static bool ValidateAgaistConstraints(JObject menu, UserData userProfile, int currentContentId = 0)
        {

            var constraintLooUp = GetConstraints(menu, currentContentId);

            if (constraintLooUp.Count == 0)
            {
                return true;
            }

            var selectedUserProfileOptions = new HashSet<string>();

            var displayContent = false;

            foreach (var userDataItem in userProfile.data.Value<JArray>("profile"))
            {
                selectedUserProfileOptions.Add(userDataItem.Value<string>("questionValueId"));
            }

            foreach (var key in constraintLooUp.Keys)
            {
                var filters = constraintLooUp[key];

                if (key == "channel")
                {
                    if (filters.Contains(userProfile.data.Value<string>("channelPortalId")))
                        displayContent = true;
                }
                //it's a profile/locations type of constraint
                else
                {
                    while (filters.Count > 0)
                    {
                        if (selectedUserProfileOptions.Contains(filters.First()))
                        {
                            displayContent = true;
                            filters.Remove(filters.First());
                        }
                        else
                        {
                            displayContent = false;
                            break;
                        }
                    }
                }
            }
            return displayContent;
        }
    }
}
