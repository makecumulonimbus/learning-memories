import React from "react";
import '../App.scss';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
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
} from "reactstrap";
import moment from 'moment'
import firebaseApp from '../auth/firebaseConfig'
import NavbarApp from '../components/Navbars/navbar'
import LoadingApp from '../components/loading'
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { NotificationContainer, NotificationManager } from 'react-notifications';

class Content extends React.Component {
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
    modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, false] }],
            ['bold', 'italic', 'underline', 'strike',],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link',],
            ['clean']
        ],
    }

    state = {
        loading: false,
        paramsURL: this.props.match.params.name,
        paramsID: this.props.match.params.id,
        modal: false,
        mode: '',
        dataSelected: {},
        datas: {
            topic: '',
            type: '',
            version: '',
            content: []
        },

        form: {
            topic: '',
            type: 'how-to',
            version: ''
        },
        formArray: [
            {
                detail: '',
                preview: '',
                filename: '',
                code: ''
            }
        ],
        options: [
            { value: 'how-to', label: 'How-to' },
            { value: 'bug', label: 'Bug' },
            { value: 'begin', label: 'Begin' },
            { value: 'recommand', label: 'Recommand' },
            { value: 'knowledge', label: 'Knowledge' },
            { value: 'auth', label: 'Auth' }
        ]
    };
    loadData = () => {
        this.setState({
            loading: true
        })
        firebaseApp.firestore().doc(this.state.paramsURL + '/' + this.state.paramsID).get().then(doc => {
            var setData = {
                id: doc.id,
                topic: doc.data().topic,
                type: doc.data().type,
                version: doc.data().version ? doc.data().version : '',
                content: doc.data().content ? doc.data().content : [],
                createAt: doc.data().createAt ? this.formatDate(doc.data().createAt) : '',
                updateAt: doc.data().updateAt ? this.formatDate(doc.data().updateAt) : ''
            }
            this.setState({
                loading: false,
                datas: setData, 
            })
        })

    }
    formatDate = (date) => {
        var time = date.toDate();
        var formatTimeShow = moment(time).format("DD-MM-YYYY HH:mm");
        return formatTimeShow;
    }

    submit = (e) => {
        e.preventDefault()
        this.cancelToggle()
        this.setState({
            loading: true
        })
        var data = this.state.form
        var dataForm = this.state.formArray
        var newForm = {
            topic: data.topic,
            type: data.type,
            version: data.version,
            content: dataForm,
        }
        if (this.state.mode == 'EDIT') {
            newForm.updateAt = new Date()
            this.editData(newForm)
        }

    }
    toggleModal = (mode) => {
        if (mode == 'EDIT') {
            this.setState({
                mode: 'EDIT',
                modal: true
            })
        }

    }
    cancelToggle = () => {
        this.setState({
            modal: false,
            form: {
                topic: '',
                type: 'how-to',
                version: ''
            },
            formArray: [
                {
                    detail: '',
                    preview: '',
                    filename: '',
                    code: ''
                }
            ]
        })
    }
    editItem = (item) => {
      
        var setForm = []
        item.content.forEach(ele => {
            var dataSet = {
                code: ele.code,
                detail: ele.detail,
                filename: ele.filename,
                image: ele.image,
                preview: ele.image,
            }
            setForm.push(dataSet)
        })

        this.setState({
            form: {
                topic: this.state.datas.topic,
                type: this.state.datas.type,
                version: this.state.datas.version
            },
            formArray: setForm,
            dataSelected: item,
        })

        this.toggleModal('EDIT')
    }
    editData = (data) => {
        var item = [];
        data.content.forEach((ele) => {
            if (typeof ele.image === "object") {
                var imageData = this.uploadImageAsPromise(ele.image);
                item.push(imageData);
            } else {
                item.push(ele.image ? ele.image : '');
            }
        });

        Promise.all(item).then((values) => {
            this.state.dataSelected.content.forEach((ele, index) => {
                if (ele.image != values[index] && ele.image != "") {
                    this.deleteOldImage(ele.image);
                }
            });

            var newitem = [];
            data.content.forEach((ele, index) => {
                var setMoreData = {
                    image: values[index],
                    detail: ele.detail == "<p><br></p>" ? "" : ele.detail,
                    code: ele.code,
                    filename: ele.filename,
                };
                newitem.push(setMoreData);
            });

            var setData = {
                topic: data.topic,
                type: data.type,
                updateAt: data.updateAt,
                version: data.version,
                content: newitem

            }

            firebaseApp.firestore().doc(this.state.paramsURL + '/' + this.state.dataSelected.id).update(setData).then(() => {
                NotificationManager.success('', 'SUCCESS');
                this.loadData()
            }).catch(err => {
                console.log(err);
                NotificationManager.error('', 'ERROR');
                this.setState({
                    loading: false
                })
            })
        })
       
    }
    deleteOldImage(img) {
        firebaseApp.storage().refFromURL(img).delete();
    }
    changForm = (formType, e) => {
        if (formType == 'topic') {
            this.setState(prevState => ({
                form: {
                    ...prevState.form,
                    topic: e.target.value
                }
            }))
        } else if (formType == 'type') {
            this.setState(prevState => ({
                form: {
                    ...prevState.form,
                    type: e.target.value
                }
            }))
        }
        else if (formType == 'version') {
            this.setState(prevState => ({
                form: {
                    ...prevState.form,
                    version: e.target.value
                }
            }))
        }
    }
    changFormArray = (formType, e, index) => {
        if (formType == 'detail') {
            const { formArray } = this.state;
            formArray[index].detail = e;
            this.setState({ formArray });
        } else if (formType == 'image') {
            var imageItem = e.target.files[0];
            var reader = new FileReader();
            reader.readAsDataURL(imageItem);

            reader.onloadend = (e) => {
                const { formArray } = this.state;
                formArray[index].preview = reader.result
                formArray[index].image = imageItem
                this.setState({ formArray });
            }
        } else if (formType == 'filename') {
            const { formArray } = this.state;
            formArray[index].filename = e.target.value;
            this.setState({ formArray });
        }
        else if (formType == 'code') {
            const { formArray } = this.state;
            formArray[index].code = e.target.value;
            this.setState({ formArray });
        }
    }
    uploadFile = (index) => {
        document.querySelector('#fileButton' + index).click();
    }
    removeFile = (index) => {
        const { formArray } = this.state;
        formArray[index].preview = ''
        formArray[index].image = ''
        this.setState({ formArray })
    }
    addForm = () => {
        var newForm = {
            detail: '',
            preview: '',
            filename: '',
            code: '',
        }

        this.setState({
            formArray: [...this.state.formArray, newForm]
        })
    }
    deleteForm = () => {
        console.log("s");
        const formArray = [...this.state.formArray];
        formArray.splice(this.state.formArray.length - 1, 1);
        this.setState({ formArray: formArray })
    }
    uploadImageAsPromise(imageFile) {
        return new Promise(function (resolve, reject) {
            let randomName = (
                Math.random().toString(36).substring(2, 16) +
                Math.random().toString(36).substring(2, 16)
            ).toUpperCase();

            var storageRef = firebaseApp
                .storage()
                .ref("/imageContent/" + randomName);

            //Upload file
            var task = storageRef.put(imageFile);

            //Update progress bar
            task.on(
                "state_changed",
                function progress(snapshot) {
                    // var percentage =
                    //     (snapshot.bytesTransferred / snapshot.totalBytes) * 100;


                },
                function error(err) {
                    console.log(err);
                    reject(err);
                },
                function complete() {

                    var downloadURL = task.snapshot.ref.getDownloadURL();

                    resolve(downloadURL);
                }
            );
        });
    }
    
    render() {
        return (
            <>
                <NavbarApp  {...this.props}/>
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
                                            onClick={()=> this.editItem(this.state.datas)}
                                        >

                                            <span className="nav-link-inner--text" >EDIT
                                             </span>
                                        </Button>
                                    </div>

                                    <div className="col px-0">
                                        <div className="title-name"><i className="fa fa-chevron-circle-left icon-back" onClick={() => this.props.history.push('/topic/' + this.state.paramsURL)} /> { this.state.paramsURL}</div>
                                        <Card className="p-4">
                                            <div className="topic-title bold">{this.state.datas.topic}</div>

                                            <div className="content-title">

                                                {this.state.datas.content.map((ele, index) => {
                                                    return <div key={index}>
                                                        {ele.image
                                                            ? <div className="img-detail text-center mb-4 mt-4">
                                                                <img width="300px" src={ele.image} />
                                                            </div>
                                                            : ''}
                                                        {ele.detail ?
                                                            <div className="detail-text p-3" dangerouslySetInnerHTML={{ __html: ele.detail }}></div>
                                                            : ''
                                                        }
                                                        {ele.code ?
                                                            <>
                                                                <div className="filename">{ele.filename ? ele.filename : ''}</div>
                                                                <SyntaxHighlighter language="javascript" style={docco} className="p-3">
                                                                    {ele.code}
                                                                </SyntaxHighlighter>
                                                            </>
                                                            : ''}
                                                    </div>
                                                })}
                                                <hr></hr>
                                                <div>
                                                    <span className="bold">type : </span>{this.state.datas.type == 'how-to' ? <span className="type-topic green">{this.state.datas.type}</span> : ''}
                                                    {this.state.datas.type == 'bug' ? <span className="type-topic red">{this.state.datas.type}</span> : ''}
                                                    {this.state.datas.type == 'begin' ? <span className="type-topic pink">{this.state.datas.type}</span> : ''}
                                                    {this.state.datas.type == 'recommand' ? <span className="type-topic blue">{this.state.datas.type}</span> : ''}
                                                    {this.state.datas.type == 'knowledge' ? <span className="type-topic yellow">{this.state.datas.type}</span> : ''}
                                                    {this.state.datas.type == 'auth' ? <span className="type-topic orange">{this.state.datas.type}</span> : ''}
                                                </div>
                                                <div><span className="bold">version : </span>{this.state.datas.version ? this.state.datas.version : '-'}</div>
                                                <div><span className="bold">createAt : </span>{this.state.datas.createAt}</div>
                                                <div><span className="bold">updateAt : </span>{this.state.datas.updateAt}</div>


                                            </div>
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
                    <Modal isOpen={this.state.modal} toggle={this.toggleModal} className="modal-app" size="lg">
                        <Form onSubmit={(e) => this.submit(e)}>
                            <ModalHeader toggle={this.cancelToggle}>{this.state.mode}</ModalHeader>
                            <ModalBody>

                                <Row>
                                    <Col md="12">
                                        <FormGroup>
                                            <Label for="Image">Topic</Label>
                                            <Input type="text" name="name" id="exampleEmail" required placeholder="Topic title" value={this.state.form.topic} onChange={e => this.changForm('topic', e)} />
                                        </FormGroup>
                                    </Col>
                                    <Col md="6">
                                        <FormGroup>
                                            <Label for="Name">Type</Label>
                                            <Input type="select" name="select" id="exampleSelect" value={this.state.form.type} onChange={e => this.changForm('type', e)} >
                                                {this.state.options.map((element, index) => {
                                                    return <option key={index}>{element.value}</option>
                                                })}

                                            </Input>
                                        </FormGroup>
                                    </Col>
                                    <Col md="6">
                                        <FormGroup>
                                            <Label for="Name">Version</Label>
                                            <Input type="text" name="version" value={this.state.form.version} placeholder="version" onChange={e => this.changForm('version', e)} />
                                        </FormGroup>
                                    </Col>

                                    {this.state.formArray.length > 0 ? this.state.formArray.map((element, index) => {
                                        return <Row key={index} className="p-3">


                                            <Col lg="4" md="12">
                                                <FormGroup>
                                                    <Label for="Image">Image #{index + 1}</Label>
                                                    <div>
                                                        <img className="preview" width="130px" src={element.preview ? element.preview : 'https://www.spu.ac.th/uploads/webfac/f000000/contents/20180312145944OSQuw1m.jpg'}></img>
                                                        <Button onClick={() => this.uploadFile(index)} className="upload-btn-topic" size="sm" color="primary">
                                                            Upload
                                                        </Button>
                                                        <Button onClick={() => this.removeFile(index)} className="remove-btn-topic" size="sm" color="secondary">
                                                            Remove
                                                        </Button>

                                                        <Input type="file" id={'fileButton' + index} name="file" hidden onChange={e => this.changFormArray('image', e, index)} />

                                                    </div>
                                                </FormGroup>
                                            </Col>
                                            <Col lg="8" md="12">
                                                <FormGroup>
                                                    <Label for="Name">Detail #{index + 1}</Label>
                                                    <ReactQuill modules={this.modules} theme="snow" value={this.state.formArray[index].detail} onChange={e => this.changFormArray('detail', e, index)} />

                                                </FormGroup>
                                            </Col>
                                            <Col lg="4" md="12">
                                                <FormGroup>
                                                    <Label for="Name">Filename #{index + 1}</Label>
                                                    <Input type="text" value={this.state.formArray[index].filename} onChange={e => this.changFormArray('filename', e, index)} />
                                                </FormGroup>
                                            </Col>
                                            <Col lg="8" md="12">
                                                <FormGroup>
                                                    <Label for="Name">Code #{index + 1}</Label>
                                                    <Input type="textarea" className="text-area" value={this.state.formArray[index].code} onChange={e => this.changFormArray('code', e, index)} />

                                                </FormGroup>
                                            </Col>
                                            <Col sm="12">
                                                <hr></hr>
                                            </Col>
                                        </Row>
                                    }) : ''
                                    }

                                    <Col md="12">
                                        <Row>
                                            {this.state.formArray.length == 1
                                                ? <Col md="12"> <Button size="sm" color="outline-primary" className="mr-2 mb-2 w-100" onClick={this.addForm}>ADD</Button> </Col>
                                                : <Col md="6"> <Button size="sm" color="outline-primary" className="mr-2 mb-2 w-100" onClick={this.addForm}>ADD</Button> </Col>
                                            }
                                            <Col md="6">{this.state.formArray.length > 1 ? <Button size="sm" color="outline-primary" className="w-100" onClick={this.deleteForm}>REMOVE</Button> : ''}</Col>
                                        </Row>



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
        );
    }
}

export default Content;