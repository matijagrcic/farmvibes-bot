import React from "react";
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
import { styled } from "@fluentui/react";
import { DynamicForm } from "components/forms";
import { addAdministrativeUnit } from "global/defaultValues";
import { capitaliseSentense, flat } from "helpers/utils";
import { useLanguages } from "helpers/utilities";
import { useIntl } from "react-intl";

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
  const { locale } = useLanguages();
  const intl = useIntl();
  const [panelHidden, setPanelHidden] = React.useState(false);
  const [panelTitle, setPanelTitle] = React.useState("");
  const [formValues, setFormValues] = React.useState({});
  const [persistStatus, setPersistStatus] = React.useState(undefined);
  const [dialogHidden, setDialogHidden] = React.useState(false);
  const [dialogTitle, setDialogTitle] = React.useState("");
  const [dialogContent, setDialogContent] = React.useState([]);
  const [dialogProceedFunction, setDialogProceedFunction] =
    React.useState(null);
  const [dialogProceedFunctionParams, setDialogProceedFunctionParams] =
    React.useState({});
  let selected = [];
  const addAdministrativeUnit = [
    {
      name: intl.formatMessage({ id: "general.name" }),
      key: "name",
      required: true,
      length: 50,
      type: "string",
      label: intl.formatMessage({ id: "general.name" }),
      translatable: false,
    },
    {
      name: "parent",
      key: "parent",
      required: false,
      length: 3,
      type: "dropdown",
      label: intl.formatMessage({ id: "general.parent" }),
      translatable: false,
    },
  ];
  //We need to add options to administrative unit's parent drowdown.
  addAdministrativeUnit.map((field) => {
    if (field.name === "parent") {
      field["options"] = getPlatformComponents(
        "administrative_units",
        "administrativeUnits"
      ).then((units) => {
        return units.map((unit) => {
          return { key: unit.id, text: unit.name };
        });
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
      text: intl.formatMessage({ id: "general.new" }, { subject: "" }),
      cacheKey: "myCacheKey", // changing this key will invalidate this item's cache
      iconProps: { iconName: "Add" },
      onClick: () => {
        setPanelTitle(
          intl.formatMessage(
            { id: "general.add" },
            {
              subject: intl.formatMessage(
                { id: "administrative.units" },
                { count: 1 }
              ),
            }
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
      onClick: () => onItemInvoked(selected[0]),
      activeCount: " === 1",
    },
    {
      key: "delete",
      text: intl.formatMessage({ id: "general.delete" }, { subject: "" }),
      iconProps: { iconName: "Delete" },
      disabled: true,
      activeCount: " > 0",
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
      name: intl.formatMessage({ id: "general.parent" }),
      fieldName: `parent`,
      key: `parent`,
      data: "string",
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
      onRender: (item) => {
        if (item.parent !== undefined) {
          let un = administrativeUnits.filter(
            (unit) =>
              unit.id ===
              parseInt(item.parent.substring(item.parent.lastIndexOf("/") + 1))
          );
          return un.length > 0 ? un[0].name : null;
        } else return;
      },
    },
  ];

  const updateSelected = (items) => {
    selected = items;
  };

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
      intl.formatMessage(
        { id: "general.remove" },
        {
          subject: intl.formatMessage(
            { id: "administrative.units" },
            { count: 1 }
          ),
        }
      )
    );
    setDialogProceedFunction(() => removeAdministrativeUnitAction);
    setDialogContent(
      intl.formatMessage({ id: "administrative.units.remove.confirm" })
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
        header={capitaliseSentense(
          intl.formatMessage({ id: "administrative.units" }, { count: 2 })
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
          description={intl.formatMessage({
            id: "administrative.units.description",
          })}
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
