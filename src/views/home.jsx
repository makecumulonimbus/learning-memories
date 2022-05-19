import React from "react";
import '../App.scss'
import {
    Button,
    FormGroup,
    Form,
    Label,
    Input,
    Container,
    Card,
    Modal,
    ModalHeader, ModalBody, ModalFooter,
    Row,
    Col,
} from "reactstrap";
import firebaseApp from '../auth/firebaseConfig'
import NavbarApp from '../components/Navbars/navbar'
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import LoadingApp from '../components/loading';
import { NotificationContainer, NotificationManager } from 'react-notifications';

class HomePage extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        this.loadData()
        localStorage.setItem("currentPage", 0)
        localStorage.setItem("activePage", 1)
    }
    state = {
        loading: false,
        modal: false,
        mode: '',
        datas: [],
        dataSelected: {},
        preview: '',
        form: {
            image: null,
            name: ''
        }
    };
    loadData = () => {
        this.setState({
            loading: true
        })
        firebaseApp.firestore().collection('learningApp').get().then(document => {
            var setData = []
            document.docs.forEach(doc => {
                var element = {
                    id: doc.id,
                    image: doc.data().image,
                    name: doc.data().name,
                }
                setData.push(element)
            })
            this.setState({
                datas: setData,
                loading: false
            })
        }).catch(err => {
            console.log(err);
            this.setState({
                loading: false
            })
        })
    }

    toggleModal = (mode) => {
        if (mode == 'ADD') {
            this.setState({
                form: {
                    name: '',
                    image: null
                },
                mode: 'ADD',
                modal: true
            })
        } else if (mode == 'EDIT') {
            this.setState({
                mode: 'EDIT',
                modal: true
            })
        }

    }
    cancelToggle = () => {
        this.setState({
            modal: false,
            preview: '',
            form: {
                name: '',
                image: null
            }
        })
    }
    addItem = () => {
        this.toggleModal('ADD')
    }
    editItem = (item) => {
        this.setState({
            preview: item.image,
            form: {
                name: item.name,
                image: item.image
            },
            dataSelected: item
        })
        this.toggleModal('EDIT')
    }


    toggleModalDelete = (item) => {
        this.setState({
            dataSelected: item,
            mode: 'DELETE',
            modalDelete: true
        })
    }
    deleteData = () => {
        this.setState({
            loading: true
        })
        this.cancelToggleDelete()
        this.deleteOldImage()
        firebaseApp.firestore().doc('learningApp/' + this.state.dataSelected.id).delete().then(() => {
            NotificationManager.success('', 'SUCCESS');
            this.loadData()

        }).catch(err => {
            console.log(err);
            NotificationManager.error('', 'ERROR');
            this.setState({
                loading: false
            })
        })
    }
    cancelToggleDelete = () => {
        this.setState({
            modalDelete: false,
        })
    }
    submit = (e) => {
        e.preventDefault()
        this.cancelToggle()
        this.setState({
            loading: true
        })
        var data = this.state.form
        if (this.state.mode == 'ADD') {
            var timestamp = new Date();
            const filename = timestamp.valueOf().toString(); //สุ่มชื่อไฟล์
            if (data.image) {
                firebaseApp.storage().ref("imagelearningApp").child(filename).put(data.image).then(response => {
                    response.ref.getDownloadURL().then(photoURL => {
                        data.image = photoURL
                        this.addData(data)
                    })
                })
            } else {
                this.addData(data)
            }
        } else if (this.state.mode == 'EDIT') {
            var timestamp = new Date();
            const filename = timestamp.valueOf().toString();
            if (data.image != this.state.dataSelected.image) {
                this.deleteOldImage()
                firebaseApp.storage().ref("imagelearningApp").child(filename).put(data.image).then(response => {
                    response.ref.getDownloadURL().then(photoURL => {
                        data.image = photoURL
                        this.editData(data)
                    })
                })
            } else {
                this.editData(data)
            }
        }

    }
    deleteOldImage = () => {
        var oldImage = this.state.dataSelected.image
        if (oldImage) {
            firebaseApp.storage().refFromURL(oldImage).delete();
        }
    }

    addData = (data) => {
        firebaseApp.firestore().collection('learningApp').add(data).then(() => {
            NotificationManager.success('', 'SUCCESS');
            this.loadData()
        }).catch(err => {
            console.log(err);
            NotificationManager.error('', 'ERROR');
            this.setState({
                loading: false
            })
        })
    }
    editData = (data) => {
        firebaseApp.firestore().doc('learningApp/' + this.state.dataSelected.id).update(data).then(() => {
            NotificationManager.success('', 'SUCCESS');
            this.loadData()
        }).catch(err => {
            console.log(err);
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
        } else if (formType == 'image') {
            var imageItem = e.target.files[0];
            var reader = new FileReader();
            reader.readAsDataURL(imageItem);

            reader.onloadend = (e) => {
                this.setState({
                    preview: reader.result
                })

            }

            this.setState(prevState => ({
                form: {
                    ...prevState.form,
                    image: imageItem
                }
            }))

        }
    }
    goTopic = (name) => {
        this.props.history.push('/topic/' + name)
    }

    uploadFile = () => {
        document.querySelector('#fileButton').click();
    }

    render() {
        return (
            <>
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
                                            onClick={this.addItem}
                                            target="_blank"
                                        >

                                            <span className="nav-link-inner--text" >
                                                ADD NEW
                                             </span>
                                        </Button>
                                    </div>
                                    <div className="col px-0">
                                        <Row className="align-items-center justify-content-center">

                                            {this.state.datas.map((ele, index) => {
                                                return <Col className="text-center" lg="3" md="4" sm="6" xs="6" key={index}>


                                                    <ContextMenuTrigger id={ele.name}>
                                                        <Card className="mb-3 p-4 card-app" onClick={() => this.goTopic(ele.name)} >


                                                            <div className="img-app">
                                                                <img className="app-image" src={ele.image ? ele.image : 'https://www.spu.ac.th/uploads/webfac/f000000/contents/20180312145944OSQuw1m.jpg'}></img>
                                                            </div>
                                                        </Card>
                                                    </ContextMenuTrigger>

                                                    <ContextMenu id={ele.name}>
                                                        <MenuItem onClick={() => this.editItem(ele)}>
                                                            <i className="fa fa-edit icons"></i> EDIT
                                                     </MenuItem>
                                                        <MenuItem onClick={() => this.toggleModalDelete(ele)}>
                                                            <i className="fa fa-trash icons"></i> DELETE
                                                    </MenuItem>
                                                    </ContextMenu>



                                                </Col>
                                            })}

                                        </Row>
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

                                <FormGroup>
                                    <Label for="Image">Image</Label>
                                    <div>
                                        <img className="preview" width="130px" src={this.state.preview ? this.state.preview : 'https://www.spu.ac.th/uploads/webfac/f000000/contents/20180312145944OSQuw1m.jpg'}></img>
                                        <Button onClick={this.uploadFile} className="upload-btn" size="sm" color="primary">
                                            Upload
                                    </Button>

                                        <Input type="file" id="fileButton" name="file" hidden onChange={e => this.changForm('image', e)} />
                                        <span className="img-size-text">Imge size 700x700 </span>
                                    </div>
                                </FormGroup>
                                <FormGroup>
                                    <Label for="Name">Name</Label>
                                    <Input type="text" name="nameApp" id="exampleEmail" autoComplete="off" required placeholder="app name" value={this.state.form.name} onChange={e => this.changForm('name', e)} autocomplete="new-password"/>
                                </FormGroup>

                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" type="submit">Save</Button>{' '}
                                <Button color="secondary" onClick={this.cancelToggle}>Cancel</Button>
                            </ModalFooter>
                        </Form>
                    </Modal>

                    <Modal isOpen={this.state.modalDelete} toggle={this.toggleModalDelete} className="modal-app">
                        <ModalHeader toggle={this.cancelToggleDelete}>{this.state.mode}</ModalHeader>
                        <ModalBody>
                            <div className="text-center text-delete"> Are you want to delete this Item ?</div>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={this.deleteData}>delete</Button>{' '}
                            <Button color="secondary" onClick={this.cancelToggleDelete}>Cancel</Button>
                        </ModalFooter>
                    </Modal>
                    <NotificationContainer />
                </div>
            </>
        );
    }
}

export default HomePage;