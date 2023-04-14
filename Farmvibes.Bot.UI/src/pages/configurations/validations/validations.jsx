import React from "react";
import { connect } from "react-redux";
import { styled } from "@fluentui/react";
import { Dialog, Text } from "@fluentui/react-northstar";
import { getStyles } from "components/layout/Sidebar/Nav/Nav.styles";
import { Grouped } from "components/containers";
import { DynamicForm } from "components/forms";
import { addValidationGroup } from "global/defaultValues";
import {
  unflatten,
  addTranslationLocale,
  getPlatformComponents,
} from "helpers/utils";
import {
  getValidations,
  getValidation,
  updateValidation,
  createValidation,
  removeValidation,
  createValidationAttribute,
} from "../../../redux/actions";
import { useIntl } from "react-intl";
import { useLanguages } from "helpers/utilities";

const Validations = ({
  getValidationsAction,
  removeValidationAction,
  updateValidationAction,
  createValidationAction,
  createValidationAttributeAction,
  validations,
  loading,
}) => {
  const intl = useIntl();
  const { locale } = useLanguages();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogTitle, setDialogTitle] = React.useState("");
  const [dialogConfirmText, setDialogConfirmText] = React.useState("");
  const [formValues, setFormValues] = React.useState({});
  const [questionTypes, setQuestionTypes] = React.useState([]);
  const [attibutes, setAttibutes] = React.useState([]);
  const [activeValidation, setActiveValidation] = React.useState(null);
  const fetchRecords = (currentPage) => {
    getValidationsAction({ page: currentPage, itemsPerPage: 10 });
  };
  const valuesChanged = (values) => {
    setFormValues(values);
  };
  React.useEffect(() => {
    getValidationsAction({ page: 1, itemsPerPage: 10 });
    getPlatformComponents(
      "question_types?groups[]=translations",
      "questionTypes"
    ).then((result) => setQuestionTypes(result));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const addValidation = (action = null, group) => {
    let title = intl.formatMessage({ id: "validation" }, { count: 1 });
    let confirmButtonText = intl.formatMessage({ id: "general.create" });
    if (action !== null) {
      if (action.includes("edit")) {
        title = intl.formatMessage({ id: "general.edit" }, { subject: title });
        confirmButtonText = "Update";
      } else {
        title = intl.formatMessage({ id: "general.add" }, { subject: title });
        setAttibutes([
          {
            label: intl.formatMessage({ id: "general.description" }),
            name: "description",
            key: "description",
            type: "string",
            required: true,
            translatable: true,
            variant: "northstar",
          },
          {
            label: intl.formatMessage({
              id: "validation.default.error.message",
            }),
            name: "errorMessage",
            key: "errorMessage",
            type: "string",
            required: true,
            translatable: true,
            variant: "northstar",
          },
          {
            label: intl.formatMessage({ id: "general.type" }),
            name: "type",
            placeholder: intl.formatMessage({ id: "validation.type" }),
            key: "type",
            type: "choice",
            required: true,
            translatable: false,
            variant: "northstar",
            options: [
              {
                key: "regex-type",
                label: intl.formatMessage({ id: "validation.regex" }),
                value: "Regex",
                name: "type",
              },
              {
                key: "expression-type",
                label: intl.formatMessage({ id: "validation.expression" }),
                value: "Expression",
                name: "type",
              },
            ],
          },
          {
            label: intl.formatMessage({ id: "validation.pattern" }),
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
        addFunctionTitle={intl.formatMessage(
          { id: "general.add" },
          {
            subject: intl.formatMessage(
              { id: "validation.group" },
              { count: 1 }
            ),
          }
        )}
        pageTitle={intl.formatMessage({ id: "validation.group" }, { count: 2 })}
        pageDescription={intl.formatMessage({ id: "validation.available" })}
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
                weight="bold"
                content={`${item.translations[locale]?.description}`}
                size="large"
              />
            ),
          };
        })}
        header={[
          {
            content: intl.formatMessage({ id: "general.description" }),
            styles: { flexGrow: 4 },
            key: "header-title-description",
          },
          {
            content: intl.formatMessage({ id: "general.created.on" }),
            styles: { flexGrow: 1 },
            key: "header-title-created",
          },
          {
            content: intl.formatMessage({ id: "general.updated.on" }),
            styles: { flexGrow: 1 },
            key: "header-title-updated",
          },
          { content: "", styles: { flexGrow: 1 }, key: "header-title-actions" },
        ]}
      />
      <Dialog
        cancelButton={intl.formatMessage({ id: "general.cancel" })}
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
                      label: intl.formatMessage({ id: "question.types" }),
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
