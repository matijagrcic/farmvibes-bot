import React, { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const Contents = React.lazy(() =>
  import(/* webpackChunkName: "menus" */ "./contents")
);

const BotContent = ({ route }) => (
  <Suspense fallback={<div className="loading" />}>
    <Routes>
      <Route path={`/`} element={<Contents />} />
      <Route element={<Navigate to="/error" />} />
    </Routes>
  </Suspense>
);
export default BotContent;
