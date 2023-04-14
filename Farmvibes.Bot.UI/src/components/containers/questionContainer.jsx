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
  MenuButton,
  AddIcon,
  Segment,
  SplitButton,
} from "@fluentui/react-northstar";
import { CheckboxField } from "components/forms";
import { ValidationContainer } from "components/containers";
import * as React from "react";
import { ValidationDialog } from "./validationDialog";
import { getFromStorage } from "../../helpers/utils";
import { FontSizes, FontWeights } from "@fluentui/theme";
import { ConstraintsDialog } from "./constraintsDialog";

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
  validations,
  loading,
}) {
  const [validationDialogToggle, setValidationDialogToggle] =
    React.useState(false);
  const [constraintsDialogToggle, setConstraintsDialogToggle] =
    React.useState(false);
  const [validationAttr, setValidationAtt] = React.useState({});
  const [validationValues, setValidationValues] = React.useState({});
  const [validationAction, setValidationAction] = React.useState(null);
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
  const toggleConstraintsDialog = () => {
    setConstraintsDialogToggle(!constraintsDialogToggle);
  };

  const panels = [
    {
      title: {
        content: "Response validation",
        style: { fontSize: FontSizes.size14, fontWeight: FontWeights.semibold },
      },
      key: `validation-panel-${question.id}`,
      content: (
        <>
          <Segment
            content={
              <>
                <Text>
                  Validations allow you to define criteria of responses that
                  would be acceptable from the user. This will make sure that
                  the data provided by the user will meet your expectations.
                </Text>
                <ValidationContainer
                  locale={locale}
                  validations={question.questionValidations}
                  dialogOpen={validationDialogToggle}
                  action='Add'
                  editAttr={toggleValidationDialog}
                />
                <br />
                {validations.length > 0 && (
                  <Flex.Item gap='gap.small'>
                    <SplitButton
                      flat
                      primary
                      small
                      button={{
                        content: "Add validation",
                        "aria-label": "Add validation",
                        icon: <AddIcon outline />,
                      }}
                      toggleButton={{
                        "aria-label": "validation options",
                      }}
                      menu={validations.map((validation) => {
                        if (validation === undefined) return;

                        if (validation.length < 1) return;
                        return {
                          key: `${question.id}-validations-${validation.id}`,
                          id: validation.description,
                          content: validation.description,
                          menu: validation.validationAttributes.map(
                            (attribute) => {
                              return {
                                key: `${question.id}-validations-${validation.id}-${attribute.id}`,
                                content: attribute.description,
                                onClick: () => {
                                  toggleValidationDialog(attribute, {}, "Add");
                                },
                              };
                            }
                          ),
                          on: "hover",
                        };
                      })}
                    />
                  </Flex.Item>
                )}
              </>
            }
            color='brand'
          />
        </>
      ),
    },
    {
      title: {
        content: "Constraints",
        style: { fontSize: FontSizes.size14, fontWeight: FontWeights.semibold },
      },
      key: `constraints-panel-${question.id}`,
      content: (
        <>
          <Segment
            content={
              <>
                <Text>
                  Constraints allow you to specify availability of this question
                  to users who meet your desired criteria.
                </Text>
                <br />
                <br />
                <Button
                  text
                  icon={<AddIcon />}
                  primary
                  content='Add constraint'
                  onClick={() => toggleConstraintsDialog()}
                />
              </>
            }
            color='brand'
          />
        </>
      ),
    },
  ];

  return (
    <>
      <Card
        accessibility={cardFocusableBehavior}
        aria-roledescription='user card'
        elevated
        fluid
        expandable
        ghost
        size='largest'
        style={{ maxWidth: "700px", margin: "0 auto 30px auto" }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ duration: 0.1 }}
      >
        <Card.Header fitted>
          <Flex space='between'>
            <Flex gap='gap.medium' vAlign='center'>
              <Text
                content={`${index + 1}. ${
                  question.translations[locale].question
                }`}
                weight='semibold'
                size='medium'
              />
            </Flex>
            <Flex gap='gap.medium' vAlign='center'>
              <Button
                icon={<EditIcon />}
                iconOnly
                text
                title='Edit question'
                onClick={editQuestion}
              />
              <Dialog
                cancelButton='Cancel'
                confirmButton='Publish'
                size='small'
                onConfirm={() =>
                  onUpdate({ isPublished: !question.isPublished })
                }
                header='Publish question'
                content='Are you sure you want to publish this question?'
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
                    title={question.isPublished ? "Unpublish" : "Publish"}
                  />
                }
              />

              <Dialog
                cancelButton='Cancel'
                confirmButton='Remove'
                onConfirm={onRemove}
                header='Remove question'
                content='Are you sure you want to remove this question?'
                size='small'
                trigger={
                  <Button
                    icon={<TrashCanIcon />}
                    iconOnly
                    text
                    title='Remove'
                    disabled={question.isSystem}
                  />
                }
              />
              <Button
                icon={<ScreenshareIcon />}
                iconOnly
                text
                title='Duplicate'
                onClick={(e) => duplicateAction(index)}
              />
              <Button
                icon={<ArrowUpIcon />}
                iconOnly
                text
                title='Move up'
                onClick={(e) => swapAction(index, index - 1)}
                disabled={index === 0 || question.isSystem ? true : false}
              />
              <Button
                icon={<ArrowDownIcon />}
                iconOnly
                text
                title='Move down'
                onClick={() => swapAction(index, index + 1)}
                disabled={isLast || question.isSystem}
              />
            </Flex>
          </Flex>
        </Card.Header>
        <Card.Body>
          <Flex column gap='gap.small'>
            <CheckboxField
              options={question.questionOptions.map((option) => {
                return {
                  label: option.translations[locale].value,
                  key: option.id,
                };
              })}
              handleChange={() => void 0}
              variant='northstar'
              toggle={false}
              checkBoxstyle={{ lineHeight: "normal", marginTop: "10px" }}
              horizontal={false}
            />
          </Flex>
          <Divider style={{ margin: "3rem 0 0" }} content='Question configs' />
          <Accordion panels={panels} defaultActiveIndex={[0]} exclusive />
        </Card.Body>
        <Card.Footer fitted>
          <Divider style={{ margin: "10px 0" }} />
          <Flex space='between' hAlign='center' vAlign='center'>
            <CheckboxField
              options={getFromStorage("questionTypes")
                .filter((type) => type.id === question.questionType.id)[0]
                .attributes.map((attribute) => {
                  return {
                    label: attribute.translations[locale].name,
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
                })}
              handleChange={(name, values) => {
                const payload = question.attributes.map((attr) => {
                  return values.find((value) => attr.id === value)
                    ? { ...attr, ...{ value: true } }
                    : { ...attr, ...{ value: false } };
                });
                onUpdate({
                  attributes: payload,
                });
              }}
              variant='northstar'
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
        />
      )}

      {constraintsDialogToggle && (
        <ConstraintsDialog
          dialogOpen={constraintsDialogToggle}
          locale={locale}
          question={question}
          loading={loading}
          toggleConstraintsDialog={toggleConstraintsDialog}
        />
      )}
    </>
  );
}
