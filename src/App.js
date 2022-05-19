import React from 'react'
import './App.scss';
import { Helmet } from "react-helmet";
import { AuthProvider } from './auth/authentication'
import Login from "./views/login";
import HomePage from "./views/home"
import PrivateRoute from './Privateroutes'
import PublicRoute from './Publicroutes'
import Topic from './views/topic'
import Content from './views/content'
import { BrowserRouter as Router, Redirect, Route } from "react-router-dom";
import Profile from './views/profile';
import ChangeLog from './views/change-log'
import { TinyButton as ScrollUpButton } from "react-scroll-up-button";
import 'react-notifications/lib/notifications.css';

class App extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <>
        <ScrollUpButton />
        <Helmet>
          <title>Learning Memories</title>
        </Helmet>
        <AuthProvider>
          <Router >
            <Redirect to="/login" />
            <PublicRoute exact path="/login" component={Login} />
            <PrivateRoute exact path="/home" component={HomePage} />
            <PrivateRoute exact path="/topic/:name" component={Topic} />
            <PrivateRoute exact path="/topic/:name/:id" component={Content} />
            <PrivateRoute exact path="/profile" component={Profile} />
            <PrivateRoute exact path="/change-log" component={ChangeLog} />

          </Router>
        </AuthProvider>
      </>
    );
  }
}
export default App;
