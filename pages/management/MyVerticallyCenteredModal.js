import { useState } from "react";
import { Row, Col, Card, Form } from "react-bootstrap";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { add, empty } from "../../lib/slices/simCard";
import Link from "next/link";

const MyVerticallyCenteredModal = () => {
  const [validated, setValidated] = useState(false);
  const [SImCardSerialNumber, setSImCardSerialNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [providerName, setProviderName] = useState("");

  const router = useRouter();
  const dispatch = useDispatch();

  const allData = {
    providerName,
    SImCardSerialNumber,
    phoneNumber,
  };

  const handleSImCardSerialNumber = (e) => {
    setSImCardSerialNumber(e.target.value);
  };

  const handlePhoneNumber = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleProviderName = ({ value }) => {
    setProviderName(value);
  };

  const handleDeleteAllDataWithGoToMainPage = () => {
    dispatch(empty());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (SImCardSerialNumber && phoneNumber) {
      dispatch(add(allData));
      router.push("/management/SimManagement");
    }
    setValidated(true);
  };

  return (
    <div className="container-fluid">
      <Card>
        <Card.Body>
          <Row className="d-flex justify-content-center">
            <Col md="7">
              <Form
                noValidate
                validated={validated}
                onSubmit={handleSubmit}
                className="mt-5"
              >
                <Row className="p-3 mb-3">
                  <Col lg="6">
                    <Form.Group className="form-group">
                      <Form.Label htmlFor="SIMCardSerialNumber">
                        {t('SImCard_Serial_Number')}
                      </Form.Label>
                      <Form.Control
                        required
                        type="number"
                        id="SIMCardSerialNumber"
                        onChange={handleSImCardSerialNumber}
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide a valid SImCard Serial Number.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col lg="6">
                    <Form.Group className="form-group">
                      <Form.Label htmlFor="phoneNumber">
                        Phone Number
                      </Form.Label>
                      <Form.Control
                        onChange={handlePhoneNumber}
                        required
                        type="number"
                        id="phoneNumber"
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide a valid Phone Number.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col lg="12">
                    <div className="mb-3">
                      <Form.Group className="form-group">
                        <Form.Label htmlFor="ProviderName">
                        {t('Provider_Name')}
                        </Form.Label>
                        <Select
                          options={options}
                          onChange={handleProviderName}
                        />
                      </Form.Group>
                    </div>
                  </Col>
                  <Col lg="12">
                    <div className="mt-5 d-flex justify-content-end">
                      <button
                        type="submit"
                        className="btn btn-primary px-3 py-2 ms-3"
                      >
                        <FontAwesomeIcon
                          className="me-2"
                          icon={faSave}
                          size="sm"
                        />
                        Save
                      </button>
                      <Link href="/management/SimManagement" passHref>
                        <button
                          onClick={() => handleDeleteAllDataWithGoToMainPage()}
                          className="btn btn-primary px-3 py-2 ms-3"
                        >
                          <FontAwesomeIcon
                            className="me-2"
                            icon={faTimes}
                            size="sm"
                          />
                          Cancel
                        </button>
                      </Link>
                    </div>
                  </Col>
                </Row>
              </Form>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default MyVerticallyCenteredModal;
