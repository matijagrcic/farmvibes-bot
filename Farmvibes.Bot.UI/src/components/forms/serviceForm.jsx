import React from "react";
import {
  Avatar,
  AddIcon,
  Flex,
  Text,
  Button,
  Divider,
  pxToRem,
} from "@fluentui/react-northstar";
import { DynamicForm } from "components/forms";
import { addService } from "global/defaultValues";
import { useTheme, Pivot, PivotItem } from "@fluentui/react";
import { getFromStorage } from "helpers/utils";

export const ServiceForm = ({
  action,
  inputValues,
  serviceTypes,
  updateValues,
  btnLabel,
}) => {
  const { palette } = useTheme();
  const [values, setValues] = React.useState({});
  const updateLocalValues = (data) => {
    let output = {};
    setValues((prev) => {
      output = { ...prev, ...data };
      return output;
    });
    updateValues(output);
  };
  React.useEffect(() => {
    if (Object.keys(inputValues).length > Object.keys(values).length) {
      setValues(inputValues);
    }
  }, []);
  return (
    <>
      <Flex gap='gap.large'>
        <Avatar
          size='largest'
          variables={{ iconBackgroundColor: palette.neutralTertiary }}
          icon={
            <AddIcon
              variables={{ iconBackgroundColor: palette.neutralTertiary }}
            />
          }
        />
        <div style={{ flexGrow: 1 }}>
          <DynamicForm
            inputs={addService}
            inputValues={values}
            valuesChanged={updateLocalValues}
          />
        </div>
      </Flex>
      <Flex space='between' style={{ marginTop: pxToRem(40) }}>
        <Text content={"Type of service"} color='brand' weight='semibold' />
        <Flex gap='gap.small'>
          <DynamicForm
            inputs={[
              {
                name: "type",
                key: "type",
                required: true,
                type: "dropdown",
                translatable: false,
                disabled: false,
                options: serviceTypes,
                styles: {
                  dropdown: {
                    width: 140,
                  },
                  title: {
                    borderColor: palette.themePrimary,
                    backgroundColor: palette.themePrimary,
                    color: palette.white,
                    selectors: {
                      ":hover": {
                        background: palette.themeSecondary,
                        color: palette.white,
                      },
                    },
                  },
                  dropdownItemsWrapper: {
                    backgroundColor: palette.themePrimary,
                    selectors: {
                      ":hover": {
                        background: palette.themeSecondary,
                        color: palette.white,
                      },
                    },
                  },
                  dropdownItem: {
                    color: palette.white,
                    selectors: {
                      ":hover": {
                        background: palette.themeSecondary,
                        color: palette.white,
                      },
                      ":focus": {
                        background: palette.themeSecondary,
                        color: palette.white,
                      },
                    },
                  },
                  caretDown: {
                    color: palette.white,
                    selectors: {
                      ":hover": {
                        color: palette.white,
                      },
                    },
                  },
                },
              },
            ]}
            inputValues={values}
            valuesChanged={updateLocalValues}
          />
        </Flex>
      </Flex>
      <Flex gap='gap.large'>
        <Pivot
          aria-label='Content management tabs'
          style={{ marginTop: pxToRem(20) }}
        >
          <PivotItem
            headerText='Messages'
            headerButtonProps={{
              "data-order": 1,
              "data-title": "Service content",
            }}
            key='content'
            style={{ paddingTop: pxToRem(10) }}
          >
            <DynamicForm
              inputs={[
                {
                  name: "introduction",
                  key: "introduction",
                  required: true,
                  length: 300,
                  type: "richtext",
                  label: "Service introduction",
                  hint: "Provide introductory message or guide for user when they begin interacting with the service.",
                  translatable: true,
                },
                {
                  name: "conclusion",
                  key: "conclusion",
                  required: true,
                  length: 300,
                  type: "richtext",
                  label: "Completion message",
                  hint: "The user will see this message when they conclude interaction with this service.",
                  translatable: true,
                },
              ]}
              inputValues={values}
              valuesChanged={updateLocalValues}
            />
          </PivotItem>
          <PivotItem
            headerText='Settings'
            headerButtonProps={{
              "data-order": 2,
              "data-title": "Service settings",
            }}
            key='settings'
            style={{ paddingTop: pxToRem(20) }}
          >
            <Text
              content={"Configure your service"}
              color='brand'
              weight='semibold'
              style={{ marginTop: "40px" }}
            />
            <DynamicForm
              inputs={[
                {
                  name: "singleAccess",
                  key: "singleAccess",
                  required: false,
                  type: "boolean",
                  label: "User limited to only one interaction?",
                  translatable: false,
                  checkedValue: values.hasOwnProperty("singleAccess")
                    ? values.singleAccess.toString()
                    : "false",
                  variant: "northstar",
                  options: [
                    { key: 1, label: "Yes", value: "true" },
                    { key: 2, label: "No", value: "false" },
                  ],
                },
                {
                  name: "backAfterCompletion",
                  key: "backAfterCompletion",
                  required: false,
                  type: "boolean",
                  label: "Allow user to go back to service after interaction?",
                  translatable: false,
                  checkedValue: values.hasOwnProperty("backAfterCompletion")
                    ? values.backAfterCompletion.toString()
                    : "false",
                  options: [
                    { key: 1, label: "Yes", value: "true" },
                    { key: 2, label: "No", value: "false" },
                  ],
                  variant: "northstar",
                },
              ]}
              inputValues={values}
              valuesChanged={updateLocalValues}
            />
          </PivotItem>
          <PivotItem
            headerText='Filters'
            headerButtonProps={{
              "data-order": 3,
              "data-title": "Service filters",
            }}
            key='filters'
            style={{ paddingTop: pxToRem(20) }}
          >
            <Text
              content={"Channels"}
              color='brand'
              weight='semibold'
              style={{ marginTop: "40px" }}
            />
            <Flex space='between' style={{ marginTop: "20px" }}>
              <Flex gap='gap.small'>
                <DynamicForm
                  inputs={[
                    {
                      name: "channel",
                      key: "channel",
                      required: true,
                      type: "multiple-choice",
                      translatable: false,
                      disabled: false,
                      variant: "northstar",
                      options: getFromStorage("channels").map((channel) => {
                        return { key: channel.name, label: channel.name };
                      }),
                    },
                  ]}
                  inputValues={values}
                  valuesChanged={updateLocalValues}
                />
              </Flex>
            </Flex>
          </PivotItem>
        </Pivot>
      </Flex>
      <Divider style={{ marginTop: "40px" }} />
      <Button
        content={btnLabel}
        style={{ marginTop: "10px" }}
        primary
        size='medium'
        fluid
        onClick={() => action()}
      />
    </>
  );
};
