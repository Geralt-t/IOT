import React from "react";

// react-bootstrap components
import {
  Badge,
  Button,
  Card,
  Form,
  Navbar,
  Nav,
  Container,
  Row,
  Col
} from "react-bootstrap";

function User() {
  return (
    <>
      <Container fluid>
        <Row>
          <Col md="8">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Profile</Card.Title>
              </Card.Header>
              <Card.Body>
                <Form>
                  <Row>
                    
                  <Col className="px-1" md="6">
                  <Form.Group>
                  <label>Họ tên</label>
                    <p>Nguyễn Quang Duy</p>
                  </Form.Group>
                </Col>
                                    
                  </Row>
                  <Row>
                    <Col className="pr-1" md="6">
                    <Form.Group>
                      <label>Mã SV</label>
                      <p>B21DCCN301</p>
                    </Form.Group>
                  </Col>
                    <Col className="pl-1" md="6">
                      <Form.Group>
                        
                        <label>Lớp</label>
                        <p>D21CNPM1</p>
                      
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="12">
                    <Form.Group>
                      <label>Báo cáo PDF</label>
                      <p></p>
                    </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="pr-1" md="4">
                      <Form.Group>
                        <label>Git link</label>
                        <p>
                          <a >
                          </a>
                        </p>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                  <Col md="12">
                    <Form.Group>
                      <label>API Docs</label>
                      <p>
                        <a >
                        </a>
                      </p>
                    </Form.Group>
                  </Col>
                </Row>
                  
                  <div className="clearfix"></div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col md="4">
            <Card className="card-user">
              <div className="card-image">
                <img
                  alt="..."
                  src={require("assets/img/photo-1431578500526-4d9613015464.jpeg")}
                ></img>
              </div>
              <Card.Body>
                <div className="author">
                  <a href="#pablo" onClick={(e) => e.preventDefault()}>
                    <img
                      alt="..."
                      className="avatar border-gray"
                      src={require("assets/img/faces/anhchandung.jpg")}
                    ></img>
                    <h5 className="title">Nguyễn Quang Duy</h5>
                  </a>
                  <p className="description">B21DCCN301</p>
                </div>
                <p className="description text-center">
                  D21CNPM1
                </p>
              </Card.Body>
              <hr></hr>
              <div className="button-container mr-auto ml-auto">
                <Button
                  className="btn-simple btn-icon"
                  href="https://www.facebook.com/Duyisme.vn/?locale=vi_VN"
  
                  variant="link"
                >
                  <i className="fab fa-facebook-square"></i>
                </Button>
                <Button
                  className="btn-simple btn-icon"
                  href="https://github.com/Geralt-t"
                  
                  variant="link"
                >
                  <i className="fab fa-github"></i>
                </Button>
                <Button
                  className="btn-simple btn-icon"
                  href="https://open.spotify.com/user/31avkaevdacrygizyohtd7rwsjdy?si=18f1f50b41cc41d8"
                  
                  variant="link"
                >
                  <i className="fab fa-spotify"></i>
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default User;
