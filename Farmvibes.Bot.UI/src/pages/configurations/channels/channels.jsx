import React from "react";
import { connect } from "react-redux";
import { getStyles } from "components/layout/Sidebar/Nav/Nav.styles";
import {
  getChannels,
  getChannel,
  updateChannel,
  createChannel,
  removeChannel,
} from "../../../redux/actions";
import { PanelContainer, DialogBox } from "components/containers";
import { Table } from "components/containers/table";
import { Form, Button, BanIcon, AcceptIcon } from "@fluentui/react-northstar";
import { styled } from "@fluentui/react";
import { DynamicForm } from "components/forms";
import { capitaliseSentense, flat, validateForm } from "helpers/utils";
import { useLanguages } from "helpers/utilities";
import { useIntl } from "react-intl";

const Channels = ({
  loading,
  channels,
  channel,
  getChannelsAction,
  createChannelAction,
  updateChannelAction,
  removeChannelAction,
  error,
}) => {
  const { locale } = useLanguages();
  const intl = useIntl();
  const [panelHidden, setPanelHidden] = React.useState(false);
  const [panelTitle, setPanelTitle] = React.useState("");
  const [formValues, setFormValues] = React.useState({});
  const [persistStatus, setPersistStatus] = React.useState(undefined);
  const [dialogHidden, setDialogHidden] = React.useState(false);
  const [dialogTitle, setDialogTitle] = React.useState("");
  const [dialogContent, setDialogContent] = React.useState([]);
  const [action, setAction] = React.useState("");
  const [dialogProceedFunction, setDialogProceedFunction] =
    React.useState(null);
  const [dialogProceedFunctionParams, setDialogProceedFunctionParams] =
    React.useState({});
  let selected = [];

  const showPanel = () => {
    return setPanelHidden(!panelHidden);
  };

  const addChannel = [
    {
      name: "name",
      key: "name",
      required: true,
      length: 50,
      type: "string",
      label: intl.formatMessage({ id: "general.name" }),
      translatable: false,
      variant: "northstar",
    },
    {
      name: "prefix",
      key: "prefix",
      required: false,
      hint: intl.formatMessage({ id: "general.prefix.hint" }),
      length: 3,
      type: "string",
      label: intl.formatMessage({ id: "general.prefix" }),
      translatable: false,
      variant: "northstar",
    },
    {
      name: "postfix",
      key: "postfix",
      required: false,
      hint: intl.formatMessage({ id: "general.postfix.hint" }),
      length: 3,
      type: "string",
      label: intl.formatMessage({ id: "general.postfix" }),
      translatable: false,
      variant: "northstar",
    },
    {
      name: "characterLength",
      key: "characterLength",
      required: false,
      length: 10,
      type: "integer",
      label: intl.formatMessage({ id: "channels.characters.per.message" }),
      translatable: false,
      variant: "northstar",
    },
    {
      name: "isEnabled",
      key: "isEnabled",
      required: false,
      length: 3,
      type: "boolean",
      label: intl.formatMessage({ id: "language.enabled" }),
      translatable: false,
      selectedText: intl.formatMessage({ id: "general.activated" }),
      deselectedText: intl.formatMessage({ id: "general.deactivated" }),
    },
    {
      name: "isRichText",
      key: "isRichText",
      required: false,
      length: 3,
      type: "boolean",
      label: intl.formatMessage({ id: "channels.richtext.support" }),
      translatable: false,
      selectedText: intl.formatMessage({ id: "general.yes" }),
      deselectedText: intl.formatMessage({ id: "general.no" }),
    },
  ];

  const toggleDialog = () => {
    setDialogHidden(!dialogHidden);
  };

  const menuActions = [
    {
      key: "newItem",
      text: intl.formatMessage({ id: "general.new" }, { subject: "" }),
      cacheKey: "myCacheKey", // changing this key will invalidate this item's cache
      iconProps: { iconName: "Add" },
      onClick: () => {
        setAction("add");
        setPanelTitle(intl.formatMessage({ id: "channels.add" }));
        showPanel();
      },
    },
    {
      key: "edit",
      text: intl.formatMessage({ id: "general.edit" }, { subject: "" }),
      iconProps: { iconName: "Edit" },
      disabled: true,
      onClick: () => onItemInvoked(selected[0]),
      activeCount: " === 1",
    },
    {
      key: "delete",
      text: intl.formatMessage({ id: "general.delete" }, { subject: "" }),
      iconProps: { iconName: "Delete" },
      disabled: true,
      activeCount: " === 1",
      onClick: () => onItemRemove(selected[0]),
    },
  ];

  const columns = [
    {
      name: intl.formatMessage({ id: "general.name" }),
      fieldName: `name`,
      key: `name`,
      data: "string",
      isRowHeader: true,
      isResizable: true,
      isMultiline: true,
      isSorted: false,
      isSortedDescending: false,
      sortAscendingAriaLabel: intl.formatMessage({
        id: "general.list.sort.az",
      }),
      sortDescendingAriaLabel: intl.formatMessage({
        id: "general.list.sort.za",
      }),
    },
    {
      fieldName: "isEnabled",
      name: intl.formatMessage({ id: "general.isenabled" }),
      key: "isEnabled",
      data: "boolean",
      isResizable: true,
      isSorted: false,
      isSortedDescending: false,
      sortAscendingAriaLabel: intl.formatMessage({
        id: "general.list.sort.az",
      }),
      sortDescendingAriaLabel: intl.formatMessage({
        id: "general.list.sort.za",
      }),
      onRender: (item) => {
        return (
          <Button
            icon={item.isEnabled ? <AcceptIcon /> : <BanIcon />}
            text
            content={
              item.isEnabled
                ? intl.formatMessage({ id: "general.yes" })
                : intl.formatMessage({ id: "general.no" })
            }
            onClick={() => {
              setDialogTitle(intl.formatMessage({ id: "channels.modify" }));
              setDialogContent(
                intl.formatMessage(
                  { id: "channels.toggle" },
                  {
                    subject: item.isEnabled
                      ? intl.formatMessage({ id: "general.deactivate" })
                      : intl.formatMessage({ id: "general.activate" }),
                  }
                )
              );
              toggleDialog();
              setDialogProceedFunction(() => updateChannelAction);
              setDialogProceedFunctionParams({
                isEnabled: !item.isEnabled,
                id: item.id,
              });
            }}
          />
        );
      },
    },
    {
      name: intl.formatMessage({ id: "general.created.on" }),
      key: "createdAt",
      fieldName: "createdAt",
      data: "string",
      isResizable: true,
      isSorted: true,
      minWidth: 150,
      isSortedDescending: true,
      sortAscendingAriaLabel: intl.formatMessage({
        id: "general.list.sort.az",
      }),
      sortDescendingAriaLabel: intl.formatMessage({
        id: "general.list.sort.za",
      }),
      onRender: (dt) => {
        return intl.formatDate(new Date(dt.createdAt), {
          year: "numeric",
          month: "short",
          hour: "numeric",
          minute: "numeric",
          day: "numeric",
        });
      },
    },
    {
      name: intl.formatMessage({ id: "general.updated.on" }),
      key: "updatedAt",
      fieldName: "updatedAt",
      data: "string",
      isResizable: true,
      isSorted: false,
      minWidth: 150,
      isSortedDescending: true,
      sortAscendingAriaLabel: intl.formatMessage({
        id: "general.list.sort.az",
      }),
      sortDescendingAriaLabel: intl.formatMessage({
        id: "general.list.sort.za",
      }),
      onRender: (dt) => {
        return intl.formatDate(new Date(dt.updatedAt), {
          year: "numeric",
          month: "short",
          hour: "numeric",
          minute: "numeric",
          day: "numeric",
        });
      },
    },
  ];

  const onItemInvoked = (item) => {
    setPanelTitle(intl.formatMessage({ id: "general.edit" }, { subject: "" }));
    setAction("edit");
    let temp = flat(item);
    setFormValues(
      Object.keys(temp).reduce((res, key) => {
        Object.assign(res, { [`${key}`]: temp[key] });
        return res;
      }, {})
    );
    setPanelHidden(true);
  };

  const updateValues = (values) => {
    setFormValues((prev) => {
      return { ...prev, ...values };
    });
  };

  const updateSelected = (items) => {
    selected = items;
  };

  const onItemRemove = (item) => {
    toggleDialog();
    setDialogProceedFunctionParams(item);
    setDialogTitle(intl.formatMessage({ id: "channels.remove" }));
    setDialogProceedFunction(() => removeChannelAction);
    setDialogContent(intl.formatMessage({ id: "channels.remove.confirm" }));
  };

  const onPanelDismiss = () => {
    setFormValues({});
    showPanel();
    channel = undefined;
  };

  React.useEffect(() => {
    if (error !== undefined) setPersistStatus({ error: error });
    if (channel !== undefined && loading === false)
      setPersistStatus({ success: channel });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, error]);

  React.useEffect(() => {
    setPanelHidden(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  return (
    <>
      <Table
        selected={updateSelected}
        loading={loading}
        menuActions={menuActions}
        getRecords={getChannelsAction}
        items={channels}
        itemInvoked={onItemInvoked}
        itemRemove={onItemRemove}
        cols={columns}
        isCompactMode={false}
        locale={locale}
        header={capitaliseSentense(
          intl.formatMessage({ id: "channels" }, { count: 1 })
        )}
      />
      {panelTitle.length > 0 && (
        <PanelContainer
          panelDismiss={onPanelDismiss}
          lightDismiss={Object.keys(formValues).length > 0}
          panelHidden={panelHidden}
          header={panelTitle}
          showPanel={showPanel}
          content={
            <Form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
              }}
              style={{ width: "100%" }}
              className="validate"
            >
              <DynamicForm
                submitStatus={persistStatus}
                channels={channels}
                inputs={addChannel}
                valuesChanged={updateValues}
                onSubmit={(e, data) => {
                  let hasErrors = validateForm(
                    e.target.parentElement.form.elements
                  );
                  if (!hasErrors) {
                    action.includes("add")
                      ? createChannelAction(data)
                      : updateChannelAction(data);
                  }
                }}
                locale={locale}
                error={error}
                inputValues={formValues}
              />
            </Form>
          }
          description={intl.formatMessage({ id: "channel.description" })}
        />
      )}
      <DialogBox
        title={dialogTitle}
        dialogHidden={dialogHidden}
        showDialog={toggleDialog}
        content={dialogContent}
        cancel={intl.formatMessage({ id: "general.cancel" })}
        confirm={intl.formatMessage({ id: "general.confirm" })}
        proceedFunction={dialogProceedFunction}
        params={dialogProceedFunctionParams}
      />
    </>
  );
};

const mapStateToProps = ({ channelReducer }) => {
  const { loading, channels, channel, error } = channelReducer;
  return { loading, error, channels, channel };
};

export default connect(mapStateToProps, {
  getChannelsAction: getChannels,
  getChannelAction: getChannel,
  updateChannelAction: updateChannel,
  removeChannelAction: removeChannel,
  createChannelAction: createChannel,
})(styled(Channels, getStyles));
