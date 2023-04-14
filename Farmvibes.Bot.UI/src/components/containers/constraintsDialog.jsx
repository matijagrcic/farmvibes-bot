import * as React from "react";
import { Dialog, Loader } from "@fluentui/react-northstar";
import { DynamicDropdowns } from "../forms";
import { capitaliseSentense, makeListRequest } from "helpers/utils";
import { useIntl } from "react-intl";
export const ConstraintsDialog = ({
  dialogOpen,
  toggleConstraintsDialog,
  preset,
  action,
  iri,
  title,
  url,
  intent,
}) => {
  const [loading, setLoading] = React.useState(false);
  const [values, setValues] = React.useState(() =>
    preset.length > 0 ? preset : []
  );
  const [selectInputs, setSelectInputs] = React.useState([]);
  const [currentConstraint, setCurrentConstraint] = React.useState("");
  const intl = useIntl();

  const getConstraints = (data) => {
    const {
      path,
      propertyValue,
      propertyName,
      propertyDescription,
      level,
      constraint,
      paths,
    } = data;
    setLoading(true);
    makeListRequest({
      url: path,
      options: {
        "groups[]": "translations",
      },
    }).then((result) => {
      let options = result.map((option) => {
        return {
          header: capitaliseSentense(option[propertyName]),
          content: option[propertyDescription],
          key: option[propertyValue],
          entity: option.entity,
          paths: option.dataPaths,
          constraint,
          level: level + 1,
        };
      });

      if (level === 0 && !constraint) {
        setSelectInputs((prev) => [
          ...prev,
          {
            level,
            key: `select-level-${level}`,
            options,
            constraint, //This is the main dropdown so has no parent contraint
            label: intl.formatMessage(
              { id: "general.form.select" },
              {
                subject: intl.formatMessage(
                  { id: "constraints" },
                  { count: 1 }
                ),
              }
            ),
            paths: null,
            isLast: false,
          },
        ]);
      } else {
        //We are getting list of children selects from parent
        if (paths) {
          paths.forEach((pathData, idx) => {
            let pathLength = paths.length;
            let isLast = pathData === paths[pathLength - 1];
            setSelectInputs((prev) => [
              ...prev,
              {
                level: level + idx + 1,
                key: `select-${constraint}-${level + idx + 1}`,
                options: idx === level ? options : [],
                constraint: constraint,
                label: isLast
                  ? intl.formatMessage({ id: "constraints.filters.specify" })
                  : intl.formatMessage({
                      id: "constraints.filters.select available",
                      values: { constraint: constraint },
                    }),
                paths: isLast ? null : idx === 0 ? paths[idx + 1] : pathData,
                isLast,
              },
            ]);
          });
        } else {
          if (
            selectInputs.filter(
              (select) =>
                select.constraint === constraint &&
                select.key === `select-${constraint}-${level + 1}`
            ).length > 0
          ) {
            updateSelects(constraint, level, options);
          } else {
            setSelectInputs((prev) => [
              ...prev,
              {
                level: level + 1,
                key: `select-${constraint}-${level + 1}`,
                options: options,
                constraint: constraint,
                label: intl.formatMessage({
                  id: "constraints.filters.specify",
                }),
                paths: null,
                isLast: true,
              },
            ]);
          }
        }
      }
      setLoading(false);
    });
  };

  //When we switch parents, let's update select options
  const updateSelects = (constraint, level, options) => {
    //We're somewhere in cascading list of selects but not top
    let updated = selectInputs
      .filter(
        (select) =>
          select.constraint === constraint && select.level === level + 1
      )
      .map((child) => {
        if (child.level === level + 1) {
          child.options = options;
          child.selected = true;
        }
        return child;
      });

    setSelectInputs(
      selectInputs.map((select) => {
        return select.key === updated.key ? updated : select;
      })
    );
  };

  const getFieldValue = (level, constraint) => {
    if (values.length === 0) return;
    var vals = values.filter(
      (value) =>
        (value.level === level && value.constraint === constraint) ||
        (level === 0) & (value.constraint === null)
    );
    if (vals.length) return vals[0].header;
  };

  const updateValues = (vals) => {
    let currentVal = {
      level: vals.level,
      value: Array.isArray(vals.value)
        ? vals.value
            .filter((val) => val !== null && val !== undefined)
            .map((val) => {
              return val.key;
            })
        : vals.value.key,
      header: Array.isArray(vals.value)
        ? vals.value
            .filter((val) => val !== null && val !== undefined)
            .map((val) => {
              return val.header;
            })
        : vals.value.header,
      constraint: vals.constraint,
      entity: vals.value.entity,
    };
    //Let's see if we have a value at the selected level
    if (values.filter((v) => v.level === vals.level).length > 0)
      setValues(values.map((v) => (v.level === vals.level ? currentVal : v)));
    else setValues((v) => [...v, currentVal]);
  };

  const valuesChanged = (payload) => {
    let { value, paths, isLast, constraint, level } = payload;
    if (!isLast) {
      if (paths === null) {
        paths = value.paths[level];
        constraint = value.header.toLowerCase();
        setCurrentConstraint(constraint);
      }
      let uri = paths.path.replace("{id}", value.key);
      getConstraints({
        ...paths,
        ...{ path: uri, constraint, level, paths: value.paths, isLast },
      });
    }
  };

  React.useEffect(() => {
    //If we're editing, we need to get the subsequent selects
    if (
      intent.includes("edit") &&
      values.length - 1 > selectInputs.length &&
      selectInputs.length > 0
    ) {
      let cSelect = selectInputs[selectInputs.length - 1].options.filter(
        (o) => o.header === values[selectInputs.length - 1].header
      )[0];
      if (cSelect)
        valuesChanged({
          value: cSelect,
          paths:
            cSelect.paths !== undefined
              ? cSelect.paths[selectInputs.length - 1]
              : selectInputs[selectInputs.length - 1].paths,
          islast: values.length - 1 === selectInputs.length,
          constraint: values[0].header.toLowerCase(),
          level: selectInputs.length - 1,
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectInputs]);

  React.useEffect(() => {
    if (selectInputs.length === 0 && !loading) {
      getConstraints({
        path: `constraints?groups[]=constraints%3Aread`,
        propertyName: `name`,
        propertyValue: `id`,
        propertyDescription: `description`,
        level: 0,
        constraint: null,
      });
    }
  });

  return (
    <Dialog
      cancelButton={intl.formatMessage({ id: "general.cancel" })}
      confirmButton={{
        onClick: () => {
          //We loop through the cascaded selection of values to
          //get the IDs picked by the users
          let payload = {
            constraintItem: `/api/constraints/${values[0].value}`,
            raw: values,
            filters: values[values.length - 1].value,
            ...iri,
          };
          action({ path: url, object: payload });
          toggleConstraintsDialog();
        },
        content: intl.formatMessage(
          {
            id: "general.add",
          },
          {
            subject: intl.formatMessage({ id: "constraints" }, { count: 1 }),
          }
        ),
      }}
      content={{
        content: (
          <>
            {loading ? (
              <Loader size="largest" label="loading..." labelPosition="below" />
            ) : (
              <>
                {selectInputs
                  .filter(
                    (select) =>
                      select.constraint === currentConstraint ||
                      select.constraint === null
                  )
                  .sort((a, b) => {
                    if (a.index > b.index) {
                      return 1;
                    }
                    if (a.index < b.index) {
                      return -1;
                    }
                    return 0;
                  })
                  .map((select) => {
                    return (
                      <DynamicDropdowns
                        key={`dropdown-${select.level}-${select.key}`}
                        options={select.options}
                        index={select.index}
                        label={select.label}
                        paths={select.paths}
                        onChange={(ev) => {
                          updateValues(ev);
                          valuesChanged(ev);
                        }}
                        isLast={select.isLast}
                        disabled={select.disabled}
                        constraint={select.constraint}
                        level={select.level}
                        loading={loading}
                        fieldVal={getFieldValue(
                          select.level,
                          select.constraint
                        )}
                      ></DynamicDropdowns>
                    );
                  })}
              </>
            )}
          </>
        ),
        styles: {
          // keep only 1 scrollbar while zooming
          height: "100%",
          minHeight: "250px",
          overflow: "auto",
        },
      }}
      header={title}
      open={dialogOpen}
      onCancel={() => toggleConstraintsDialog()}
    />
  );
};
