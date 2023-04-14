import React, { Suspense } from "react";
import { Redirect, Route, Switch } from "react-router-dom";

const AdministrativeUnits = React.lazy(() =>
  import(/* webpackChunkName: "menus" */ "./menu")
);

const Locations = React.lazy(() =>
  import(/* webpackChunkName: "menus" */ "./menu")
);

// const MenuDetails = React.memo(React.lazy(() => import(/* webpackChunkName: "menuDetails" */ './details')));

const Location = ({ route }) => (
  <Suspense fallback={<div className='loading' />}>
    <Switch>
      <Redirect
        exact
        from={`${route.path}/`}
        to={`${route.path}/administrative-units`}
      />
      <Route
        path={`${route.path}/administrative-units`}
        render={(props) => <AdministrativeUnits {...props} />}
      />
      <Route
        path={`${route.path}/locations`}
        render={(props) => <Locations {...props} />}
      />
      <Redirect to='/error' />
    </Switch>
  </Suspense>
);
export default Location;
