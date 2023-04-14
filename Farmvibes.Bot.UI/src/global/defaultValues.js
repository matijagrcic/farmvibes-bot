import { SharedColors } from "@fluentui/theme";

export const backendPath = process.env.REACT_APP_API_ENDPOINT;

export const translationsDelay = process.env.REACT_APP_TRANSLATIONS_DELAY;

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
export const itemsPerPage = 10;
export const ROUTER_BASE_URL = "/admin";
