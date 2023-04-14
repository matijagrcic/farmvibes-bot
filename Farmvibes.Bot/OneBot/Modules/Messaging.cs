// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using Microsoft.Bot.Schema;
using System;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;
using System.Net;
using Microsoft.Extensions.Configuration;
using Attachment = Microsoft.Bot.Schema.Attachment;
using OneBot.State;
using Microsoft.Bot.Builder;
using OneBot.Models;
using OneBot.Singletons;
using OneBot.Utilities;
using System.Text;
namespace OneBot.Modules
{
    /// <summary>
    /// This class handles all messaging related features of the bot.
    /// The functions within prepares all outgoing messages and hands them over to the sending function.
    /// Outgoing messages can be media or text.
    /// </summary>
    public class Messaging
    {
        private readonly IConfiguration _config;

        /// <summary>
        /// Generates an image card with caption to the user.
        /// </summary>
        /// <param name="config"></param>
        /// <returns></returns>
        public Messaging(IConfiguration config)
        {
            _config = config;
        }

        private Attachment GetImageCard(JObject item)
        {
            var heroCard = new HeroCard
            {
                Title = item.Value<string>("title"),
                Subtitle = "",
                Text = item.Value<string>("text"),
                Images = new List<CardImage> { new CardImage(item.Value<string>("pathUrl")) }
            };

            heroCard = CreateCardButtons(item, heroCard);

            return heroCard.ToAttachment();
        }

        /// <summary>
        /// Generates a video card to send out videos to users.
        /// </summary>
        /// <param name="video">Object with link, caption, thumbnail and title of card</param>
        /// <returns></returns>
        private Attachment GetVideoCard(JObject video)
        {
            var videoCard = new VideoCard
            {
                Title = video.Value<string>("caption"),
                Subtitle = "",
                Text = video.Value<string>("text"),
                Image = new ThumbnailUrl
                {
                    Url = video.Value<string>("filename"),
                },
                Media = new List<MediaUrl>
                {
                    new MediaUrl()
                    {
                        Url = video.Value<string>("filename"),
                    },
                }
            };
            videoCard = CreateCardButtons(video, videoCard);
            return videoCard.ToAttachment();
        }

        /// <summary>
        /// Generates an audio card to send to the user.
        /// </summary>
        /// <param name="audio">Object with link, caption and title of card</param>
        /// <returns></returns>
        private Attachment GetAudioCard(JObject audio)
        {
            var audioCard = new AudioCard
            {
                Title = audio.Value<string>("title"),
                Subtitle = "",
                Text = audio.Value<string>("text"),
                Media = new List<MediaUrl>
                {
                    new MediaUrl()
                    {
                        Url = audio.Value<string>("url"),
                    },
                }
            };

            audioCard = CreateCardButtons(audio, audioCard);
            return audioCard.ToAttachment();
        }

        /// <summary>
        /// Generates options for users to select alongside the messages sent to them.
        /// </summary>
        /// <param name="options">List of options to select from.</param>
        /// <param name="userData"></param>
        /// <param name="numberOptions">Indicates whether we can prefix the options with their numeric position.</param>
        /// <returns></returns>
        public SuggestedActions MessageActions(dynamic options, UserData userData, bool numberOptions = false)
        {
            try
            {
                // Create CardAction buttons 
                // and return to the calling method 
                var cardButtons = new List<CardAction>();
                foreach (var option in options)
                {
                    string optionText;

                    if (option is string)
                    {
                        optionText = option.value.Trim();
                    }
                    else 
                    {
                        var language = userData.Has("language") ? userData.Get<string>("language") : "en";

                        if (option.translations == null)
                        {
                            optionText = option.value.ToString().Trim();
                        }
                        else
                        {
                            var optionTranslations = option.translations;
                            if (optionTranslations != null)
                            {
                                var userLanguageTranslation = optionTranslations.Value<JObject>(language);

                                if (userLanguageTranslation != null)
                                {
                                    optionText = userLanguageTranslation.Value<string>("value").Trim();

                                    //we don't need to display an empty option
                                    if (optionText.Equals(string.Empty))
                                        continue;
                                }
                                else
                                {
                                    optionText = optionTranslations.Value<JObject>("en").Value<string>("value").Trim();
                                }

                            }
                            else
                            {
                                optionText = option.Value<string>("value").Trim();
                            }
                        }
                    }

                    CardAction cardButton = CreateCardButton(string.Concat(optionText[0].ToString().ToUpperInvariant(), optionText.ToLowerInvariant().Substring(1)),
                        numberOptions ? options.IndexOf(option) + 1 : default(int));
                    
                    cardButtons.Add(cardButton);
                }

                return new SuggestedActions() { Actions = cardButtons };
            }
            catch(Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
            
        }
        /// <summary>
        /// Sets the text to be presented to the user in the activity message
        /// </summary>
        /// <param name="content"></param>
        /// <param name="userProfile"></param>
        /// <returns>Text to be sent out</returns>
        public string SetText(Dictionary<string, dynamic> content, UserData userProfile)
        {
            string output;
            if (content["text"] is string)
            {
                output = TextFunctions.PrepareOutput(content["text"], userProfile);
            }
            else
            {
                var toUser = new StringBuilder();
                foreach (string msg in content["text"])
                {
                    if (((JArray)content["text"]).IndexOf(msg) < 1)
                        continue;
                    toUser.AppendLine(msg);
                }
                output = TextFunctions.PrepareOutput(toUser.ToString(), userProfile);
            }

            return output;
        }
        /// <summary>
        /// Sets the media to be presented to the activity message
        /// </summary>
        /// <param name="userProfile"></param>
        /// <param name="content"></param>
        /// <returns>Media output object</returns>
        public IMessageActivity SetMedia(UserData userProfile, Dictionary<string, dynamic> content)
        {
            var attachments = new List<Attachment>();
            var output = MessageFactory.Attachment(attachments);

            userProfile.Set("content", "media");
            foreach (JObject media in content["media"])
            {
                //Let us replace placeholders in the text
                if (media.Value<string>("caption") != null)
                {
                    media["text"] = TextFunctions.PrepareOutput(media.Value<string>("caption"), userProfile);
                }
                else
                {
                    if (content["text"] is string)
                    {
                        media["text"] = TextFunctions.PrepareOutput(content["text"], userProfile);
                    }
                    else
                    {
                        media["text"] = TextFunctions.PrepareOutput(JArray.FromObject(content["text"]).First.ToString(), userProfile);
                    }
                }

                switch (media.Value<string>("filetype"))
                {
                    case "video":
                        output.Attachments.Add(GetVideoCard(media));
                        break;

                    case "audio":
                        output.Attachments.Add(GetAudioCard(media));
                        break;

                    default:
                        output.Attachments.Add(GetImageCard(media));
                        break;
                }
            }

            return output;
        }
        /// <summary>
        /// Set display options
        /// </summary>
        /// <param name="content"></param>
        /// <param name="userProfile"></param>
        /// <param name="numberOptions"></param>
        /// <returns></returns>
        public dynamic SetOptions(Dictionary<string, dynamic> content, UserData userProfile, bool numberOptions = false)
        {
            var options = content["options"];
            var objFound = content["state"].ContainsKey("state");

            //We don't need to set back button on the main menu
            if ((content.ContainsKey("state") && objFound && !((JObject)content["state"]).Value<string>("state").Equals("mainMenu")) && userProfile.Has("language"))
            {
                do
                {
                    if (((JObject)content["state"]).Value<string>("state").Equals("service") && ((JObject)content["state"]).Value<bool>("finalMenu"))
                    {
                        break;
                    }

                    var backButtonText = DefaultsContainer.GetSingleObject().Value<JObject>("back_button").Value<string>(userProfile.Get<string>("language"));

                    var backButtonObj = new QuestionOption { value = backButtonText };

                    if (options is List<QuestionOption>)
                    {
                        options.Add(backButtonObj);
                    }
                } while (false);
            }
            return options;
        }

        /// <summary>
        /// Creates a card button which is returned to users as options to select from when navigating the bot
        /// </summary>
        /// <param name="text">Button text</param>
        /// <param name="numberOption">Number if the buttons need to be numbered</param>
        /// <returns></returns>
        private CardAction CreateCardButton(string text, int numberOption)
        {
            var cardButton = new CardAction()
            {
                Type = "imBack",
                Title = numberOption != default ? $"{numberOption}. {text}" : text,
                Value = text
            };

            return cardButton;
        }

        /// <summary>
        /// If outgoing messages have buttons linking to external content, this function will create buttons and embed on the card.
        /// If the item object contains 'info' key, buttons will be created at the bottom of the cards with the info.
        /// 'info' is an array with objects that have a title (title for the button) and source (link to send user when button clicked)
        /// </summary>
        /// <param name="item">JObject item which contains content with specific interest of the 'info' key</param>
        /// <param name="card"></param>
        /// <returns></returns>
        private dynamic CreateCardButtons(JObject item, dynamic card)
        {
            if (!item.ContainsKey("info"))
            {
                return card;
            }

            var cardActions = new List<CardAction>();
            foreach (JObject button in item.Value<JArray>("info"))
            {
                cardActions.Add(new CardAction(ActionTypes.OpenUrl, button.Value<string>("title"), value: button.Value<string>("source")));
            }
            card.Buttons = cardActions;
            return card;
        }
    }
}
