import React from "react";
import { FontSizes, FontWeights } from "@fluentui/theme";
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
import {
  getTheme,
  Stack,
  styled,
  Icon,
  TooltipHost,
  mergeStyles,
  mergeStyleSets,
} from "@fluentui/react";
import { DynamicForm } from "components/forms";
import { addLanguage } from "global/defaultValues";
import { flat } from "helpers/utils";

const Languages = ({
  loading,
  languages,
  language,
  getLanguagesAction,
  createLanguageAction,
  getLanguageAction,
  updateLanguageAction,
  removeLanguageAction,
  error,
}) => {
  const theme = getTheme();
  const [locale, setLocale] = React.useState("en");
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
  const iconClass = mergeStyles({
    fontSize: 20,
    height: 20,
    width: 20,
    margin: "0 auto",
    cursor: "pointer",
    FontWeight: 600,
  });
  const classNames = mergeStyleSets({
    danger: [{ color: theme.palette.redDark }, iconClass],
    success: [{ color: theme.palette.green }, iconClass],
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
        setPanelTitle("Add Language");
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
      name: "ISO Code",
      fieldName: `code`,
      key: `code`,
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
      fieldName: "isEnabled",
      name: "Enabled?",
      key: "isEnabled",
      data: "boolean",
      isRowHeader: true,
      isResizable: true,
      isSorted: false,
      isSortedDescending: false,
      sortAscendingAriaLabel: "Sorted A to Z",
      sortDescendingAriaLabel: "Sorted Z to A",
      onRender: (item) => {
        return (
          <TooltipHost content={item.isEnabled ? `Enabled` : `Disabled`}>
            <Icon
              iconName={item.isEnabled ? `Accept` : `CalculatorMultiply`}
              className={
                item.isEnabled ? classNames.success : classNames.danger
              }
            />
          </TooltipHost>
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
      sortAscendingAriaLabel: "Sorted A to Z",
      sortDescendingAriaLabel: "Sorted Z to A",
      onRender: (dt) => {
        return new Date(dt.createdAt).toLocaleString();
      },
    },
    {
      name: "Updated on",
      key: "updatedAt",
      fieldName: "updatedAt",
      data: "string",
      isRowHeader: true,
      isResizable: true,
      isSorted: false,
      minWidth: 150,
      isSortedDescending: true,
      sortAscendingAriaLabel: "Sorted A to Z",
      sortDescendingAriaLabel: "Sorted Z to A",
      onRender: (dt) => {
        return new Date(dt.updatedAt).toLocaleString();
      },
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
    setDialogTitle("Remove language");
    setDialogProceedFunction(() => removeLanguageAction);
    setDialogContent(
      "You are about to remove a language. This may have adverse effects in the case users have this as their default language. Content in this language will also be removed. Would you still like to proceed?"
    );
  };

  const onPanelDismiss = () => {
    setFormValues({});
    showPanel();
    language = undefined;
  };

  React.useEffect(() => {
    if (error !== undefined) setPersistStatus({ error: error });
    if (language !== undefined) setPersistStatus({ success: language });
  }, [language, error]);

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
        locale={locale}
        getRecords={getLanguagesAction}
        header={"Languages"}
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
              languages={languages}
              inputs={addLanguage}
              onSubmit={
                Object.keys(formValues).length > 0
                  ? updateLanguageAction
                  : createLanguageAction
              }
              locale={locale}
              error={error}
              inputValues={formValues}
            />
          }
          description='The platform supports interaction in multiple languages. Adding a language here will make it available for users within the platform. If you already had content in the system, it would be advisable to go back and update the content for this new language for the benefit of your users.'
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
