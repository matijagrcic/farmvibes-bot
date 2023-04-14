import { capitaliseSentense } from "helpers/utils";
import React from "react";
import { FormattedMessage } from "react-intl";

const routes = {
  key: "home",
  name: <FormattedMessage id="general.nav.dashboard" />,
  icon: "Home",
  path: "/",
  component: React.lazy(() => import("./pages/dashboard")),
  children: [
    {
      key: "login",
      name: "login",
      isPublic: true,
      isHidden: true,
      component: React.lazy(() => import("./pages/login")),
    },
    {
      key: "profile",
      name: <FormattedMessage id="general.nav.profile" />,
      isHidden: true,
    },
    {
      key: "content",
      name: <FormattedMessage id="general.nav.sections" />,
      icon: "visualizeApp",
      children: [
        {
          key: "services",
          name: (
            <FormattedMessage id="service" values={{ count: 2 }}>
              {(txt) => capitaliseSentense(txt[0])}
            </FormattedMessage>
          ),
          icon: "CRMServices",
          component: React.lazy(() => import("./pages/services")),
        },
        {
          key: "content-library",
          name: <FormattedMessage id="content.page.title" />,
          icon: "TextDocument",
          component: React.lazy(() => import("./pages/content-library")),
        },
        {
          key: "menus",
          name: (
            <FormattedMessage id="menu" values={{ count: 2 }}>
              {(txt) => capitaliseSentense(txt[0])}
            </FormattedMessage>
          ),
          icon: "CollapseMenu",
          component: React.lazy(() => import("./pages/menu")),
        },
        {
          key: "bot-users",
          name: (
            <FormattedMessage id="user" values={{ count: 2 }}>
              {(txt) => capitaliseSentense(txt[0])}
            </FormattedMessage>
          ),
          icon: "People",
          component: React.lazy(() => import("./pages/bot-user")),
        },
      ],
    },
    {
      key: "mangement",
      name: <FormattedMessage id="general.nav.systemmanagement" />,
      icon: "managementApp",
      children: [
        {
          key: "languages",
          name: (
            <FormattedMessage id="language" values={{ count: 2 }}>
              {(txt) => capitaliseSentense(txt[0])}
            </FormattedMessage>
          ),
          icon: "LocaleLanguage",
          component: React.lazy(() => import("./pages/languages")),
        },
        {
          key: "channels",
          name: (
            <FormattedMessage id="channels" values={{ count: 2 }}>
              {(txt) => capitaliseSentense(txt[0])}
            </FormattedMessage>
          ),
          icon: "InternetSharing",
          component: React.lazy(() =>
            import("./pages/configurations/channels")
          ),
        },
        {
          key: "admin_users",
          name: (
            <FormattedMessage id="user.admin" values={{ count: 2 }}>
              {(txt) => capitaliseSentense(txt[0])}
            </FormattedMessage>
          ),
          icon: "Teamwork",
          component: React.lazy(() =>
            import("./pages/configurations/admin-users")
          ),
        },
      ],
    },
  ],
};

export default routes;
