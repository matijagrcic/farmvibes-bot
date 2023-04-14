import React from "react";

const routes = {
  key: "home",
  name: "Dashboard",
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
      name: "Profile",
      isHidden: true,
    },
    {
      key: "content",
      name: "Content",
      icon: "visualizeApp",
      children: [
        {
          key: "services",
          name: "Services",
          icon: "CRMServices",
          component: React.lazy(() => import("./pages/services")),
        },
        {
          key: "bot-content",
          name: "Bot Content",
          icon: "TextDocument",
          component: React.lazy(() => import("./pages/bot-content")),
        },
        {
          key: "menus",
          name: "Menus",
          icon: "CollapseMenu",
          component: React.lazy(() => import("./pages/menu")),
        },
        {
          key: "bot-users",
          name: "Platform Users",
          icon: "People",
          component: React.lazy(() => import("./pages/bot-user")),
        },
      ],
    },
    {
      key: "mangement",
      name: "System Management",
      icon: "managementApp",
      children: [
        {
          key: "languages",
          name: "Languages",
          icon: "LocaleLanguage",
          component: React.lazy(() => import("./pages/languages")),
        },
        {
          key: "channels",
          name: "Channels",
          icon: "InternetSharing",
          component: React.lazy(() =>
            import("./pages/configurations/channels")
          ),
        },
        {
          key: "location-information",
          name: "Location Management",
          icon: "POI",
          children: [
            {
              key: "administrative-units",
              name: "Administrative Units",
              icon: "Nav2DMapView",
              component: React.lazy(() =>
                import("./pages/configurations/locations/administrativeUnits")
              ),
            },
            {
              key: "locations",
              name: "Locations",
              icon: "Nav2DMapView",
              component: React.lazy(() =>
                import("./pages/configurations/locations/locations")
              ),
            },
          ],
        },
        {
          key: "validations",
          name: "Validation Groups",
          icon: "TriggerApproval",
          component: React.lazy(() =>
            import("./pages/configurations/validations")
          ),
        },
      ],
    },
  ],
};

export default routes;
