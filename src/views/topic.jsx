import React from "react";
import '../App.scss'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Pagination from "react-js-pagination";
import {
    Button,
    FormGroup,
    Input,
    Container,
    Card,
    Form,
    Label,
    Row,
    Col,
    Modal,
    Dropdown,
    DropdownItem,
    DropdownToggle,
    DropdownMenu,
    ModalHeader, ModalBody, ModalFooter,
} from "reactstrap";
import NavbarApp from '../components/Navbars/navbar'
import LoadingApp from '../components/loading'
import firebaseApp from '../auth/firebaseConfig'
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import dataNull from '../assets/img/icons/common/null.svg'
import moment from 'moment'
import { NotificationContainer, NotificationManager } from 'react-notifications';

class Topic extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        this.loadData()
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
        modal: false,
        dataSelected: {},
        mode: '',
        filterType: "all",
        modalDelete: false,
        datas: [],
        currentPage: localStorage.getItem('currentPage') ? localStorage.getItem('currentPage') : 0,
        activePage: localStorage.getItem('activePage') ? Number(localStorage.getItem('activePage')) : 1,
        itemPerPage: 25,
        form: {
            topic: '',
            type: 'how-to',
            version: ''
        },

        itemStart: null,
        itemEnd: null,
        totalDatas: null,
        formArray: [
            {
                detail: '',
                preview: '',
                filename: '',
                code: ''
            }
        ],
        options: [
            { value: 'how-to', label: 'HOW-TO' },
            { value: 'bug', label: 'BUG' },
            { value: 'begin', label: 'BEGIN' },
            { value: 'recommand', label: 'RECOMMAND' },
            { value: 'knowledge', label: 'KNOWLEDGE' },
            { value: 'auth', label: 'AUTH' }
        ],
        dropdownOpen: false,

    };
    loadData = () => {
        this.setState({
            loading: true
        })

        const appName = firebaseApp.firestore().collection(this.state.paramsURL)
        var filterdata
        if (this.state.filterType != 'all') {
            filterdata = appName.where('type', '==', this.state.filterType).orderBy("createAt", "desc")
        } else if (this.state.filterType == 'all') {
            filterdata = appName.orderBy("createAt", "desc")
        }
        let indexOf = this.state.itemPerPage * this.state.currentPage;  //currentpage quert default = 0
        return filterdata.get().then(document => {

            let last = document.docs[indexOf];
            var itemCount = document.docs.length;

            var start = this.state.activePage * this.state.itemPerPage - (this.state.itemPerPage - 1);
            var end = Math.min(start + this.state.itemPerPage - 1, itemCount);
            this.state.itemStart = start;
            this.state.itemEnd = end;
            this.state.totalDatas = itemCount;

            if (last) {
                var queryRef = filterdata.startAt(last).limit(this.state.itemPerPage);
            } else {
                queryRef = filterdata.limit(this.state.itemPerPage);
            }

            queryRef.get()
                .then((querySnapshot) => {
                    var setData = []
                    querySnapshot.docs.forEach(doc => {

                        var element = {
                            id: doc.id,
                            topic: doc.data().topic,
                            type: doc.data().type,
                            version: doc.data().version ? doc.data().version : '',
                            content: doc.data().content ? doc.data().content : [],
                            createAt: doc.data().createAt ? this.formatDate(doc.data().createAt) : '',
                            updateAt: doc.data().updateAt ? this.formatDate(doc.data().updateAt) : ''
                        }
                        setData.push(element)
                    })

                    this.setState({
                        loading: false,
                        datas: setData
                    })
                })
        })

    }
    toggle = () => {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        })
    }
    toggleModal = (mode) => {
        if (mode == 'ADD') {
            this.setState({
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
                    code: '',

                }
            ]
        })
    }
    handlePageChange = (pageNumber) => {
        if(this.state.activePage != pageNumber){
            localStorage.setItem("currentPage", pageNumber - 1)
            localStorage.setItem("activePage", pageNumber)
            this.setState({
                currentPage: pageNumber - 1,
                activePage: pageNumber
            }, () => this.loadData())
        }  
    }

    addItem = () => {
        this.toggleModal('ADD')
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
                topic: item.topic,
                type: item.type,
                version: item.version
            },
            formArray: setForm,
            dataSelected: item
        })
        this.toggleModal('EDIT')
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

        if (this.state.mode == 'ADD') {
            newForm.createAt = new Date()
            newForm.updateAt = new Date()
            this.addData(newForm)
        } else if (this.state.mode == 'EDIT') {

            newForm.updateAt = new Date()
            this.editData(newForm)
        }

    }

    addData = (data) => {

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
                createAt: data.createAt,
                updateAt: data.updateAt,
                version: data.version,
                content: newitem

            }


            firebaseApp.firestore().collection(this.state.paramsURL).add(setData).then(() => {
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
    toggleModalDelete = (item) => {
        this.setState({
            dataSelected: item,
            mode: 'DELETE',
            modalDelete: true
        })
    }
    cancelToggleDelete = () => {
        this.setState({
            modalDelete: false,
        })
    }
    deleteData = () => {
        this.setState({
            loading: true
        })


        this.state.dataSelected.content.forEach(ele => {
            if (ele.image != "") {
                this.deleteOldImage(ele.image)
            }
        })
        this.cancelToggleDelete()
        firebaseApp.firestore().doc(this.state.paramsURL + '/' + this.state.dataSelected.id).delete().then(() => {
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
        this.setState({ formArray });
    }
    goDetail = (element) => {
        var id = element.id
        this.props.history.push('/topic/' + this.state.paramsURL + '/' + id)

    }
    formatDate = (date) => {
        var time = date.toDate();
        var formatTimeShow = moment(time).format("DD-MM-YYYY");
        return formatTimeShow;
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
        const formArray = [...this.state.formArray];
        formArray.splice(this.state.formArray.length - 1, 1);
        this.setState({ formArray: formArray })
    }
    setFilter = (value) => {
        this.setState({
            filterType: value
        }, () => this.loadData())
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
                <NavbarApp  {...this.props} />

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
                                        <div className="title-name">{this.state.paramsURL} <span className="mr-4"></span>
                                            <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle} size="sm" color="neutral" className="drop-filter">
                                                <DropdownToggle caret>
                                                    Filter : {this.state.filterType}
                                                </DropdownToggle>
                                                <DropdownMenu>
                                                    <DropdownItem onClick={() => this.setFilter("all")}>ALL</DropdownItem>
                                                    {this.state.options.map((ele, index) => {
                                                        return <DropdownItem key={index} onClick={() => this.setFilter(ele.value)}>{ele.label}</DropdownItem>
                                                    })}


                                                </DropdownMenu>
                                            </Dropdown>
                                        </div>
                                        {this.state.datas.length == 0 ?
                                            <div className="text-center mt-3">
                                                <img src={dataNull} width="250px"></img>
                                                <div className="no-data">NO DATA</div>
                                            </div>

                                            : this.state.datas.map((ele, index) => {
                                                return <div key={index}>

                                                    <ContextMenuTrigger id={ele.id}>
                                                        <Card className="mb-3 p-4 card-app-topic" onClick={() => this.goDetail(ele)}>
                                                            <Row>
                                                                <Col className="col-topic-name" md="7" lg="8">
                                                                    <span className="topic-name">{ele.topic}</span>
                                                                </Col>
                                                                <Col md="3" lg="2">
                                                                    {ele.type == 'how-to' ? <span className="type-topic green">{ele.type}</span> : ''}
                                                                    {ele.type == 'bug' ? <span className="type-topic red">{ele.type}</span> : ''}
                                                                    {ele.type == 'begin' ? <span className="type-topic pink">{ele.type}</span> : ''}
                                                                    {ele.type == 'recommand' ? <span className="type-topic blue">{ele.type}</span> : ''}
                                                                    {ele.type == 'knowledge' ? <span className="type-topic yellow">{ele.type}</span> : ''}
                                                                    {ele.type == 'auth' ? <span className="type-topic orange">{ele.type}</span> : ''}

                                                                </Col>
                                                                <Col md="2" lg="2" className="col-topic-date">
                                                                    <div><span className="date-topic">{ele.createAt}</span></div>

                                                                </Col>

                                                            </Row>

                                                        </Card>
                                                    </ContextMenuTrigger>

                                                    <ContextMenu id={ele.id}>
                                                        <MenuItem onClick={() => this.editItem(ele)}>
                                                            <i className="fa fa-edit icons"></i> EDIT
                                                        </MenuItem>
                                                        <MenuItem onClick={() => this.toggleModalDelete(ele)}>
                                                            <i className="fa fa-trash icons"></i> DELETE
                                                        </MenuItem>
                                                    </ContextMenu>
                                                </div>
                                            })
                                        }
                                        {this.state.datas.length > 0 ?
                                            <Pagination
                                                activePage={this.state.activePage}
                                                itemsCountPerPage={this.state.itemPerPage}
                                                totalItemsCount={this.state.totalDatas}

                                                itemClass="page-item"
                                                linkClass="page-link"
                                                pageRangeDisplayed={5}
                                                hideFirstLastPages={true}
                                                onChange={this.handlePageChange.bind(this)}
                                            />
                                            : ''
                                        }
                                        {this.state.datas.length > 0 ?
                                            <div className="pagi-of-total">{this.state.itemStart} - {this.state.itemEnd} of {this.state.totalDatas}</div>
                                            : ''
                                        }

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
                        <Form onSubmit={(e) => this.submit(e)} >
                            <ModalHeader toggle={this.cancelToggle}>{this.state.mode}</ModalHeader>
                            <ModalBody>

                                <Row>
                                    <Col md="12">
                                        <FormGroup>
                                            <Label for="Image">Topic</Label>
                                            <Input type="text" name="name" id="exampleEmail" required placeholder="Topic title" value={this.state.form.topic} onChange={e => this.changForm('topic', e)} autocomplete="new-password"/>
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
                                            <Input type="text" name="version" id="exampleEmail" placeholder="version"  value={this.state.form.version} onChange={e => this.changForm('version', e)} autocomplete="new-password"/>
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
                                                    <Input type="text" value={this.state.formArray[index].filename} onChange={e => this.changFormArray('filename', e, index)} autocomplete="new-password"/>
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

                    <Modal isOpen={this.state.modalDelete} toggle={this.toggleModalDelete} className="modal-app " >
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

export default Topic;