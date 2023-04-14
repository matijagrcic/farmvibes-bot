import {
  Dialog,
  Text,
  Button,
  Dropdown,
  Loader,
} from "@fluentui/react-northstar";
import { DynamicForm } from "components/forms";
import * as React from "react";
import { useDispatch } from "react-redux";
import { getFromStorage, makeListRequest } from "helpers/utils";
import { select } from "redux-saga/effects";
export const ConstraintsDialog = ({
  action,
  locale,
  dialogOpen,
  question,
  toggleConstraintsDialog,
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = React.useState(false);
  const [values, setValues] = React.useState([]);
  const [selectInputs, setSelectInputs] = React.useState([]);
  const [filters, setFilters] = React.useState([]);
  const [currentConstraint, setCurrentConstraint] = React.useState("");

  const getConstraints = (data) => {
    const { path, propertyValue, propertyName, level, constraint, paths } =
      data;
    setLoading(true);
    makeListRequest({
      url: path,
      options:
        path === `constraints`
          ? {
              "groups[]": "constraints:read",
            }
          : {
              "groups[]": "translations",
            },
    }).then((result) => {
      let options = result.map((option) => {
        return {
          header: option[propertyName],
          content: option.description,
          key: option[propertyValue],
          paths: option.dataPaths,
          constraint,
          level: level + 1,
          selected: false,
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
            label: `Select filter`,
            paths: null,
            isLast: false,
          },
        ]);
      } else {
        //We are getting list of children selects from parent
        if (paths) {
          paths.forEach((pathData, idx) => {
            let pathLength = paths.length;
            let isLast = pathData == paths[pathLength - 1];

            setSelectInputs((prev) => [
              ...prev,
              {
                level: level + idx + 1,
                key: `select-${constraint}-${level + idx + 1}`,
                options: options,
                constraint: constraint,
                label: isLast
                  ? `Specify filters`
                  : `Select available ${constraint}`,
                paths: isLast ? null : idx === 0 ? paths[idx + 1] : pathData,
                isLast,
              },
            ]);
          });
        } else {
          //We're somewhere in cascading list of selects but not top
          let updated = selectInputs
            .filter(
              (select) =>
                select.constraint == constraint && select.level == level + 1
            )
            .map((child) => {
              if (child.level === level + 1) {
                child.options = options;
              }
              return child;
            });

          setSelectInputs(
            selectInputs.map((select) => {
              return select.key === updated.key ? updated : select;
            })
          );
        }
      }
      setLoading(false);
    });
  };

  const Dropdowns = ({
    options,
    onChange,
    index,
    label,
    paths,
    isLast,
    disabled,
    constraint,
    level,
  }) => {
    return (
      <>
        <Text
          content={label}
          styles={{ marginTop: "20px", display: "block" }}
        />
        <Dropdown
          multiple={isLast}
          search={isLast}
          loading={loading}
          disabled={disabled}
          loadingMessage='Loading...'
          placeholder='Start typing to select option.'
          fluid
          checkable
          items={options}
          constraint={constraint}
          onChange={(ev, el) =>
            onChange({
              value: el.value,
              paths,
              isLast,
              index,
              constraint,
              level,
            })
          }
        />
      </>
    );
  };

  const updateValues = (vals) => {
    setValues([
      ...values,
      {
        level: vals.level,
        value: vals.item.header,
        constraint: vals.constraint,
      },
    ]);
  };

  const getFieldValue = (level, constraint) => {
    if (values.length == 0) return;
    var vals = values.filter(
      (value) => value.level === level && value.constraint === constraint
    );

    if (vals.length) return vals[0].value;
  };

  const valuesChanged = (payload) => {
    let { value, paths, isLast, constraint, level } = payload;
    if (!isLast) {
      if (paths === null) {
        paths = value.paths[level];
        constraint = value.header.toLowerCase();
        setCurrentConstraint(constraint);
      }
      //Do we have constraint in state already?
      //If not, we may have to call external api for data
      if (
        selectInputs.filter((select) => select.constraint === constraint)
          .length > 0
      )
        return;
      //If we're using value of previous select to filter upcoming options
      //We replace placeholder in url with the key
      let uri = paths.path.replace("{id}", value.key);
      getConstraints({
        ...paths,
        ...{ path: uri, constraint, level, paths: value.paths },
      });
    }

    //We mark options in state as selected.
    let exists = selectInputs.filter(
      (select) => select.constraint === constraint && select.level === level
    );
    let selects = selectInputs.reduce((prev, current) => {
      if (
        (current.constraint === constraint && current.level === level) ||
        (current.level == 0 && value.constraint === null)
      ) {
        current.options.map((option) => {
          if (option.key === value.key) option["selected"] = true;
          else option["selected"] = false;
        });
      }
      prev.push(current);
      return prev;
    }, []);
    console.log(selects);
    // setSelectInputs(selects);
  };
  React.useEffect(() => {
    if (selectInputs.length === 0 && !loading)
      getConstraints({
        path: `constraints`,
        propertyName: `name`,
        propertyValue: `id`,
        level: 0,
        constraint: null,
      });
  });

  return (
    <Dialog
      cancelButton='Cancel'
      confirmButton='Add constraint'
      content={{
        content: (
          <>
            {loading ? (
              <Loader size='largest' label='loading...' labelPosition='below' />
            ) : (
              <>
                {selectInputs
                  .filter(
                    (select) =>
                      select.constraint == currentConstraint ||
                      select.constraint == null
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
                      <Dropdowns
                        key={`dropdown-${select.key}`}
                        options={select.options}
                        index={select.index}
                        label={select.label}
                        paths={select.paths}
                        onChange={valuesChanged}
                        isLast={select.isLast}
                        disabled={select.disabled}
                        constraint={select.constraint}
                        level={select.level}
                      ></Dropdowns>
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
      header='New filter'
      open={dialogOpen}
      onCancel={() => toggleConstraintsDialog()}
    />
  );
};
