import React from "react";
import {
  Avatar,
  AddIcon,
  Flex,
  Text,
  Button,
  Divider,
  pxToRem,
  Loader,
  EditIcon,
} from "@fluentui/react-northstar";
import { DynamicForm } from "components/forms";
import { translationsDelay } from "global/defaultValues";
import { useTheme, Pivot, PivotItem, Overlay } from "@fluentui/react";
import { connect } from "react-redux";
import { resetServiceObj, updateServiceObj } from "redux/actions";
import { capitaliseSentense, validateForm } from "helpers/utils";
import { useIntl } from "react-intl";

const ServiceForm = ({
  action,
  serviceTypes,
  updateValues,
  serviceObj,
  updateServiceObjAction,
  btnLabel,
  panelDismiss,
}) => {
  const { palette } = useTheme();
  const intl = useIntl();
  const [values, setValues] = React.useState({});
  const [blockSubmit, setBlockSubmit] = React.useState(false);
  const [loaderLabel, setLoaderLabel] = React.useState(
    intl.formatMessage({ id: "general.loading" }, { subject: "" })
  );
  const addService = [
    {
      name: intl.formatMessage({ id: "general.name" }),
      key: "name",
      required: true,
      length: 50,
      type: "string",
      placeholder: intl.formatMessage({
        id: "service.placeholder.description",
      }),
      translatable: true,
      disabled: false,
      icon: <EditIcon outline />,
      variant: "northstar",
      styles: { fontSize: "16px", fontWeight: "400" },
      inverted: true,
    },
  ];
  const updateLocalValues = (data) => {
    let output = {};
    setValues((prev) => {
      output = { ...prev, ...data };
      return output;
    });
    updateServiceObjAction(output);
  };
  const preventSubmit = (status, message = "") => {
    setBlockSubmit(status);
    setLoaderLabel(message);
  };
  React.useEffect(() => {
    if (Object.keys(serviceObj).length > Object.keys(values).length) {
      setValues(serviceObj);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    updateValues(values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  return (
    <form
      onSubmit={(e) => {
        let hasErrors = validateForm(e);
        e.preventDefault();
        if (!hasErrors) action();
      }}
      style={{ width: "100%" }}
    >
      {blockSubmit && (
        <Overlay className={"loader"}>
          <Loader label={loaderLabel} size="largest" />
        </Overlay>
      )}
      <Flex gap="gap.large">
        <Avatar
          size="largest"
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
            preventSubmit={preventSubmit}
          />
        </div>
      </Flex>
      <Flex space="between" style={{ marginTop: pxToRem(40) }} fill>
        <Flex gap="gap.small">
          <DynamicForm
            inputs={[
              {
                name: "type",
                key: "type",
                required: true,
                type: "combo",
                variant: "northstar",
                translatable: false,
                disabled: false,
                options: serviceTypes,
                label: (
                  <Text
                    content={intl.formatMessage({ id: "service.types" })}
                    color="brand"
                    weight="semibold"
                  />
                ),
              },
            ]}
            inputValues={serviceObj}
            valuesChanged={updateLocalValues}
            preventSubmit={preventSubmit}
          />
        </Flex>
      </Flex>
      <Flex gap="gap.large">
        <Pivot
          aria-label={intl.formatMessage({ id: "content.management.tabs" })}
          style={{ marginTop: pxToRem(20) }}
        >
          <PivotItem
            headerText={intl.formatMessage(
              { id: "content.messages.count" },
              { count: "" }
            )}
            headerButtonProps={{
              "data-order": 1,
              "data-title": `${capitaliseSentense(
                intl.formatMessage({ id: "service" }),
                { count: 1 }
              )} ${intl.formatMessage({ id: "content" }, { count: 1 })}`,
            }}
            key="content"
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
                  label: intl.formatMessage({
                    id: "service.form.introduction",
                  }),
                  hint: intl.formatMessage({
                    id: "service.form.introduction.hint",
                  }),
                  translatable: true,
                },
                {
                  name: "conclusion",
                  key: "conclusion",
                  required: true,
                  length: 300,
                  type: "richtext",
                  label: intl.formatMessage({
                    id: "service.form.conclusion",
                  }),
                  hint: intl.formatMessage({
                    id: "service.form.conclusion.hint",
                  }),
                  translatable: true,
                },
              ]}
              inputValues={serviceObj}
              valuesChanged={updateLocalValues}
              preventSubmit={preventSubmit}
            />
          </PivotItem>
          <PivotItem
            headerText={intl.formatMessage({ id: "general.settings" })}
            headerButtonProps={{
              "data-order": 2,
              "data-title": intl.formatMessage({ id: "general.settings" }),
            }}
            key="settings"
            style={{ paddingTop: pxToRem(20) }}
          >
            <Text
              content={intl.formatMessage({ id: "service.configure" })}
              color="brand"
              weight="semibold"
              style={{ marginTop: "40px" }}
            />
            <DynamicForm
              inputs={[
                {
                  name: "singleAccess",
                  key: "singleAccess",
                  required: false,
                  type: "boolean",
                  label: intl.formatMessage({
                    id: "service.interaction.limited",
                  }),
                  translatable: false,
                  checkedValue: values.hasOwnProperty("singleAccess")
                    ? values.singleAccess.toString()
                    : "false",
                  variant: "northstar",
                  options: [
                    {
                      key: 1,
                      label: intl.formatMessage({ id: "general.yes" }),
                      value: "true",
                    },
                    {
                      key: 2,
                      label: intl.formatMessage({ id: "general.no" }),
                      value: "false",
                    },
                  ],
                },
                {
                  name: "backAfterCompletion",
                  key: "backAfterCompletion",
                  required: false,
                  type: "boolean",
                  label: intl.formatMessage({
                    id: "service.interaction.after.completion",
                  }),
                  translatable: false,
                  checkedValue: values.hasOwnProperty("backAfterCompletion")
                    ? values.backAfterCompletion.toString()
                    : "false",
                  options: [
                    {
                      key: 1,
                      label: intl.formatMessage({ id: "general.yes" }),
                      value: "true",
                    },
                    {
                      key: 2,
                      label: intl.formatMessage({ id: "general.no" }),
                      value: "false",
                    },
                  ],
                  variant: "northstar",
                },
              ]}
              inputValues={values}
              valuesChanged={updateLocalValues}
              preventSubmit={preventSubmit}
            />
          </PivotItem>
        </Pivot>
      </Flex>
      <Divider style={{ marginTop: "40px" }} />
      <Flex space="between" gap="gap.large" hAlign="end" vAlign="end">
        <Button
          content={btnLabel}
          primary
          onMouseDown={() => {
            preventSubmit(
              true,
              intl.formatMessage({ id: "general.await.persist" })
            );
            setTimeout(() => action(), translationsDelay);
          }}
          disabled={blockSubmit}
        />
        <Button
          default
          content={intl.formatMessage({ id: "general.cancel" })}
          onMouseDown={() => {
            panelDismiss();
          }}
        />
      </Flex>
    </form>
  );
};

const mapStateToProps = ({ serviceReducer }) => {
  const { serviceObj, loading } = serviceReducer;
  return { serviceObj, loading };
};

export default connect(mapStateToProps, {
  resetServiceObjAction: resetServiceObj,
  updateServiceObjAction: updateServiceObj,
})(ServiceForm);
