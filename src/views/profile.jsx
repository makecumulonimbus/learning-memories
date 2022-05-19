import React from "react";
import '../App.scss';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import {
    Button,
    FormGroup,
    Form,
    Label,
    Input,
    Row,
    Col,
    Container,
    Card,
    Modal,
    ModalHeader, ModalBody, ModalFooter,
    CardBody,
} from "reactstrap";
import NavbarApp from '../components/Navbars/navbar'
import LoadingApp from '../components/loading'
import firebaseApp from '../auth/firebaseConfig'

class Profile extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        this.loadData()
    }
    componentWillUnmount() {
        localStorage.setItem("currentPage", 0)
        localStorage.setItem("activePage", 1)
    }
    state = {
        loading: false,
        modal: false,
        mode: 'EDIT',
        iconTabs: 1,
        preview: '',
        plainTabs: 1,
        profileData: {},
        options: [
            { value: 'Male', label: 'MALE' },
            { value: 'Female', label: 'FEMALE' }
        ],
        form: {
            name: '',
            gender: '',
            email: '',
            phone: ''
        }
    }
    loadData = () => {
        this.setState({
            loading: true
        })
        firebaseApp.firestore().doc('profile/cSopSPOLPRvX5JMrC3Cl').get().then((document) => {
            this.setState({
                loading: false,
                preview: document.data().image,
                profileData: document.data(),
                form: document.data(),
            })
        }).catch(err => {
            this.setState({
                loading: false
            })
            console.log(err);
        })
    }
    editItem = () => {
        this.setState({
            modal: true
        })
    }
    submit = (e) => {
        e.preventDefault()
        this.setState({
            modal: false,
            loading: true
        })
        var setData = {
            image: this.state.preview,
            name: (this.state.form.name),
            email: (this.state.form.email),
            gender: (this.state.form.gender),
            phone: (this.state.form.phone),
        }
        firebaseApp.firestore().doc('profile/cSopSPOLPRvX5JMrC3Cl').update(setData).then(() => {
            NotificationManager.success('', 'SUCCESS');
            this.loadData()
        }).catch(err => {
            NotificationManager.error('', 'ERROR');
            this.setState({
                loading: false
            })
        })
    }
    changForm = (formType, e) => {
        if (formType == 'name') {
            this.setState(prevState => ({
                form: {
                    ...prevState.form,
                    name: e.target.value
                }
            }))
        } else if (formType == 'email') {
            this.setState(prevState => ({
                form: {
                    ...prevState.form,
                    email: e.target.value
                }
            }))
        }
        else if (formType == 'gender') {
            this.setState(prevState => ({
                form: {
                    ...prevState.form,
                    gender: e.target.value
                }
            }))
        }
        else if (formType == 'phone') {
            this.setState(prevState => ({
                form: {
                    ...prevState.form,
                    phone: e.target.value
                }
            }))
        } else if (formType == 'image') {
            console.log(e.target.files[0]);
            var imageItem = e.target.files[0];
            var reader = new FileReader();
            reader.readAsDataURL(imageItem);

            reader.onloadend = (e) => {
                this.setState({
                    preview: reader.result
                })
            }

        }
    }
    uploadFile = () => {
        document.querySelector('#fileButton').click();
    }
    toggleModal = () => {

    }
    cancelToggle = () => {
        this.setState({
            modal: false,
        })
    }
    render() {
        return <>
            <NavbarApp {...this.props}/>
            <div className="position-relative">
                <section className="section section-hero section-shaped">
                    <div className="shape shape-style-1 shape-default">
                        <span className="span-150" />
                        <span className="span-50" />
                        <span className="span-50" />
                        <span className="span-75" />
                        <span className="span-100" />
                        <span className="span-75" />
                        <span className="span-50" />
                        <span className="span-100" />
                        <span className="span-50" />
                        <span className="span-100" />
                    </div>

                    {
                        this.state.loading ? <LoadingApp type={'bars'} color={'white'} /> :
                            <Container className="shape-container d-flex align-items-center py-lg">
                                <div className="btn-add">
                                    <Button
                                        className="btn-neutral btn-icon"
                                        color="default"
                                        onClick={this.editItem}
                                        target="_blank"
                                    >

                                        <span className="nav-link-inner--text" >
                                            EDIT
                                             </span>
                                    </Button>
                                </div>
                                <div className="col px-0">
                                    <div className="title-name">Profile <span className="mr-4"></span></div>
                                    <Card className="p-4">
                                        <Row>
                                            <Col md="4 text-center">
                                                <img className="preview-profile mb-2" width="130px" src={this.state.profileData.image ? this.state.profileData.image : 'https://www.spu.ac.th/uploads/webfac/f000000/contents/20180312145944OSQuw1m.jpg'}></img>

                                            </Col>
                                            <Col md="8 mt-4">
                                                <div className="mb-2"><span className="bold">Name :</span> {this.state.profileData.name}</div>
                                                <div className="mb-2"><span className="bold">Email : </span>{this.state.profileData.email}</div>
                                                <div className="mb-2"><span className="bold">Gender : </span>{this.state.profileData.gender}</div>
                                                <div className="mb-2"><span className="bold">Phone : </span>{this.state.profileData.phone}</div>
                                            </Col>
                                        </Row>

                                    </Card>
                                </div>
                            </Container>
                    }
                    <div className="separator separator-bottom separator-skew zindex-100">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            preserveAspectRatio="none"
                            version="1.1"
                            viewBox="0 0 2560 100"
                            x="0"
                            y="0"
                        >
                            <polygon
                                className="fill-white"
                                points="2560 0 2560 100 0 100"
                            />
                        </svg>
                    </div>
                </section>
                <Modal isOpen={this.state.modal} toggle={this.toggleModal} className="modal-app">
                    <Form onSubmit={(e) => this.submit(e)}>
                        <ModalHeader toggle={this.cancelToggle}>{this.state.mode}</ModalHeader>
                        <ModalBody>
                            <Row>
                                <Col md="12">
                                    <FormGroup>
                                        <Label for="Image">Image</Label>
                                        <div>
                                            <img className="preview" width="130px" src={this.state.preview ? this.state.preview : 'https://www.spu.ac.th/uploads/webfac/f000000/contents/20180312145944OSQuw1m.jpg'}></img>
                                            <Button onClick={() => this.uploadFile()} className="upload-btn-topic" size="sm" color="primary">
                                                Upload
                                                        </Button>

                                            <Input type="file" id='fileButton' name="file" hidden onChange={e => this.changForm('image', e)} />

                                        </div>
                                    </FormGroup>
                                </Col>
                                <Col md="6">
                                    <FormGroup>
                                        <Label for="Image">Name</Label>
                                        <Input type="text" name="name" id="examplename" required placeholder="enter name" value={this.state.form.name} onChange={e => this.changForm('name', e)} autocomplete="new-password"/>
                                    </FormGroup>
                                </Col>
                                <Col md="6">
                                    <FormGroup>
                                        <Label for="Image">Email</Label>
                                        <Input type="text" name="email" id="exampleEmail" placeholder="enter email" value={this.state.form.email} onChange={e => this.changForm('email', e)} disabled/>
                                    </FormGroup>
                                </Col>
                                <Col md="6">
                                    <FormGroup>
                                        <Label for="Name">Gender</Label>
                                        <Input type="select" name="select" id="exampleSelect" value={this.state.form.gender} onChange={e => this.changForm('gender', e)} >
                                            {this.state.options.map((element, index) => {
                                                return <option key={index}>{element.value}</option>
                                            })}
                                        </Input>
                                    </FormGroup>
                                </Col>
                                <Col md="6">
                                    <FormGroup>
                                        <Label for="Image">Phone</Label>
                                        <Input type="text" name="phome" id="exampleEmail" placeholder="enter phone" value={this.state.form.phone} onChange={e => this.changForm('phone', e)} autocomplete="new-password"/>
                                    </FormGroup>
                                </Col>
                            </Row>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" type="submit">Save</Button>{' '}
                            <Button color="secondary" onClick={this.cancelToggle}>Cancel</Button>
                        </ModalFooter>
                    </Form>
                </Modal>
                <NotificationContainer />
            </div>
        </>
    }
}

export default Profile;