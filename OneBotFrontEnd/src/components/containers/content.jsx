import React from "react";
import { DynamicForm } from "components/forms";
import {
  Flex,
  Text,
  Button,
  pxToRem,
  AcceptIcon,
  BanIcon,
  Provider,
} from "@fluentui/react-northstar";
import { getFromStorage } from "helpers/utils";
import { updateContentItem } from "redux/actions";
import { useDispatch } from "react-redux";

export const ContentContainer = ({
  palette,
  addNewRow,
  containerIndex,
  preset,
  updateChannelStatus,
}) => {
  const dispatch = useDispatch();
  const channelStatus = (channel) => {
    let status = true;
    if (preset.hasOwnProperty("text")) {
      //If current container already has values, let's indicate channel status
      if (
        preset.text.findIndex(
          (item) => item.containerIndex === containerIndex
        ) >= 0
      ) {
        status = preset.text[containerIndex].channels.filter(
          (item) => item.id === channel.id
        )[0].status;
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
    return getFromStorage("channels").map((channel) => {
      return {
        status: channelStatus(channel),
        name: channel.name,
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
    return Object.keys(preset).length > 0 &&
      preset.hasOwnProperty("text") &&
      preset.text.some((item) => item.containerIndex === containerIndex)
      ? preset.text.filter((item) => item.containerIndex === containerIndex)[0]
      : {
          containerIndex: containerIndex,
          channels: getChannelObjects(),
        };
  });

  const updateFieldvalues = (vals) => {
    console.log(vals);
    setValues((prevState) => {
      var newState = { ...prevState, ...vals };
      return newState;
    });
  };

  const updateActiveChannels = (channel) => {
    let containerToUpdate = null;
    let updates = values.channels.map((item) => {
      if (item.id === channel.id) {
        //Let's only add a new row if we are disabling existing status
        if (item.status) {
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

  React.useEffect(() => {
    newContentObj();
  }, [values]);
  return (
    <Provider styles={{ marginBottom: pxToRem(20) }}>
      <Flex gap='gap.small'>
        <DynamicForm
          inputs={form}
          formWidth='100%'
          valuesChanged={updateFieldvalues}
          inputValues={values}
        />
      </Flex>
      <Flex gap='gap.small'>
        <Text
          size='medium'
          weight='semibold'
          content='Channels'
          style={{
            marginTop: pxToRem(20),
            marginBottom: pxToRem(10),
            color: palette.themePrimary,
          }}
        />
      </Flex>
      <Flex gap='gap.small'>
        {getFromStorage("channels").map((channel) => {
          return (
            <Button
              key={channel.id}
              flat='true'
              primary={channelStatus(channel)}
              size='small'
              content={
                <Flex>
                  <Text content={channel.name} />
                  {channelStatus(channel) ? (
                    <AcceptIcon
                      size='smallest'
                      bordered
                      circular
                      styles={{ marginLeft: "5px" }}
                    />
                  ) : (
                    <BanIcon
                      size='small'
                      styles={{ marginLeft: "5px", marginTop: "1px" }}
                    />
                  )}
                </Flex>
              }
              onClick={() => {
                updateActiveChannels(channel);
              }}
            />
          );
        })}
      </Flex>
    </Provider>
  );
};
