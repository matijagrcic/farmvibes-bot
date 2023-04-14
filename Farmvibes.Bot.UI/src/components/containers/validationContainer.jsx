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
import { FormattedMessage, useIntl } from "react-intl";
import { removeQuestionValidation } from "redux/actions";

export const ValidationContainer = ({ locale, validations, editAttr }) => {
  const dispatch = useDispatch();
  const intl = useIntl();

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
            validations?.length > 0
              ? intl.formatMessage(
                  { id: "validation.intro.exists" },
                  { count: validations?.length }
                )
              : intl.formatMessage({ id: "validation.intro.notexists" })
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
                    title={intl.formatMessage(
                      { id: "general.edit" },
                      { subject: "" }
                    )}
                    onClick={() =>
                      editAttr(
                        validation.validationAttribute,
                        validation,
                        intl.formatMessage(
                          { id: "general.update" },
                          { subject: "" }
                        )
                      )
                    }
                  />
                </Stack.Item>
                <Stack.Item>
                  <Dialog
                    cancelButton={intl.formatMessage({ id: "general.cancel" })}
                    confirmButton={intl.formatMessage(
                      { id: "general.remove" },
                      { subject: "" }
                    )}
                    onConfirm={() =>
                      dispatch(removeQuestionValidation(validation.id))
                    }
                    header={intl.formatMessage(
                      { id: "general.remove" },
                      { subject: intl.formatMessage({ id: "validation" }) }
                    )}
                    content={intl.formatMessage(
                      { id: "general.remove.confirm" },
                      { subject: "" }
                    )}
                    trigger={
                      <Button
                        icon={<TrashCanIcon />}
                        iconOnly
                        text
                        title={
                          <FormattedMessage
                            id="general.remove"
                            values={{ subject: "" }}
                          />
                        }
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
