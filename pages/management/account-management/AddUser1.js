import { useState } from "react";
import { useRouter } from "next/router";
import { Row, Col, Form, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faTimes } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { addGeneralInfo, reset } from "../../../lib/slices/userInfo";

// translation
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const AddUser1 = () => {
  const { t } = useTranslation("Management");
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state?.userInfo);
  const [FirstName, setFirstName] = useState(user.FirstName || " ");
  const [LastName, setLastName] = useState(user.LastName || "");
  const [UserName, setUserName] = useState(user.UserName || "");
  const [PhoneNumber, setPhoneNumber] = useState(user.PhoneNumber || "");
  const [Email, setEmail] = useState(user.Email || "");
  const [Password, setPassword] = useState(user.Password || "");

  const [validated, setValidated] = useState(false);

  const handleFirstName = (e) => {
    setFirstName(e.target.value);
  };
  const handleLastName = (e) => {
    setLastName(e.target.value);
  };
  const handleUserName = (e) => {
    setUserName(e.target.value);
  };
  const handlePhoneNumber = (e) => {
    setPhoneNumber(e.target.value);
  };
  const handleEmail = (e) => {
    setEmail(e.target.value);
  };
  const handlePassword = (e) => {
    setPassword(e.target.value);
  };

  const allData = {
    FirstName,
    LastName,
    UserName,
    PhoneNumber,
    Email,
    Password,
  };

  const handleDeleteAllDataWithGoToMainPage = () => {
    dispatch(reset());
  };

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const allData = {
      FirstName,
      LastName,
      UserName,
      PhoneNumber,
      Email,
      Password,
    };
    if (
      FirstName &&
      LastName &&
      UserName &&
      PhoneNumber &&
      Password &&
      validateEmail(Email)
    ) {
      dispatch(addGeneralInfo(allData));
      router.push("/management/account-management/AddUser2");
    }
    setValidated(true);
  };

  return (
    <div className="container-fluid">
      <Card>
        <Card.Body>
          <Row className=" d-flex justify-content-center mb-5">
            <Col lg="8">
              <Form
                className="mt-5"
                noValidate
                validated={validated}
                onSubmit={handleSubmit}
              >
                <Row className="p-3 mb-3">
                  <Col md="6">
                    <Form.Group className="form-group">
                      <Form.Label htmlFor="firstName">
                        {t("First_Name")}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        id="firstName"
                        defaultValue={FirstName}
                        onChange={handleFirstName}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide a valid First Name.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md="6">
                    <Form.Group className="form-group">
                      <Form.Label htmlFor="lastName">
                        {t("Last_Name")}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        id="lastName"
                        defaultValue={LastName}
                        onChange={handleLastName}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide a valid Last Name.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md="12">
                    <Form.Group className="form-group">
                      <Form.Label htmlFor="userName">
                        {t("Username")}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        id="userName"
                        defaultValue={UserName}
                        onChange={handleUserName}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide a valid User Name.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md="6">
                    <Form.Group className="form-group">
                      <Form.Label htmlFor="email">{t("E-mail")}</Form.Label>
                      <Form.Control
                        type="email"
                        id="email"
                        defaultValue={Email}
                        onChange={handleEmail}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide a valid Email.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md="6">
                    <Form.Group className="form-group">
                      <Form.Label htmlFor="phoneNumber">
                        {t("Phone_Number")}
                      </Form.Label>
                      <Form.Control
                        type="number"
                        defaultValue={PhoneNumber}
                        id="phoneNumber"
                        onChange={handlePhoneNumber}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide a valid Phone Number.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>{" "}
                  <Col md="6">
                    <Form.Group className="form-group">
                      <Form.Label htmlFor="password">
                        {t("Password")}
                      </Form.Label>
                      <Form.Control
                        type="password"
                        defaultValue={Password}
                        id="password"
                        onChange={handlePassword}
                        required
                      />
                    </Form.Group>
                  </Col>{" "}
                </Row>
                <div className="mt-5 d-flex justify-content-end">
                  <button
                    type="submit"
                    className="btn btn-primary px-3 py-2 ms-3"
                  >
                    <FontAwesomeIcon
                      className="me-2"
                      icon={faArrowRight}
                      size="sm"
                    />
                    {t("Next")}
                  </button>
                  <Link
                    href="/management/account-management/manageUsers"
                    passHref
                  >
                    <button
                      onClick={() => handleDeleteAllDataWithGoToMainPage()}
                      className="btn btn-primary px-3 py-2 ms-3"
                    >
                      <FontAwesomeIcon
                        className="me-2"
                        icon={faTimes}
                        size="sm"
                      />
                      {t("Cancel")}
                    </button>
                  </Link>
                </div>
              </Form>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AddUser1;

// translation ##################################
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["Management", "main"])),
    },
  };
}
// translation ##################################
