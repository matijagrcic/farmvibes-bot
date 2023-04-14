import React from "react";
import { getStyles } from "components/layout/Sidebar/Nav/Nav.styles";
import {
  getService,
  getServices,
  createService,
  removeService,
  updateService,
} from "redux/service/actions";
import { connect } from "react-redux";
import { styled } from "@fluentui/react";
import { ItemStatus } from "components/general";
import { useHistory } from "react-router-dom";
import { Table, PanelContainer, DialogBox } from "components/containers";

import {
  unflatten,
  addTranslationLocale,
  getFromStorage,
  flat,
} from "helpers/utils";
import { ServiceForm } from "components/forms";

const Services = ({
  getServicesAction,
  createServiceAction,
  updateServiceAction,
  getServiceAction,
  removeServiceAction,
  services,
  loading,
}) => {
  const history = useHistory();
  const [locale, setLocale] = React.useState(getFromStorage("locale"));
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
      onRender: (item) => {
        return item.translations[locale].name;
      },
    },
    {
      name: "Type",
      fieldName: "type",
      key: "type",
      data: "string",
      isRowHeader: true,
      isResizable: true,
      isSorted: false,
      isSortedDescending: false,
      sortAscendingAriaLabel: "Sorted A to Z",
      sortDescendingAriaLabel: "Sorted Z to A",
      onRender: (item) => {
        if (item.type.translations !== undefined) {
          return item.type.translations[locale].name;
        }
      },
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
    {
      name: "Last update",
      key: "updatedAt",
      fieldName: "updatedAt",
      data: "string",
      isRowHeader: true,
      isResizable: true,
      isSorted: true,
      minWidth: 150,
      isSortedDescending: true,
      sortAscendingAriaLabel: "Sorted oldest to newest",
      sortDescendingAriaLabel: "Sorted newest to oldest",
      onRender: (dt) => {
        return new Date(dt.updatedAt).toLocaleString();
      },
    },
  ];
  const [dialogHidden, setDialogHidden] = React.useState(true);
  const [panelHidden, setPanelHidden] = React.useState(false);
  const [dialogContent, setDialogContent] = React.useState(null);
  const [dialogTitle, setDialogTitle] = React.useState(null);
  const [inputValues, setInputValues] = React.useState({});
  let type = "";
  const stateRef = React.useRef();
  const [dialogProceedFunction, setDialogProceedFunction] =
    React.useState(null);
  const [dialogProceedFunctionParams, setDialogProceedFunctionParams] =
    React.useState();

  stateRef.current = inputValues;

  let selected = [];
  const updateValues = (values) => {
    console.log({ values });
    setInputValues(values);
  };
  const onItemInvoked = (item) => {
    //let's remove service type becaue we have an object, but make sure we keep name
    item["type"] = `/api/service_types/${item.type.id}`;
    const toEdit = flat(item);
    setInputValues(flat(item));
    setDialogTitle("Update service");
    const serviceTypes = getFromStorage("serviceTypes").map((type) => {
      return { text: type.name, key: `/api/service_types/${type.id}` };
    });

    setDialogContent(
      <ServiceForm
        action={newService}
        inputValues={toEdit}
        serviceTypes={serviceTypes}
        updateValues={updateValues}
        btnLabel='Update service'
      />
    );
    togglePanel();
    type = "edit";
  };

  const toggleDialog = () => {
    setDialogHidden(!dialogHidden);
  };

  const onPanelDismiss = () => {
    togglePanel();
  };

  const togglePanel = () => {
    setPanelHidden(!panelHidden);
  };

  const onItemRemove = (item) => {
    console.log(item);
    toggleDialog();
    setDialogProceedFunctionParams(item);
    setDialogTitle("Remove service");
    setDialogProceedFunction(() => removeServiceAction);
    setDialogContent(
      "You are about to remove a service. If the service is attached to a menu, it will no-longer appear to it's relevant users. All related questions, translations and other related configuration will be deleted. Would you still like to proceed?"
    );
  };

  const updateSelected = (items) => {
    selected = items;
  };
  const menuActions = [
    {
      key: "newItem",
      text: "Add service",
      cacheKey: "myCacheKey", // changing this key will invalidate this item's cache
      iconProps: { iconName: "Add" },
      onClick: () => {
        setDialogTitle("Create a new service");
        const serviceTypes = getFromStorage("serviceTypes").map((type) => {
          return { text: type.name, key: `/api/service_types/${type.id}` };
        });
        var cnt = (
          <ServiceForm
            action={newService}
            inputValues={{
              ...inputValues,
              ...{ singleAccess: false, backAfterCompletion: true },
            }}
            serviceTypes={serviceTypes}
            updateValues={updateValues}
            btnLabel='Create service'
          />
        );
        setDialogContent(cnt);
        togglePanel();
        type = "create";
      },
    },
    {
      key: "edit",
      text: "Edit service",
      iconProps: { iconName: "Edit" },
      disabled: true,
      onClick: () => onItemInvoked(selected[0]),
      activeCount: " === 1",
    },
    {
      key: "publish",
      text: "Publish service",
      iconProps: { iconName: "PublishContent" },
      disabled: true,
      onClick: () => {
        setDialogTitle(`Publish ${selected[0].translations[locale]["label"]}`);
        toggleDialog();
      },
      activeCount: " === 1",
    },
    {
      key: "delete",
      text: "Remove service",
      iconProps: { iconName: "Delete" },
      disabled: true,
      activeCount: " > 0",
    },
  ];

  const newService = () => {
    //Flatten translated fields
    const unflattened = unflatten(addTranslationLocale(stateRef.current));
    //Format constraints. This will be improved once Paul completes API
    //For now, we probably will have constraints fetched on user-login and then
    //read from there

    const constraints =
      getFromStorage("constraints") ??
      getFromStorage("constraints").map((constraint) => {
        if (
          Object.keys(unflattened).findIndex((key) => key === constraint.entity)
        ) {
          return {
            constaintItem: `/api/constraints/${constraint.id}`,
            filters: unflattened[constraint.entity],
          };
        }
      });

    if (type === "create")
      createServiceAction(
        {
          ...unflattened,
          type: unflattened["type"][0],
          // serviceConstraints: constraints,
        },
        history
      );
    else
      updateServiceAction(
        {
          ...unflattened,
          type: unflattened["type"][0],
          serviceConstraints: constraints,
        },
        history
      );
  };

  const evaluateAdditionalActions = (item, idx) => {
    switch (idx) {
      case 0:
        history.push(`details/${item.id}`);
        break;

      default:
        break;
    }
  };
  return (
    <>
      <Table
        selected={updateSelected}
        loading={loading}
        items={services}
        cols={columns}
        isCompactMode={false}
        locale={locale}
        itemInvoked={onItemInvoked}
        menuActions={menuActions}
        getRecords={getServicesAction}
        itemRemove={onItemRemove}
        header={"Services"}
        localeUpdate={setLocale}
        evaluateAdditionalActions={evaluateAdditionalActions}
        additionalActions={[
          {
            key: "questions",
            text: "Manage questions",
            iconProps: { iconName: "QandA" },
            iconOnly: true,
            buttonStyles: {
              root: { background: "transparent" },
            },
          },
        ]}
      />
      {panelHidden && (
        <PanelContainer
          header={dialogTitle}
          panelWidth='546px'
          panelType='custom'
          panelDismiss={onPanelDismiss}
          lightDismiss={false}
          content={dialogContent}
        />
      )}
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
const mapStateToProps = ({ serviceReducer }) => {
  const { loading, services, error } = serviceReducer;
  return { loading, error, services };
};
export default connect(mapStateToProps, {
  getServicesAction: getServices,
  getServiceAction: getService,
  createServiceAction: createService,
  updateServiceAction: updateService,
  removeServiceAction: removeService,
})(styled(Services, getStyles));
