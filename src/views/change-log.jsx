import LoadingApp from "../components/loading";
import NavbarApp from "../components/Navbars/navbar";
import React from "react";
import { firebaseApp } from "../auth/firebaseConfig";
import { Container, Card, Badge } from "reactstrap";
import "../App.scss";

class ChangeLog extends React.Component {
  componentDidMount() {
    this.loadData();
  }

  state = {
    loading: false,
    logData: [],
  };

  loadData = () => {
    this.setState({
      loading: true,
    });
    firebaseApp
      .firestore()
      .collection("changeLog")
      .orderBy("createAt", "desc")
      .get()
      .then((document) => {
        var data = [];
        document.docs.forEach((doc) => {
          data.push(doc.data());
        });
        this.setState({
          loading: false,
          logData: data,
        });
      })
      .catch((err) => {
        this.setState({
          loading: false,
        });
        console.log(err);
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
                <div className="col px-0">
                  <div className="title-name">
                    Change-log
                  </div>
                  <Card className="p-4">
                    {this.state.logData.map((ele, index) => {
                      return (
                        <div key={index}>
                          {index === 0 ? "" : <hr />}
                          <div className="bold mb-2">
                            Version : {ele.version}
                            <span className="pl-2">
                              {index === 0 ? (
                                <Badge color="primary">NOW</Badge>
                              ) : (
                                ""
                              )}
                            </span>
                          </div>

                          <div>
                            {ele.list.map((element, indexs) => {
                              return (
                                <div className="pl-4" key={indexs}>
                                  {indexs + 1}. {element}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
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
        </div>
      </>
    );
  }
}

export default ChangeLog;
