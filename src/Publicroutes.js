import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";
import { AuthContext } from "./auth/authentication";

const PublicRoute = ({ component: RouteComponent, ...rest }) => {
  const { currentUser } = useContext(AuthContext);
  return (
    <Route
      {...rest}
      render={routeProps =>
        currentUser ? (
          <Redirect to={"/home"} />
        ) : (
          <RouteComponent {...routeProps} />
        )
      }
    />
  );
};

export default PublicRoute;