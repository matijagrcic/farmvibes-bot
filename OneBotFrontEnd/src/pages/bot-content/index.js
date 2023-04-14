import React, { Suspense } from "react";
import { Redirect, Route, Switch } from "react-router-dom";

const Contents = React.lazy(() =>
  import(/* webpackChunkName: "menus" */ "./contents")
);

const BotContent = ({ route }) => (
  <Suspense fallback={<div className='loading' />}>
    <Switch>
      <Redirect exact from={`${route.path}/`} to={`${route.path}/list`} />
      <Route
        path={`${route.path}/list`}
        render={(props) => <Contents {...props} />}
      />
      <Redirect to='/error' />
    </Switch>
  </Suspense>
);
export default BotContent;
