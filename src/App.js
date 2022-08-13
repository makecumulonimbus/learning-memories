import ChangeLog from "./views/change-log";
import Content from "./views/content";
import Dashboard from './views/dashboard'
import HomePage from "./views/home";
import Login from "./views/login";
import React from "react";
import Topic from "./views/topic";
import { AuthContextProvider, useAuthState } from "./auth/authentication";
import { Helmet } from "react-helmet";
import { NotificationContainer } from "react-notifications";
import { TinyButton as ScrollUpButton } from "react-scroll-up-button";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import "react-notifications/lib/notifications.css";

const AuthenticatedRoute = ({ component: Page, ...props }) => {
  const { isAuthenticated } = useAuthState();
  return (
    <Route
      {...props}
      render={(routeProps) =>
        isAuthenticated ? <Page {...routeProps} /> : <Redirect to="/login" />
      }
    />
  );
};

const UnauthenticatedRoute = ({ component: Page, ...props }) => {
  const { isAuthenticated } = useAuthState();
  return (
    <Route
      {...props}
      render={(routeProps) =>
        !isAuthenticated ? <Page {...routeProps} /> : <Redirect to="/home" />
      }
    />
  );
};

function App() {
  return (
    <>
      <ScrollUpButton />
      <NotificationContainer />
      <Helmet>
        <title>Learning Memories</title>
      </Helmet>
      <AuthContextProvider>
        <Router>
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>
          <AuthenticatedRoute exact path="/home" component={HomePage} />
          <AuthenticatedRoute exact path="/topic/:name" component={Topic} />
          
          <AuthenticatedRoute
            exact
            path="/topic/:name/:id"
            component={Content}
          />  <AuthenticatedRoute exact path="/dashboard" component={Dashboard} />
          <AuthenticatedRoute exact path="/change-log" component={ChangeLog} />
          <UnauthenticatedRoute exact path="/login" component={Login} />
        </Router>
      </AuthContextProvider>
    </>
  );
}

export default App;
