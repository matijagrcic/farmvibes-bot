import { SharedColors } from "@fluentui/theme";
import { EditIcon } from "@fluentui/react-icons-northstar";

export const backendPath = process.env.REACT_APP_API_ENDPOINT;

export const menuColours = (theme) => {
  return {
    disabled: theme.semanticColors.disabledBackground,
    branch: SharedColors.blueMagenta10,
    service: SharedColors.blue10,
    content: SharedColors.greenCyan10,
    unpublished: SharedColors.yellowGreen10,
    locked: SharedColors.gray10,
    main: SharedColors.red10,
  };
};

export const createContentFields = [
  {
    name: "label",
    key: "menu label",
    required: true,
    length: 300,
    type: "string",
    label: "Menu label",
    translatable: true,
  },
  {
    name: "description",
    key: "description",
    required: false,
    length: 300,
    type: "longtext",
    label: "Content Title",
    translatable: true,
  },
  {
    fields: [
      {
        name: "text",
        key: "text",
        required: true,
        length: 300,
        type: "longtext",
        label: "Text",
        translatable: true,
        multiple: true,
      },
    ],
    name: "content",
    label: "Messages",
    key: "content",
    type: "array",
    translatable: true,
  },
  // {
  //     "fields": [
  //       {
  //         "name": "file",
  //         "key": "file",
  //         "required": true,
  //         "type": "file",
  //         "label": "File",
  //         "translatable": false
  //       },
  //       {
  //         "name": "caption",
  //         "key": "caption",
  //         "required": true,
  //         "length": 500,
  //         "type": "longtext",
  //         "label": "Caption",
  //         "translatable": false
  //       }
  //     ],
  //     "name": "media",
  //     "label": "Media",
  //     "key": "media",
  //     "type": "array",
  //     "translatable": false
  // }
];

export const createNode = [
  {
    name: "label",
    key: "menu label",
    required: true,
    length: 50,
    type: "string",
    label: "Menu label",
    translatable: true,
  },
];

export const addMenu = [
  {
    name: "label",
    key: "menu label",
    required: true,
    length: 50,
    type: "string",
    label: "Name",
    translatable: true,
    variant: "northstar",
  },
  {
    name: "description",
    key: "description",
    required: false,
    length: 300,
    type: "longtext",
    label: "Description",
    translatable: true,
    variant: "northstar",
  },
];

export const addLanguage = [
  {
    name: "name",
    key: "name",
    required: true,
    length: 50,
    type: "string",
    label: "Name",
    translatable: true,
  },
  {
    name: "code",
    key: "code",
    required: true,
    length: 3,
    type: "string",
    label: "ISO code",
    translatable: false,
  },
  {
    name: "isEnabled",
    key: "isEnabled",
    required: false,
    length: 3,
    type: "boolean",
    label: "Is language enabled?",
    translatable: false,
    selectedText: "Activated",
    deselectedText: "Deactivated",
  },
];

export const addAdministrativeUnit = [
  {
    name: "name",
    key: "name",
    required: true,
    length: 50,
    type: "string",
    label: "Name",
    translatable: false,
  },
  {
    name: "parent",
    key: "parent",
    required: false,
    length: 3,
    type: "dropdown",
    label: "Parent",
    translatable: false,
  },
];

export const publishMenu = [
  {
    name: "publish",
    key: "publish",
    required: true,
    type: "choice",
    label:
      "Publishing a menu makes it available to users of the platform on all designated channels. How would you want to treat options not published?",
    translatable: false,
    options: [
      {
        key: "all",
        text: "Make all unpublished menu items available to your users.",
      },
      {
        key: "none",
        text: "Leave items unpblished and make menu visible on the platform",
      },
    ],
  },
];

export const addChannel = [
  {
    name: "name",
    key: "name",
    required: true,
    length: 50,
    type: "string",
    label: "Name",
    translatable: false,
  },
  {
    name: "prefix",
    key: "prefix",
    required: false,
    hint: "If the channel requires every outgoing message to be prefixed by certain characters, please define that here",
    length: 3,
    type: "string",
    label: "Prefix",
    translatable: false,
  },
  {
    name: "postfix",
    key: "postfix",
    required: false,
    hint: "If the channel requires all outgoing messages to be terminated by certain characters, please indicated here",
    length: 3,
    type: "string",
    label: "Postfix",
    translatable: false,
  },
  {
    name: "characterLength",
    key: "characterLength",
    required: false,
    length: 10,
    type: "integer",
    label: "Number of characters per message",
    translatable: false,
  },
  {
    name: "isEnabled",
    key: "isEnabled",
    required: false,
    length: 3,
    type: "boolean",
    label: "Is language enabled?",
    translatable: false,
    selectedText: "Activated",
    deselectedText: "Deactivated",
  },
  {
    name: "isRichText",
    key: "isRichText",
    required: false,
    length: 3,
    type: "boolean",
    label: "Does the channel support rich messages?",
    translatable: false,
    selectedText: "Yes",
    deselectedText: "No",
  },
];

export const addUser = [
  {
    name: "fullname",
    key: "fullname",
    required: true,
    length: 50,
    type: "string",
    label: "Name",
    translatable: false,
    disabled: true,
  },
  {
    name: "gender",
    key: "gender",
    required: true,
    length: 3,
    type: "string",
    label: "Gender",
    translatable: false,
    disabled: true,
  },
  {
    name: "language",
    key: "language",
    required: true,
    length: 3,
    type: "string",
    label: "Language",
    translatable: false,
    disabled: true,
  },
  {
    name: "createdAt",
    key: "createdAt",
    required: true,
    length: 3,
    type: "string",
    label: "Registered on",
    translatable: false,
    disabled: true,
  },
  {
    name: "status",
    key: "status",
    required: true,
    length: 3,
    type: "string",
    label: "Status",
    translatable: false,
    disabled: true,
  },
  {
    name: "age",
    key: "age",
    required: true,
    length: 3,
    type: "string",
    label: "Age",
    translatable: false,
    disabled: true,
  },
];

export const addContent = [
  {
    name: "label",
    key: "label",
    required: true,
    length: 50,
    type: "string",
    placeholder: "Insert content description",
    translatable: true,
    disabled: false,
    icon: <EditIcon outline />,
    variant: "northstar",
    styles: { fontSize: "16px", fontWeight: "400" },
    inverted: true,
  },
];

export const addService = [
  {
    name: "name",
    key: "name",
    required: true,
    length: 50,
    type: "string",
    placeholder: "Insert service description",
    translatable: true,
    disabled: false,
    icon: <EditIcon outline />,
    variant: "northstar",
    styles: { fontSize: "16px", fontWeight: "400" },
    inverted: true,
  },
];

export const addQuestion = [
  {
    label: "Enter question",
    name: "question",
    key: "question",
    type: "string",
    required: true,
    translatable: true,
    variant: "northstar",
    hasPlaceholders: true,
  },
  {
    label: "What is the title of your question?",
    name: "description",
    key: "description",
    type: "string",
    required: true,
    translatable: false,
    variant: "northstar",
  },
];

export const addValidationGroup = [
  {
    label: "Description",
    name: "description",
    key: "description",
    type: "string",
    required: true,
    translatable: true,
    variant: "northstar",
    hasPlaceholders: false,
  },
  {
    label: "Which question types does this validation group apply to?",
    name: "questionTypes",
    key: "questionTypes",
    type: "multiple-choice",
    required: true,
    translatable: false,
    variant: "northstar",
  },
];

export const languages = [
  { code: "en", label: "English" },
  { code: "sw", label: "Kiswahili" },
];

export const addValidationQuestion = [
  {
    label: "Expected user input",
    name: "expectedInput",
    key: "expectedInput",
    type: "string",
    required: true,
    translatable: false,
    variant: "northstar",
  },
  {
    label: "Error message",
    name: "errorMessage",
    key: "errorMessage",
    type: "string",
    required: true,
    translatable: true,
    variant: "northstar",
  },
];

/* Types of nodes supported by the menu builder */
export const nodeTypes = [
  { name: "main", id: 1 },
  { name: "branch", id: 2 },
  { name: "service", id: 4 },
  { name: "content", id: 3 },
];

/* Gets language name when given ISO Code */
export const getLanguage = (code) => {
  const language = languages.filter((lingo) => {
    return lingo.code === code;
  });
  return language.length > 0 ? language[0].label : "";
};

/* Default state before user is authenticated */
export const defaultAuthState = () => {
  return Object.freeze({
    isAuthenticated: false,
    principal: null,
    login: () => {},
    logout: () => {},
  });
};

/* default value for items to be fetched per page */
export const itemsPerPage = 15;
