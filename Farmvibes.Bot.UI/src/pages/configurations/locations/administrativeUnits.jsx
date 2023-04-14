import React from "react";
import { FontSizes, FontWeights } from "@fluentui/theme";
import { connect } from "react-redux";
import { getStyles } from "components/layout/Sidebar/Nav/Nav.styles";
import {
  getAdministrativeUnits,
  getAdministrativeUnit,
  updateAdministrativeUnit,
  createAdministrativeUnit,
  removeAdministrativeUnit,
} from "../../../redux/actions";
import { Table, PanelContainer, DialogBox } from "components/containers";
import { getTheme, Stack, styled } from "@fluentui/react";
import { DynamicForm } from "components/forms";
import { addAdministrativeUnit } from "global/defaultValues";
import { flat, getFromStorage } from "helpers/utils";

const AdministrativeUnits = ({
  loading,
  administrativeUnits,
  administrativeUnit,
  getAdministrativeUnitsAction,
  createAdministrativeUnitAction,
  updateAdministrativeUnitAction,
  removeAdministrativeUnitAction,
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
  let selected = [];
  //We need to add options to administrative unit's parent drowdown.
  addAdministrativeUnit.map((field) => {
    if (field.name === "parent") {
      field["options"] = getFromStorage("administrativeUnits").map((unit) => {
        return { key: unit.id, text: unit.name };
      });
    }
    return field;
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
        setPanelTitle("Add AdministrativeUnit");
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
      name: "Parent",
      fieldName: `parent`,
      key: `parent`,
      data: "string",
      isRowHeader: true,
      isResizable: true,
      isMultiline: true,
      isSorted: false,
      isSortedDescending: false,
      sortAscendingAriaLabel: "Sorted A to Z",
      sortDescendingAriaLabel: "Sorted Z to A",
    },
  ];

  const updateSelected = (items) => {
    selected = items;
  };

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
    setDialogTitle("Remove Administrative Unit");
    setDialogProceedFunction(() => removeAdministrativeUnitAction);
    setDialogContent(
      "You are about to remove an administrative unit. This may have adverse effects in cases where content is tagged to this unit. Constraints restricting content and users within this unit will also be removed. Would you still like to proceed?"
    );
  };

  const onPanelDismiss = () => {
    setFormValues({});
    showPanel();
    administrativeUnit = undefined;
  };

  React.useEffect(() => {
    if (error !== undefined) setPersistStatus({ error: error });
    if (administrativeUnit !== undefined)
      setPersistStatus({ success: administrativeUnit });
  }, [administrativeUnit, error]);

  return (
    <>
      <Table
        selected={updateSelected}
        menuActions={menuActions}
        getRecords={getAdministrativeUnitsAction}
        loading={loading}
        items={administrativeUnits}
        itemInvoked={onItemInvoked}
        itemRemove={onItemRemove}
        cols={columns}
        isCompactMode={false}
        locale={locale}
        header={"Administrative Units"}
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
              administrativeUnits={administrativeUnits}
              inputs={addAdministrativeUnit}
              onSubmit={
                Object.keys(formValues).length > 0
                  ? updateAdministrativeUnitAction
                  : createAdministrativeUnitAction
              }
              locale={locale}
              error={error}
              inputValues={formValues}
            />
          }
          description='The platform allows you to create all levels of administration within your country. Adding an administrative unit here will make it available for users when registering on the platform and allow you to customise availability of content within these units.'
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

const mapStateToProps = ({ administrativeUnitReducer }) => {
  const { loading, administrativeUnits, administrativeUnit, error } =
    administrativeUnitReducer;
  return { loading, error, administrativeUnits, administrativeUnit };
};

export default connect(mapStateToProps, {
  getAdministrativeUnitsAction: getAdministrativeUnits,
  getAdministrativeUnitAction: getAdministrativeUnit,
  updateAdministrativeUnitAction: updateAdministrativeUnit,
  removeAdministrativeUnitAction: removeAdministrativeUnit,
  createAdministrativeUnitAction: createAdministrativeUnit,
})(styled(AdministrativeUnits, getStyles));
