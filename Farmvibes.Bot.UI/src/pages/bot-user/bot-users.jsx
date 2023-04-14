import React from "react";
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
import { capitaliseSentense, flat } from "helpers/utils";
import { useLanguages } from "helpers/utilities";
import { useIntl } from "react-intl";

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
  const { locale } = useLanguages();
  const [panelHidden, setPanelHidden] = React.useState(false);
  const [panelTitle, setPanelTitle] = React.useState("");
  const [formValues, setFormValues] = React.useState({});
  const [persistStatus, setPersistStatus] = React.useState(undefined);
  const [dialogHidden, setDialogHidden] = React.useState(false);
  const [dialogTitle, setDialogTitle] = React.useState("");
  const [dialogContent, setDialogContent] = React.useState([]);
  const intl = useIntl();
  const [dialogProceedFunction, setDialogProceedFunction] =
    React.useState(null);
  const [dialogProceedFunctionParams, setDialogProceedFunctionParams] =
    React.useState({});

  const showPanel = () => {
    return setPanelHidden(!panelHidden);
  };

  const addUser = [
    {
      name: "fullname",
      key: "fullname",
      required: true,
      length: 50,
      type: "string",
      label: intl.formatMessage({ id: "general.name" }),
      translatable: false,
      disabled: true,
    },
    {
      name: "language",
      key: "language",
      required: true,
      length: 3,
      type: "string",
      label: intl.formatMessage({ id: "language" }, { count: 1 }),
      translatable: false,
      disabled: true,
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
      disabled: true,
      onClick: () => {
        setPanelTitle(
          intl.formatMessage(
            { id: "general.add" },
            { subject: intl.formatMessage({ id: "user" }, { count: 1 }) }
          )
        );
        showPanel();
      },
    },
    {
      key: "edit",
      text: intl.formatMessage({ id: "general.edit" }, { subject: "" }),
      iconProps: { iconName: "Edit" },
      disabled: true,
      onClick: () => console.log("Share"),
    },
    {
      key: "import",
      text: intl.formatMessage({ id: "user.import" }),
      iconProps: { iconName: "Import" },
      disabled: true,
    },
    {
      key: "export",
      text: intl.formatMessage({ id: "user.export" }),
      iconProps: { iconName: "Export" },
      disabled: true,
    },
    {
      key: "delete",
      text: intl.formatMessage({ id: "general.delete" }, { subject: "" }),
      iconProps: { iconName: "Delete" },
      disabled: true,
    },
  ];

  const columns = [
    {
      name: intl.formatMessage({ id: "general.name" }),
      fieldName: `fullname`,
      key: `fullname`,
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
      name: capitaliseSentense(
        intl.formatMessage(
          {
            id: "contacts",
          },
          { count: 1 }
        )
      ),
      fieldName: `contacts`,
      key: `contacts`,
      data: "string",
      isRowHeader: true,
      isResizable: true,
      isMultiline: true,
      isSorted: false,
      isSortedDescending: false,
      minWidth: 250,
      sortAscendingAriaLabel: intl.formatMessage({
        id: "general.list.sort.az",
      }),
      sortDescendingAriaLabel: intl.formatMessage({
        id: "general.list.sort.za",
      }),
      onRender: (item) => {
        return item.botUserContacts.map((contact) => {
          return (
            <Stack key={`contact-${contact.id}`}>
              <div>
                <strong>
                  {capitaliseSentense(
                    intl.formatMessage({ id: "channels" }, { count: 1 })
                  )}
                </strong>
                : {contact.channel.name.toUpperCase()}
              </div>
              <div>
                <strong>
                  {capitaliseSentense(
                    intl.formatMessage({ id: "contacts" }, { count: 1 })
                  )}
                </strong>
                : {contact.value.toUpperCase()}
              </div>
            </Stack>
          );
        });
      },
    },
    {
      name: capitaliseSentense(
        intl.formatMessage({ id: "language" }, { count: 1 })
      ),
      key: "language",
      fieldName: "language",
      data: "string",
      isRowHeader: true,
      isResizable: true,
      isSorted: false,
      minWidth: 150,
      isSortedDescending: false,
      sortAscendingAriaLabel: intl.formatMessage({
        id: "general.list.sort.az",
      }),
      sortDescendingAriaLabel: intl.formatMessage({
        id: "general.list.sort.za",
      }),
    },
    {
      name: intl.formatMessage({ id: "general.registered.on" }, { count: 1 }),
      key: "createdAt",
      fieldName: "createdAt",
      data: "string",
      isRowHeader: true,
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
  ];

  const onItemInvoked = (item) => {
    setPanelTitle(intl.formatMessage({ id: "general.edit" }, { subject: "" }));
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
    setDialogTitle(
      intl.formatMessage({
        id: "user.remove",
      })
    );
    setDialogProceedFunction(() => removeUserAction);
    setDialogContent(
      intl.formatMessage(
        { id: "user.remove.confirm" },
        { fullname: item.fullname }
      )
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
        header={capitaliseSentense(
          intl.formatMessage({ id: "user" }, { count: 2 })
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
            <DynamicForm
              submitStatus={persistStatus}
              disableSubmit={true}
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
          description=""
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
