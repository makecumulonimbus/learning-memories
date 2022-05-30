// import facebook from '../assets/img/icons/common/facebook.svg';
// import google from '../assets/img/icons/common/google.svg';
import welcome from '../assets/img/icons/common/welcome.svg'
import '../App.scss'
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
    Col
} from "reactstrap";

import React, { useCallback, useContext } from "react";
import { withRouter, Redirect } from "react-router";
import firebaseApp from "../auth/firebaseConfig";
// import { AuthContext } from "../auth/authentication";

const Login = ({ history }) => {
    const handleLogin = useCallback(
        async event => {
            event.preventDefault();
            const { email, password } = event.target.elements;
            try {
                await firebaseApp
                    .auth()
                    .signInWithEmailAndPassword(email.value, password.value);
                history.push("/home");
            } catch (error) {
                alert(error);
            }
        },
        [history]
    );

    // const { currentUser } = useContext(AuthContext);

    // if (currentUser) {
    //     return <Redirect to="/home" />;
    // }

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
                            <img className="welcome-logo" src={welcome} width="450px" />

                        </Col>
                        <Col className="mb-lg-auto" lg="5">
                            <div className="transform-perspective-right">
                                <Card className="bg-secondary shadow border-0">
                                    <CardHeader className="bg-white pb-5">
                                        <div className="text-center title-app-login">
                                            <span>Learning Memories</span>
                                        </div>
                                    </CardHeader>
                                    <CardBody className="px-lg-5 py-lg-5 card-body-custom">
                                        <Form role="form" onSubmit={handleLogin}>
                                            <FormGroup

                                            >
                                                <InputGroup className="input-group-alternative">
                                                    <InputGroupAddon addonType="prepend">
                                                        <InputGroupText>
                                                            <i className="ni ni-email-83" />
                                                        </InputGroupText>
                                                    </InputGroupAddon>
                                                    <Input
                                                        placeholder="Email"
                                                        type="email"
                                                        name="email"

                                                    />
                                                </InputGroup>
                                            </FormGroup>
                                            <FormGroup

                                            >
                                                <InputGroup className="input-group-alternative">
                                                    <InputGroupAddon addonType="prepend">
                                                        <InputGroupText>
                                                            <i className="ni ni-lock-circle-open" />
                                                        </InputGroupText>
                                                    </InputGroupAddon>
                                                    <Input
                                                        placeholder="Password"
                                                        type="password"
                                                        autoComplete="off"
                                                        name="password"

                                                    />
                                                </InputGroup>
                                            </FormGroup>
                                            <div className="custom-control custom-control-alternative custom-checkbox">
                                                <input
                                                    className="custom-control-input"
                                                    id="customCheckLogin2"
                                                    type="checkbox"
                                                   
                                                />
                                                <label
                                                    className="custom-control-label"
                                                    htmlFor="customCheckLogin2"
                                                >
                                                    <span>Remember me</span>
                                                </label>
                                            </div>
                                            <div className="text-center">
                                                <Button
                                                    className="my-4"
                                                    color="primary"
                                                    type="submit"
                                                >
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