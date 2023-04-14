import React, { Suspense } from "react";
import { Redirect, Route, Switch } from "react-router-dom";

const Services = React.lazy(() =>
  import(/* webpackChunkName: "services" */ "./services")
);

const ServiceDetails = React.memo(
  React.lazy(() => import(/* webpackChunkName: "serviceDetails" */ "./details"))
);

const Service = ({ route }) => (
  <Suspense fallback={<div className='loading' />}>
    <Switch>
      <Redirect exact from={`${route.path}/`} to={`${route.path}/list`} />
      <Route
        path={`${route.path}/list`}
        render={(props) => <Services {...props} />}
      />
      <Route
        path={`${route.path}/details/:serviceId`}
        render={(props) => <ServiceDetails {...props} />}
      />
      <Redirect to='/error' />
    </Switch>
  </Suspense>
);
export default Service;
