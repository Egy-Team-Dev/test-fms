import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Row, Col, Form, Card } from "react-bootstrap";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faForward,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { add, empty } from "../../../lib/slices/addDevicesInfo";
// import { add, empty } from "../../../lib/slices/vehicleInfo";

const options = [
  { value: "Acura", label: "Acura" },
  { value: "Alfa Romeo", label: "Alfa Romeo" },
  { value: "AM General", label: "AM General" },
  { value: "AMC", label: "AMC" },
  { value: "Ariel", label: "Ariel" },
  { value: "Aston Martin", label: "Aston Martin" },
  { value: "Asuna", label: "Asuna" },
  { value: "Audi", label: "Audi" },
  { value: "Austin", label: "Austin" },
  { value: "Austin-Healey", label: "Austin-Healey" },
  { value: "Bedford", label: "Bedford" },
  { value: "Bentley", label: "Bentley" },
];

const AddDevicesInfo2 = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const allDataDevicesInfo = useSelector((state) => state?.addDevicesInfo);
  const allDataSimCard = useSelector((state) => state);


  const [serialSIMCard, setSerialSIMCard] = useState();
  const [serialNumberSelected, setSerialNumberSelected] = useState();
  const [phoneNumber, setPhoneNumber] = useState();
  const [SIMProvider, setSIMProvider] = useState();
  // const [listSerialNumbers, setListSerialNumbers] = useState([]);
  // const [simCard, setSimCard] = useState([]);

  const [validated, setValidated] = useState(false);

  // useEffect(() => {
  // setListSerialNumbers([
  //   ...new Set([...allDataDevicesInfo?.map((item) => item.serialNumber)]),
  // ]);
  // setSimCard([...allDataSimCard]);
  // }, [allDataDevicesInfo, allDataSimCard]);

  const handleSerialNumber = (e) => {
    setSerialSIMCard(e.target.value);
  };
  const handlePhoneNumber = (e) => {
    setPhoneNumber(e.target.value);
  };
  const handleSIMProvider = ({ value }) => {
    setSIMProvider(value);
  };

  const allData = {
    serialSIMCard,
    phoneNumber,
    SIMProvider,
  };

  const handleDeleteAllDataWithGoToMainPage = () => {
    dispatch(empty());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (serialSIMCard) {
      dispatch(add(allData));
      router.push("/management/account-management/manageDevices");
    } else if (serialNumberSelected) {
      dispatch(
        add({
          serialSIMCard: serialNumberSelected,
          phoneNumber: serialNumberSelected,
          SIMProvider,
        })
      );
      router.push("/management/account-management/manageDevices");
    }
    setValidated(true);
  };

  const handleSelectSerialNumber = (val) => {
    setSerialNumberSelected(val);
    setSIMProvider;
    // setPhoneNumber(val);
  };

  const handleOnSkip = () => {
    dispatch(add({ Skip: "" }));
    router.push("/management/account-management/manageDevices");
  };

  return (
    <div className="container-fluid">
      <Row>
        <Col md="4">
          <Card>
            <Card.Body>
              <h2>Select a SIMCard</h2>
              <div className="list-group">
                {allDataSimCard.length > 0 ? (
                  allDataSimCard?.map((item, key) => (
                    <button
                      key={key}
                      style={{
                        backgroundColor:
                          item === serialNumberSelected && "#c3d3d1",
                        color: "#16413d",
                      }}
                      className="list-group-item list-group-item-action list-group-item-primary"
                      onClick={() =>
                        handleSelectSerialNumber(item.SImCardSerialNumber)
                      }
                    >
                      {item.SImCardSerialNumber}
                    </button>
                  ))
                ) : (
                  <p className="mt-5 fs-6 text-center">
                    list SIMCard is Empty please add one!!
                  </p>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md="8">
          <Card>
            <Card.Body>
              <h2>Add SIMCard Information</h2>
              <Row className=" d-flex justify-content-center">
                <Col md="12">
                  <Card className="shadow-none">
                    <Card.Body>
                      <Form
                        className="mt-5"
                        noValidate
                        validated={validated}
                        onSubmit={handleSubmit}
                      >
                        <Row className=" rounded p-3 mb-3">
                          <Col lg="6">
                            <Form.Group className="form-group">
                              <Form.Label htmlFor="serialNumber">
                                Serial Number
                              </Form.Label>
                              <Form.Control
                                onChange={handleSerialNumber}
                                type="text"
                                id="serialNumber"
                                required
                                value={serialNumberSelected}
                                disabled={serialNumberSelected}
                              />
                              <Form.Control.Feedback type="invalid">
                                Please provide a valid Serial Number.
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
                                type="text"
                                id="phoneNumber"
                                required
                                value={serialNumberSelected}
                                disabled={serialNumberSelected}
                              />
                              <Form.Control.Feedback type="invalid">
                                Please provide a valid Phone Number.
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                          <Col lg="6">
                            <div className="mb-3">
                              <Form.Group className="form-group">
                                <Form.Label htmlFor="SIMProvider">
                                  SIM Provider
                                </Form.Label>
                                <Select
                                  onChange={handleSIMProvider}
                                  options={options}
                                />
                              </Form.Group>
                            </div>
                          </Col>
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
                            Finish
                          </button>
                          <Link
                            href="/management/account-management/manageDevices"
                            passHref
                          >
                            <button
                              onClick={() => handleOnSkip()}
                              className="btn btn-primary px-3 py-2 ms-3"
                            >
                              <FontAwesomeIcon
                                className="me-2"
                                icon={faForward}
                                size="sm"
                              />
                              Skip
                            </button>
                          </Link>
                          <Link
                            href="/management/account-management/manageDevices"
                            passHref
                          >
                            <button
                              onClick={() =>
                                handleDeleteAllDataWithGoToMainPage()
                              }
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
                      </Form>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AddDevicesInfo2;
