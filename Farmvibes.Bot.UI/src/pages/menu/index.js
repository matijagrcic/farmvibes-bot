import React, { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const Menus = React.lazy(() =>
  import(/* webpackChunkName: "menus" */ "./menu")
);

const MenuDetails = React.memo(
  React.lazy(() => import(/* webpackChunkName: "menuDetails" */ "./details"))
);

const Menu = ({ route }) => (
  <Suspense fallback={<div className="loading" />}>
    <Routes>
      <Route path={`/`} element={<Menus />} />
      <Route path={`:menuId`} element={<MenuDetails />} />
      <Route element={<Navigate to="/error" />} />
    </Routes>
  </Suspense>
);
export default Menu;
