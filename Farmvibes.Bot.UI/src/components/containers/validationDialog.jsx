import { DynamicForm } from "components/forms";
import { Dialog, Text } from "@fluentui/react-northstar";
import { flat, unflatten, addTranslationLocale } from "helpers/utils";
import * as React from "react";
import { useIntl } from "react-intl";
import { useDispatch } from "react-redux";
import {
  createQuestionValidation,
  updateQuestionValidation,
} from "redux/actions";

export const ValidationDialog = ({
  validationAttribute,
  customValues,
  action,
  locale,
  dialogOpen,
  question,
  toggleValidationDialog,
  loading,
  serviceId,
}) => {
  const dispatch = useDispatch();
  let expectedInput = customValues?.expectedInput;
  let flattened = flat(validationAttribute);
  const intl = useIntl();
  const addValidationQuestion = [
    {
      label: intl.formatMessage({ id: "validation.form.user.input" }),
      name: "expectedInput",
      key: "expectedInput",
      type: "string",
      required: true,
      translatable: false,
      variant: "northstar",
    },
    {
      label: intl.formatMessage({ id: "validation.form.error.message" }),
      name: "errorMessage",
      key: "errorMessage",
      type: "string",
      required: true,
      translatable: true,
      variant: "northstar",
    },
  ];

  const errorMessages = (state) => {
    return {
      ...Object.keys(flattened).reduce((prev, current) => {
        if (
          current.toLowerCase().indexOf("errormessage") > 0 &&
          state !== "new"
        ) {
          prev[current] =
            expectedInput !== undefined
              ? flattened[current].substring(
                  0,
                  flattened[current].indexOf("#")
                ) + expectedInput
              : flattened[current];
        }
        return prev;
      }, {}),
      expectedInput: expectedInput,
      expression:
        expectedInput !== undefined
          ? validationAttribute.expression?.replace(
              "#expectedInput#",
              expectedInput
            )
          : validationAttribute.expression,
    };
  };

  const [validationValues, setValidationValues] = React.useState(() =>
    action === "Update" ? flat(customValues) : errorMessages("new")
  );

  const valuesChanged = (vals) => {
    if (validationValues["expectedInput"] !== vals.expectedInput) {
      expectedInput = vals.expectedInput;
      var values = errorMessages();
      setValidationValues({ ...validationValues, ...values });
    } else {
      setValidationValues({ ...validationValues, ...vals });
    }
  };

  return (
    <Dialog
      cancelButton={intl.formatMessage({ id: "cancel" })}
      confirmButton={{
        content: `${intl.formatMessage({
          id: action.toLowerCase(),
        })} ${intl.formatMessage({ id: "validation" }, { count: 1 })}`,
        loading: !loading,
        disabled: !loading,
      }}
      header={
        validationAttribute.hasOwnProperty("translations")
          ? intl.formatMessage(
              { id: "validation.input" },
              { subject: validationAttribute.translations[locale].description }
            )
          : intl.formatMessage(
              { id: "general.add" },
              {
                subject: intl.formatMessage({ id: "validation" }, { count: 1 }),
              }
            )
      }
      content={
        <>
          <Text content={intl.formatMessage({ id: "validation.prompt" })} />
          <DynamicForm
            inputs={addValidationQuestion}
            reverse={true}
            inputValues={validationValues}
            valuesChanged={valuesChanged}
          />
        </>
      }
      size="small"
      open={dialogOpen}
      onConfirm={() => {
        let payload = {
          ...unflatten(addTranslationLocale(validationValues)),
          ...{
            question: `/api/services/${serviceId}/questions/${question.id}`,
            validationAttribute: `/api/validation_attributes/${validationAttribute.id}`,
          },
        };
        if (action === "Update") {
          dispatch(
            updateQuestionValidation({ ...payload, ...{ id: customValues.id } })
          );
        } else {
          dispatch(
            createQuestionValidation({
              ...payload,
            })
          );
        }
        setTimeout(() => {
          if (loading) toggleValidationDialog({});
        }, 1000);
      }}
      onCancel={() => toggleValidationDialog({})}
    />
  );
};
