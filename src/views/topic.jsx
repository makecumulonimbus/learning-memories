import DeleteModal from "../components/Modal/deleteModal";
import LoadingApp from "../components/loading";
import NavbarApp from "../components/Navbars/navbar";
import Pagination from "react-js-pagination";
import React from "react";
import TopicModal from "../components/Modal/topicModal";
import dataNull from "../assets/img/icons/common/null.svg";
import { firebaseApp } from "../auth/firebaseConfig";
import moment from "moment";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import {
  Button,
  Container,
  Card,
  Row,
  Col,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  DropdownMenu,
} from "reactstrap";
import "../App.scss";
import "react-quill/dist/quill.snow.css";
import { connect } from "react-redux";

class Topic extends React.Component {
  componentDidMount() {
    if (this.props.topicPageDetail.nameApp == this.props.match.params.name &&
       this.props.topicList.length != 0) {
      this.setState({
        datas: this.props.topicList,
        totalDatas : this.props.topicPageDetail.totalData,
        itemStart : this.props.topicPageDetail.itemStart,
        itemEnd : this.props.topicPageDetail.itemEnd,
        activePage : this.props.topicPageDetail.page
      });
    } else {
      this.loadData();
    }
  }

  modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, false] }],
      ["bold", "italic", "underline", "strike"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link"],
      ["clean"],
    ],
  };

  state = {
    loading: false,
    paramsURL: this.props.match.params.name,
    showModal: false,
    dataSelected: {},
    mode: "",
    filterType: "all",
    showModalDelete: false,
    datas: [],
    currentPage: 0,
    activePage: 1,
    itemPerPage: 25,
    form: {
      topic: "",
      type: "how-to",
      version: "",
      preview: "",
      cover: "",
      intro: "",
    },

    itemStart: null,
    itemEnd: null,
    totalDatas: null,
    formArray: [],
    options: [
      { value: "how-to", label: "HOW-TO" },
      { value: "bug", label: "BUG" },
      { value: "begin", label: "BEGIN" },
      { value: "recommand", label: "RECOMMAND" },
      { value: "knowledge", label: "KNOWLEDGE" },
      { value: "auth", label: "AUTH" },
    ],
    dropdownOpen: false,
  };


  loadData = () => {
    this.setState({
      loading: true,
    });

    const appName = firebaseApp.firestore().collection(this.state.paramsURL);
    var filterdata;
    if (this.state.filterType !== "all") {
      filterdata = appName
        .where("type", "==", this.state.filterType)
        .orderBy("createAt", "desc");
    } else if (this.state.filterType === "all") {
      filterdata = appName.orderBy("createAt", "desc");
    }
    let indexOf = this.state.itemPerPage * this.state.currentPage; //currentpage quert default = 0
    return filterdata.get().then((document) => {
      let last = document.docs[indexOf];
      var itemCount = document.docs.length;

      var start =
        this.state.activePage * this.state.itemPerPage -
        (this.state.itemPerPage - 1);
      var end = Math.min(start + this.state.itemPerPage - 1, itemCount);
      this.setState({
        itemStart: start,
        itemEnd: end,
        totalDatas: itemCount,
      });

      if (last) {
        var queryRef = filterdata.startAt(last).limit(this.state.itemPerPage);
      } else {
        queryRef = filterdata.limit(this.state.itemPerPage);
      }

      queryRef.get().then((querySnapshot) => {
        var setData = [];
        querySnapshot.docs.forEach((doc) => {
          var element = {
            id: doc.id,
            topic: doc.data().topic,
            type: doc.data().type,
            version: doc.data().version ? doc.data().version : "",
            content: doc.data().content ? doc.data().content : [],
            cover : doc.data().cover ? doc.data().cover : '',
            intro : doc.data().intro ? doc.data().intro : '',
            createAt: doc.data().createAt
              ? this.formatDate(doc.data().createAt)
              : "",
            updateAt: doc.data().updateAt
              ? this.formatDate(doc.data().updateAt)
              : "",
          };
          setData.push(element);
        });
        
        this.setState({
          loading: false,
          datas: setData,
        });
        this.setTopicList(setData)
        this.setTopicPageDetail({
          nameApp :  this.props.match.params.name,
          totalData : itemCount,
          itemStart : start,
          itemEnd : end,
          page : this.state.activePage
        })
      });
    });
  };

  addItem = () => {
    this.setState({
      mode: "ADD",
      showModal: true,
    });
  };

  editItem = async (item) => {
    var setForm = [];
    await item.content.forEach((ele) => {
      var dataSet = {
        code: ele.code,
        detail: ele.detail,
        filename: ele.filename,
        image: ele.image,
        preview: ele.image,
      };
      setForm.push(dataSet);
    });

    await this.setState({
      form: {
        topic: item.topic,
        type: item.type,
        version: item.version,
        cover: item.cover ? item.cover : "",
        preview: item.cover ? item.cover : "",
        intro: item.intro ? item.intro : "",
      },
      formArray: setForm,
      dataSelected: item,
      mode: "EDIT",
      showModal: true,
    });
  };

  deleteItem = (item) => {
    this.setState({
      dataSelected: item,
      mode: "DELETE",
      showModalDelete: true,
    });
  };

  changeForm = (formType, e) => {
    var value = formType !== "intro" ? e.target.value : e;
    if (formType === "topic") {
      this.setState((prevState) => ({
        form: {
          ...prevState.form,
          topic: value,
        },
      }));
    }
    if (formType === "type") {
      this.setState((prevState) => ({
        form: {
          ...prevState.form,
          type: value,
        },
      }));
    }
    if (formType === "version") {
      this.setState((prevState) => ({
        form: {
          ...prevState.form,
          version: value,
        },
      }));
    }
    if (formType === "cover") {
     
      if (!e.target.files[0]) return;

      var maxfilesize = 1024 * 1024;
      var filesize = e.target.files[0].size;

      if (filesize > maxfilesize) {
        NotificationManager.error("FILE SIZE MAXIMUM 1MB", "ERROR", 3000);
        return
      }
      var imageItem = e.target.files[0];
      var reader = new FileReader();
      reader.readAsDataURL(imageItem);

      reader.onloadend = (e) => {
        this.setState((prevState) => ({
          form: {
            ...prevState.form,
            preview: reader.result,
          },
        }));
      };

      this.setState((prevState) => ({
        form: {
          ...prevState.form,
          cover: imageItem,
        },
      }));
    }
    if (formType === "intro") {
      this.setState((prevState) => ({
        form: {
          ...prevState.form,
          intro: value,
        },
      }));
    }
  };

  changeFormArray = (formType, e, index) => {
    if (formType === "detail") {
      const { formArray } = this.state;
      formArray[index].detail = e;
      this.setState({ formArray });
    }
    if (formType === "image") {
      if (!e.target.files[0]) return;

      var maxfilesize = 1024 * 1024;
      var filesize = e.target.files[0].size;

      if (filesize > maxfilesize) {
        NotificationManager.error("FILE SIZE MAXIMUM 1MB", "ERROR", 3000);
        return
      }
      var imageItem = e.target.files[0];
      var reader = new FileReader();
      reader.readAsDataURL(imageItem);

      reader.onloadend = (e) => {
        const { formArray } = this.state;
        formArray[index].preview = reader.result;
        formArray[index].image = imageItem;
        this.setState({ formArray });
      };
    }
    if (formType === "filename") {
      const { formArray } = this.state;
      formArray[index].filename = e.target.value;
      this.setState({ formArray });
    }
    if (formType === "code") {
      const { formArray } = this.state;
      formArray[index].code = e.target.value;
      this.setState({ formArray });
    }
  };

  submit = (e) => {
    e.preventDefault();
    this.cancelToggle();
    this.setState({
      loading: true,
    });
    var timestamp = new Date();
    var data = this.state.form;
    var dataForm = this.state.formArray;
    var newForm = {
      topic: data.topic,
      type: data.type,
      version: data.version,
      intro: data.intro,
      cover: data.cover,
      content: dataForm,
    };

    if (this.state.mode === "ADD") {
      newForm.createAt = new Date();
      newForm.updateAt = new Date();
      const filename = timestamp.valueOf().toString(); //สุ่มชื่อไฟล์
      if (newForm.cover) {
        firebaseApp
          .storage()
          .ref("imageContent")
          .child(filename)
          .put(newForm.cover)
          .then((response) => {
            response.ref.getDownloadURL().then((photoURL) => {
              newForm.cover = photoURL;
              this.addData(newForm);
            });
          });
      } else {
        this.addData(newForm);
      }
    } else if (this.state.mode === "EDIT") {
      newForm.updateAt = new Date();
      const filename = timestamp.valueOf().toString();
      if (newForm.cover !== this.state.dataSelected.cover) {
        this.deleteOldImage();
        firebaseApp
          .storage()
          .ref("imageContent")
          .child(filename)
          .put(newForm.cover)
          .then((response) => {
            response.ref.getDownloadURL().then((photoURL) => {
              newForm.cover = photoURL;
              this.editData(data);
            });
          });
      } else {
        this.editData(newForm);
      }
    }
  };

  addData = (data) => {
    var item = [];
    data.content.forEach((ele) => {
      if (typeof ele.image === "object") {
        var imageData = this.uploadImageAsPromise(ele.image);
        item.push(imageData);
      } else {
        item.push(ele.image ? ele.image : "");
      }
    });

    Promise.all(item).then((values) => {
      var newitem = [];
      data.content.forEach((ele, index) => {
        var setMoreData = {
          image: values[index],
          detail: ele.detail === "<p><br></p>" ? "" : ele.detail,
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
        intro: data.intro,
        cover: data.cover,
        content: newitem,
      };

      firebaseApp
        .firestore()
        .collection(this.state.paramsURL)
        .add(setData)
        .then((res) => {
          NotificationManager.success("", "SUCCESS");
          if(this.state.datas.length >= 25){
            this.state.datas.pop()
          }

          let getDateS = new Date(data.createAt).toISOString().slice(0, 10).split('-');
          var _dateS = getDateS[2] +'-'+ getDateS[1] +'-'+ getDateS[0];

          let getDateE = new Date(data.updateAt).toISOString().slice(0, 10).split('-');
          var _dateE = getDateE[2]  +'-'+ getDateE[1] + '-'+ getDateE[0];

          setData.createAt = _dateS
          setData.updateAt = _dateE
          setData.id = res.id
          this.state.datas.unshift(setData);
          this.setTopicList(this.state.datas);
          this.setState({
            loading: false,
          });
       
        })
        .catch((err) => {
          console.log(err);
          NotificationManager.error("", "ERROR");
          this.setState({
            loading: false,
          });
        });
    });
  };

  editData = (data) => {
    var item = [];
    data.content.forEach((ele) => {
      if (typeof ele.image === "object") {
        var imageData = this.uploadImageAsPromise(ele.image);
        item.push(imageData);
      } else {
        item.push(ele.image ? ele.image : "");
      }
    });

    Promise.all(item).then((values) => {
      this.state.dataSelected.content.forEach((ele, index) => {
        if (ele.image !== values[index] && ele.image !== "") {
          this.deleteOldImage(ele.image);
        }
      });

      var newitem = [];
      data.content.forEach((ele, index) => {
        var setMoreData = {
          image: values[index],
          detail: ele.detail === "<p><br></p>" ? "" : ele.detail,
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
        intro: data.intro,
        cover: data.cover,
        content: newitem,
      };

      firebaseApp
        .firestore()
        .doc(this.state.paramsURL + "/" + this.state.dataSelected.id)
        .update(setData)
        .then(() => {
          NotificationManager.success("", "SUCCESS");
       
          let getDateE = new Date(data.updateAt).toISOString().slice(0, 10).split('-');
          var _dateE =  getDateE[2]  +'-'+ getDateE[1] + '-'+ getDateE[0];
          
          setData.createAt = this.state.dataSelected.createAt
          setData.updateAt = _dateE
          setData.id = this.state.dataSelected.id;
          this.setState((prevState) => ({
            datas: prevState.datas.map((el) => (el.id === setData.id ? setData : el)),
          }));
          this.setTopicList(this.state.datas);
          this.setState({
            loading: false,
          });
        })
        .catch((err) => {
          console.log(err);
          NotificationManager.error("", "ERROR");
          this.setState({
            loading: false,
          });
        });
    });
  };

  deleteData = () => {
    this.setState({
      loading: true,
    });
    
    if (this.state.dataSelected.cover !== "") {
      this.deleteOldImage(this.state.dataSelected.cover)
    }

    this.state.dataSelected.content.forEach((ele) => {
      if (ele.image !== "") {
        this.deleteOldImage(ele.image);
      }
    });
    this.cancelToggle();
    firebaseApp
      .firestore()
      .doc(this.state.paramsURL + "/" + this.state.dataSelected.id)
      .delete()
      .then(() => {
        NotificationManager.success("", "SUCCESS");
        this.loadData();
      })
      .catch((err) => {
        console.log(err);
        NotificationManager.error("", "ERROR");
        this.setState({
          loading: false,
        });
      });
  };

  deleteOldImage(img) {
    firebaseApp.storage().refFromURL(img).delete();
  }

  removeFileCover = () => {
    this.setState((prevState) => ({
      form: {
        ...prevState.form,
        cover: "",
        preview: "",
      },
    }));
  };

  removeFile = (index) => {
    const { formArray } = this.state;
    formArray[index].preview = "";
    formArray[index].image = "";
    this.setState({ formArray });
  };

  goDetail = (element) => {
    var id = element.id;
    this.setTopicSelected(element)
    this.props.history.push("/topic/" + this.state.paramsURL + "/" + id);
  };

  formatDate = (date) => {
    var time = date.toDate();
    var formatTimeShow = moment(time).format("DD-MM-YYYY");
    return formatTimeShow;
  };

  addForm = () => {
    var newForm = {
      detail: "",
      preview: "",
      filename: "",
      code: "",
    };

    this.setState({
      formArray: [...this.state.formArray, newForm],
    });
  };

  deleteForm = (index) => {
    const formArray = [...this.state.formArray];
    formArray.splice(index, 1);
    this.setState({ formArray: formArray });
  };

  setFilter = (value) => {
    this.setState(
      {
        filterType: value,
      },
      () => this.loadData()
    );
  };

  uploadImageAsPromise(imageFile) {
    return new Promise(function (resolve, reject) {
      let randomName = (
        Math.random().toString(36).substring(2, 16) +
        Math.random().toString(36).substring(2, 16)
      ).toUpperCase();

      var storageRef = firebaseApp.storage().ref("/imageContent/" + randomName);

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
          console.log(downloadURL);
          resolve(downloadURL);
        }
      );
    });
  }

  cancelToggle = () => {
    this.setState({
      showModal: false,
      showModalDelete: false,
      form: {
        topic: "",
        type: "how-to",
        version: "",
        intro: "",
        cover: "",
      },
      formArray: [],
    });
  };

  handlePageChange = (pageNumber) => {
    if (this.state.activePage !== pageNumber) {
      this.setState(
        {
          currentPage: pageNumber - 1,
          activePage: pageNumber,
        },
        () => this.loadData()
      );
    }
  };

  toggle = () => {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
    });
  };

  setTopicList = (data) => {
    this.props.dispatch({
      type: "SET_TOPIC_LIST",
      payload: data,
    });
  };

  setTopicSelected = (data) => {
    this.props.dispatch({
      type: "SET_TOPIC_SELECTED",
      payload: data,
    });
  }

  setTopicPageDetail = (data) => {
    this.props.dispatch({
      type: "SET_TOPIC_PAGE_DETAIL",
      payload: data,
    });
  }

  render() {
    return (
      <>
        <NavbarApp {...this.props} />

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
            {this.state.loading ? (
              <LoadingApp type={"bars"} color={"white"} />
            ) : (
              <Container className="shape-container d-flex align-items-center py-lg">
                <div className="btn-add">
                  <Button
                    className="btn-neutral btn-icon"
                    color="default"
                    onClick={this.addItem}
                    target="_blank"
                  >
                    <span className="nav-link-inner--text">ADD NEW</span>
                  </Button>
                </div>

                <div className="col px-0">
                  <div className="title-name">
                    <span className="mr-3">{this.state.paramsURL}</span>
                    <Dropdown
                      isOpen={this.state.dropdownOpen}
                      toggle={this.toggle}
                      size="sm"
                      color="neutral"
                      className="drop-filter"
                    >
                      <DropdownToggle caret>
                        Filter : {this.state.filterType}
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem onClick={() => this.setFilter("all")}>
                          ALL
                        </DropdownItem>
                        {this.state.options.map((ele, index) => {
                          return (
                            <DropdownItem
                              key={index}
                              onClick={() => this.setFilter(ele.value)}
                            >
                              {ele.label}
                            </DropdownItem>
                          );
                        })}
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                  {this.state.datas.length === 0 ? (
                    <div className="text-center mt-3">
                      <img src={dataNull} width="200px" alt=""></img>
                      <div className="no-data">NO DATA</div>
                    </div>
                  ) : (
                    this.state.datas.map((ele, index) => {
                      return (
                        <div key={index}>
                          <ContextMenuTrigger id={ele.id}>
                            <Card
                              className="mb-3 p-4 card-app-topic"
                              onClick={() => this.goDetail(ele)}
                            >
                              <Row>
                                <Col className="col-topic-name" md="8" lg="9">
                                  <span className="topic-name">
                                    {ele.topic}
                                  </span>
                                </Col>
                                <Col md="4" lg="3" className="text-right">
                                  <div className="space-between">
                                    <div className="status">
                                      {ele.type === "how-to" ? (
                                        <span className="type-topic green">
                                          {ele.type}
                                        </span>
                                      ) : (
                                        ""
                                      )}
                                      {ele.type === "bug" ? (
                                        <span className="type-topic red">
                                          {ele.type}
                                        </span>
                                      ) : (
                                        ""
                                      )}
                                      {ele.type === "begin" ? (
                                        <span className="type-topic pink">
                                          {ele.type}
                                        </span>
                                      ) : (
                                        ""
                                      )}
                                      {ele.type === "recommand" ? (
                                        <span className="type-topic blue">
                                          {ele.type}
                                        </span>
                                      ) : (
                                        ""
                                      )}
                                      {ele.type === "knowledge" ? (
                                        <span className="type-topic yellow">
                                          {ele.type}
                                        </span>
                                      ) : (
                                        ""
                                      )}
                                      {ele.type === "auth" ? (
                                        <span className="type-topic orange">
                                          {ele.type}
                                        </span>
                                      ) : (
                                        ""
                                      )}
                                    </div>
                                    <div className="date">
                                      <span className="date-topic">
                                        {ele.createAt}
                                      </span>
                                    </div>
                                  </div>
                                </Col>
                              </Row>
                            </Card>
                          </ContextMenuTrigger>

                          <ContextMenu id={ele.id}>
                            <MenuItem onClick={() => this.editItem(ele)}>
                              <i className="fa fa-edit icons"></i> EDIT
                            </MenuItem>
                            <MenuItem onClick={() => this.deleteItem(ele)}>
                              <i className="fa fa-trash icons"></i> DELETE
                            </MenuItem>
                          </ContextMenu>
                        </div>
                      );
                    })
                  )}
                  {this.state.datas.length > 0 ? (
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
                  ) : (
                    ""
                  )}
                  {this.state.datas.length > 0 ? (
                    <div className="pagi-of-total">
                      {this.state.itemStart} - {this.state.itemEnd} of{" "}
                      {this.state.totalDatas}
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </Container>
            )}

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

          <TopicModal
            showModal={this.state.showModal}
            cancelToggle={this.cancelToggle}
            mode={this.state.mode}
            form={this.state.form}
            formArray={this.state.formArray}
            changeForm={this.changeForm.bind(this)}
            options={this.state.options}
            addForm={this.addForm}
            deleteForm={this.deleteForm}
            changeFormArray={this.changeFormArray.bind(this)}
            removeFileCover={this.removeFileCover}
            removeFile={this.removeFile}
            formDetail={this.state.modules}
            submit={this.submit}
          />
          <DeleteModal
            showModal={this.state.showModalDelete}
            data={this.state.dataSelected}
            deleteData={this.deleteData}
            cancelToggle={this.cancelToggle}
          />
          <NotificationContainer />
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    topicList: state.topicList,
    topicPageDetail : state.topicPageDetail
  };
};

export default connect(mapStateToProps)(Topic)
