import React from "react";
import { connect } from "react-redux";
import {
  createMenu,
  getMenus,
  updateMenu,
  removeMenuNode,
} from "../../redux/actions";
import { getStyles } from "components/layout/Sidebar/Nav/Nav.styles";
import { DialogBox } from "components/containers";
import { Table } from "components/containers/table";
import { styled, Overlay } from "@fluentui/react";
import { Loader, BanIcon, AcceptIcon, Button } from "@fluentui/react-northstar";
import { DynamicForm } from "components/forms";
import { useNavigate } from "react-router-dom";
import {
  capitaliseSentense,
  getFromStorage,
  validateForm,
} from "helpers/utils";
import { useNodeTypes } from "helpers/utilities/nodeTypes";
import { useIntl } from "react-intl";

const Menu = ({
  loading,
  menus,
  getMenusAction,
  createMenuAction,
  removeMenuAction,
  updateMenuAction,
}) => {
  const intl = useIntl();
  const { nodeTypes } = useNodeTypes();
  const [modalHidden, setModalHidden] = React.useState(false);
  const [locale, setLocale] = React.useState(getFromStorage("locale"));
  const [dialogHidden, setDialogHidden] = React.useState(false);
  const [dialogContent, setDialogContent] = React.useState(null);
  const [dialogTitle, setDialogTitle] = React.useState(null);
  const [dialogProceedFunction, setDialogProceedFunction] =
    React.useState(null);
  const [dialogProceedFunctionParams, setDialogProceedFunctionParams] =
    React.useState();
  const [inputValues, setInputValues] = React.useState({ publish: "single" });
  let selected = [];
  const navigate = useNavigate();
  const [loaderLabel, setLoaderLabel] = React.useState(
    intl.formatMessage({ id: "general.loading" }, { subject: "" })
  );
  const [blockSubmit, setBlockSubmit] = React.useState(false);
  const addMenu = [
    {
      name: "label",
      key: "menu label",
      required: true,
      length: 50,
      type: "string",
      label: intl.formatMessage({ id: "general.name" }),
      translatable: true,
      variant: "northstar",
    },
    {
      name: "description",
      key: "description",
      required: false,
      length: 300,
      type: "longtext",
      label: intl.formatMessage({ id: "general.description" }),
      translatable: true,
      variant: "northstar",
    },
  ];

  const showModal = () => {
    return setModalHidden(!modalHidden);
  };

  const toggleDialog = () => {
    setDialogHidden(!dialogHidden);
  };

  const updateNode = (title, content, payload) => {
    setDialogTitle(title);
    setDialogContent(content);
    setDialogProceedFunction(() => updateMenuAction);
    setDialogProceedFunctionParams(payload);
    toggleDialog();
  };

  const publishMenu = (item) => {
    let action = item.isPublished ? "Unpublish" : "Publish";
    let isDefaultWarning = item.isDefault
      ? intl.formatMessage(
          { id: "menu.default.unpublishable.warning" },
          { menu: item.translations[locale]["label"] }
        )
      : "";
    updateNode(
      intl.formatMessage(
        { id: `general.${action.toLocaleLowerCase()}` },
        { subject: item.translations[locale]["label"] }
      ),
      action === "Unpublish"
        ? intl.formatMessage(
            { id: "menu.default.unpublish.warning" },
            { isDefaultWarning: isDefaultWarning }
          )
        : intl.formatMessage({ id: "menu.default.publish.info" }),

      {
        ...{ isPublished: !item.isPublished, node: item.id },
      }
    );
    toggleDialog();
  };

  const madeDefault = (item) => {
    updateNode(
      intl.formatMessage(
        {
          id: "general.make.default",
        },
        { subject: item.translations[locale]["label"] }
      ),
      intl.formatMessage({ id: "menu.default.confirmation" }),
      { isDefault: true, node: item.id }
    );
    toggleDialog();
  };

  const menuActions = [
    {
      key: "newItem",
      text: intl.formatMessage({ id: "general.new" }, { subject: "" }),
      cacheKey: "myCacheKey", // changing this key will invalidate this item's cache
      iconProps: { iconName: "Add" },
      onClick: () => showModal(),
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
      key: "publish",
      text: intl.formatMessage({ id: "general.publish" }, { subject: "" }),
      iconProps: { iconName: "PublishContent" },
      disabled: true,
      onClick: () => {
        publishMenu(selected[0]);
      },
      activeCount: " === 1",
    },
    {
      key: "default",
      text: intl.formatMessage({ id: "general.make.default" }, { subject: "" }),
      iconProps: { iconName: "PublishContent" },
      disabled: true,
      onClick: () => {
        if (selected[0].isDefault || !selected[0].isPublished) return;
        madeDefault(selected[0]);
      },
      activeCount: " === 1",
    },
    {
      key: "delete",
      text: intl.formatMessage({ id: "general.delete" }, { subject: "" }),
      iconProps: { iconName: "Delete" },
      disabled: true,
      activeCount: " > 0",
      onClick: () => onItemRemove(selected[0]),
    },
  ];

  const updateMenuValues = (values) => {
    setInputValues((prev) => {
      return { ...prev, ...values };
    });
  };

  const updateSelected = (items) => {
    selected = items;
  };

  const columns = [
    {
      name: intl.formatMessage({ id: "general.name" }),
      key: `label`,
      fieldName: `label`,
      data: "string",
      minWidth: 50,
      isRowHeader: true,
      isResizable: true,
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
      name: intl.formatMessage({ id: "general.description" }),
      fieldName: `description`,
      key: `description`,
      data: "string",
      isResizable: true,
      isMultiline: true,
      isSorted: false,
      minWidth: 400,
      isSortedDescending: false,
      sortAscendingAriaLabel: intl.formatMessage({
        id: "general.list.sort.az",
      }),
      sortDescendingAriaLabel: intl.formatMessage({
        id: "general.list.sort.za",
      }),
    },
    {
      fieldName: "isPublished",
      name: intl.formatMessage({ id: "general.status" }),
      key: "isPublished",
      data: "boolean",
      minWidth: 150,
      isResizable: true,
      isSorted: false,
      isSortedDescending: false,
      onRender: (item) => {
        return (
          <Button
            icon={item.isPublished ? <AcceptIcon /> : <BanIcon />}
            text
            content={
              item.isPublished
                ? intl.formatMessage({
                    id: "general.list.item.status.published",
                  })
                : intl.formatMessage({
                    id: "general.list.item.status.draft",
                  })
            }
            onClick={() => publishMenu(item)}
            disabled={item.isDefault}
          />
        );
      },
    },
    {
      name: intl.formatMessage({ id: "general.isdefault" }),
      fieldName: "isDefault",
      key: "default",
      data: "string",
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
            icon={item.isDefault ? <AcceptIcon /> : <BanIcon />}
            small={"true"}
            text
            variables={{
              minWidth: "unset",
              height: "unset",
              padding: 0,

              fontWeight: "normal",
            }}
            content={
              item.isDefault
                ? intl.formatMessage({ id: "general.yes" })
                : intl.formatMessage({ id: "general.no" })
            }
            disabled={item.isPublished === false}
            onClick={() =>
              item.isDefault || !item.isPublished ? null : madeDefault(item)
            }
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
        id: "general.list.sort.newest",
      }),
      sortDescendingAriaLabel: intl.formatMessage({
        id: "general.list.sort.oldest",
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
    navigate(`${item.id}`, {
      state: { title: item.translations[locale].label },
    });
  };

  const onItemRemove = (item) => {
    toggleDialog();
    setDialogProceedFunctionParams(item.id);
    setDialogTitle(
      intl.formatMessage(
        { id: "general.remove" },
        { subject: intl.formatMessage({ id: "menu" }, { count: 1 }) }
      )
    );

    if (item.isDefault) {
      setDialogContent(intl.formatMessage({ id: "menu.default.delete.deny" }));
      setDialogProceedFunction(() => null);
    } else {
      setDialogProceedFunction(() => removeMenuAction);
      setDialogContent(
        intl.formatMessage({ id: "menu.default.delete.confirm" })
      );
    }
  };

  React.useEffect(() => {
    if (modalHidden === false) {
      setInputValues({});
    }
  }, [modalHidden]);

  React.useEffect(() => {
    setLocale(locale);
  }, [locale]);

  const preventSubmit = (status, message = "") => {
    setBlockSubmit(status);
    setLoaderLabel(message);
  };

  return (
    <>
      {nodeTypes && (
        <Table
          selected={updateSelected}
          loading={loading}
          items={menus}
          cols={columns}
          isCompactMode={false}
          itemInvoked={onItemInvoked}
          menuActions={menuActions}
          recordFilters={{
            type:
              nodeTypes !== undefined
                ? nodeTypes.filter((t) => t.name === "main")[0].id
                : "",
          }}
          getRecords={getMenusAction}
          itemRemove={onItemRemove}
          header={capitaliseSentense(
            intl.formatMessage({ id: "menu" }, { count: 2 })
          )}
          localeUpdate={setLocale}
        />
      )}
      {modalHidden && (
        <DialogBox
          title={intl.formatMessage(
            { id: "general.add" },
            { subject: intl.formatMessage({ id: "menu" }, { count: 1 }) }
          )}
          dialogHidden={modalHidden}
          showDialog={showModal}
          params={inputValues}
          content={
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
              }}
              style={{ width: "100%" }}
              className="validate"
            >
              {blockSubmit && (
                <Overlay className={"loader"}>
                  <Loader label={loaderLabel} size="largest" />
                </Overlay>
              )}
              <DynamicForm
                inputs={addMenu}
                navigate={navigate}
                locale={locale}
                onSubmit={(e, data, navigate) => {
                  let hasErrors = validateForm(
                    e.target.parentElement.form.elements
                  );
                  if (!hasErrors) {
                    createMenuAction(data, navigate);
                  }
                }}
                inputValues={inputValues}
                valuesChanged={updateMenuValues}
                loading={loading}
                preventSubmit={preventSubmit}
                reverse={false}
              />
            </form>
          }
        />
      )}
      {dialogHidden && (
        <DialogBox
          dialogHidden={dialogHidden}
          showDialog={toggleDialog}
          title={dialogTitle}
          content={dialogContent}
          cancel={intl.formatMessage({ id: "general.cancel" })}
          confirm={{
            content: intl.formatMessage({ id: "general.confirm" }),
            disabled: dialogProceedFunction === null,
          }}
          proceedFunction={dialogProceedFunction}
          params={dialogProceedFunctionParams}
        />
      )}
    </>
  );
};

const mapStateToProps = ({ menuReducer }) => {
  const { loading, menus, error } = menuReducer;
  return { loading, error, menus };
};

export default connect(mapStateToProps, {
  getMenusAction: getMenus,
  createMenuAction: createMenu,
  updateMenuAction: updateMenu,
  removeMenuAction: removeMenuNode,
})(styled(Menu, getStyles));
