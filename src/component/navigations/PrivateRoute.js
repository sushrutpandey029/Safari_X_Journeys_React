import React from "react";
import { Navigate } from "react-router-dom";
import { getUserData } from "../utils/storage";

const PrivateRoute = ({ children, allowedRoles }) => {
  const user = getUserData("safarix_user");
  const driver = getUserData("driver");
  const guide = getUserData("guide");

  let loggedRole = null;

  if (user) {
    loggedRole = "user";
  } else if (driver) {
    loggedRole = "driver";
  } else if (guide) {
    loggedRole = "guide";
  } else {
    return <Navigate to={"/"} replace />;
  }

  if (!allowedRoles.include(loggedRole)) {
    <Navigate to={"/"} replace />;
  }

  return children;
};
export default PrivateRoute;
