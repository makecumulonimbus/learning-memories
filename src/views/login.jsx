import React, { useCallback } from "react";
import { firebaseApp } from "../auth/firebaseConfig";
import login from "../assets/img/login.svg";
import logo from "../assets/img/logo.png";
import { NotificationManager } from "react-notifications";
import { withRouter } from "react-router";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Container,
  Row,
  Col,
} from "reactstrap";
import "../App.scss";

const Login = ({ history }) => {
  const handleLogin = useCallback(
    async (event) => {
      event.preventDefault();
      const { email, password } = event.target.elements;
      try {
        await firebaseApp
          .auth()
          .signInWithEmailAndPassword(email.value, password.value)
          .then((res) => {
            NotificationManager.success("", "WELCOME", 3000);
            history.push("/home");
          });
      } catch (error) {
        NotificationManager.error(error.message, "ERROR", 3000);
      }
    },
    [history]
  );

  return (
    <>
      <section className="section-custom section-shaped">
        <div className="shape shape-style-1 shape-default">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <Container className="py-md">
          <Row className="row-grid justify-content-between align-items-center">
            <Col lg="6">
              <img className="login-img" src={login} width="450px" alt="" />
            </Col>
            <Col className="mb-lg-auto" lg="5">
              <div className="transform-perspective-right">
                <Card className="bg-secondary shadow border-0">
                  <CardHeader className="bg-white">
                    <div className="text-center title-app-login">
                      <img className="logo" src={logo} width="80px" alt="" />
                      <span className="pl-2">Learning Memories</span>
                    </div>
                  </CardHeader>
                  <CardBody className="px-5 py-5 card-body-custom">
                    <Form role="form" onSubmit={handleLogin}>
                      <FormGroup>
                        <InputGroup className="input-group-alternative">
                          <InputGroupAddon addonType="prepend">
                            <InputGroupText>
                              <i className="ni ni-email-83" />
                            </InputGroupText>
                          </InputGroupAddon>
                          <Input
                            className="form-control-alternative"
                            placeholder="Email"
                            type="email"
                            autoComplete="off"
                            name="email"
                          />
                        </InputGroup>
                      </FormGroup>
                      <FormGroup>
                        <InputGroup className="input-group-alternative">
                          <InputGroupAddon addonType="prepend">
                            <InputGroupText>
                              <i className="ni ni-lock-circle-open" />
                            </InputGroupText>
                          </InputGroupAddon>
                          <Input
                            className="form-control-alternative"
                            placeholder="Password"
                            type="password"
                            autoComplete="off"
                            name="password"
                          />
                        </InputGroup>
                      </FormGroup>
                      <div className="text-center">
                        <Button className="my-4" color="primary" type="submit">
                          Sign in
                        </Button>
                      </div>
                    </Form>
                  </CardBody>
                </Card>
              </div>
            </Col>
          </Row>
        </Container>
        <div className="separator separator-bottom separator-skew">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            version="1.1"
            viewBox="0 0 2560 100"
            x="0"
            y="0"
          >
            <polygon className="fill-white" points="2560 0 2560 100 0 100" />
          </svg>
        </div>
      </section>
    </>
  );
};

export default withRouter(Login);
