import React, { useEffect, useMemo, useState } from "react";
import { Col, Row, Modal, Button, Card, Form } from "react-bootstrap";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faEdit, faTrash, faUserSlash, faCar,} from "@fortawesome/free-solid-svg-icons";
import * as lodash from "lodash";
import { useTranslation } from "next-i18next";
import { useDispatch, useSelector } from "react-redux";
import { add } from "../../lib/slices/aramcoTestService";
import AgGridDT from "../../components/AgGridDT";

// options for select menu
const options = [
  { value: "STC", label: "STC" },
  { value: "Zain", label: "Zain" },
  { value: "Mobily", label: "Mobily" },
];


const AramcoTestService = () => {
  const { t } = useTranslation("Management");
  const allDataAramcoTestService = useSelector(
    (state) => state?.aramcoTestService
  );
  const dispatch = useDispatch();

  const [modalShow, setModalShow] = useState(false);
  const [validated, ] = useState(false);
  const [SerialNumber, setSerialNumber] = useState("");
  const [listOfCommands, setListOfCommands] = useState("");
  const [valuePhoneNumber, setValuePhoneNumber] = useState("");
  const allData = {
    SerialNumber,
    listOfCommands,
    valuePhoneNumber,
  };

  const [, /* gridColumnApi */ setGridColumnApi] = useState(null);

  const [, setGridApi] = useState(null);
  const [allDataGrid, setAllDataGrid] = useState([]);

  useEffect(() => {
    setAllDataGrid([allDataAramcoTestService]);
    
  }, [allDataAramcoTestService]);

  const handleSerialNumber = (e) => {
    setSerialNumber(e.target.value);
  };
  const handleValuePhoneNumber = (e) => {
    setValuePhoneNumber(e.target.value);
  };
  const handleListOfCommands = ({ value }) => {
    setListOfCommands(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (valuePhoneNumber) {
      dispatch(add(allData));
      setModalShow(false);
    }
  };

 
  const columns = useMemo(
    () => [
      {
        headerName: `${t("SIMCard_Serial_Number")}`,
        field: "SerialNumber",
        minWidth: 150,
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: `${t("Phone Number")}`,
        field: "listOfCommands",
        minWidth: 150,
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: `${t("Provider_Name")}`,
        field: "valuePhoneNumber",
        minWidth: 150,
        unSortIcon: true,
      },
      {
        headerName: "Actions",
        field: "DriverID",
        minWidth: 380,
        cellRenderer: () => (
          <div>
            {!lodash.isEmpty(allDataAramcoTestService) &&
              lodash.isEmpty(allDataAramcoTestService) && (
                <>
                  <button className="btn btn-outline-primary m-1">
                    <FontAwesomeIcon className="pe-2" icon={faEdit} size="lg" />
                    edit
                  </button>
                  <button className="btn btn-outline-primary m-1">
                    <FontAwesomeIcon
                      className="pe-2"
                      icon={faTrash}
                      size="lg"
                    />
                    delete
                  </button>
                  <button className="btn btn-outline-primary m-1">
                    <FontAwesomeIcon
                      className="pe-2"
                      icon={faUserSlash}
                      size="lg"
                    />
                    Deactivate
                  </button>
                  <button className="btn btn-outline-primary m-1">
                    <FontAwesomeIcon className="pe-2" icon={faCar} size="lg" />
                    Show Vehicles
                  </button>
                </>
              )}
          </div>
        ),
      },
    ],
    [t, allDataAramcoTestService]
  );

  const onFirstDataRendered = (params) => {
    params.api.paginationGoToPage(0);
  };


  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const defaultColDef = useMemo(() => {
    return {
      sortable: true,
      flex: 1,
      resizable: true,
      filter: true,
    };
  }, []);

  // const allDataVehicleInfo = useSelector((state) => state?.vehicleInfo);

  return (
    <div className="container-fluid">
      <Row>
        <Card>
          <Card.Body>
            <h4>Aramco Test Service</h4>
            <Card.Header className="d-flex justify-content-between">
              <div className="w-100 header-title d-flex justify-content-between align-items-center p-3">
                <div>
                  {/* <SubmitDeviceBtn /> */}
                  <Button
                    type="Button"
                    className="btn btn-primary  px-3 py-2 me-3 "
                    onClick={() => setModalShow(true)}
                  >
                    <FontAwesomeIcon className="me-2" icon={faEdit} size="sm" />
                    Submit Device
                  </Button>

                  <Modal
                    show={modalShow}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    keyboard={false}
                  >
                    <Modal.Header closeButton>
                      <Modal.Title id="contained-modal-title-vcenter">
                        Submit Device
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Row className="d-flex justify-content-center">
                        <Col md="12">
                          <Form
                            noValidate
                            validated={validated}
                            onSubmit={handleSubmit}
                          >
                            <Row className="p-3 mb-3">
                              <Col lg="12">
                                <Form.Group
                                  className="form-group"
                                  controlId="validationCustom01"
                                >
                                  <Form.Label htmlFor="SerialNumber">
                                    Serial Number
                                  </Form.Label>
                                  <Form.Control
                                    onChange={handleSerialNumber}
                                    value={SerialNumber}
                                    type="number"
                                    id="SerialNumber"
                                  />
                                </Form.Group>
                              </Col>
                              <Col lg="12">
                                <div className="mb-3">
                                  <Form.Group className="form-group">
                                    <Form.Label htmlFor="ProviderName">
                                      List Of Commands
                                    </Form.Label>
                                    <Select
                                      onChange={handleListOfCommands}
                                      options={options}
                                    />
                                  </Form.Group>
                                </div>
                              </Col>
                              <Col lg="12">
                                <Form.Group className="form-group">
                                  <Form.Label htmlFor="Value">Value</Form.Label>
                                  <Form.Control
                                    onChange={handleValuePhoneNumber}
                                    value={valuePhoneNumber}
                                    type="number"
                                    id="Value"
                                  />
                                  <Form.Control.Feedback type="invalid">
                                    Please provide a valid Value.
                                  </Form.Control.Feedback>
                                </Form.Group>
                              </Col>
                              <Col lg="12">
                                <div className="mt-5 d-flex justify-content-end">
                                  <button
                                    className="btn btn-primary px-3 py-2 ms-3"
                                    type="submit"
                                  >
                                    <FontAwesomeIcon
                                      className="mx-2"
                                      icon={faCheck}
                                      size="sm"
                                    />
                                    Submit
                                  </button>
                                  <button
                                    className="btn btn-primary px-3 py-2 ms-3"
                                    onClick={() => setModalShow(false)}
                                  >
                                    <FontAwesomeIcon
                                      className="mx-2"
                                      icon={faTimes}
                                      size="sm"
                                    />
                                    Cancel
                                  </button>
                                </div>
                              </Col>
                            </Row>
                          </Form>
                        </Col>
                      </Row>
                    </Modal.Body>
                  </Modal>
                </div>
                <Form.Floating className=" custom-form-floating-sm form-group m-0">
                  <Form.Control
                    type="email"
                    className=""
                    id="floatingInput6"
                    placeholder="Place Holder"
                  />
                  <label htmlFor="floatingInput">search</label>
                </Form.Floating>
              </div>
            </Card.Header>
                <AgGridDT
                  columnDefs={columns}
                  rowData={allDataGrid}
                  paginationNumberFormatter={function (params) {
                    return params.value.toLocaleString();
                  }}
                  onFirstDataRendered={onFirstDataRendered}
                  defaultColDef={defaultColDef}
                  onGridReady={onGridReady}
                />
            
          </Card.Body>
        </Card>
      </Row>
    </div>
  );
};
export default AramcoTestService;
