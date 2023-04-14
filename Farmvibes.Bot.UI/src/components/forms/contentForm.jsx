import React from "react";
import {
  Avatar,
  Flex,
  AddIcon,
  pxToRem,
  Text,
  Divider,
  Button,
  Image,
  Loader,
  EditIcon,
} from "@fluentui/react-northstar";
import { connect } from "react-redux";
import { Pivot, PivotItem, useTheme, Overlay } from "@fluentui/react";
import { ContentContainer } from "components/containers/content";
import {
  createContent,
  updateContentItem,
  updateContentTextItem,
  updateContent,
  createContentItem,
  createMenuNode,
  createMedium,
  resetContentItem,
} from "redux/actions";
import { useDispatch } from "react-redux";
import {
  unflatten,
  addTranslationLocale,
  serialize,
  getPlatformComponents,
  capitaliseSentense,
} from "helpers/utils";
import { post } from "helpers/requests";
import { DynamicForm } from ".";
import { useIntl } from "react-intl";
import { useNodeTypes } from "helpers/utilities/nodeTypes";

const ContentForm = ({
  data,
  createContentAction,
  createContentItemAction,
  updateContentTextItemAction,
  createMenuNodeAction,
  resetContentItemAction,
  action,
  activeNode,
  medium,
  loading,
  onPanelDismiss,
}) => {
  const { palette } = useTheme();
  const dispatch = useDispatch();
  const { nodeTypes } = useNodeTypes();
  const intl = useIntl();
  const [contentItems, setContentItems] = React.useState(() => {
    return data.hasOwnProperty("text") ? data.text.length : 1;
  });
  const defaultUploadPrompt = intl.formatMessage({
    id: "general.form.file.uploadprompt",
  });
  const [setImgMessage] = React.useState(defaultUploadPrompt);
  const stateRef = React.useRef();
  const [contentLabel, setContentLabel] = React.useState({});
  const [setReadyToUpload] = React.useState(true);
  const [setThumbnail] = React.useState(null);
  const [blockSubmit, setBlockSubmit] = React.useState(false);
  const [loaderLabel, setLoaderLabel] = React.useState(
    intl.formatMessage({ id: "general.loading" }, { subject: "" })
  );
  const [channels, setChannels] = React.useState([]);
  const addContent = [
    {
      name: "label",
      key: "label",
      required: true,
      length: 50,
      type: "string",
      placeholder: intl.formatMessage({
        id: "content.placeholder.description",
      }),
      translatable: true,
      disabled: false,
      icon: <EditIcon outline />,
      variant: "northstar",
      styles: { fontSize: "16px", fontWeight: "400" },
      inverted: true,
    },
  ];

  stateRef.current = data;

  const updateContentLabel = (labels) => {
    setContentLabel(labels);
    updateContentItem(labels);
  };

  const addContentItems = () => {
    setContentItems((prev) => prev + 1);
  };

  const reviewChannelStatus = (channelId, container, disable = false) => {
    let update = [];
    let removeContainer = false;
    data.text.reduce((arr, item) => {
      if (disable) {
        item["channels"] = item.channels.filter((c) => c.id !== channelId);
        (
          item["unavailableChannels"] || (item["unavailableChannels"] = [])
        ).push(channelId);
      }
      if (item.containerIndex === container) {
        //Let's try to make sure we have no container with unselected channels
        if (!item.channels.some((c) => c.status)) {
          data.text[0].channels = data.text[0].channels.map((c) =>
            c.id === channelId ? { ...c, ...{ status: !c.status } } : c
          );
          //We also need to remove the container form the values we have
          removeContainer = true;
        }
        update.push(item);
        arr.push(item);
      } else {
        update.push(item);
        arr.push(item);
      }
      return arr;
    }, []);

    if (removeContainer) data.text.splice(container, 1);
    setContentItems(update.length);
    dispatch(updateContentItem(update));
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

  const preventSubmit = (status, message = "") => {
    setBlockSubmit(status);
    setLoaderLabel(message);
  };

  React.useEffect(() => {
    getPlatformComponents("channels", "channels").then((result) => {
      setChannels(result);
    });
  }, []);

  React.useEffect(() => {
    if (medium !== undefined && medium.hasOwnProperty("id")) {
      setReadyToUpload(true);
      setImgMessage(
        intl.formatMessage({ id: "general.form.file.uploadprompt" })
      );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medium, data]);

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
          channels={channels}
          preventSubmit={preventSubmit}
        />
      );
    }
    return containers;
  };

  return (
    <>
      {blockSubmit && (
        <Overlay className={"loader"}>
          <Loader label={loaderLabel} size="largest" />
        </Overlay>
      )}

      <form onSubmit={(e) => e.preventDefault()} style={{ width: "100%" }}>
        <Flex gap="gap.large">
          <Avatar
            size="largest"
            variables={{ iconBackgroundColor: palette.neutralTertiary }}
            icon={
              <AddIcon
                variables={{ iconBackgroundColor: palette.neutralTertiary }}
              />
            }
          />
          <div style={{ flexGrow: 1 }}>
            <DynamicForm
              inputs={
                action.includes("edit") || action.includes("child")
                  ? addContent.map((f) =>
                      f.name === "label" ? { ...f, disabled: true } : f
                    )
                  : addContent
              }
              formWidth="100%"
              valuesChanged={updateContentLabel}
              preventSubmit={preventSubmit}
              inputValues={
                action.includes("create") && !action.includes("child")
                  ? contentLabel
                  : data
              }
            />
          </div>
        </Flex>
        <Pivot
          aria-label={intl.formatMessage({ id: "content.management.tabs" })}
          style={{ marginTop: pxToRem(40) }}
        >
          <PivotItem
            headerText={capitaliseSentense(
              intl.formatMessage({ id: "content" }, { count: 1 })
            )}
            headerButtonProps={{
              "data-order": 1,
              "data-title": intl.formatMessage({ id: "content.management" }),
            }}
            key="content"
          >
            <Flex gap="gap.small">
              <Text
                size="medium"
                weight="semibold"
                content={intl.formatMessage(
                  { id: "content.messages.count" },
                  { count: contentItems }
                )}
                style={{
                  marginTop: pxToRem(20),
                  marginBottom: pxToRem(10),
                  color: palette.themePrimary,
                }}
              />
            </Flex>
            {renderContentRow(contentItems)}
          </PivotItem>
        </Pivot>
        <Divider
          color="grey"
          style={{ margin: `${pxToRem(10)} 0px ${pxToRem(20)}` }}
        />
        <Flex space="between" gap="gap.large" hAlign="end" vAlign="end">
          <Button
            flat
            primary
            content={intl.formatMessage(
              { id: "general.save" },
              { subject: intl.formatMessage({ id: "content" }, { count: 1 }) }
            )}
            className="save-content-btn"
            disabled={blockSubmit}
            onMouseDown={() => {
              setTimeout(() => {
                //Show loader and disable submit button
                preventSubmit(
                  true,
                  action.includes("edit")
                    ? intl.formatMessage(
                        { id: "general.updating" },
                        {
                          subject: intl.formatMessage(
                            { id: "content" },
                            { count: 1 }
                          ),
                        }
                      )
                    : intl.formatMessage(
                        { id: "general.creating" },
                        {
                          subject: intl.formatMessage(
                            { id: "content" },
                            { count: 1 }
                          ),
                        }
                      )
                );

                //We need translations in API expected format
                let translations = unflatten(
                  addTranslationLocale(contentLabel)
                );
                let variants = prepareContentForPersist();
                //Then persist.
                switch (action) {
                  case "edit-text":
                    updateContentTextItemAction({
                      contentTextVariants: variants,
                      raw: data.text,
                      content: `/api/contents/${data.content}`,
                      id: data.id,
                      media: data.media,
                    });
                    break;

                  case "create-child":
                    createContentItemAction({
                      contentTextVariants: variants,
                      raw: data.text,
                      content: `/api/contents/${data.content}`,
                      media: data.media,
                    });
                    break;

                  case "create-content-node":
                    post("contents", {
                      ...translations,
                      media: data.media,
                      text: [
                        {
                          contentTextVariants: variants,
                          raw: data.text,
                        },
                      ],
                    }).then((response) =>
                      createMenuNodeAction({
                        ...translations,
                        ...{
                          type: `/api/menu_node_types/${
                            nodeTypes.filter((t) => t.name === "content")[0].id
                          }`,
                          content: `/api/contents/${response.id}`,
                          parent: `/api/menu_nodes/${activeNode.id}`,
                        },
                      })
                    );

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
                //Hide loader
                dispatch(resetContentItemAction());
                loading = { loading };
              });
            }}
          />{" "}
          <Button
            default
            content="Cancel"
            onMouseDown={() => onPanelDismiss()}
          />
        </Flex>
      </form>
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
  updateContentAction: updateContent,
  updateContentTextItemAction: updateContentTextItem,
  createContentItemAction: createContentItem,
  createMenuNodeAction: createMenuNode,
  createMediumAction: createMedium,
  resetContentItemAction: resetContentItem,
})(ContentForm);
