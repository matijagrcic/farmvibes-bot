import React from "react";
import {
  Avatar,
  Flex,
  AddIcon,
  pxToRem,
  Text,
  Divider,
  FormFieldCustom,
  Label,
  Button,
  Accordion,
  Image,
  Dropdown,
} from "@fluentui/react-northstar";
import { connect } from "react-redux";
import { Pivot, PivotItem, useTheme, TextField } from "@fluentui/react";
import { ContentContainer } from "components/containers/content";
import {
  createContent,
  updateContentItem,
  createContentItem,
  createMenuNode,
  createMedium,
} from "redux/actions";
import { useDispatch } from "react-redux";
import { unflatten, addTranslationLocale, serialize } from "helpers/utils";
import { DynamicForm } from ".";
import { addContent } from "global/defaultValues";

const ContentForm = ({
  data,
  createContentAction,
  createContentItemAction,
  createMenuNodeAction,
  action,
  activeNode,
  createMediumAction,
  mediaError,
  medium,
  mediaLoading,
}) => {
  const { palette } = useTheme();
  const dispatch = useDispatch();
  const [contentItems, setContentItems] = React.useState(() => {
    return data.hasOwnProperty("text") ? data.text.length : 1;
  });
  const defaultUploadPrompt = "Click to upload or drag and drop a file here...";
  const inputRef = React.createRef();
  const [imgMessage, setImgMessage] = React.useState(defaultUploadPrompt);
  const [contentLabel, setContentLabel] = React.useState({});
  const [imgDescr, setImageDescr] = React.useState("");
  const [readyToUpload, setReadyToUpload] = React.useState(true);
  const [thumbnail, setThumbnail] = React.useState(null);
  const avatarStyle = {
    root: {
      background: palette.neutralTertiary,
    },
  };

  const onAddImage = () => {
    inputRef && inputRef.current && inputRef.current.click();
  };

  const updateContentLabel = (labels) => {
    setContentLabel(labels);
    updateContentItem(labels);
  };
  const onUploadFileChange = (event) => {
    let selectedFile = null;
    if (event.hasOwnProperty("dataTransfer")) {
      selectedFile = event.dataTransfer.files[0];
    } else {
      const target = event.target;
      selectedFile = target.files && target.files[0];
    }

    event.stopPropagation();
    event.preventDefault();
    let imgSize = 0;
    switch (selectedFile.size) {
      case (value) => value > 100000:
        imgSize = `${(selectedFile.size / Math.pow(1024, 2)).toFixed(2)} MB`;
        break;

      default:
        imgSize = `${(selectedFile.size / Math.pow(1024, 1)).toFixed(2)} KB`;
        break;
    }
    setImgMessage(`Ready to upload: ${selectedFile.name} (${imgSize})`);
    setImageDescr(
      selectedFile.name.substring(0, selectedFile.name.lastIndexOf("."))
    );
    setReadyToUpload(false);
  };

  const addContentItems = () => {
    setContentItems((prev) => prev + 1);
  };

  const reviewChannelStatus = (channelId, container) => {
    let update = [];
    data.text.forEach((item) => {
      if (item.containerIndex === container) {
        //For this container, we would also like to know whether we are to remove container because all channels are off.
        let channelVals = item.channels.map((channel) => {
          if (channel.id === channelId) {
            return { ...channel, ...{ status: !channel.status } };
          }
          return channel;
        });
        update.push({ ...item, ...{ channels: channelVals } });
      } else update.push(item);
    });
    //Let's try to make sure we have no container with unselected channels
    const remainingContainers = update.reduce((acc, current) => {
      if (!current.channels.every((channel) => channel.status === false))
        acc.push({ ...current, ...{ containerIndex: acc.length } });
      return acc;
    }, []);
    if (remainingContainers.length !== update.length) {
      setContentItems(remainingContainers.length);
      dispatch(updateContentItem(remainingContainers));
    } else {
      dispatch(updateContentItem(update));
    }
  };

  const prepareContentForPersist = () => {
    //We need to format the object into API format.
    return data.text.map((item) => {
      let contentType = false;
      const channels = item.channels.reduce((result, channel) => {
        if (channel.status) {
          if (channel.isRichText === false) contentType = true;
          result.push(`/api/channels/${channel.id}`);
        }
        return result;
      }, []);
      //let's unflatten item to be able to get flattened keys into nested arrays
      let unflattened = unflatten(item);
      const text = Object.keys(unflattened.translations).reduce(
        (result, key) => {
          return {
            ...result,
            ...{
              [key]: {
                text: contentType
                  ? serialize(unflattened.translations[key].messages)
                  : serialize(unflattened.translations[key].messages),
                locale: key,
              },
            },
          };
        },
        {}
      );
      let result = { channels: channels, translations: text };
      //If we're editing content, we most-likely have an ID for the item
      if (item.hasOwnProperty("id")) return { ...result, id: item.id };

      return result;
    });
  };

  React.useEffect(() => {
    // setImgMessage("Drag and drop a file here...");
  }, []);

  React.useEffect(() => {
    if (medium !== undefined && medium.hasOwnProperty("id")) {
      setReadyToUpload(true);
      setImgMessage("Click to upload or drag and drop a file here...");
      data.media = [`/api/media/${medium.id}`];
      if (data.hasOwnProperty("media")) {
        setThumbnail(
          <Image
            alt={medium.description}
            aria-label={medium.description}
            src={medium.pathUrl}
            style={{
              width: "100%",
              marginTop: pxToRem(20),
              marginBottom: pxToRem(20),
            }}
          />
        );
      }
    }
  }, [medium]);

  const renderContentRow = (count) => {
    let containers = [];
    for (let index = 0; index < count; index++) {
      containers.push(
        <ContentContainer
          key={`container-${index}`}
          palette={palette}
          addNewRow={addContentItems}
          updateChannelStatus={reviewChannelStatus}
          containerIndex={index}
          preset={data}
        />
      );
    }
    return containers;
  };

  const imagePanels = [
    {
      key: "new",
      title: `Upload new image`,
      content: (
        <>
          <FormFieldCustom
            style={{
              border: "1px solid #2A2A2A",
              minHeight: "6em",
              padding: "0.5em",
              backgroundColor: palette.neutralLight,
              marginTop: pxToRem(20),
              justifyContent: "center",
              display: "flex",
            }}
            onClick={onAddImage}
            onDragOver={(event) => {
              event.preventDefault(); //preventing from default behaviour
              setImgMessage("Drop file here to upload...");
              event.target.classList.add("active");
            }}
            onDragLeave={(event) => {
              event.preventDefault(); //preventing from default behaviour
              event.target.classList.remove("active");
              setImgMessage(defaultUploadPrompt);
            }}
            onDrop={(event) => {
              event.preventDefault(); //preventing from default behaviour
              let validExtensions = [
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/gif",
                "image/webp",
              ];
              if (validExtensions.includes(event.dataTransfer.files[0].type)) {
                onUploadFileChange(event);
              } else {
                setImgMessage(
                  "You can only upload jpeg, png, gif or webp formats"
                );
              }
            }}
          >
            <input
              ref={inputRef}
              type='file'
              accept='.png, .jpeg, .jpg, .bmp'
              onChange={onUploadFileChange}
              style={{ display: "none" }}
            />
            <Text
              content={imgMessage}
              style={{
                verticalAlign: "center",
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
              }}
            />
          </FormFieldCustom>
          <TextField
            label='Description'
            value={imgDescr}
            onChange={(event) => setImageDescr(event.currentTarget.value)}
          />
          <Button
            content={mediaLoading ? "Processing" : "Upload"}
            disabled={readyToUpload || mediaLoading}
            fluid
            primary
            loading={mediaLoading}
            style={{
              marginTop: pxToRem(20),
            }}
            onClick={() => {
              const upload = new FormData();
              upload.append("file", inputRef.current.files[0]);
              upload.append("description", imgDescr);
              createMediumAction(upload);
            }}
          />
        </>
      ),
    },
    {
      key: "existing",
      title: "Select existing image",
      content: (
        <Dropdown
          search
          items={[]}
          placeholder='Start typing image description'
          noResultsMessage="We couldn't find any matches."
          getA11ySelectionMessage={{
            onAdd: (item) => `${item} has been selected.`,
          }}
        />
      ),
    },
  ];

  return (
    <>
      <Flex gap='gap.large'>
        <Avatar
          size='largest'
          variables={{ iconBackgroundColor: palette.neutralTertiary }}
          icon={
            <AddIcon
              variables={{ iconBackgroundColor: palette.neutralTertiary }}
            />
          }
        />
        <div style={{ flexGrow: 1 }}>
          <DynamicForm
            inputs={addContent}
            formWidth='100%'
            valuesChanged={updateContentLabel}
            inputValues={
              action.includes("create") && !action.includes("child")
                ? contentLabel
                : data
            }
          />
        </div>
      </Flex>
      <Pivot
        aria-label='Content management tabs'
        style={{ marginTop: pxToRem(40) }}
      >
        <PivotItem
          headerText='Content'
          headerButtonProps={{
            "data-order": 1,
            "data-title": "Content management",
          }}
          key='content'
        >
          <Flex gap='gap.small'>
            <Text
              size='medium'
              weight='semibold'
              content={`Messages (${contentItems})`}
              style={{
                marginTop: pxToRem(20),
                marginBottom: pxToRem(10),
                color: palette.themePrimary,
              }}
            />
          </Flex>
          {renderContentRow(contentItems)}
        </PivotItem>
        <PivotItem headerText='Filters' key='content'>
          <Label>Filters</Label>
        </PivotItem>
        <PivotItem headerText='Media' key='media'>
          {thumbnail}
          <Accordion panels={imagePanels} exclusive expanded />
        </PivotItem>
      </Pivot>
      <Divider
        color='grey'
        style={{ margin: `${pxToRem(10)} 0px ${pxToRem(20)}` }}
      />
      <Flex space='between' gap='gap.large' hAlign='end' vAlign='end'>
        <Button
          flat={true}
          primary
          content='Save content'
          onClick={() => {
            //We need translations in API expected format
            let translations = unflatten(addTranslationLocale(contentLabel));
            let variants = prepareContentForPersist();
            //Then persist.
            switch (action) {
              case "edit-text":
                createContentItemAction({
                  contentTextVariants: variants,
                  raw: data.text,
                  content: data.id,
                  media: data.media,
                });
                break;

              case "create-child":
                createContentItemAction({
                  contentTextVariants: variants,
                  raw: data.text,
                  content: data.id,
                  media: data.media,
                });
                break;

              case "create-content-node":
                createMenuNodeAction({
                  ...translations,
                  ...{
                    type: `/api/menu_node_types/3`,
                    parent: `/api/menu_nodes/${activeNode.id}`,
                    media: data.media,
                    content: {
                      ...translations,
                      text: [
                        {
                          contentTextVariants: variants,
                          raw: data.text,
                        },
                      ],
                    },
                  },
                });
                break;
              default:
                createContentAction({
                  ...translations,
                  media: data.media,
                  text: [
                    {
                      contentTextVariants: variants,
                      raw: data.text,
                    },
                  ],
                });
                break;
            }
            setTimeout(() => window.location.reload(false), 2000);
          }}
        />{" "}
        <Button default content='Cancel' />
      </Flex>
    </>
  );
};

const mapStateToProps = ({ contentReducer, mediaReducer }) => {
  const { loading, error, data, content } = contentReducer;
  const { loading: mediaLoading, error: mediaError, medium } = mediaReducer;
  return { loading, error, data, content, mediaLoading, mediaError, medium };
};

export default connect(mapStateToProps, {
  createContentAction: createContent,
  updateContentItemAction: updateContentItem,
  createContentItemAction: createContentItem,
  createMenuNodeAction: createMenuNode,
  createMediumAction: createMedium,
})(ContentForm);
