import React from "react";
import { FontSizes, FontWeights } from "@fluentui/theme";
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
import {
  getTheme,
  Stack,
  styled,
  Icon,
  TooltipHost,
  mergeStyles,
  mergeStyleSets,
} from "@fluentui/react";
import { DynamicForm } from "components/forms";
import { addChannel } from "global/defaultValues";
import { flat, getFromStorage } from "helpers/utils";

const Channels = ({
  loading,
  channels,
  channel,
  getChannelsAction,
  createChannelAction,
  getChannelAction,
  updateChannelAction,
  removeChannelAction,
  error,
}) => {
  const theme = getTheme();
  const [locale, setLocale] = React.useState(getFromStorage("locale"));
  const [panelHidden, setPanelHidden] = React.useState(false);
  const [panelTitle, setPanelTitle] = React.useState("");
  const [formValues, setFormValues] = React.useState({});
  const [persistStatus, setPersistStatus] = React.useState(undefined);
  const [dialogHidden, setDialogHidden] = React.useState(true);
  const [dialogTitle, setDialogTitle] = React.useState("");
  const [dialogContent, setDialogContent] = React.useState([]);
  const [dialogProceedFunction, setDialogProceedFunction] =
    React.useState(null);
  const [dialogProceedFunctionParams, setDialogProceedFunctionParams] =
    React.useState({});
  let selected = [];
  const iconClass = mergeStyles({
    fontSize: 20,
    height: 20,
    width: 20,
    margin: "0 auto",
    cursor: "pointer",
    FontWeight: 600,
  });
  const classNames = mergeStyleSets({
    danger: [{ color: theme.palette.redDark }, iconClass],
    success: [{ color: theme.palette.green }, iconClass],
  });

  const showPanel = () => {
    return setPanelHidden(!panelHidden);
  };

  const toggleDialog = () => {
    setDialogHidden(!dialogHidden);
  };

  const menuActions = [
    {
      key: "newItem",
      text: "New",
      cacheKey: "myCacheKey", // changing this key will invalidate this item's cache
      iconProps: { iconName: "Add" },
      onClick: () => {
        setPanelTitle("Add Channel");
        showPanel();
      },
    },
    {
      key: "edit",
      text: "Edit",
      iconProps: { iconName: "Edit" },
      disabled: true,
      onClick: () => onItemInvoked(selected[0]),
      activeCount: " === 1",
    },
    {
      key: "delete",
      text: "Delete",
      iconProps: { iconName: "Delete" },
      disabled: true,
      activeCount: " > 0",
    },
  ];

  const columns = [
    {
      name: "Name",
      fieldName: `name`,
      key: `name`,
      data: "string",
      isRowHeader: true,
      isResizable: true,
      isMultiline: true,
      isSorted: false,
      isSortedDescending: false,
      sortAscendingAriaLabel: "Sorted A to Z",
      sortDescendingAriaLabel: "Sorted Z to A",
    },
    {
      name: "ISO Code",
      fieldName: `code`,
      key: `code`,
      data: "string",
      isRowHeader: true,
      isResizable: true,
      isMultiline: true,
      isSorted: false,
      isSortedDescending: false,
      sortAscendingAriaLabel: "Sorted A to Z",
      sortDescendingAriaLabel: "Sorted Z to A",
    },
    {
      fieldName: "isEnabled",
      name: "Enabled?",
      key: "isEnabled",
      data: "boolean",
      isRowHeader: true,
      isResizable: true,
      isSorted: false,
      isSortedDescending: false,
      sortAscendingAriaLabel: "Sorted A to Z",
      sortDescendingAriaLabel: "Sorted Z to A",
      onRender: (item) => {
        return (
          <TooltipHost content={item.isEnabled ? `Enabled` : `Disabled`}>
            <Icon
              iconName={item.isEnabled ? `Accept` : `CalculatorMultiply`}
              className={
                item.isEnabled ? classNames.success : classNames.danger
              }
            />
          </TooltipHost>
        );
      },
    },
    {
      name: "Created on",
      key: "createdAt",
      fieldName: "createdAt",
      data: "string",
      isRowHeader: true,
      isResizable: true,
      isSorted: true,
      minWidth: 150,
      isSortedDescending: true,
      sortAscendingAriaLabel: "Sorted A to Z",
      sortDescendingAriaLabel: "Sorted Z to A",
      onRender: (dt) => {
        return new Date(dt.createdAt).toLocaleString();
      },
    },
    {
      name: "Updated on",
      key: "updatedAt",
      fieldName: "updatedAt",
      data: "string",
      isRowHeader: true,
      isResizable: true,
      isSorted: false,
      minWidth: 150,
      isSortedDescending: true,
      sortAscendingAriaLabel: "Sorted A to Z",
      sortDescendingAriaLabel: "Sorted Z to A",
      onRender: (dt) => {
        return new Date(dt.updatedAt).toLocaleString();
      },
    },
  ];

  const onItemInvoked = (item) => {
    setPanelTitle("Edit item");
    let temp = flat(item);
    setFormValues(
      Object.keys(temp).reduce((res, key) => {
        Object.assign(res, { [`${key}`]: temp[key] });
        return res;
      }, {})
    );
    setPanelHidden(true);
  };

  const updateSelected = (items) => {
    selected = items;
  };

  const onItemRemove = (item) => {
    toggleDialog();
    setDialogProceedFunctionParams(item);
    setDialogTitle("Remove channel");
    setDialogProceedFunction(() => removeChannelAction);
    setDialogContent(
      "You are about to remove a channel. This may have adverse effects in the case users access the platform through this channel. Content targeting this channel will also be removed. Would you still like to proceed?"
    );
  };

  const onPanelDismiss = () => {
    setFormValues({});
    showPanel();
    channel = undefined;
  };

  React.useEffect(() => {
    if (error !== undefined) setPersistStatus({ error: error });
    if (channel !== undefined) setPersistStatus({ success: channel });
  }, [channel, error]);

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
        header={"Channels"}
      />
      {panelTitle.length > 0 && (
        <PanelContainer
          panelDismiss={onPanelDismiss}
          lightDismiss={Object.keys(formValues).length > 0}
          panelHidden={panelHidden}
          header={panelTitle}
          showPanel={showPanel}
          content={
            <DynamicForm
              submitStatus={persistStatus}
              channels={channels}
              inputs={addChannel}
              onSubmit={
                Object.keys(formValues).length > 0
                  ? updateChannelAction
                  : createChannelAction
              }
              locale={locale}
              error={error}
              inputValues={formValues}
            />
          }
          description='The platform supports interaction in multiple channels. Adding a channel here will make it available for users within the platform. If you already had content in the system, it would be advisable to go back and update the content for this new channel for the benefit of your users.'
        />
      )}
      <DialogBox
        title={dialogTitle}
        dialogHidden={dialogHidden}
        showDialog={toggleDialog}
        content={dialogContent}
        cancel='Cancel'
        confirm='Confirm'
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
