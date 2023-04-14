import React from "react";
import { connect } from "react-redux";
import {
  createMenu,
  getMenus,
  updateMenuNode,
  removeMenuNode,
  publishMenu,
} from "../../redux/actions";
import { getStyles } from "components/layout/Sidebar/Nav/Nav.styles";
import { DialogBox, ModalContainer } from "components/containers";
import { ItemStatus } from "components/general";
import { Table } from "components/containers/table";
import { styled } from "@fluentui/react";
import { DynamicForm } from "components/forms";
import { useHistory } from "react-router-dom";
import {
  addMenu,
  publishMenu as publishMenuFields,
} from "global/defaultValues";

const Menu = ({
  loading,
  menus,
  getMenusAction,
  createMenuAction,
  removeMenuAction,
  publishMenuAction,
}) => {
  const [modalHidden, setModalHidden] = React.useState(false);
  const [locale, setLocale] = React.useState("en");
  const [dialogHidden, setDialogHidden] = React.useState(true);
  const [dialogContent, setDialogContent] = React.useState(null);
  const [dialogTitle, setDialogTitle] = React.useState(null);
  const [dialogProceedFunction, setDialogProceedFunction] =
    React.useState(null);
  const [dialogProceedFunctionParams, setDialogProceedFunctionParams] =
    React.useState();
  const [inputValues, setInputValues] = React.useState({ publish: "single" });
  let selected = [];
  const history = useHistory();
  const showModal = () => {
    return setModalHidden(!modalHidden);
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
      onClick: () => showModal(),
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
      key: "publish",
      text: "Publish",
      iconProps: { iconName: "PublishContent" },
      disabled: true,
      onClick: () => {
        setDialogTitle(`Publish ${selected[0].translations[locale]["label"]}`);
        setDialogContent(
          <DynamicForm
            inputs={publishMenuFields}
            valuesChanged={valuesChanged}
            inputValues={inputValues}
          />
        );
        setDialogProceedFunction(() => publishMenuAction);
        setDialogProceedFunctionParams({
          ...inputValues,
          ...{ isPublished: !selected[0].isPublished, node: selected[0].id },
        });
        toggleDialog();
      },
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

  const updateMenuValues = (values) => {
    setInputValues((prev) => {
      return { ...prev, ...values };
    });
  };

  const updateSelected = (items) => {
    selected = items;
  };

  const valuesChanged = (values) => {
    //This will need to be revisited
    setDialogProceedFunctionParams(
      Object.assign(
        { isPublished: !selected[0].isPublished, node: selected[0].id },
        values
      )
    );
  };

  const columns = [
    {
      name: "Name",
      key: `label`,
      fieldName: `label`,
      data: "string",
      minWidth: 50,
      isRowHeader: true,
      isResizable: true,
      isSorted: false,
      isSortedDescending: false,
      sortAscendingAriaLabel: "Sorted A to Z",
      sortDescendingAriaLabel: "Sorted Z to A",
    },
    {
      name: "Description",
      fieldName: `description`,
      key: `description`,
      data: "string",
      isRowHeader: true,
      isResizable: true,
      isMultiline: true,
      isSorted: false,
      minWidth: 400,
      isSortedDescending: false,
      sortAscendingAriaLabel: "Sorted A to Z",
      sortDescendingAriaLabel: "Sorted Z to A",
    },
    {
      name: "Default?",
      fieldName: "isDefault",
      key: "default",
      data: "boolean",
      isRowHeader: true,
      isResizable: true,
      isSorted: false,
      isSortedDescending: false,
      sortAscendingAriaLabel: "Sorted A to Z",
      sortDescendingAriaLabel: "Sorted Z to A",
    },
    {
      fieldName: "isPublished",
      name: "Status",
      key: "isPublished",
      data: "boolean",
      isRowHeader: true,
      isResizable: true,
      isSorted: false,
      isSortedDescending: false,
      sortAscendingAriaLabel: "Sorted A to Z",
      sortDescendingAriaLabel: "Sorted Z to A",
      onRender: (item) => {
        return (
          <ItemStatus
            text={item.isPublished ? `Published` : `Not published`}
            status={item.isPublished ? "success" : "error"}
            field='Publish status'
          />
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
      sortAscendingAriaLabel: "Sorted oldest to newest",
      sortDescendingAriaLabel: "Sorted newest to oldest",
      onRender: (dt) => {
        return new Date(dt.createdAt).toLocaleString();
      },
    },
  ];

  const onItemInvoked = (item) => {
    history.push(`details/${item.id}`);
  };

  const onItemRemove = (item) => {
    toggleDialog();
    setDialogProceedFunctionParams(item);
    setDialogTitle("Remove Menu");
    setDialogProceedFunction(() => removeMenuAction);
    setDialogContent(
      "You are about to remove a navigation menu. If the menu is published, it will no-longer appear to it's relevant users. Branches and nodes associated with it will also be discarded. Would you still like to proceed?"
    );
  };

  return (
    <>
      <Table
        selected={updateSelected}
        loading={loading}
        items={menus}
        cols={columns}
        isCompactMode={false}
        locale={locale}
        itemInvoked={onItemInvoked}
        menuActions={menuActions}
        getRecords={getMenusAction}
        itemRemove={onItemRemove}
        header={"Menus"}
      />
      <ModalContainer
        title={"Add menu"}
        modalHidden={modalHidden}
        showModal={showModal}
        content={
          <DynamicForm
            formWidth={450}
            inputs={addMenu}
            onSubmit={createMenuAction}
            history={history}
            locale={locale}
            inputValues={inputValues}
            valuesChanged={updateMenuValues}
            loading={loading}
          />
        }
      />
      <DialogBox
        dialogHidden={dialogHidden}
        showDialog={toggleDialog}
        title={dialogTitle}
        content={dialogContent}
        cancel='Cancel'
        confirm='Confirm'
        proceedFunction={dialogProceedFunction}
        params={dialogProceedFunctionParams}
      />
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
  updateMenuAction: updateMenuNode,
  removeMenuAction: removeMenuNode,
  publishMenuAction: publishMenu,
})(styled(Menu, getStyles));
