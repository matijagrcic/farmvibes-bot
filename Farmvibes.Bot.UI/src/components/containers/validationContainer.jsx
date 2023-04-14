import * as React from "react";
import {
  Text,
  Button,
  TrashCanIcon,
  EditIcon,
  Dialog,
  Divider,
} from "@fluentui/react-northstar";
import { Stack } from "@fluentui/react";
import { useDispatch } from "react-redux";
import { removeQuestionValidation } from "redux/actions";

export const ValidationContainer = ({ locale, validations, editAttr }) => {
  const dispatch = useDispatch();

  return (
    <Stack
      style={{
        padding: "12px",
        backgroundColor: "#CFD6DE",
        borderRadius: "3px",
        margin: "1rem 0",
      }}
    >
      <>
        <Text
          content={
            validations.length > 0
              ? `The following ${validations.length} will be applied to verify every user response to this question`
              : `No validation specified for this question.`
          }
          styles={{ fontSize: "0.875rem", paddingBottom: "1rem" }}
        />
        {validations.map((validation, index) => {
          return (
            <React.Fragment key={`validation-list-${validation.id}`}>
              <Stack
                horizontal
                verticalAlign={"start"}
                tokens={{ padding: "0.1rem 0" }}
              >
                <Stack.Item grow={3}>
                  <Text
                    content={
                      validation.validationAttribute.translations[locale]
                        .description
                    }
                  />
                </Stack.Item>
                <Stack.Item>
                  <Button
                    icon={<EditIcon />}
                    iconOnly
                    text
                    title='Edit'
                    onClick={() =>
                      editAttr(
                        validation.validationAttribute,
                        validation,
                        "Update"
                      )
                    }
                  />
                </Stack.Item>
                <Stack.Item>
                  <Dialog
                    cancelButton='Cancel'
                    confirmButton='Remove'
                    onConfirm={() =>
                      dispatch(removeQuestionValidation(validation.id))
                    }
                    header='Remove validation'
                    content='Are you sure you want to delete this validation?'
                    trigger={
                      <Button
                        icon={<TrashCanIcon />}
                        iconOnly
                        text
                        title='Remove'
                      />
                    }
                  />
                </Stack.Item>
              </Stack>
              {index <= validations.length - 2 && (
                <Stack>
                  <Divider />
                </Stack>
              )}
            </React.Fragment>
          );
        })}
      </>
    </Stack>
  );
};
