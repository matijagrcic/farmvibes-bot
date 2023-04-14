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

export const generateUUID = () => {
  var d = new Date().getTime();
  var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      // eslint-disable-next-line no-mixed-operators
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      // eslint-disable-next-line no-mixed-operators
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    }
  );
  return uuid;
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
          menuButtonAction.subMenuProps.items.filter((subMenu) => {
            return subMenu.key === "contentMenu";
          })[0]["disabled"] = true;
          break;

        default:
          menuButtonAction.subMenuProps.items.filter((subMenu) => {
            return subMenu.key === "contentMenu";
          })[0]["disabled"] = false;
          break;
      }
    }
    return menuButtonAction;
  });
  return buttons;
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
