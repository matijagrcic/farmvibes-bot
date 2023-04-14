import {
  cardFocusableBehavior,
  Flex,
  Text,
  Card,
  Button,
  TrashCanIcon,
  FilesUploadIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ScreenshareIcon,
  Accordion,
  EditIcon,
  Dialog,
  DownloadIcon,
  Divider,
  Segment,
} from "@fluentui/react-northstar";
import { CheckboxField } from "components/forms";
import * as React from "react";
import { ValidationDialog } from "./validationDialog";
import { updateQuestion } from "redux/actions";
import {
  capitaliseSentense,
  encodeGroupURI,
  getPlatformComponents,
  makeListRequest,
} from "../../helpers/utils";
import { FontSizes, FontWeights } from "@fluentui/theme";
import ConstraintsContainer from "./constraintContainer";
import { useIntl } from "react-intl";

export function QuestionContainer({
  index,
  swapAction,
  duplicateAction,
  onRemove,
  onUpdate,
  isLast,
  locale,
  editQuestion,
  question,
  loading,
  serviceId,
}) {
  const [validationDialogToggle, setValidationDialogToggle] =
    React.useState(false);
  const [validationAttr, setValidationAtt] = React.useState({});
  const [validationValues, setValidationValues] = React.useState({});
  const [setQuestionConstraints] = React.useState([]);
  const [validationAction, setValidationAction] = React.useState(null);
  const intl = useIntl();
  const toggleValidationDialog = (attr, customValues, action) => {
    if (Object.keys(attr).length > 0) {
      setValidationAtt(attr);
      setValidationDialogToggle(true);
      setValidationValues(customValues);
    } else {
      setValidationDialogToggle(false);
      setValidationValues({});
    }
    setValidationAction(action);
  };

  const panels = [
    {
      title: {
        content: capitaliseSentense(
          intl.formatMessage({ id: "constraints" }, { count: 2 })
        ),
        disabled: question.isSystem,
        style: question.isSystem
          ? { display: "none" }
          : { fontSize: FontSizes.size14, fontWeight: FontWeights.semibold },
        key: `configs-accordion-${question.id}-constraints-title`,
        onClick: () => {
          makeListRequest({
            url: `questions/${question.id}/constraints?${encodeGroupURI(
              "groups",
              ["questionConstraint:read", "translations"]
            )}&paginate=false`,
          }).then((result) => {
            setQuestionConstraints(result);
          });
        },
      },
      key: `constraints-panel-${question.id}-constraints-content`,
      content: (
        <>
          <Segment
            content={
              <ConstraintsContainer
                object={{ id: question.id, serviceId }}
                iri={{
                  question: `/api/services/${serviceId}/questions/${question.id}`,
                }}
                paths={{
                  list: `questions/${question.id}/constraints`,
                  remove: `questions/${question.id}/constraints/{id}`,
                  new: `question_constraints`,
                  update: `questions/${question.id}/constraints/{id}`,
                }}
                action={updateQuestion}
                loading={loading}
                locale={locale}
                leading={intl.formatMessage({ id: "constraints.description" })}
              />
            }
            color="brand"
          />
        </>
      ),
    },
  ];

  return (
    <>
      <Card
        accessibility={cardFocusableBehavior}
        aria-roledescription={intl.formatMessage({ id: "question.container" })}
        elevated
        fluid
        expandable
        ghost
        size="largest"
        style={{ maxWidth: "700px", margin: "0 auto 30px auto" }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ duration: 0.1 }}
      >
        <Card.Header fitted>
          <Flex space="between">
            <Flex gap="gap.medium" vAlign="center">
              <Text
                content={`${index + 1}. ${
                  question.translations[locale]?.question
                }`}
                weight="semibold"
                size="medium"
              />
            </Flex>
            <Flex gap="gap.medium" vAlign="center">
              <Button
                icon={<EditIcon />}
                iconOnly
                text
                title={intl.formatMessage(
                  {
                    id: "general.edit",
                  },
                  { subject: "question" }
                )}
                onClick={editQuestion}
              />
              <Dialog
                cancelButton={intl.formatMessage({ id: "general.cancel" })}
                confirmButton={intl.formatMessage(
                  { id: "general.publish" },
                  { subject: "" }
                )}
                size="small"
                onConfirm={() =>
                  onUpdate({ isPublished: !question.isPublished })
                }
                header={intl.formatMessage(
                  { id: "general.publish" },
                  {
                    subject: intl.formatMessage(
                      { id: "question" },
                      { count: 1 }
                    ),
                  }
                )}
                content={intl.formatMessage(
                  { id: "general.publish.confirm" },
                  {
                    subject: intl.formatMessage(
                      { id: "question" },
                      { count: 1 }
                    ),
                  }
                )}
                trigger={
                  <Button
                    icon={
                      question.isPublished ? (
                        <DownloadIcon />
                      ) : (
                        <FilesUploadIcon />
                      )
                    }
                    iconOnly
                    text
                    title={
                      question.isPublished
                        ? intl.formatMessage({ id: "general.unpublish" })
                        : intl.formatMessage(
                            { id: "general.publish" },
                            {
                              subject: intl.formatMessage(
                                { id: "question" },
                                { count: 1 }
                              ),
                            }
                          )
                    }
                    disabled={question.isSystem}
                  />
                }
              />

              <Dialog
                cancelButton={intl.formatMessage({ id: "general.cancel" })}
                confirmButton={intl.formatMessage(
                  { id: "general.remove" },
                  { subject: "" }
                )}
                onConfirm={onRemove}
                header={intl.formatMessage(
                  { id: "general.remove" },
                  {
                    subject: intl.formatMessage(
                      { id: "question" },
                      { count: 1 }
                    ),
                  }
                )}
                content={intl.formatMessage(
                  { id: "general.publish.confirm" },
                  { subject: "question" }
                )}
                size="small"
                trigger={
                  <Button
                    icon={<TrashCanIcon />}
                    iconOnly
                    text
                    title={intl.formatMessage({ id: "general.remove" })}
                    disabled={question.isSystem}
                  />
                }
              />
              <Button
                icon={<ScreenshareIcon />}
                iconOnly
                text
                title={intl.formatMessage({ id: "general.duplicate" })}
                onClick={(e) => duplicateAction(index)}
                disabled={question.isSystem}
              />
              <Button
                icon={<ArrowUpIcon />}
                iconOnly
                text
                title={intl.formatMessage({ id: "general.moveup" })}
                onClick={(e) => swapAction(index, index - 1)}
                disabled={index === 0 || question.isSystem}
              />
              <Button
                icon={<ArrowDownIcon />}
                iconOnly
                text
                title={intl.formatMessage({ id: "general.movedown" })}
                onClick={() => swapAction(index, index + 1)}
                disabled={isLast || question.isSystem}
              />
            </Flex>
          </Flex>
        </Card.Header>
        <Card.Body>
          <Flex column gap="gap.small">
            <CheckboxField
              options={question.questionOptions.map((option) => {
                return {
                  label: option.translations.hasOwnProperty(locale)
                    ? option.translations[locale].value
                    : option.translations["en"].value,
                  key: option.id,
                };
              })}
              handleChange={() => void 0}
              variant="northstar"
              toggle={false}
              checkBoxstyle={{ lineHeight: "normal", marginTop: "10px" }}
              horizontal={false}
            />
          </Flex>
          <Divider
            style={{ margin: "3rem 0 0" }}
            content={intl.formatMessage({ id: "question.configs" })}
          />

          <Accordion
            panels={panels}
            defaultActiveIndex={[0]}
            exclusive
            key={`configs-accordion-${question.id}`}
          />
        </Card.Body>
        <Card.Footer fitted>
          <Divider style={{ margin: "10px 0" }} />
          <Flex space="between" hAlign="center" vAlign="center">
            <CheckboxField
              options={getPlatformComponents(
                "question_types?groups[]=translations",
                "questionTypes"
              ).then((result) => {
                return result
                  .filter((type) => type.id === question.questionType.id)[0]
                  .attributes.map((attribute) => {
                    let label = attribute.translations.hasOwnProperty(locale)
                      ? attribute.translations[locale].name
                      : attribute.translations["en"].name;
                    return {
                      label,
                      key: `question-${question.id}-${attribute.id}`,
                      checked:
                        question.attributes.find(
                          (attr) => attr.id === attribute.id
                        ) !== undefined
                          ? question.attributes.find(
                              (attr) => attr.id === attribute.id
                            ).value
                          : false,
                    };
                  });
              })}
              handleChange={(_name, value) => {
                const payload = question.attributes.map((attr) => {
                  if (
                    attr.id ===
                    parseInt(
                      value.key.substring(value.key.lastIndexOf("-") + 1)
                    )
                  )
                    return { ...attr, ...{ value: value.checked } };

                  return attr;
                });
                onUpdate({
                  attributes: payload,
                  id: question.id,
                  serviceId: serviceId,
                });
              }}
              variant="northstar"
            />
          </Flex>
        </Card.Footer>
      </Card>
      {validationDialogToggle && (
        <ValidationDialog
          toggleValidationDialog={toggleValidationDialog}
          validationAttribute={validationAttr}
          locale={locale}
          dialogOpen={validationDialogToggle}
          question={question}
          loading={loading}
          customValues={validationValues}
          action={validationAction}
          serviceId={serviceId}
        />
      )}
    </>
  );
}
