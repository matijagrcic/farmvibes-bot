import React from "react";
import { FontSizes, FontWeights } from "@fluentui/theme";
import { connect } from "react-redux";
import { getStyles } from "components/layout/Sidebar/Nav/Nav.styles";
import {
  getBotUsers,
  getBotUser,
  updateBotUser,
  createBotUser,
  removeBotUser,
} from "../../redux/actions";
import { PanelContainer, DialogBox } from "components/containers";
import { Table } from "components/containers/table";
import { Stack, styled } from "@fluentui/react";
import { DynamicForm } from "components/forms";
import { addUser } from "global/defaultValues";
import { flat, getFromStorage } from "helpers/utils";

const BotUsers = ({
  loading,
  users,
  user,
  getUsersAction,
  createUserAction,
  updateUserAction,
  removeUserAction,
  error,
}) => {
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
        setPanelTitle("Add User");
        showPanel();
      },
    },
    {
      key: "edit",
      text: "Edit",
      iconProps: { iconName: "Edit" },
      disabled: true,
      onClick: () => console.log("Share"),
    },
    {
      key: "import",
      text: "Import users",
      iconProps: { iconName: "Import" },
      disabled: true,
    },
    {
      key: "export",
      text: "Export users",
      iconProps: { iconName: "Export" },
      disabled: true,
    },
    {
      key: "delete",
      text: "Delete",
      iconProps: { iconName: "Delete" },
      disabled: true,
    },
  ];

  const columns = [
    {
      name: "Name",
      fieldName: `fullname`,
      key: `fullname`,
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
      name: "Contacts",
      fieldName: `contacts`,
      key: `contacts`,
      data: "string",
      isRowHeader: true,
      isResizable: true,
      isMultiline: true,
      isSorted: false,
      isSortedDescending: false,
      minWidth: 250,
      sortAscendingAriaLabel: "Sorted A to Z",
      sortDescendingAriaLabel: "Sorted Z to A",
      onRender: (item) => {
        return item.botUserContacts.map((contact) => {
          return (
            <Stack>
              <div>
                <strong>Channel</strong>: {contact.channel.name.toUpperCase()}
              </div>
              <div>
                <strong>Contact</strong>: {contact.value.toUpperCase()}
              </div>
            </Stack>
          );
        });
      },
    },
    {
      name: "Language",
      key: "language",
      fieldName: "language",
      data: "string",
      isRowHeader: true,
      isResizable: true,
      isSorted: false,
      minWidth: 150,
      isSortedDescending: false,
      sortAscendingAriaLabel: "Sorted A to Z",
      sortDescendingAriaLabel: "Sorted Z to A",
    },
    {
      name: "Registered on",
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

  const onItemRemove = (item) => {
    toggleDialog();
    setDialogProceedFunctionParams(item);
    setDialogTitle("Remove user");
    setDialogProceedFunction(() => removeUserAction);
    setDialogContent(
      `You are about to remove ${item.fullname} from the platform. The user will not be able to access the platform again unless they register. Would you like to proceed?`
    );
  };

  const onPanelDismiss = () => {
    setFormValues({});
    showPanel();
    user = undefined;
  };

  React.useEffect(() => {
    if (error !== undefined) setPersistStatus({ error: error });
    if (user !== undefined) setPersistStatus({ success: user });
  }, [user, error]);

  return (
    <>
      <Table
        menuActions={menuActions}
        items={users}
        loading={loading}
        itemInvoked={onItemInvoked}
        itemRemove={onItemRemove}
        cols={columns}
        isCompactMode={false}
        locale={locale}
        getRecords={getUsersAction}
        header={"Users"}
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
              users={users}
              inputs={addUser}
              onSubmit={
                Object.keys(formValues).length > 0
                  ? updateUserAction
                  : createUserAction
              }
              locale={locale}
              error={error}
              inputValues={formValues}
            />
          }
          description=''
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

const mapStateToProps = ({ userReducer }) => {
  const { loading, users, user, error } = userReducer;
  return { loading, error, users, user };
};

export default connect(mapStateToProps, {
  getUsersAction: getBotUsers,
  getUserAction: getBotUser,
  updateUserAction: updateBotUser,
  removeUserAction: removeBotUser,
  createUserAction: createBotUser,
})(styled(BotUsers, getStyles));
