import { get } from "./requests";

export async function makeListRequest({ url, options, json, blob }) {
  // eslint-disable-next-line no-return-await
  return await get({ url, params: options, blob, json })
    .then((result) => result)
    .catch((error) => error);
}

export const delay = (time) =>
  new Promise((resolve) => setTimeout(resolve, time));

export const setToStorage = (key, data) => {
  try {
    if (data) {
      localStorage.setItem(key, JSON.stringify(data));
    } else {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.log(">>>>: src/helpers/utils.js : setToStorage -> error", error);
  }
};
//Fetch registration fields to be used in constraints and customisation of outgoing messages
export const getRegistrationFields = () => {
  let regFields =
    getFromStorage("reg") !== null
      ? getFromStorage("reg")
      : makeListRequest({
          url: `services/${process.env.REACT_APP_REGISTRATION_ID}/questions`,
        }).then((result) => {
          console.log(result);
          setToStorage("reg", result);
          return result;
        });
  return regFields ? regFields : [];
};

//Validate form fields
export const handleValidation = (field) => {
  // Don't validate submits, buttons, file and reset inputs, and disabled fields
  if (
    field.disabled ||
    field.type === "file" ||
    field.type === "reset" ||
    field.type === "submit" ||
    field.type === "button"
  )
    return;

  // Get validity
  var validity = field.validity;

  // If valid, return null
  if (validity.valid) return;

  // If field is required and empty
  if (validity.valueMissing) return "Please fill out this field.";

  // If not the right type
  if (validity.typeMismatch) {
    // Email
    if (field.type === "email") return "Please enter an email address.";

    // URL
    if (field.type === "url") return "Please enter a URL.";
  }

  // If too short
  if (validity.tooShort)
    return (
      "Please lengthen this text to " +
      field.getAttribute("minLength") +
      " characters or more. You are currently using " +
      field.value.length +
      " characters."
    );

  // If too long
  if (validity.tooLong)
    return (
      "Please shorten this text to no more than " +
      field.getAttribute("maxLength") +
      " characters. You are currently using " +
      field.value.length +
      " characters."
    );

  // If number input isn't a number
  if (validity.badInput) return "Please enter a number.";

  // If a number value doesn't match the step interval
  if (validity.stepMismatch) return "Please select a valid value.";

  // If a number field is over the max
  if (validity.rangeOverflow)
    return (
      "Please select a value that is no more than " +
      field.getAttribute("max") +
      "."
    );

  // If a number field is below the min
  if (validity.rangeUnderflow)
    return (
      "Please select a value that is no less than " +
      field.getAttribute("min") +
      "."
    );

  // If pattern doesn't match
  if (validity.patternMismatch) {
    // If pattern info is included, return custom error
    if (field.hasAttribute("title")) return field.getAttribute("title");

    // Otherwise, generic error
    return "Please match the requested format.";
  }

  // If all else fails, return a generic catchall error
  return "The value you entered for this field is invalid.";
};

// Show an error message
export const showError = (field, error) => {
  // Add error class to field
  field.classList.add("error");
  field.setAttribute("aria-invalid", "true");

  // If the field is a radio button and part of a group, error all and get the last item in the group
  if (field.type === "radio" && field.name) {
    var group = document.getElementsByName(field.name);
    if (group.length > 0) {
      for (var i = 0; i < group.length; i++) {
        // Only check fields in current form
        if (group[i].form !== field.name) continue;
        group[i].classList.add("error");
      }
      field = group[group.length - 1];
    }
  }

  // Get field id or name
  var id = field.id || field.name;
  if (!id) return;

  // Check if error message field already exists
  // If not, create one
  var message = field.form.querySelector(".error-message#error-for-" + id);
  if (!message) {
    message = document.createElement("div");
    message.className = "error-message";
    message.id = "error-for-" + id;

    // If the field is a radio button or checkbox, insert error after the label
    var label;
    if (field.type === "radio" || field.type === "checkbox") {
      label =
        field.form.querySelector('label[for="' + id + '"]') || field.parentNode;
      if (label) {
        label.parentNode.insertBefore(message, label.nextSibling);
      }
    }

    // Otherwise, insert it after the field
    if (!label) {
      field.parentNode.insertBefore(message, field.nextSibling);
    }
  }

  // Add ARIA role to the field
  field.setAttribute("aria-describedby", "error-for-" + id);

  // Update error message
  message.innerHTML = error;

  // Show error message
  message.style.display = "block";
  message.style.visibility = "visible";
};

export const getToken = (instance) => {
  const accounts = instance.getAllAccounts();

  if (Array.isArray(accounts) && accounts.length === 0) return null;

  let data = JSON.parse(
    sessionStorage.getItem(
      `${accounts[0].homeAccountId}-${accounts[0].environment}-idtoken-${process.env.REACT_APP_AZURE_CLIENT_ID}-${process.env.REACT_APP_TENANT_ID}---`
    )
  );

  return data === null ? data : data.secret;
};

export const isTokenExpired = (token) => {
  if (token === null) return false;
  const expiry = JSON.parse(window.atob(token.split(".")[1])).exp;
  return Date.now() >= expiry * 1000 ? false : true;
};

// Remove the error message
export const removeError = (field) => {
  // Remove error class to field
  field.classList.remove("error");

  // Remove ARIA role from the field
  field.removeAttribute("aria-describedby");

  // If the field is a radio button and part of a group, remove error from all and get the last item in the group
  if (field.type === "radio" && field.name) {
    var group = document.getElementsByName(field.name);
    if (group.length > 0) {
      for (var i = 0; i < group.length; i++) {
        // Only check fields in current form
        if (group[i].form !== field.name) continue;
        group[i].classList.remove("error");
      }
      field = group[group.length - 1];
    }
  }

  // Get field id or name
  var id = field.id || field.name;
  if (!id) return;

  // Check if an error message is in the DOM
  var message = field.form.querySelector(".error-message#error-for-" + id + "");
  if (!message) return;

  // If so, hide it
  message.innerHTML = "";
  message.style.display = "none";
  message.style.visibility = "hidden";
};

//Validate form on submit
export const validateForm = (fields) => {
  let error, hasErrors;
  for (let i = 0; i < fields.length; i++) {
    error = handleValidation(fields[i]);
    if (error) {
      showError(fields[i], error);
      if (!hasErrors) {
        hasErrors = fields[i];
      }
    }
  }
  return hasErrors;
};

export const getPlatformComponents = async (url, key) => {
  if (getFromStorage(key)) {
    return getFromStorage(key);
  }

  let response = await makeListRequest({
    url,
  }).then((result) => {
    setToStorage(key, result);
    return result;
  });
  return response;
};

export const clearStorage = () => {
  localStorage.clear();
};

export const getFromStorage = (key) => {
  try {
    return localStorage.getItem(key) != null
      ? JSON.parse(localStorage.getItem(key))
      : null;
  } catch (error) {
    console.log(">>>>: src/helpers/utils.js  : getFromStorage -> error", error);
    return null;
  }
};

/*
  Resizes side-bar height according to the height of the content. This is for sitautions where 100v in CSS doesn't suffice like when drawing complex menu tree
  */
export const updateSideBarheight = () => {
  //We need to resize the side bar height to avoid white-space if menu is too long
  let menu = document.getElementsByClassName("root-116");
  if (menu.length > 0) {
    menu[0].setAttribute(
      "style",
      `height:
        ${
          document.getElementById("tree-container").getBoundingClientRect()
            .height + 200
        }px`
    );
  }
};

export const generateUUID = () => {
  var d = new Date().getTime();
  var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      // eslint-disable-next-line no-mixed-operators
      var random = window.crypto.getRandomValues(new Uint32Array(1))[0];
      var r = (d + random * 16) % 16 | 0;
      d = Math.floor(d / 16);
      // eslint-disable-next-line no-mixed-operators
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    }
  );
  return uuid;
};

export const encodeGroupURI = (name, items) => {
  let prefix = `${name}[]=`;
  return prefix + items.map((o) => encodeURI(o)).join(`&${prefix}`);
};

export const createNewNode = ({ name, type, options = [] }) => {};

/*
    Filter object properties returning those that match the predicate
*/
export const objectFilter = (obj, predicate) =>
  Object.keys(obj)
    .filter((key) => predicate(obj[key]))
    // eslint-disable-next-line no-sequences
    .reduce((res, key) => ((res[key] = obj[key]), res), {});

/*
Flatten an array returning a single level object with nested keys concatenated with concatenator
*/
export const flat = (obj, newObj, prefix) => {
  if (obj === null || obj === undefined || Object.keys(obj).length < 1)
    return {};
  newObj = newObj || {};
  prefix = prefix || "";
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      const type = typeof obj[key];
      const newKey = !!prefix ? prefix + "." + key : key;
      if (type === "string" || type === "boolean" || type === "number") {
        newObj[newKey] = obj[key];
      } else if (type === "object") {
        flat(obj[key], newObj, newKey);
      }
    }
  }
  return newObj;
};

export const flattenedArray = (array) => array.map((o) => flat(o));

/*
Unflatten a dot notationed object into nested array
*/
export const unflatten = (obj) => {
  var result = {};
  for (var i in obj) {
    var keys = i.split(".");
    // eslint-disable-next-line no-loop-func
    keys.reduce(function (r, e, j) {
      return (
        r[e] ||
        (r[e] = isNaN(Number(keys[j + 1]))
          ? keys.length - 1 === j
            ? obj[i]
            : {}
          : [])
      );
    }, result);
  }
  return result;
};

/*
 Manipulates context menu before it's displayed to the user
 */
export const prepareContentMenu = (buttons, node) => {
  buttons.map((menuButtonAction) => {
    if (menuButtonAction.key === "publishItem") {
      switch (node.isPublished) {
        case true:
          menuButtonAction.iconProps.iconName = "UnpublishContent";
          menuButtonAction.text = "Unpublish menu node";
          break;

        default:
          menuButtonAction.iconProps.iconName = "publishContent";
          menuButtonAction.text = "Publish menu node";
          break;
      }
    }
    if (menuButtonAction.key === "newItem") {
      switch (node.type.name) {
        case "content":
          menuButtonAction.subMenuProps.items
            .filter((subMenu) => {
              return (
                subMenu.key === "contentMenu" ||
                subMenu.key === "serviceMenu" ||
                subMenu.key === "branchMenu"
              );
            })
            .forEach((menu) => (menu["disabled"] = true));
          break;

        case "service":
          menuButtonAction.subMenuProps.items
            .filter((subMenu) => {
              return (
                subMenu.key === "contentMenu" ||
                subMenu.key === "serviceMenu" ||
                subMenu.key === "branchMenu"
              );
            })
            .forEach((menu) => (menu["disabled"] = true));
          break;

        default:
          menuButtonAction.subMenuProps.items
            .filter((subMenu) => {
              return (
                subMenu.key === "contentMenu" ||
                subMenu.key === "serviceMenu" ||
                subMenu.key === "branchMenu"
              );
            })
            .forEach((menu) => (menu["disabled"] = false));
          break;
      }
    }
    return menuButtonAction;
  });
  return buttons;
};

/* Searches object for values. Object can be string, array or object */
export const includesText = (data, text, deep = false, exact = false) => {
  return Object.values(data).some((txt) => {
    if (
      txt !== null &&
      typeof txt === "object" &&
      txt.constructor === Object &&
      deep
    )
      return includesText(txt, text, deep);
    if (txt !== null && txt.constructor === Array && deep)
      return (
        txt.filter((j) => {
          return includesText(j, text);
        }).length > 0
      );
    if (typeof txt === "string" && txt !== null) {
      if (exact) return txt.toLowerCase() === text.toLowerCase();
      else return txt.toLowerCase().includes(text.toLowerCase());
    }
    return false;
  });
};

/* Adds locale property to unflattened object as expected by API before persisting */
export const addTranslationLocale = (obj) => {
  Object.keys(obj).forEach((key) => {
    if (key.includes("translation")) {
      obj[`${key.substring(0, key.lastIndexOf("."))}.locale`] = key.substring(
        key.indexOf(".", key.lastIndexOf("translations.")) + 1,
        key.lastIndexOf(".")
      );
    }
  });
  return obj;
};

// Serializing function that takes a Slate.js rich text value and returns a string.
export const serialize = (value) => {
  if (typeof value === "string") return value;

  return (
    value
      // Return the string content of each paragraph in the value's children.
      .map((n) => {
        //Do we have formatted children?
        return n.children
          .map((child) => {
            const keyLength = Object.keys(child);
            if (keyLength.length > 1) {
              switch (keyLength[keyLength.length - 1]) {
                case "bold":
                  return `**${child.text}**`;
                case "strikethrough":
                  return `~${child.text}~`;

                case "italic":
                  return `_${child.text}_`;

                case "code":
                  return `\```${child.text}\````;

                default:
                  return `${child.text}`;
              }
            } else return child.text;
          })
          .join("");
      })
      // Join them all with line breaks denoting paragraphs.
      .join("\n")
  );
};

//Returns items in local storage items from IRI
export const getFromIri = (item, iri) => {
  let result = getFromStorage(item).filter(
    (itm) => itm.id === iri.substring(iri.lastIndexOf("/") + 1)
  );
  if (result) return result[0];
  return;
};

export const capitaliseSentense = (text) => {
  return text
    .replace(/([.?!])(\s)*(?=[A-Z])/g, "$1|")
    .split("|")
    .map((word) => {
      return word.replace(/^\w/, (c) => c.toUpperCase());
    })
    .join(" ");
};
