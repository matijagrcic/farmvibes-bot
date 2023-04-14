import React, { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const Services = React.lazy(() =>
  import(/* webpackChunkName: "services" */ "./services")
);

const ServiceDetails = React.memo(
  React.lazy(() => import(/* webpackChunkName: "serviceDetails" */ "./details"))
);

const Service = ({ route }) => (
  <Suspense fallback={<div className="loading" />}>
    <Routes>
      <Route path={`/`} element={<Services />} />
      <Route path={`:serviceId`} element={<ServiceDetails />} />
      <Route element={<Navigate to="/error" />} />
    </Routes>
  </Suspense>
);
export default Service;
