import React from "react";
import { DynamicForm } from "components/forms";
import { useIntl } from "react-intl";
import {
  Flex,
  Text,
  SplitButton,
  pxToRem,
  AcceptIcon,
  BanIcon,
} from "@fluentui/react-northstar";

import { updateContentItem } from "redux/actions";
import { useDispatch } from "react-redux";
import { useChannels } from "helpers/utilities";
import { capitaliseSentense } from "helpers/utils";

export const ContentContainer = ({
  palette,
  addNewRow,
  containerIndex,
  preset,
  updateChannelStatus,
  preventSubmit,
}) => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const { channels } = useChannels();
  const channelStatus = (channel) => {
    let status = true;

    if (preset.hasOwnProperty("text")) {
      //If current container already has values, let's indicate channel status
      if (
        preset.text.findIndex(
          (item) => item.containerIndex === containerIndex
        ) >= 0
      ) {
        //If channel is not in the list of channels, means it's disabled
        let currChannels = preset.text[containerIndex].channels.filter(
          (item) => item.id === channel.id
        );
        status = currChannels.length > 0 ? currChannels[0].status : false;
      } else {
        //Let's check if we already have text for that particular channel.
        status = !preset.text.some((text) =>
          text.channels.some(
            (existing) => existing.id === channel.id && existing.status
          )
        );
      }
    }
    return status;
  };

  const getChannelObjects = () => {
    return channels.map((channel) => {
      return {
        status: channelStatus(channel),
        name: channel.label,
        id: channel.id,
        isRichText: channel.isRichText,
      };
    });
  };

  const form = [
    {
      name: "messages",
      key: "messages",
      required: true,
      type: "richtext",
      translatable: true,
      height: 100,
    },
  ];

  const [values, setValues] = React.useState(() => {
    if (
      Object.keys(preset).length > 0 &&
      preset.hasOwnProperty("text") &&
      preset.text.some((item) => item.containerIndex === containerIndex)
    ) {
      return {
        ...preset.text.filter(
          (item) => item.containerIndex === containerIndex
        )[0],
        unavailableChannels: getChannelObjects().filter(
          (c) =>
            !preset.text
              .filter((item) => item.containerIndex === containerIndex)[0]
              .channels.includes(c.id)
        ),
      };
    } else {
      return {
        containerIndex: containerIndex,
        channels: getChannelObjects(),
        unavailableChannels: [],
      };
    }
  });

  const updateFieldvalues = (vals) => {
    setValues((prevState) => {
      var newState = { ...prevState, ...vals };
      return newState;
    });
  };

  const updateActiveChannels = (channel, disabled = true) => {
    let containerToUpdate = null;
    // if(!evaluateChannelVisibility(channel))
    let updates = preset.text[containerIndex].channels.map((item) => {
      if (item.id === channel.id) {
        //Let's only add a new row if we are disabling existing status
        if (item.status && containerIndex === 0) {
          addNewRow(channel);
        } else {
          //If we're enabling channel for this container, let's disable it for every other container that's already there
          containerToUpdate = preset.text.filter((text) => {
            return text.channels.some(
              (existing) => existing.id === channel.id && existing.status
            );
          });
        }
        item["status"] = !item.status;
        return item;
      } else return item;
    });
    setValues({ ...values, ...{ channels: updates } });
    if (containerToUpdate !== null) {
      //We need to disable channel in previous values.
      //We also need to remove container in case all channels are disabled
      updateChannelStatus(channel.id, containerToUpdate[0].containerIndex);
    }
  };

  const newContentObj = () => {
    let obj = {};
    //Let's update content text and do we have a single data item coming in?
    if (preset.hasOwnProperty("text") && !Array.isArray(values)) {
      if (
        preset.text.findIndex(
          (item) => item.containerIndex === values.containerIndex
        ) < 0
      ) {
        obj = {
          text: [...preset.text, values],
        };
      } else {
        obj["text"] = preset.text.map((item) => {
          if (item.containerIndex === values.containerIndex) {
            return values;
          }
          return item;
        });
      }
    } else {
      if (Array.isArray(values)) {
        obj = { ...preset.text, ...{ text: values } };
      } else {
        obj = Object.assign(preset, { text: [values] });
      }
    }
    dispatch(updateContentItem({ ...preset, ...obj }));
  };

  const evaluateChannelVisibility = (channelId) => {
    return values.unavailableChannels.indexOf(channelId) > -1 ? true : false;
  };

  const disableChannel = (channelId) => {
    if (values.unavailableChannels.includes(channelId)) {
      updateFieldvalues({
        unavailableChannels: values.unavailableChannels.splice(
          values.unavailableChannels.indexOf(channelId),
          1
        ),
      });
    } else {
      updateFieldvalues({
        unavailableChannels: [...values.unavailableChannels, channelId],
      });
    }
    updateChannelStatus(channelId, containerIndex, true);
  };

  React.useEffect(() => {
    newContentObj();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  return (
    <div styles={{ marginBottom: pxToRem(20) }}>
      <Flex gap="gap.small">
        <DynamicForm
          inputs={form}
          formWidth="100%"
          valuesChanged={updateFieldvalues}
          inputValues={values}
          preventSubmit={preventSubmit}
        />
      </Flex>
      <Flex gap="gap.small">
        <Text
          size="medium"
          weight="semibold"
          content={capitaliseSentense(
            intl.formatMessage({ id: "channels" }, { count: 2 })
          )}
          style={{
            marginTop: pxToRem(20),
            marginBottom: pxToRem(10),
            color: palette.themePrimary,
          }}
        />
      </Flex>
      <Flex gap="gap.small">
        {channels &&
          channels.map((channel) => {
            let cStatus = channelStatus(channel);
            let cVisibility = evaluateChannelVisibility(channel.id);
            return (
              <SplitButton
                key={channel.id}
                flat
                primary={cStatus}
                size="small"
                disabled={cVisibility}
                menu={[
                  {
                    key: "disable",
                    content: cVisibility
                      ? intl.formatMessage(
                          {
                            id: "general.enable",
                          },
                          {
                            subject: intl.formatMessage(
                              { id: "channels" },
                              { count: 1 }
                            ),
                          }
                        )
                      : intl.formatMessage(
                          {
                            id: "general.disable",
                          },
                          {
                            subject: intl.formatMessage(
                              { id: "channels" },
                              { count: 1 }
                            ),
                          }
                        ),
                    onClick: () => {
                      disableChannel(channel.id);
                      // updateActiveChannels(channel, false);
                    },
                  },
                  {
                    key: "channel",
                    content:
                      containerIndex > 0
                        ? intl.formatMessage({ id: "content.channels.merge" })
                        : intl.formatMessage({
                            id: "content.channels.customise",
                          }),
                    onClick: () => {
                      updateActiveChannels(channel);
                    },
                    disabled: containerIndex === 0 && !cStatus && cVisibility,
                  },
                ]}
                button={{
                  content: channel.label,
                  icon: cStatus ? (
                    <AcceptIcon
                      size="smallest"
                      bordered
                      circular
                      styles={{ marginLeft: "5px" }}
                    />
                  ) : (
                    <BanIcon
                      size="small"
                      styles={{ marginLeft: "5px", marginTop: "1px" }}
                    />
                  ),
                  "aria-roledescription": "channelButton",
                  "aria-describedby": intl.formatMessage({
                    id: "channels.selection",
                  }),
                }}
                toggleButton={{
                  "aria-label": intl.formatMessage({
                    id: "general.more.options",
                  }),
                }}
              />
            );
          })}
      </Flex>
    </div>
  );
};
