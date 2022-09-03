import AppModal from "../components/Modal/appModal";
import DeleteModal from "../components/Modal/deleteModal";
import LoadingApp from "../components/loading";
import NavbarApp from "../components/Navbars/navbar";
import React from "react";
import { firebaseApp } from "../auth/firebaseConfig";
import { Button, Container, Card, Row, Col } from "reactstrap";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import "../App.scss";
import { connect } from "react-redux";

class HomePage extends React.Component {
  componentDidMount() {
    if (this.props.appList.length !== 0) {
      this.setState({
        datas: this.props.appList,
      });
    } else {
      this.loadData();
    }
  }

  state = {
    loading: false,
    showModal: false,
    showModalDelete: false,
    mode: "",
    datas: [],
    dataSelected: {},
    preview: "",
    form: {
      image: null,
      name: "",
    },
  };

  loadData = () => {
    this.setState({
      loading: true,
    });
    firebaseApp
      .firestore()
      .collection("learningApp")
      .get()
      .then((document) => {
        var setData = [];
        document.docs.forEach((doc) => {
          var element = {
            id: doc.id,
            image: doc.data().image,
            name: doc.data().name,
          };
          setData.push(element);
        });
        this.setState({
          datas: setData,
          loading: false,
        });

        this.setAppList(setData);
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          loading: false,
        });
      });
  };

  addItem = () => {
    this.setState({
      preview: "",
      form: {
        name: "",
        image: null,
      },
      mode: "ADD",
      showModal: true,
    });
  };

  editItem = (item) => {
    this.setState({
      preview: item.image,
      form: {
        name: item.name,
        image: item.image,
      },
      dataSelected: item,
      mode: "EDIT",
      showModal: true,
    });
  };

  submit = (e) => {
    e.preventDefault();
    this.cancelToggle();
    this.setState({
      loading: true,
    });
    var data = this.state.form;
    var timestamp = new Date();
    if (this.state.mode === "ADD") {
      const filename = timestamp.valueOf().toString(); //สุ่มชื่อไฟล์
      if (data.image) {
        firebaseApp
          .storage()
          .ref("imagelearningApp")
          .child(filename)
          .put(data.image)
          .then((response) => {
            response.ref.getDownloadURL().then((photoURL) => {
              data.image = photoURL;
              this.addData(data);
            });
          });
      } else {
        this.addData(data);
      }
    } else if (this.state.mode === "EDIT") {
      const filename = timestamp.valueOf().toString();
      if (data.image !== this.state.dataSelected.image) {
        this.deleteOldImage();
        firebaseApp
          .storage()
          .ref("imagelearningApp")
          .child(filename)
          .put(data.image)
          .then((response) => {
            response.ref.getDownloadURL().then((photoURL) => {
              data.image = photoURL;
              this.editData(data);
            });
          });
      } else {
        this.editData(data);
      }
    }
  };

  addData = (data) => {
    firebaseApp
      .firestore()
      .collection("learningApp")
      .add(data)
      .then((res) => {
        NotificationManager.success("", "SUCCESS");
        data.id = res.id;
        this.state.datas.push(data);
        this.setAppList(this.state.datas);
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
  };

  editData = (data) => {
    firebaseApp
      .firestore()
      .doc("learningApp/" + this.state.dataSelected.id)
      .update(data)
      .then(() => {
        NotificationManager.success("", "SUCCESS");
        data.id = this.state.dataSelected.id;
        this.setState((prevState) => ({
          datas: prevState.datas.map((el) => (el.id === data.id ? data : el)),
        }));
        this.setAppList(this.state.datas);
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
  };

  deleteData = () => {
    this.setState({
      loading: true,
    });
    this.cancelToggle();
    this.deleteOldImage();
    firebaseApp
      .firestore()
      .doc("learningApp/" + this.state.dataSelected.id)
      .delete()
      .then(() => {
        NotificationManager.success("", "SUCCESS");
        this.setState((prevState) => ({
          datas: prevState.datas.filter((el) => {
            return el.id !== this.state.dataSelected.id;
          }),
        }));
        this.setAppList(this.state.datas);
        this.setState({
          loading: false,
        });
      })
      .catch((err) => {
        NotificationManager.error(err.message, "ERROR", 3000);
        this.setState({
          loading: false,
        });
      });
  };

  deleteOldImage = () => {
    var oldImage = this.state.dataSelected.image;
    if (oldImage) {
      firebaseApp.storage().refFromURL(oldImage).delete();
    }
  };

  changeForm = (formType, e) => {
    if (formType === "name") {
      var nameValue = e.target.value;
      this.setState((prevState) => ({
        form: {
          ...prevState.form,
          name: nameValue,
        },
      }));
    } else if (formType === "image") {
      if (!e.target.files[0]) return;

      var maxfilesize = 1024 * 1024;
      var filesize = e.target.files[0].size;

      if (filesize > maxfilesize) {
        NotificationManager.error("FILE SIZE MAXIMUM 1MB", "ERROR", 3000);
        return;
      }
      var imageItem = e.target.files[0];
      var reader = new FileReader();
      reader.readAsDataURL(imageItem);

      reader.onloadend = (e) => {
        this.setState({
          preview: reader.result,
        });
      };

      this.setState((prevState) => ({
        form: {
          ...prevState.form,
          image: imageItem,
        },
      }));
    }
  };

  goTopic = (name) => {
    this.props.history.push("/topic/" + name);
  };

  deleteItem = (item) => {
    this.setState({
      dataSelected: item,
      mode: "DELETE",
      showModalDelete: true,
    });
  };

  cancelToggle = () => {
    this.setState({
      showModalDelete: false,
      showModal: false,
    });
  };

  setAppList = (data) => {
    this.props.dispatch({
      type: "SET_APP_LIST",
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
                    onClick={this.addItem}
                    target="_blank"
                  >
                    <span className="nav-link-inner--text">ADD NEW</span>
                  </Button>
                </div>
                <div className="col px-0">
                  <Row className="align-items-center justify-content-center">
                    {this.state.datas.map((ele, index) => {
                      return (
                        <Col
                          className="text-center"
                          lg="3"
                          md="4"
                          sm="6"
                          xs="6"
                          key={index}
                        >
                          <ContextMenuTrigger id={ele.name}>
                            <Card
                              className="mb-3 p-3 card-app"
                              onClick={() => this.goTopic(ele.name)}
                            >
                              <div className="img-app">
                                <img
                                  className="app-image"
                                  alt={ele.image}
                                  src={
                                    ele.image
                                      ? ele.image
                                      : "https://www.spu.ac.th/uploads/webfac/f000000/contents/20180312145944OSQuw1m.jpg"
                                  }
                                ></img>
                              </div>
                            </Card>
                          </ContextMenuTrigger>

                          <ContextMenu id={ele.name}>
                            <MenuItem onClick={() => this.editItem(ele)}>
                              <i className="fa fa-edit icons"></i> EDIT
                            </MenuItem>
                            <MenuItem onClick={() => this.deleteItem(ele)}>
                              <i className="fa fa-trash icons"></i> DELETE
                            </MenuItem>
                          </ContextMenu>
                        </Col>
                      );
                    })}
                  </Row>
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

          <AppModal
            showModal={this.state.showModal}
            mode={this.state.mode}
            cancelToggle={this.cancelToggle}
            form={this.state.form}
            imgPreview={this.state.preview}
            changeForm={this.changeForm.bind(this)}
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
    appList: state.appList,
  };
};

export default connect(mapStateToProps)(HomePage);
