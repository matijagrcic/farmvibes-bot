import React from "react";
import { connect } from "react-redux";
import { getStyles } from "components/layout/Sidebar/Nav/Nav.styles";
import {
  getAdminUsers,
  getAdminUser,
  updateAdminUser,
  createAdminUser,
  removeAdminUser,
} from "../../../redux/actions";
import { PanelContainer, DialogBox } from "components/containers";
import { Table } from "components/containers/table";
import { styled } from "@fluentui/react";
import { DynamicForm } from "components/forms";
import { capitaliseSentense, flat, validateForm } from "helpers/utils";
import { Text, Form } from "@fluentui/react-northstar";
import { useLanguages } from "helpers/utilities";
import { useIntl } from "react-intl";
import { Action } from "@remix-run/router";

const AdminUsers = ({
  loading,
  users,
  user,
  getUsersAction,
  createUserAction,
  updateUserAction,
  removeUserAction,
  error,
}) => {
  const { languages, locale } = useLanguages();
  const [panelHidden, setPanelHidden] = React.useState(false);
  const [panelTitle, setPanelTitle] = React.useState("");
  const [formValues, setFormValues] = React.useState({});
  const intl = useIntl();
  const [persistStatus, setPersistStatus] = React.useState(undefined);
  const [dialogHidden, setDialogHidden] = React.useState(false);
  const [dialogTitle, setDialogTitle] = React.useState("");
  const [dialogContent, setDialogContent] = React.useState([]);
  const [setAction] = React.useState("");
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
      text: intl.formatMessage({ id: "general.new" }, { subject: "" }),
      cacheKey: "myCacheKey", // changing this key will invalidate this item's cache
      iconProps: { iconName: "Add" },
      onClick: () => {
        setPanelTitle(intl.formatMessage({ id: "user.add" }));
        showPanel();
        setAction("add");
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
      key: "delete",
      text: intl.formatMessage({ id: "general.delete" }, { subject: "" }),
      iconProps: { iconName: "Delete" },
      disabled: true,
    },
  ];

  const updateValues = (values) => {
    setFormValues((prev) => {
      return { ...prev, ...values };
    });
  };

  const columns = [
    {
      name: intl.formatMessage({ id: "general.name" }),
      fieldName: `firstName`,
      key: `firstName`,
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
      onRender: (itm) => {
        return `${itm.firstName} ${itm.surname}`;
      },
    },
    {
      name: capitaliseSentense(
        intl.formatMessage({ id: "language" }, { count: 1 })
      ),
      key: "language",
      fieldName: "language",
      data: "string",
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
      onRender: (itm) => {
        return (
          languages &&
          languages.filter((lingo) => lingo.code === itm.language)[0]?.name
        );
      },
    },
    {
      name: intl.formatMessage({ id: "general.registered.on" }, { count: 1 }),
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
  ];

  const addAdminUser = [
    {
      name: "firstName",
      key: "firstName",
      required: true,
      length: 50,
      type: "string",
      label: intl.formatMessage({ id: "user.name.first" }),
      translatable: false,
      variant: "northstar",
    },
    {
      name: "surname",
      key: "surname",
      required: true,
      length: 3,
      type: "string",
      label: intl.formatMessage({ id: "user.name.surname" }),
      translatable: false,
      variant: "northstar",
    },
    {
      name: "email",
      key: "email",
      required: true,
      length: 50,
      type: "email",
      label: intl.formatMessage({ id: "user.name.email" }),
      translatable: false,
      variant: "northstar",
    },
    {
      name: "language",
      key: "language",
      required: true,
      type: "combo",
      label: (
        <Text content={intl.formatMessage({ id: "user.default.language" })} />
      ),
      variant: "northstar",
      translatable: false,
      disabled: false,
      options:
        languages &&
        languages.map((lingo) => {
          return { key: lingo.code, header: lingo?.translations[locale]?.name };
        }),
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

  const onItemRemove = (item) => {
    toggleDialog();
    setDialogProceedFunctionParams(item);
    setDialogTitle(intl.formatMessage({ id: "user.remove" }));
    setDialogProceedFunction(() => removeUserAction);
    setDialogContent(
      intl.formatMessage(
        { id: "user.remove.confirm" },
        { fullname: item.firstName }
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

  React.useEffect(() => {
    setPanelHidden(false);
  }, [loading]);

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
        getRecords={getUsersAction}
        header={capitaliseSentense(
          intl.formatMessage({ id: "user.admin" }, { count: 1 })
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
                users={users}
                valuesChanged={updateValues}
                inputs={
                  Object.keys(formValues).length > 0
                    ? addAdminUser
                    : [
                        ...addAdminUser,
                        {
                          name: "plainPassword",
                          key: "plainPassword",
                          required: true,
                          length: 50,
                          type: "password",
                          label: intl.formatMessage({ id: "user.password" }),
                          translatable: false,
                          variant: "northstar",
                          fieldAttributes: {
                            minLength: 7,
                            autoComplete: "new-password",
                          },
                          hint: intl.formatMessage(
                            { id: "text.validation.chars.minimum" },
                            { count: 7 }
                          ),
                        },
                      ]
                }
                onSubmit={(e, data) => {
                  let hasErrors = validateForm(
                    e.target.parentElement.form.elements
                  );
                  if (!hasErrors) {
                    Action.includes("add")
                      ? createUserAction(data)
                      : updateUserAction(data);
                  }
                }}
                error={error}
                inputValues={formValues}
              />
            </Form>
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

const mapStateToProps = ({ adminUserReducer }) => {
  const { loading, users, user, error } = adminUserReducer;
  return { loading, error, users, user };
};

export default connect(mapStateToProps, {
  getUsersAction: getAdminUsers,
  getUserAction: getAdminUser,
  updateUserAction: updateAdminUser,
  removeUserAction: removeAdminUser,
  createUserAction: createAdminUser,
})(styled(AdminUsers, getStyles));
