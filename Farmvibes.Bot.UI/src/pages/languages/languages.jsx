import React from "react";
import { connect } from "react-redux";
import { getStyles } from "components/layout/Sidebar/Nav/Nav.styles";
import {
  getLanguages,
  getLanguage,
  updateLanguage,
  createLanguage,
  removeLanguage,
} from "../../redux/actions";
import { PanelContainer, DialogBox } from "components/containers";
import { Table } from "components/containers/table";
import { styled, Overlay } from "@fluentui/react";
import {
  Loader,
  Form,
  Button,
  AcceptIcon,
  BanIcon,
  Text,
  Status,
} from "@fluentui/react-northstar";
import { DynamicForm } from "components/forms";
import {
  capitaliseSentense,
  flat,
  makeListRequest,
  validateForm,
} from "helpers/utils";
import { useLanguages } from "helpers/utilities";
import { useIntl } from "react-intl";

const Languages = ({
  loading,
  languages,
  language,
  getLanguagesAction,
  createLanguageAction,
  updateLanguageAction,
  removeLanguageAction,
  error,
}) => {
  const { locale } = useLanguages();
  const intl = useIntl();
  const [translatable, setTranslatable] = React.useState([]);
  const [panelHidden, setPanelHidden] = React.useState(false);
  const [panelTitle, setPanelTitle] = React.useState("");
  const [formValues, setFormValues] = React.useState({});
  const [persistStatus, setPersistStatus] = React.useState(undefined);
  const [dialogHidden, setDialogHidden] = React.useState(false);
  const [dialogTitle, setDialogTitle] = React.useState("");
  const [dialogContent, setDialogContent] = React.useState([]);
  const [loaderLabel, setLoaderLabel] = React.useState(
    intl.formatMessage({ id: "general.loading" }, { subject: "" })
  );
  const [blockSubmit, setBlockSubmit] = React.useState(false);
  const [dialogProceedFunction, setDialogProceedFunction] =
    React.useState(null);
  const [dialogProceedFunctionParams, setDialogProceedFunctionParams] =
    React.useState({});
  let selected = [];

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
      iconProps: { iconName: "Add" },
      onClick: () => {
        setPanelTitle("Add Language");
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
      onClick: () => onItemRemove(selected[0]),
    },
  ];

  const madeDefault = (item) => {
    setDialogTitle(
      intl.formatMessage(
        { id: "general.make.default" },
        { subject: item.translations[locale]["name"] }
      )
    );
    setDialogContent(intl.formatMessage({ id: "language.default.confirm" }));
    setDialogProceedFunction(() => updateLanguageAction);
    setDialogProceedFunctionParams({ isDefault: true, id: item.id });
    toggleDialog();
  };

  const columns = [
    {
      name: intl.formatMessage({ id: "general.name" }),
      fieldName: `name`,
      key: `name`,
      data: "string",
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
      name: "ISO Code",
      fieldName: `code`,
      key: `code`,
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
    },
    {
      fieldName: "isEnabled",
      name: intl.formatMessage({ id: "general.isenabled" }),
      key: "isEnabled",
      data: "boolean",
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
            icon={item.isEnabled ? <AcceptIcon /> : <BanIcon />}
            text
            disabled={item.isDefault}
            content={
              item.isEnabled
                ? intl.formatMessage({ id: "general.yes" })
                : intl.formatMessage({ id: "general.no" })
            }
            onClick={() => {
              setDialogTitle(
                `${
                  item.isEnabled
                    ? intl.formatMessage({ id: "general.deactivate" })
                    : intl.formatMessage({ id: "general.activate" })
                }`
              );
              setDialogContent(
                `${intl.formatMessage(
                  { id: "language.toggle" },
                  {
                    action: item.isEnabled
                      ? intl.formatMessage({ id: "general.toggle.disable" })
                      : intl.formatMessage({ id: "general.state.enable" }),
                  }
                )} ${
                  item.isTranslatable && !item.isEnabled
                    ? intl.formatMessage({
                        id: "language.autotranslate.available",
                      })
                    : intl.formatMessage({
                        id: "language.autotranslate.unavailable",
                      })
                } ${intl.formatMessage({
                  id: "general.confirm.proceed",
                })}`
              );
              toggleDialog();
              setDialogProceedFunction(() => updateLanguageAction);
              setDialogProceedFunctionParams({
                isEnabled: !item.isEnabled,
                id: item.id,
              });
            }}
          />
        );
      },
    },
    {
      fieldName: "isDefault",
      name: intl.formatMessage({ id: "general.isdefault" }),
      key: "isDefault",
      data: "boolean",
      isResizable: true,
      isSorted: false,
      isPadded: false,
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
            text
            content={
              item.isDefault
                ? intl.formatMessage({ id: "general.yes" })
                : intl.formatMessage({ id: "general.no" })
            }
            disabled={item.isEnabled === false}
            onClick={() =>
              item.isDefault || !item.isEnabled ? null : madeDefault(item)
            }
          />
        );
      },
    },
    {
      fieldName: "isTranslatable",
      name: intl.formatMessage({ id: "language.autotranslate.translatable" }),
      key: "isTranslatable",
      data: "boolean",
      isResizable: true,
      isSorted: false,
      isPadded: true,
      isSortedDescending: false,
      sortAscendingAriaLabel: intl.formatMessage({
        id: "general.list.sort.az",
      }),
      sortDescendingAriaLabel: intl.formatMessage({
        id: "general.list.sort.za",
      }),
      onRender: (item) => {
        return (
          <Status
            state={item.isTranslatable ? "success" : "error"}
            title={
              item.isTranslatable
                ? intl.formatMessage({ id: "general.yes" })
                : intl.formatMessage({ id: "general.no" })
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
    {
      name: intl.formatMessage({ id: "general.updated.on" }),
      key: "updatedAt",
      fieldName: "updatedAt",
      data: "string",
      isResizable: true,
      isSorted: false,
      minWidth: 150,
      isSortedDescending: true,
      sortAscendingAriaLabel: intl.formatMessage({
        id: "general.list.sort.az",
      }),
      sortDescendingAriaLabel: intl.formatMessage({
        id: "general.list.sort.za",
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
    if (item.isDefault) {
      setDialogContent(
        intl.formatMessage({ id: "language.default.remove.notallowed" })
      );
      setDialogProceedFunction(() => toggleDialog);
    } else {
      setDialogProceedFunctionParams(item);
      setDialogTitle(
        intl.formatMessage(
          { id: "general.remove" },
          { subject: intl.formatMessage({ id: "language" }, { count: 1 }) }
        )
      );
      setDialogProceedFunction(() => removeLanguageAction);
      setDialogContent(
        intl.formatMessage({ id: "language.default.remove.allowed" })
      );
    }
  };

  const onPanelDismiss = () => {
    setFormValues({});
    showPanel();
    language = undefined;
  };

  const updateValues = (values) => {
    setFormValues((prev) => {
      return { ...prev, ...values };
    });
  };

  let addLanguage = [
    {
      name: "name",
      key: "name",
      required: true,
      length: 50,
      type: "string",
      label: intl.formatMessage({ id: "general.name" }),
      translatable: true,
      onBlur: (event) => {
        let val = event.value;
        let langExists = translatable.filter(
          (l) =>
            val.length > 0 &&
            (l.header === val || l.header.includes(val) || l.content === val)
        );
        if (langExists.length > 0)
          updateValues({ code: langExists[0].key, isTranslatable: true });
        else updateValues({ code: "", isTranslatable: false });
      },
      variant: "northstar",
      hint: intl.formatMessage({ id: "language.add.hint" }),
    },
    {
      name: "code",
      key: "code",
      required: true,
      length: 3,
      type: "string",
      label: intl.formatMessage({ id: "language.code" }),
      translatable: false,
      variant: "northstar",
    },
    {
      name: "isEnabled",
      key: "isEnabled",
      required: false,
      length: 3,
      type: "boolean",
      label: intl.formatMessage({ id: "language.enabled" }),
      translatable: false,
      selectedText: intl.formatMessage({ id: "general.activated" }),
      deselectedText: intl.formatMessage({ id: "general.deactivated" }),
    },
  ];

  const preventSubmit = (status, message = "") => {
    setBlockSubmit(status);
    setLoaderLabel(message);
  };

  React.useEffect(() => {
    if (error !== undefined) setPersistStatus({ error: error });
    if (language !== undefined && loading === false) onPanelDismiss();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  React.useEffect(() => {
    makeListRequest({ url: "get_translator_languages" }).then((result) => {
      let supportedLingos = Object.keys(result.translation).map((key) => {
        return {
          key: key,
          header: result.translation[key].name,
          content: result.translation[key].nativeName,
        };
      });
      setTranslatable(supportedLingos);
    });
  }, []);

  return (
    <>
      <Table
        selected={updateSelected}
        menuActions={menuActions}
        loading={loading}
        items={languages}
        itemInvoked={onItemInvoked}
        itemRemove={onItemRemove}
        cols={columns}
        isCompactMode={false}
        getRecords={getLanguagesAction}
        header={capitaliseSentense(
          intl.formatMessage({ id: "language" }, { count: 1 })
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
              {blockSubmit && (
                <Overlay className={"loader"}>
                  <Loader label={loaderLabel} size="largest" />
                </Overlay>
              )}
              <Text
                error
                content={intl.formatMessage({
                  id: "general.background.process",
                })}
              />
              <DynamicForm
                submitStatus={persistStatus}
                languages={languages}
                valuesChanged={updateValues}
                inputs={addLanguage}
                onSubmit={(e, data) => {
                  let hasErrors = validateForm(
                    e.target.parentElement.form.elements
                  );
                  if (!hasErrors) {
                    panelTitle.includes(
                      intl.formatMessage({
                        id: "general.edit",
                      })
                    )
                      ? updateLanguageAction(data)
                      : createLanguageAction(data);
                  }
                }}
                locale={locale}
                error={error}
                inputValues={formValues}
                reverse={false}
                preventSubmit={preventSubmit}
                loading={loading}
              />
            </Form>
          }
          description={intl.formatMessage({ id: "language.page.description" })}
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

const mapStateToProps = ({ languageReducer }) => {
  const { loading, languages, language, error } = languageReducer;
  return { loading, error, languages, language };
};

export default connect(mapStateToProps, {
  getLanguagesAction: getLanguages,
  getLanguageAction: getLanguage,
  updateLanguageAction: updateLanguage,
  removeLanguageAction: removeLanguage,
  createLanguageAction: createLanguage,
})(styled(Languages, getStyles));
