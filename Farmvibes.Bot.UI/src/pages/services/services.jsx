import React from "react";
import { getStyles } from "components/layout/Sidebar/Nav/Nav.styles";
import {
  getService,
  getServices,
  createService,
  removeService,
  updateService,
  updateServiceObj,
  resetServiceObj,
} from "redux/service/actions";
import { connect } from "react-redux";
import { styled } from "@fluentui/react";
import { useNavigate } from "react-router-dom";
import { Table, PanelContainer, DialogBox } from "components/containers";
import { Button, BanIcon, AcceptIcon } from "@fluentui/react-northstar";
import { useIntl } from "react-intl";

import {
  unflatten,
  addTranslationLocale,
  getPlatformComponents,
  flat,
  capitaliseSentense,
} from "helpers/utils";
import ServiceForm from "components/forms/serviceForm";
import { useServiceTypes } from "helpers/utilities/serviceTypes";
import { useLocalStorage } from "react-use-storage";

const Services = ({
  getServicesAction,
  createServiceAction,
  updateServiceAction,
  removeServiceAction,
  updateServiceObjAction,
  resetServiceObjAction,
  services,
  loading,
}) => {
  const { serviceTypes } = useServiceTypes();
  const navigate = useNavigate();
  const intl = useIntl();
  const [locale] = useLocalStorage("locale");
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
      ariaLabel: intl.formatMessage({ id: "service" }, { count: 1 }),
      isSortedDescending: false,
      sortAscendingAriaLabel: intl.formatMessage({
        id: "general.list.sort.az",
      }),
      sortDescendingAriaLabel: intl.formatMessage({
        id: "general.list.sort.za",
      }),
      onRender: (item) => {
        return item.translations[locale].name;
      },
    },
    {
      name: intl.formatMessage({ id: "general.type" }),
      fieldName: "type",
      key: "type",
      data: "string",
      isResizable: true,
      isSorted: false,
      isSortedDescending: false,
      ariaLabel: intl.formatMessage({ id: "general.type" }, { count: 1 }),
      sortAscendingAriaLabel: intl.formatMessage({
        id: "general.list.sort.az",
      }),
      sortDescendingAriaLabel: intl.formatMessage({
        id: "general.list.sort.za",
      }),
      onRender: (item) => {
        if (serviceTypes === undefined) return;

        let stype = serviceTypes.filter((type) => {
          let itmId = parseInt(
            item.type.substring(item.type.lastIndexOf("/") + 1)
          );
          return type.id === itmId;
        });

        if (stype.length > 0) return stype[0].translations[locale]?.name;
        return;
      },
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
            content={capitaliseSentense(
              item.isPublished
                ? intl.formatMessage({
                    id: "general.list.item.status.published",
                  })
                : intl.formatMessage({
                    id: "general.list.item.status.draft",
                  })
            )}
            onClick={() => publishService(item)}
            disabled={item.isDefault}
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
    {
      name: intl.formatMessage({ id: "general.updated.on" }),
      key: "updatedAt",
      fieldName: "updatedAt",
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
  const [dialogHidden, setDialogHidden] = React.useState(false);
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
    setInputValues((prev) => {
      return { ...prev, ...values };
    });
  };
  const onItemInvoked = (item) => {
    //let's remove service type becaue we have an object, but make sure we keep name
    // item["type"] = `${item.type.id}`;
    const toEdit = flat(item);
    updateServiceObjAction(toEdit);
    setInputValues(flat(item));
    setDialogTitle(
      intl.formatMessage({ id: "general.update" }, { subject: "" })
    );
    setDialogContent(
      <ServiceForm
        action={newService}
        serviceTypes={getPlatformComponents(
          "service_types?groups[]=translations",
          "serviceTypes"
        ).then((types) => {
          return types
            .filter((x) => x.isHidden === false)
            .map((type) => {
              return {
                header: type.name,
                key: `/api/service_types/${type.id}`,
                disabled: type.isDisabled,
              };
            });
        })}
        updateValues={updateValues}
        btnLabel={intl.formatMessage({ id: "general.update" }, { subject: "" })}
        panelDismiss={onPanelDismiss}
      />
    );
    togglePanel();
    type = "edit";
  };

  const toggleDialog = () => {
    setDialogHidden(!dialogHidden);
  };

  const onPanelDismiss = () => {
    setPanelHidden(false);
    resetServiceObjAction();
  };

  const togglePanel = () => {
    setPanelHidden(!panelHidden);
  };

  const onItemRemove = (item) => {
    toggleDialog();
    setDialogProceedFunctionParams(item);
    setDialogTitle(
      intl.formatMessage(
        { id: "general.remove" },
        { subject: intl.formatMessage({ id: "service" }, { count: 1 }) }
      )
    );
    if (item.isSystem) {
      setDialogContent(intl.formatMessage({ id: "service.delete.blocked" }));
      setDialogProceedFunction(() => null);
    } else {
      setDialogProceedFunction(() => removeServiceAction);
      setDialogContent(intl.formatMessage({ id: "service.delete.confirm" }));
    }
  };

  const updateSelected = (items) => {
    selected = items;
  };
  const menuActions = [
    {
      key: "newItem",
      text: intl.formatMessage(
        { id: "general.add" },
        { subject: intl.formatMessage({ id: "service" }, { count: 1 }) }
      ),
      iconProps: { iconName: "Add" },
      onClick: () => {
        getPlatformComponents("service_types", "serviceTypes").then(
          (result) => {
            setDialogTitle(intl.formatMessage({ id: "service.create" }));
            let cnt = (
              <ServiceForm
                action={newService}
                inputValues={{
                  ...inputValues,
                  ...{ singleAccess: false, backAfterCompletion: true },
                }}
                serviceTypes={result
                  .filter((x) => x.isHidden === false)
                  .map((type) => {
                    return {
                      header: type.name,
                      key: `/api/service_types/${type.id}`,
                      disabled: type.isDisabled,
                    };
                  })}
                updateValues={updateValues}
                btnLabel={intl.formatMessage(
                  { id: "general.add" },
                  {
                    subject: intl.formatMessage(
                      { id: "service" },
                      { count: 1 }
                    ),
                  }
                )}
                panelDismiss={onPanelDismiss}
              />
            );
            setDialogContent(cnt);

            togglePanel();
            type = "create";
          }
        );
      },
    },
    {
      key: "edit",
      text: intl.formatMessage(
        { id: "general.edit" },
        {
          subject: intl.formatMessage({ id: "service" }, { count: 1 }),
        }
      ),
      iconProps: { iconName: "Edit" },
      disabled: true,
      onClick: () => onItemInvoked(selected[0]),
      activeCount: " === 1",
    },
    {
      key: "delete",
      text: intl.formatMessage(
        { id: "general.remove" },
        {
          subject: intl.formatMessage({ id: "service" }, { count: 1 }),
        }
      ),
      iconProps: { iconName: "Delete" },
      disabled: true,
      activeCount: " > 0",
      onClick: () => onItemRemove(selected[0]),
    },
  ];

  const newService = () => {
    //Flatten translated fields
    const unflattened = unflatten(addTranslationLocale(stateRef.current));

    //Format constraints. This will be improved once Paul completes API
    //For now, we probably will have constraints fetched on user-login and then
    //read from there

    const constraints = getPlatformComponents(
      "service_types",
      "serviceTypes"
    ).then((result) => {
      return result.reduce((arr, constraint) => {
        if (
          Object.keys(unflattened).findIndex((key) => key === constraint.entity)
        ) {
          arr.push({
            constaintItem: `/api/constraints/${constraint.id}`,
            filters: unflattened[constraint.entity],
          });
        }
        return arr;
      }, []);
    });

    if (type === "create")
      createServiceAction(
        {
          ...unflattened,
          constraints: constraints,
        },
        navigate
      );
    else
      updateServiceAction(
        {
          ...unflattened,
          type: unflattened["type"],
          serviceConstraints: constraints,
        },
        navigate
      );
  };

  const publishService = (item) => {
    let action = item.isPublished ? "Unpublish" : "Publish";
    setDialogTitle(`${action} ${selected[0].translations[locale]["name"]}`);
    let publishMessage = "";
    if (item.isSystem) {
      publishMessage = intl.formatMessage({ id: "service.unpublishable" });
      setDialogProceedFunction(() => null);
    } else {
      setDialogProceedFunction(() => updateServiceAction);
      setDialogProceedFunctionParams({
        id: item.id,
        isPublished: !item.isPublished,
      });
      publishMessage = "Unpublish"
        ? intl.formatMessage({ id: "service.publish" })
        : intl.formatMessage({ id: "service.unpublish" });
      publishMessage += ` ${intl.formatMessage({
        id: "general.confirm.proceed",
      })}`;
    }
    setDialogContent(publishMessage);
    toggleDialog();
  };

  const evaluateAdditionalActions = (item, idx) => {
    switch (idx) {
      case 0:
        navigate(`${item.id}`, {
          state: {
            title: item?.translations ? item?.translations[locale].name : "",
          },
        });
        break;

      default:
        break;
    }
  };

  React.useEffect(() => {
    onPanelDismiss();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  return (
    <>
      <Table
        selected={updateSelected}
        loading={loading}
        items={services}
        cols={columns}
        isCompactMode={false}
        itemInvoked={onItemInvoked}
        menuActions={menuActions}
        getRecords={getServicesAction}
        itemRemove={onItemRemove}
        locale={locale}
        header={capitaliseSentense(
          intl.formatMessage({ id: "service" }, { count: 2 })
        )}
        evaluateAdditionalActions={evaluateAdditionalActions}
        additionalActions={[
          {
            key: "questions",
            text: intl.formatMessage(
              { id: "general.manage" },
              { subject: "question" },
              { count: 2 }
            ),
            iconProps: { iconName: "QandA" },
            buttonStyles: {
              root: { background: "transparent" },
            },
          },
        ]}
      />
      {panelHidden && (
        <PanelContainer
          header={dialogTitle}
          panelWidth="546px"
          panelType="custom"
          panelDismiss={onPanelDismiss}
          lightDismiss={false}
          content={dialogContent}
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
  resetServiceObjAction: resetServiceObj,
  updateServiceObjAction: updateServiceObj,
})(styled(Services, getStyles));
