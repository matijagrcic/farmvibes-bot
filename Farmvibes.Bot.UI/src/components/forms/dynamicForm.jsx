import React from "react";
import {
  ToggleField,
  TextareaField,
  RadioField,
  InputTextField,
  DropDownField,
  ComboBoxField,
  ArrayField,
  UploadField,
  CheckboxField,
  RichEditor,
} from "components/forms";
import {
  TooltipHost,
  MessageBarType,
  MessageBar,
  Stack,
  Separator,
  Pivot,
  PivotItem,
} from "@fluentui/react";
import { Button } from "@fluentui/react-northstar";
import { translationsDelay } from "global/defaultValues";
import {
  unflatten,
  includesText,
  removeError,
  handleValidation,
  showError,
  capitaliseSentense,
} from "helpers/utils";
import { post } from "helpers/requests";
import { useLanguages } from "helpers/utilities";
import { useIntl } from "react-intl";

export const DynamicForm = React.memo(
  ({
    inputs,
    formWidth,
    onSubmit,
    navigate,
    inputValues,
    loading,
    error,
    valuesChanged,
    handleSearchQuery,
    reverse = true,
    preventSubmit,
    disableSubmit,
    dataPool,
    isValid,
  }) => {
    //Values provided by the user
    const [values, setValues] = React.useState(inputValues || {});
    const { languages } = useLanguages();
    const intl = useIntl();
    const stateRef = React.useRef();
    stateRef.current = values;
    const [personalisationFields] = React.useState([]);
    let arrayKeys = {};

    //Inputs to be shown on the form
    const [formInputs, setFormInputs] = React.useState(inputs);

    //Track list of uploaded files
    const [files, setFiles] = React.useState([]);

    //Track list of errors
    const [validationError, setValidationError] = React.useState([]);

    //Icon to show for adding list fields
    const addIcon = { iconName: "Add" };

    const [submitStatus, setSubmitStatus] = React.useState(null);

    React.useEffect(() => {
      if (isValid) isValid(validationError.length > 0);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [validationError]);

    const handleChange = (event, value) => {
      let fieldName = null;
      let fieldVal = null;
      if (event.hasOwnProperty("currentTarget")) {
        fieldName = event.currentTarget.name;
        //For radio options, the whole object with key, text properties is returned
        //We can take the key only as value otherise let's take value
        fieldVal =
          event.currentTarget.type === "radio"
            ? value.key
            : event.currentTarget.type === "button"
            ? value
            : event.currentTarget.value;

        //Convert numbers to integer lest they get posted to API as strings
        if (event.currentTarget.type === "number")
          fieldVal = parseInt(fieldVal);
      } else {
        fieldName = event;
        fieldVal = value;
      }

      if (fieldName === undefined || fieldVal === undefined) return;

      _clearValidationError(fieldName);

      let newVal = {
        ...values,
        ...{
          [fieldName]: fieldVal,
        },
      };
      //This line could have side effects on editing content
      setValues(newVal);
      if (valuesChanged) valuesChanged(newVal);
    };

    const _handleFile = (file, name) => {
      const upload = { name: name + files.length, file: file };
      setFiles([...files, upload]);
    };

    const _clearValidationError = (field) => {
      setValidationError((prev) => prev.filter((e) => e.field !== field));
    };

    const _validateOnBlur = (currentTarget) => {
      // Only run if the field is in a form to be validated
      if (!currentTarget.form.classList.contains("validate")) return;

      // Validate the field
      let error = handleValidation(currentTarget);

      // If there's an error, show it
      if (error) {
        showError(currentTarget, error);
        setSubmitStatus(null);
        return;
      }

      // Otherwise, remove any existing error message
      removeError(currentTarget);
    };

    const _uniqueValidationCheck = (field, val) => {
      //Let's check if we need to validate
      let validationCheck = formInputs.filter(
        (f) => f.name === field && f.unique
      );

      if (validationCheck.length > 0) {
        let check = includesText(dataPool, val, true, true);
        if (check)
          setValidationError((e) => [
            ...e,
            { field, message: "This value should be unique" },
          ]);
        else {
          _clearValidationError(field);
        }
        return check;
      }
      return false;
    };

    const _autoTranslate = async (currentTarget) => {
      let fieldVal = currentTarget.value;
      let fieldName = currentTarget.name;
      //let's translate only translate strings of length greater than one
      if (fieldVal.length === 0) return;

      //If the field is offers text in various languages, let's check if the current locale is default.
      //If default, translate all other languages
      if (fieldName.includes("translations")) {
        //Let's fetch available languages

        //We do not need to proceed if we have less than two languages
        if (languages.length < 2) return;

        //Let's show loader as translation happens in the background
        if (preventSubmit)
          preventSubmit(
            true,
            `Translating ${fieldName.substring(fieldName.lastIndexOf(".") + 1)}`
          );
        //Are we on a default language?
        const arraysFromName = fieldName.match(/(?<=\.)(.*?)(?=\.)/gm);

        let newVal = { [fieldName]: fieldVal };

        if (arraysFromName) {
          //Locale will always be last
          const currentLingo = arraysFromName[arraysFromName.length - 1];

          //Are we on default lingo?
          if (
            languages.filter(
              (lingo) => lingo.isDefault && lingo.code === currentLingo
            ).length > 0
          ) {
            const to = [];
            const untranslatable = [];
            languages.forEach((lingo) => {
              if (!lingo.isDefault && lingo.isTranslatable) {
                to.push(lingo.code);
              } else {
                untranslatable.push(lingo.code);
              }
            });
            post("get_translation", {
              text: insertHtmlTags(fieldVal),
              to,
              from: currentLingo,
            }).then((result) => {
              if (result && result.status === "success") {
                result.translations.forEach((translation) => {
                  newVal[fieldName.replace(currentLingo, translation.to)] =
                    capitaliseSentense(translation.text);
                });
                untranslatable.forEach(
                  (l) => (newVal[fieldName.replace(currentLingo, l)] = fieldVal)
                );
              }
              if (Object.keys(newVal).length > 0) {
                setValues((prev) => {
                  return { ...prev, ...newVal };
                });
                if (valuesChanged) valuesChanged({ ...values, ...newVal });
              }
              if (preventSubmit) preventSubmit(false);
            });
          } else {
            if (preventSubmit) preventSubmit(false);
          }
        }
      }
    };

    const insertHtmlTags = (str) => {
      if (!str.includes("#")) return str;
      let open = false;
      let chars = str.split("");
      let matches = [];
      let openTag = '<div class="notranslate">';
      let closeTag = "</div>";
      let output = str;
      chars.forEach((character, index) => {
        if (character !== "#") return;
        if (open) {
          matches[matches.length - 1]["close"] = index;
          open = false;
        } else {
          matches.push({ open: index });
          open = true;
        }
      });

      matches.forEach((match, index) => {
        let offset = (openTag.length + closeTag.length) * index;
        let arr = Array.from(output);
        arr.splice(match.open + offset, 0, openTag);
        arr.splice(match.close + offset + openTag.length, 0, closeTag);
        output = arr.join("");
      });

      return output;
    };

    /*
    For field groups where multiple can be added, this functions adds a new row of fields when triggered.
    */
    const _addFieldRow = (row) => {
      let field = inputs.filter((input) => {
        return input.name === row;
      });

      if (field.length < 1) return;

      const currentFields = formInputs.filter((input) => {
        return input.name === row;
      });

      let newFieldRow = currentFields[0].fields[0];
      //We need to update the index of new field with last one
      currentFields[0].fields.push(newFieldRow);

      setFormInputs([...formInputs, currentFields]);
    };

    const _returnFormField = (fields, locale, parent) => {
      let form = [];
      if (fields.length > 0) {
        fields.forEach((field, idx) => {
          let fieldname = "";
          if (parent !== undefined) {
            fieldname = `${fieldname}`;
            //We need to track fields in array field type that shouldn't be added each time we add a new row.
            //We store them in an array and check if they've already been added.
            fieldname = locale
              ? `${parent}.${field.name}.${idx}.translations.${locale}.${field.name}`
              : `${parent}.${field.name}`;
          } else {
            fieldname = locale
              ? `translations.${locale}.${field.name}`
              : field.name;
          }

          //Let's assign field value to control
          let fieldValue = inputValues.hasOwnProperty(fieldname)
            ? inputValues[fieldname]
            : "";

          if (values.isSystem && fieldname === "description") return;

          switch (field.type) {
            case "longtext":
              form.push(
                <TextareaField
                  key={field.name + idx}
                  disabled={field.disabled}
                  name={fieldname}
                  required={field.required}
                  handleChange={handleChange}
                  label={field.label}
                  maxLength={field.length}
                  value={fieldValue}
                  hint={field.hint}
                  onBlur={[field.onBlur, _autoTranslate]}
                  personalisationFields={personalisationFields}
                  variant={field.variant}
                />
              );
              break;

            case "boolean":
              form.push(
                <ToggleField
                  key={field.name + idx}
                  disabled={field.disabled}
                  onText={field.selectedText}
                  offText={field.deselectedText}
                  name={fieldname}
                  required={field.required}
                  handleChange={handleChange}
                  inlineLabel
                  label={field.label}
                  defaultChecked={fieldValue}
                  options={field.options}
                  checkedValue={field.checkedValue}
                  variant={field.variant}
                />
              );
              break;

            case "choice":
              form.push(
                <RadioField
                  defaultSelectedKey={fieldValue}
                  key={field.name + idx}
                  disabled={field.disabled}
                  name={fieldname}
                  options={field.options}
                  required={field.required}
                  handleChange={handleChange}
                  label={field.label}
                  value={fieldValue}
                />
              );
              break;

            case "multiple-choice":
              form.push(
                <CheckboxField
                  defaultSelectedKey={fieldValue}
                  key={field.name + idx}
                  disabled={field.disabled}
                  name={fieldname}
                  options={field.options}
                  required={field.required}
                  handleChange={handleChange}
                  label={field.label}
                  value={fieldValue}
                  variant={field.variant}
                />
              );
              break;

            case "dropdown":
              form.push(
                <DropDownField
                  key={field.name + idx}
                  disabled={field.disabled}
                  name={fieldname}
                  options={field.options}
                  required={field.required}
                  handleChange={handleChange}
                  label={field.label}
                  defaultSelectedKey={fieldValue}
                  styles={field.styles}
                />
              );
              break;

            case "array":
              form.push(
                <ArrayField
                  key={field.name + idx}
                  disabled={field.disabled}
                  name={field.name}
                  fields={field.fields}
                  locale={locale}
                  addText={field.addText}
                  addFieldRow={() => _addFieldRow(field.name)}
                  addIcon={addIcon}
                  fieldsFunction={_returnFormField}
                  label={field.label}
                  value={values}
                  personalisationFields={personalisationFields}
                />
              );
              if (field.hasOwnProperty("count")) {
                arrayKeys[field.name] = field.count - 1;
                delete field.count;
              }
              break;

            case "file":
              form.push(
                <UploadField
                  key={field.name + idx}
                  disabled={field.disabled}
                  name={fieldname}
                  required={field.required}
                  handleFile={_handleFile}
                  label={field.label}
                />
              );
              break;

            case "combo":
              let blurFunctions = [field.onBlur];
              if (field.translatable) blurFunctions.push(_autoTranslate);
              form.push(
                <ComboBoxField
                  key={field.name + idx}
                  disabled={field.disabled}
                  name={fieldname}
                  required={field.required}
                  handleChange={handleChange}
                  handleSearchQuery={handleSearchQuery}
                  label={field.label}
                  options={field.options}
                  defaultSelectedKeys={fieldValue}
                  values={values}
                  placeholder={field.placeholder}
                  variant={field.variant}
                  allowFreeform={field.allowFreeform}
                  onBlur={blurFunctions}
                  hint={field.hint}
                />
              );
              break;

            case "integer":
              form.push(
                <InputTextField
                  description={field.hint}
                  key={field.name + idx}
                  disabled={field.disabled}
                  name={fieldname}
                  required={field.required}
                  handleChange={handleChange}
                  label={field.label}
                  maxLength={field.length}
                  type={"number"}
                  value={fieldValue}
                  values={values}
                  personalisationFields={personalisationFields}
                  onBlur={[field.onBlur, _validateOnBlur]}
                  validationPattern={field.validationPattern}
                  variant={field.variant}
                />
              );
              break;

            case "hidden":
              form.push(
                <InputTextField
                  key={field.name + idx}
                  disabled={field.disabled}
                  name={fieldname}
                  required={field.required}
                  handleChange={handleChange}
                  label={field.label}
                  maxLength={field.length}
                  type={"hidden"}
                  error={error}
                  borderless={true}
                  value={fieldValue}
                  values={values}
                  personalisationFields={personalisationFields}
                />
              );
              break;
            case "password":
              form.push(
                <InputTextField
                  key={field.name + idx}
                  disabled={field.disabled}
                  name={fieldname}
                  required={field.required}
                  handleChange={handleChange}
                  label={field.label}
                  maxLength={field.length}
                  type={"password"}
                  error={error}
                  borderless={true}
                  value={fieldValue}
                  values={values}
                  variant={field.variant}
                  personalisationFields={personalisationFields}
                  fieldAttributes={field.fieldAttributes}
                />
              );
              break;
            case "richtext":
              form.push(
                <RichEditor
                  key={field.name + idx}
                  disabled={field.disabled}
                  placeholder={field.placeholder}
                  name={fieldname}
                  required={field.required}
                  handleChange={handleChange}
                  label={field.label}
                  val={fieldValue}
                  values={values}
                  hint={field.hint}
                  onBlur={_autoTranslate}
                  height={field.height}
                  personalisationFields={personalisationFields}
                />
              );
              break;
            default:
              form.push(
                <InputTextField
                  key={field.name + idx}
                  disabled={field.disabled}
                  name={fieldname}
                  required={field.required}
                  handleChange={handleChange}
                  label={field.label}
                  maxLength={field.length}
                  defaultValue={field.value}
                  value={fieldValue}
                  values={values}
                  variant={field.variant}
                  styles={field.styles}
                  inverted={field.inverted}
                  placeholder={field.placeholder}
                  icon={field.icon}
                  validationPattern={field.validationPattern}
                  onBlur={[
                    field.onBlur,
                    _validateOnBlur,
                    _uniqueValidationCheck,
                    _autoTranslate,
                  ]}
                  personalisationFields={personalisationFields}
                  unique={field.unique}
                  inputValidation={validationError}
                  hint={field.hint}
                />
              );
              break;
          }
          return null;
        });

        return form;
      }
    };

    const pivotStyles = (props) => {
      return {
        link: [
          {
            height: "34px",
          },
        ],
        root: [
          {
            margin: "0 0 20px 0",
          },
        ],
      };
    };

    /* 
    Pushes translatable fields into respective language tabs
    */
    const _returnTabItems = (filter) => {
      let tabs = [];
      let filters = buildFilter(filter);
      let filteredInputs = filterData(formInputs, filters);
      languages &&
        languages.forEach((language, index) => {
          tabs.push(
            <PivotItem
              headerText={language.code.toUpperCase()}
              key={language.code}
              headerButtonProps={{
                "data-order": index + 1,
                "data-title": `${language} content`,
              }}
              onRenderItemLink={(properties, nullableDefaultRenderer) => {
                return (
                  <TooltipHost content={language.name}>
                    {nullableDefaultRenderer(properties)}
                  </TooltipHost>
                );
              }}
              styles={{ root: [{ height: "24px", display: "none" }] }}
            >
              {_returnFormField(filteredInputs, language.code)}
            </PivotItem>
          );
        });
      return tabs;
    };

    /*
    Build an object of filters when an object is provided
    */
    const buildFilter = (filter) => {
      let query = {};
      for (let keys in filter) {
        if (filter[keys].constructor === Array && filter[keys].length > 0) {
          query[keys] = filter[keys];
        }
      }
      return query;
    };

    /*
    Filter object returning an array of objects with matching keys.
    Query is an object with key-value pairs that will be matched.
    */
    const filterData = (data, query) => {
      if (data === undefined) return {};
      const filteredData = data.filter((item) => {
        for (let key in query) {
          if (item[key] === undefined || !query[key].includes(item[key])) {
            return false;
          }
        }
        return true;
      });
      return filteredData;
    };

    const submitBind = function (event) {
      let data = unflatten(stateRef.current);
      if (data.hasOwnProperty("translations")) {
        Object.keys(data.translations).forEach((key) => {
          data.translations[key]["locale"] = key;
        });
      }
      onSubmit(event, data, navigate);
    };

    /*
    Submit form when all fields are completed
    */
    const submitForm = (event) => {
      setSubmitStatus("Submitted");
      setTimeout(submitBind, translationsDelay, event);
    };

    /**
     * Let's make sure we can enable submit button if validation is done externally and we encounter an error.
     */
    React.useEffect(() => {
      if (disableSubmit === false) setSubmitStatus(null);
    }, [disableSubmit]);

    React.useEffect(
      () =>
        setValues((prev) => {
          return { ...prev, ...inputValues };
        }),
      [inputValues]
    );

    React.useEffect(() => {
      if (error === undefined) return;

      setSubmitStatus("error");
    }, [error]);

    return (
      <>
        <Stack
          styles={{ root: { width: formWidth } }}
          tokens={{ childrenGap: 15 }}
        >
          {submitStatus !== null && error && (
            <MessageBar
              messageBarType={
                submitStatus === "error"
                  ? MessageBarType.error
                  : MessageBarType.success
              }
              isMultiline={true}
              onDismiss={() => setSubmitStatus(null)}
              dismissButtonAriaLabel={intl.formatMessage({
                id: "general.close",
              })}
            >
              {submitStatus === "error"
                ? intl.formatMessage({ id: "general.form.submit.error" })
                : intl.formatMessage({ id: "general.form.submit.success" })}
            </MessageBar>
          )}
          {reverse ? (
            <>
              {_returnFormField(
                filterData(formInputs, buildFilter({ translatable: [false] }))
              )}
              {formInputs.filter((i) => i.translatable).length > 0 && (
                <Pivot aria-label="multilingual-content" styles={pivotStyles}>
                  {_returnTabItems({ translatable: [true] })}
                </Pivot>
              )}
            </>
          ) : (
            <>
              {formInputs.filter((i) => i.translatable).length > 0 && (
                <Pivot aria-label="multilingual-content" styles={pivotStyles}>
                  {_returnTabItems({ translatable: [true] })}
                </Pivot>
              )}
              {_returnFormField(
                filterData(formInputs, buildFilter({ translatable: [false] }))
              )}
            </>
          )}

          {/* To do: Find a better way to load options when editing questions with choices */}
          {Object.keys(arrayKeys).forEach((arrayKey) => {
            for (let i = 0; i < arrayKeys[arrayKey]; i++) {
              _addFieldRow(arrayKey);
            }
          })}
          {onSubmit && (
            <div>
              <Separator />{" "}
              <Button
                content={intl.formatMessage({ id: "general.form.submit" })}
                flat
                primary
                type="submit"
                loading={loading || submitStatus !== null}
                disabled={loading || disableSubmit || submitStatus !== null}
                onMouseDown={submitForm}
              />
            </div>
          )}
        </Stack>
      </>
    );
  }
);
