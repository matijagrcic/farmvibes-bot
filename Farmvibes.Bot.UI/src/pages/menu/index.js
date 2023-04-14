import React, { Suspense } from "react";
import { Redirect, Route, Switch } from "react-router-dom";

const Menus = React.lazy(() =>
  import(/* webpackChunkName: "menus" */ "./menu")
);

const MenuDetails = React.memo(
  React.lazy(() => import(/* webpackChunkName: "menuDetails" */ "./details"))
);

const Menu = ({ route }) => (
  <Suspense fallback={<div className='loading' />}>
    <Switch>
      <Redirect exact from={`${route.path}/`} to={`${route.path}/list`} />
      <Route
        path={`${route.path}/list`}
        render={(props) => <Menus {...props} />}
      />
      <Route
        path={`${route.path}/details/:menuId`}
        render={(props) => <MenuDetails {...props} />}
      />
      <Redirect to='/error' />
    </Switch>
  </Suspense>
);
export default Menu;
