import React from "react";
import '../../App.scss';
import { Link } from "react-router-dom";
import Headroom from "headroom.js";
import {

    UncontrolledCollapse,
    DropdownMenu,
    DropdownItem,
    DropdownToggle,
    UncontrolledDropdown,

    NavbarBrand,
    Navbar,
    NavItem,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Nav,
    Container,
    Button,
    Row,
    Col,

} from "reactstrap";
import firebaseApp from '../../auth/firebaseConfig'



class NavbarApp extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        let headroom = new Headroom(document.getElementById("navbar-main"));
        // initialise
        headroom.init();

    }
    state = {
        collapseClasses: "",
        collapseOpen: false,
        modalOut: false

    };
    onExiting = () => {
        this.setState({
            collapseClasses: "collapsing-out"
        });
    };

    onExited = () => {
        this.setState({
            collapseClasses: ""
        });
    };
    toggleModalOut = () => {
        this.setState({
            modalOut: true
        })
    }
    cancelToggleOut = () => {
        this.setState({
            modalOut: false
        })
    }
    signOut = () => {
        this.setState({
            modalOut: false
        })
        firebaseApp.auth().signOut().then(() => {
            this.props.history.push("/login");
        })

    }
    render() {
        return (
            <>
                <header className="header-global">
                    <Navbar
                        className="navbar-main navbar-transparent navbar-light headroom"
                        expand="lg"
                        id="navbar-main"
                    >
                        <Container>
                            <NavbarBrand className="mr-lg-5" to="/home" tag={Link}>

                                <i className="fa fa-home logo-text" />
                            </NavbarBrand>
                            <button className="navbar-toggler" id="navbar_global">
                                <span className="navbar-toggler-icon" />
                            </button>
                            <UncontrolledCollapse
                                toggler="#navbar_global"
                                navbar
                                className={this.state.collapseClasses}
                                onExiting={this.onExiting}
                                onExited={this.onExited}
                            >
                                <div className="navbar-collapse-header">
                                    <Row>
                                        <Col className="collapse-brand" xs="6">
                                            <Link to="/home">
                                                <i className="fa fa-home logo-text" />
                                            </Link>
                                        </Col>
                                        <Col className="collapse-close" xs="6">
                                            <button className="navbar-toggler" id="navbar_global">
                                                <span />
                                                <span />
                                            </button>
                                        </Col>
                                    </Row>
                                </div>
                                <Nav className="navbar-nav-hover align-items-lg-center" navbar>
                                    <UncontrolledDropdown nav>
                                        <DropdownToggle nav>
                                            <i className="ni ni-collection d-lg-none mr-1" />
                                            <span className="nav-link-inner--text">Menu</span>
                                        </DropdownToggle>
                                        <DropdownMenu>

                                            <DropdownItem to="/profile" tag={Link}>
                                                <i className="ni ni-circle-08" />Profile
                                            </DropdownItem>
                                            <DropdownItem to="/change-log" tag={Link} >
                                                <i className="ni ni-bell-55" /> Change-log
                                            </DropdownItem>

                                        </DropdownMenu>
                                    </UncontrolledDropdown>
                                </Nav>
                                <Nav className="align-items-lg-center ml-lg-auto" navbar>
                                    <NavItem className="d-lg-block ml-lg-4 exit-nav pt-2 pb-2" onClick={this.toggleModalOut}>
                                        <span className="exit" ><i className="fa fa-sign-out" /></span>
                                        <span className="nav-link-inner--text d-lg-none ml-1">sign out</span>
                                    </NavItem>
                                </Nav>
                            </UncontrolledCollapse>
                        </Container>
                    </Navbar>
                    <Modal isOpen={this.state.modalOut} toggle={this.toggleModalOut} className="modal-app " >
                        <ModalHeader toggle={this.cancelToggleOut}>SIGN OUT</ModalHeader>
                        <ModalBody>
                            <div className="text-center text-delete"> Are you want to sign out ?</div>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={this.signOut}>Yes</Button>{' '}
                            <Button color="secondary" onClick={this.cancelToggleOut}>No</Button>
                        </ModalFooter>
                    </Modal>
                </header>

            </>
        );
    }
}
export default NavbarApp;