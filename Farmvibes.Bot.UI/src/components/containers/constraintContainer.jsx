import * as React from "react";
import { useIntl } from "react-intl";
import { connect } from "react-redux";
import {
  Button,
  EditIcon,
  Flex,
  Text,
  TrashCanIcon,
  AddIcon,
  Pill,
  PillGroup,
  FlexItem,
  Header,
  Loader,
  Divider,
} from "@fluentui/react-northstar";
import { ConstraintsDialog } from "./constraintsDialog";
import {
  createConstraint,
  getConstraint,
  getConstraints,
  removeConstraint,
  updateConstraint,
} from "redux/actions";
import { Overlay, Stack } from "@fluentui/react";

const ConstraintsContainer = ({
  createConstraintAction,
  updateConstraintAction,
  object,
  loading,
  locale,
  constraints,
  iri,
  paths,
  getConstraintsAction,
  removeConstraintAction,
  leading,
}) => {
  const [constraintsDialogToggle, setConstraintsDialogToggle] =
    React.useState(false);
  const [values, setValues] = React.useState([]);
  const [items, setItems] = React.useState({});
  const intl = useIntl();
  const toggleConstraintsDialog = () => {
    setConstraintsDialogToggle(!constraintsDialogToggle);
    if (constraintsDialogToggle) setValues([]);
  };
  React.useEffect(() => {
    getConstraintsAction({ path: paths.list });
  });

  React.useEffect(() => {
    const obj = constraints.reduce((prev, curr) => {
      let entry = { id: curr.id, data: curr.raw };
      if (prev.hasOwnProperty(curr.constraintItem.name)) {
        prev[curr.constraintItem.name].push(entry);
      } else {
        prev[curr.constraintItem.name] = [entry];
      }
      return prev;
    }, {});
    setItems(obj);
  }, [constraints]);
  return (
    <>
      <Text>{leading}</Text>
      <br />
      <br />
      <Button
        text
        icon={<AddIcon />}
        primary
        content={intl.formatMessage(
          {
            id: "general.add",
          },
          { subject: "constraints" }
        )}
        onClick={() => toggleConstraintsDialog()}
      />
      {loading && (
        <Overlay className={"loader"}>
          <Loader
            label={intl.formatMessage(
              {
                id: "general.loading",
              },
              { subject: "constraints" }
            )}
            size="largest"
          />
        </Overlay>
      )}
      {constraints &&
        Object.keys(items).map((constraint, idx) => {
          return (
            <React.Fragment key={`constraints-list-${idx}`}>
              <Flex column={true} gap="gap.small">
                <>
                  <Header as="h4" content={constraint} />
                  <Divider />
                </>
                <FlexItem>
                  <>
                    {items[constraint].map((constraintItem) => (
                      <>
                        {constraintItem.data[constraintItem.data.length - 2]
                          .header !== constraint && (
                          <Header
                            as="h5"
                            content={
                              constraintItem.data[
                                constraintItem.data.length - 2
                              ].header
                            }
                          />
                        )}
                        <Stack horizontal horizontalAlign="space-between">
                          <Stack.Item align="start">
                            <PillGroup
                              aria-label={intl.formatMessage({
                                id: "constraints.selected",
                              })}
                            >
                              {constraintItem.data[
                                constraintItem.data.length - 1
                              ].header.map((v) => (
                                <Pill
                                  styles={{ justifyContent: "center" }}
                                  key={v}
                                  appearance="outline"
                                  content={v}
                                  size={"small"}
                                />
                              ))}
                            </PillGroup>
                          </Stack.Item>
                          <Stack.Item align="end">
                            <Button
                              icon={<EditIcon />}
                              text
                              primary
                              iconOnly
                              title={intl.formatMessage({ id: "general.edit" })}
                              onClick={() => {
                                setValues(constraintItem.data);
                                toggleConstraintsDialog();
                              }}
                            />
                            <Button
                              icon={<TrashCanIcon />}
                              text
                              primary
                              iconOnly
                              title={intl.formatMessage({
                                id: "general.remove",
                              })}
                              onClick={() =>
                                removeConstraintAction({
                                  path: paths.remove.replace(
                                    "{id}",
                                    constraintItem.id
                                  ),
                                })
                              }
                            />
                          </Stack.Item>
                        </Stack>
                      </>
                    ))}
                  </>
                </FlexItem>
              </Flex>
            </React.Fragment>
          );
        })}
      {constraintsDialogToggle && (
        <ConstraintsDialog
          dialogOpen={constraintsDialogToggle}
          locale={locale}
          object={object}
          loading={loading}
          preset={values}
          toggleConstraintsDialog={toggleConstraintsDialog}
          iri={iri}
          title={
            values.length > 0
              ? intl.formatMessage(
                  { id: "general.edit" },
                  {
                    subject: intl.formatMessage(
                      { id: "constraints" },
                      { count: 1 }
                    ),
                  }
                )
              : intl.formatMessage(
                  { id: "general.add" },
                  {
                    subject: intl.formatMessage(
                      { id: "constraints" },
                      { count: 1 }
                    ),
                  }
                )
          }
          intent={values.length > 0 ? "edit" : "add"}
          action={
            values.length > 0 ? updateConstraintAction : createConstraintAction
          }
          url={values.length > 0 ? paths.update : paths.new}
        />
      )}
    </>
  );
};

const mapStateToProps = ({ constraintsReducer }) => {
  const { loading, constraints, constraint, error } = constraintsReducer;
  return { loading, error, constraints, constraint };
};

export default connect(mapStateToProps, {
  getConstraintsAction: getConstraints,
  getConstraintAction: getConstraint,
  updateConstraintAction: updateConstraint,
  removeConstraintAction: removeConstraint,
  createConstraintAction: createConstraint,
})(ConstraintsContainer);
