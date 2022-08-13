import React from "react";
import "../App.scss";
import "react-quill/dist/quill.snow.css";
import { Button, Container, Card } from "reactstrap";
import moment from "moment";
import { firebaseApp } from "../auth/firebaseConfig";
import NavbarApp from "../components/Navbars/navbar";
import LoadingApp from "../components/loading";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import TopicModal from "../components/Modal/topicModal";
import { connect } from "react-redux";

class Content extends React.Component {
  componentDidMount() {
    if (
      this.props.topicSelected.id !== undefined &&
      this.props.topicSelected.id === this.props.match.params.id
    ) {
      this.setState({
        datas: this.props.topicSelected,
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
    showModal: false,
    paramsURL: this.props.match.params.name,
    paramsID: this.props.match.params.id,
    modal: false,
    mode: "",
    dataSelected: {},
    datas: {
      topic: "",
      type: "",
      version: "",
      content: [],
    },

    form: {
      topic: "",
      type: "how-to",
      version: "",
      preview: "",
      cover: "",
      intro: "",
    },
    formArray: [
      {
        detail: "",
        preview: "",
        filename: "",
        code: "",
      },
    ],
    options: [
      { value: "how-to", label: "How-to" },
      { value: "bug", label: "Bug" },
      { value: "begin", label: "Begin" },
      { value: "recommand", label: "Recommand" },
      { value: "knowledge", label: "Knowledge" },
      { value: "auth", label: "Auth" },
    ],
  };
  loadData = () => {
    this.setState({
      loading: true,
    });
    firebaseApp
      .firestore()
      .doc(this.state.paramsURL + "/" + this.state.paramsID)
      .get()
      .then((doc) => {
        var setData = {
          id: doc.id,
          topic: doc.data().topic,
          type: doc.data().type,
          version: doc.data().version ? doc.data().version : "",
          content: doc.data().content ? doc.data().content : [],
          cover: doc.data().cover ? doc.data().cover : "",
          intro: doc.data().intro ? doc.data().intro : "",
          createAt: doc.data().createAt
            ? this.formatDate(doc.data().createAt)
            : "",
          updateAt: doc.data().updateAt
            ? this.formatDate(doc.data().updateAt)
            : "",
        };

        this.setState({
          loading: false,
          datas: setData,
        });
      })
      .catch((err) => {
        this.props.history.goBack();
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

  formatDate = (date) => {
    var time = date.toDate();
    var formatTimeShow = moment(time).format("DD-MM-YYYY");
    return formatTimeShow;
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
    if (this.state.mode === "EDIT") {
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
          let getDateE = new Date(data.updateAt)
            .toISOString()
            .slice(0, 10)
            .split("-");
          var _dateE = getDateE[2] + "-" + getDateE[1] + "-" + getDateE[0];

          setData.createAt = this.state.dataSelected.createAt;
          setData.updateAt = _dateE;
          setData.id = this.state.dataSelected.id;
          this.state.datas = setData;
          this.setTopicSelected(this.state.datas);
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

  removeFileCover = () => {
    this.setState((prevState) => ({
      form: {
        ...prevState.form,
        cover: "",
        preview: "",
      },
    }));
  };

  deleteOldImage(img) {
    firebaseApp.storage().refFromURL(img).delete();
  }

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

  removeFile = (index) => {
    const { formArray } = this.state;
    formArray[index].preview = "";
    formArray[index].image = "";
    this.setState({ formArray });
  };

  deleteForm = (index) => {
    const formArray = [...this.state.formArray];
    formArray.splice(index, 1);
    this.setState({ formArray: formArray });
  };

  cancelToggle = () => {
    this.setState({
      showModal: false,
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

          resolve(downloadURL);
        }
      );
    });
  }

  setTopicList = (data) => {
    if (this.props.topicList.length != 0) {
      let topicData = this.props.topicList;
      let newData = topicData.map((el) => (el.id === data.id ?  data  : el));
      this.props.dispatch({
        type: "SET_TOPIC_LIST",
        payload: newData,
      });
    }
  };

  setTopicSelected = (data) => {
    this.props.dispatch({
      type: "SET_TOPIC_SELECTED",
      payload: data,
    });
  };

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
                    onClick={() => this.editItem(this.state.datas)}
                  >
                    <span className="nav-link-inner--text">EDIT</span>
                  </Button>
                </div>

                <div className="col px-0">
                  <div className="title-name">
                    <i
                      className="fa fa-chevron-circle-left icon-back pr-2"
                      onClick={() =>
                        this.props.history.push(
                          "/topic/" + this.state.paramsURL
                        )
                      }
                    />
                    {this.state.paramsURL}
                  </div>
                  <Card className="p-4">
                    <div className="topic-title bold">
                      {this.state.datas.topic}
                    </div>
                    <div className="intro">
                      <div className="img-cover text-center">
                        {this.state.datas.cover !== "" ? (
                          <img
                            src={this.state.datas.cover}
                            max-width="500px"
                          ></img>
                        ) : (
                          ""
                        )}
                      </div>
                      <div className="introduction">
                        {this.state.datas.intro !== "" ? (
                          <div
                            className="detail-text"
                            dangerouslySetInnerHTML={{
                              __html: this.state.datas.intro,
                            }}
                          ></div>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                    <div className="content-title">
                      {this.state.datas.content.map((ele, index) => {
                        return (
                          <div key={index}>
                            {ele.detail ? (
                              <div
                                className="detail-text"
                                dangerouslySetInnerHTML={{ __html: ele.detail }}
                              ></div>
                            ) : (
                              ""
                            )}
                            {ele.image ? (
                              <div className="img-detail text-center mb-4 mt-4">
                                <img
                                  max-width="500px"
                                  src={ele.image}
                                  alt={ele.image}
                                />
                              </div>
                            ) : (
                              ""
                            )}

                            {ele.code ? (
                              <>
                                <div className="filename">
                                  {ele.filename ? ele.filename : ""}
                                </div>
                                <SyntaxHighlighter
                                  language="javascript"
                                  style={docco}
                                  className=""
                                >
                                  {ele.code}
                                </SyntaxHighlighter>
                              </>
                            ) : (
                              ""
                            )}
                            <hr></hr>
                          </div>
                        );
                      })}

                      <div className="pb-1 detail-sub d-flex align-items-center">
                        <span className="text-sub-detail pr-1">type : </span>
                        {this.state.datas.type === "how-to" ? (
                          <span className="type-topic green">
                            {this.state.datas.type}
                          </span>
                        ) : (
                          ""
                        )}
                        {this.state.datas.type === "bug" ? (
                          <span className="type-topic red">
                            {this.state.datas.type}
                          </span>
                        ) : (
                          ""
                        )}
                        {this.state.datas.type === "begin" ? (
                          <span className="type-topic pink">
                            {this.state.datas.type}
                          </span>
                        ) : (
                          ""
                        )}
                        {this.state.datas.type === "recommand" ? (
                          <span className="type-topic blue">
                            {this.state.datas.type}
                          </span>
                        ) : (
                          ""
                        )}
                        {this.state.datas.type === "knowledge" ? (
                          <span className="type-topic yellow">
                            {this.state.datas.type}
                          </span>
                        ) : (
                          ""
                        )}
                        {this.state.datas.type === "auth" ? (
                          <span className="type-topic orange">
                            {this.state.datas.type}
                          </span>
                        ) : (
                          ""
                        )}
                      </div>
                      <div className="pb-1 detail-sub">
                        <span className="text-sub-detail">version : </span>
                        {this.state.datas.version
                          ? this.state.datas.version
                          : "-"}
                      </div>
                      <div className="pb-1 detail-sub">
                        <span className="text-sub-detail">createAt : </span>
                        {this.state.datas.createAt}
                      </div>
                      <div className="pb-1 detail-sub">
                        <span className="text-sub-detail">updateAt : </span>
                        {this.state.datas.updateAt}
                      </div>
                    </div>
                  </Card>
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
          <NotificationContainer />
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    topicSelected: state.topicSelected,
    topicList: state.topicList,
  };
};

export default connect(mapStateToProps)(Content);
