import React from "react";
import { connect } from "react-redux";
import { styled } from "@fluentui/react";
import { Dialog, Text } from "@fluentui/react-northstar";
import { getStyles } from "components/layout/Sidebar/Nav/Nav.styles";
import { Grouped } from "components/containers";
import { DynamicForm } from "components/forms";
import { addValidationGroup } from "global/defaultValues";
import {
  makeListRequest,
  getFromStorage,
  unflatten,
  addTranslationLocale,
} from "helpers/utils";
import {
  getValidations,
  getValidation,
  updateValidation,
  createValidation,
  removeValidation,
  createValidationAttribute,
} from "../../../redux/actions";

const Validations = ({
  getValidationsAction,
  removeValidationAction,
  updateValidationAction,
  createValidationAction,
  createValidationAttributeAction,
  validations,
  loading,
}) => {
  const [locale, setLocale] = React.useState(getFromStorage("locale"));
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogTitle, setDialogTitle] = React.useState("");
  const [dialogConfirmText, setDialogConfirmText] = React.useState("");
  const [formValues, setFormValues] = React.useState({});
  const [questionTypes, setQuestionTypes] = React.useState([]);
  const [attibutes, setAttibutes] = React.useState([]);
  const [activeValidation, setActiveValidation] = React.useState(null);
  const fetchRecords = React.useCallback((currentPage) => {
    getValidationsAction({ page: currentPage, itemsPerPage: 10 });
  });
  const valuesChanged = (values) => {
    setFormValues(values);
  };
  React.useEffect(() => {
    getValidationsAction({ page: 1, itemsPerPage: 10 });
    makeListRequest({
      url: `question_types`,
      options: {
        "groups[]": "translations",
      },
    }).then((result) => {
      //May be a new menu without lables
      setQuestionTypes(result);
    });
  }, []);
  const addValidation = (action = null, group) => {
    let title = "validation";
    let confirmButtonText = "Create";
    if (action !== null) {
      if (action.includes("edit")) {
        title = `Edit ${title}`;
        confirmButtonText = "Update";
      } else {
        title = `Create ${title} item`;
        setAttibutes([
          {
            label: "Description",
            name: "description",
            key: "description",
            type: "string",
            required: true,
            translatable: true,
            variant: "northstar",
          },
          {
            label: "Default error message",
            name: "errorMessage",
            key: "errorMessage",
            type: "string",
            required: true,
            translatable: true,
            variant: "northstar",
          },
          {
            label: "Type",
            name: "type",
            placeholder: "Type of validation",
            key: "type",
            type: "choice",
            required: true,
            translatable: false,
            variant: "northstar",
            options: [
              {
                key: "regex-type",
                label: "Regex",
                value: "Regex",
                name: "type",
              },
              {
                key: "expression-type",
                label: "Expression",
                value: "Expression",
                name: "type",
              },
            ],
          },
          {
            label: "Validation pattern or expression",
            name: "expression",
            key: "expression",
            type: "string",
            required: true,
            translatable: false,
            variant: "northstar",
          },
        ]);
      }
    } else {
      title = `Add ${title}`;
    }
    setDialogOpen(true);
    setDialogTitle(title);
    setDialogConfirmText(confirmButtonText);
    if (group !== undefined) setActiveValidation(group);
  };

  const addParent = (data) => {
    data.questionTypes = data.questionTypes.map((type) => {
      return `/api/question_types/${type}`;
    });
    createValidationAction(data);
  };

  const addChild = (data) => {
    createValidationAttributeAction({
      ...data,
      ...{ validation: [`/api/validations/${activeValidation.key}`] },
    });
    setAttibutes([]);
  };

  const updateParent = (data) => {
    updateValidationAction(data);
  };
  return (
    <>
      <Grouped
        items={validations !== undefined ? validations.length : 0}
        getRecords={fetchRecords}
        addFunction={addValidation}
        removeFunction={removeValidationAction}
        loading={loading}
        addFunctionTitle='Add validation group'
        pageTitle='Validation groups'
        pageDescription='List of input validations available on the application'
        childRow={"description"}
        groups={validations.map((item) => {
          return {
            key: item.id,
            items: item.validationAttributes,
            label: { translations: item.translations },
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            collapsible: false,
            header: (
              <Text
                weight='bold'
                content={`${item.translations[locale]?.description}`}
                size='large'
              />
            ),
          };
        })}
        header={[
          {
            content: "Description",
            styles: { flexGrow: 4 },
            key: "header-title-description",
          },
          {
            content: "Created on",
            styles: { flexGrow: 1 },
            key: "header-title-created",
          },
          {
            content: "Updated on",
            styles: { flexGrow: 1 },
            key: "header-title-updated",
          },
          { content: "", styles: { flexGrow: 1 }, key: "header-title-actions" },
        ]}
      />
      <Dialog
        cancelButton='Cancel'
        confirmButton={dialogConfirmText}
        onConfirm={() => {
          let data = unflatten(addTranslationLocale(formValues));
          if (dialogConfirmText.toLocaleLowerCase().includes("create")) {
            if (!dialogTitle.toLocaleLowerCase().includes("item")) {
              addParent(data);
            } else {
              addChild(data);
            }
          } else {
            updateParent(data);
          }
        }}
        header={dialogTitle}
        temporary={loading.toString()}
        disabled={loading}
        open={dialogOpen}
        onOpen={() => setDialogOpen(true)}
        onCancel={() => {
          setDialogOpen(false);
          setFormValues({});
        }}
        content={
          <DynamicForm
            inputValues={formValues}
            valuesChanged={valuesChanged}
            reverse={false}
            inputs={
              attibutes.length === 0
                ? [
                    ...addValidationGroup,
                    {
                      label: "questionTypes",
                      name: "questionTypes",
                      key: "questionTypes",
                      type: "multiple-choice",
                      required: true,
                      translatable: false,
                      variant: "northstar",
                      options: questionTypes.map((questionType) => {
                        return {
                          label: questionType.translations[locale].name,
                          key: questionType.id,
                        };
                      }),
                    },
                  ]
                : attibutes
            }
          />
        }
      />
    </>
  );
};
const mapStateToProps = ({ validationsReducer }) => {
  const { loading, validations, validation, error } = validationsReducer;
  return { loading, error, validations, validation };
};

export default connect(mapStateToProps, {
  getValidationsAction: getValidations,
  getValidationAction: getValidation,
  updateValidationAction: updateValidation,
  removeValidationAction: removeValidation,
  createValidationAction: createValidation,
  createValidationAttributeAction: createValidationAttribute,
})(styled(Validations, getStyles));
