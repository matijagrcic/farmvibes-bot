import { DynamicForm } from "components/forms";
import { addValidationQuestion } from "global/defaultValues";
import { Dialog, Text } from "@fluentui/react-northstar";
import { flat, unflatten, addTranslationLocale } from "helpers/utils";
import * as React from "react";
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
}) => {
  const dispatch = useDispatch();
  let expectedInput = customValues?.expectedInput;
  let flattened = flat(validationAttribute);
  const valuesChanged = (vals) => {
    if (expectedInput !== vals.expectedInput) {
      expectedInput = vals.expectedInput;
      var values = errorMessages();
      setValidationValues(values);
    }
  };

  const errorMessages = (state) => {
    return {
      ...Object.keys(flattened).reduce((prev, current) => {
        console.log(prev);
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
  return (
    <Dialog
      cancelButton='Cancel'
      confirmButton={{
        content: `${action} validation`,
        loading: !loading,
        disabled: !loading,
      }}
      header={
        validationAttribute.hasOwnProperty("translations")
          ? `Input Validation: ${validationAttribute.translations[locale].description}`
          : "Add validation"
      }
      content={
        <>
          <Text content='Please specify how you want to verify response to this question.' />
          <DynamicForm
            inputs={addValidationQuestion}
            reverse={true}
            inputValues={validationValues}
            valuesChanged={valuesChanged}
          />
        </>
      }
      size='small'
      open={dialogOpen}
      onConfirm={() => {
        let payload = {
          ...unflatten(addTranslationLocale(validationValues)),
          ...{
            question: `/api/questions/${question.id}`,
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
