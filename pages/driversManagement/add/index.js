import {
  faCar,
  faCheck,
  faSpinner,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { CustomInput } from "../../../components/CustomInput";
// import MenuTree from "./tree";
// import style from "../../../styles/ReportsOptions.module.scss";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import axios from "axios";
import config from "../../../config/config";
import useToken from "../../../hooks/useToken";
import { toast } from "react-toastify";
import Model from "../../../components/UI/Model";
import AgGridDT from "../../../components/AgGridDT";
import { useTranslation } from "next-i18next";

import countryList from "react-select-country-list";

import Select from "react-select";
// import { data } from "jquery";
// import { useTransition } from "react";

export default function Index() {
  const gridRef = useRef();
  const router = useRouter();
  const { tokenRef } = useToken();
  const [vehiclesData, setVehiclesData] = useState([]);
  const [rowSelected, setRowSelected] = useState("");
  const { t } = useTranslation();
  // const [assigne, setassigne] = useState(false);
  // const [treeFilter, setTreeFilter] = useState("");
  // const [TreeVehicleID, setTreeVehicleID] = useState("");
  const [loading, setloading] = useState(false);
  // states for handle errors
  const [validated, setValidated] = useState(false);
  const [firstError, setFirstError] = useState(false);
  const [lastError, setLastError] = useState(false);

  const [modalShow, setModalShow] = useState(false);
  const [Data, setData] = useState({
    FirstName: "",
    LastName: "",
    Department: "",
    PhoneNumber: "",
    Email: "",
    DLNumber: "",
    DLClass: "1",
    DLExpirationDate: "",
    StartTime: "2017-08-23T00:00:00.000Z",
    EndTime: "2017-08-23T00:00:00.000Z",
    RFID: "",
    UDID: "1",
    DateOfBirth: "",
    Nationality: "",
    WorkingDays: "h",
    ASPNetID: null,
    Image: "",
    IsDeleted: 0,
    EmployeeID: "12121212",
    DateOfJoin: "2018-01-31T00:00:00.000Z",
    AccountID: 1,
    IdentityNumber: null,
    DateOfBirthHijri: null,
    MobileNumber: "",
    referencKey: null,
    SelectedVehiclePlateNumber: "",
  });

  //fetch vehicle Data
  const onGridReady = useCallback(async () => {
    try {
      const respond = await axios.get(
        `${config.apiGateway.URL}dashboard/vehicles/info/unassigned/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenRef}`,
          },
        }
      );
      setVehiclesData(respond.data.unAssingedVehs);
    } catch (error) {
      toast.error(error.response.data?.message);
    }
  }, [tokenRef]);

  // func pass selected input to ag grid when open vehciles list
  const onFirstDataRendered = useCallback(
    (e) => {
      e.api.forEachNode((node) =>
        node.setSelected(
          !!node.data &&
          node.data.PlateNumber === Data.SelectedVehiclePlateNumber
        )
      );
    },
    [Data.SelectedVehiclePlateNumber]
  );

  // columns for ag grid
  const columns = useMemo(
    () => [
      {
        headerName: `${t("Select")}`,
        field: "Select",
        maxWidth: 70,
        sortable: false,
        unSortIcon: false,
        checkboxSelection: true,
        filter: false,
      },
      {
        headerName: `${t("Vehicle ID")}`,
        field: "VehicleID",
      },
      {
        headerName: `${t("Vehicle Name")}`,
        field: "DisplayName",
      },
      {
        headerName: `${t("Plate Name")}`,
        field: "PlateNumber",
      },
      {
        headerName: `${t("Manufacturing Year")}`,
        field: "MakeYear",
      },
      {
        headerName: `${t("Group Name")}`,
        field: "GroupName",
      },
    ],
    [t]
  );

  //the setting of the AG grid table .. sort , filter , etc...
  const defaultColDef = useMemo(() => {
    return {
      sortable: true,
      flex: 1,
      resizable: true,
      filter: true,
    };
  }, []);

  // assign vehicle to driver func Handler
  const assignVehicleHandler = () => {
    setModalShow(false);
    Data.SelectedVehiclePlateNumber = rowSelected.PlateNumber;
  };

  // make min birthday is 17 years old from today
  const date = new Date().setFullYear(new Date().getFullYear() - 17);
  const maxLicenceBirthDate = new Date(date).toISOString().slice(0, 10);

  //make min licence expire Date is today
  const minLicenceExDate = new Date().toISOString().slice(0, 10);

  const options = useMemo(() => countryList().getData(), []);

  useEffect(() => {
    options?.map((item) => (item.name = "Nationality"));
  }, [options]);

  // helper func to check if input value has number or pure text
  function stringContainsNumber(_string) {
    return /\d/.test(_string);
  }

  // helper func to prevent some characters to put in input
  const blockInvalidChar = (e) =>
    ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault();

  const handleChange = (e) => {
    if (e.hasOwnProperty("label")) {
      const { label, name } = e;
      setData({
        ...Data,
        [name]: label,
      });
    } else {
      const { name, value } = e.target;
      if (name === "Image") {
        setData({
          ...Data,
          [name]: e.target.files[0],
        });
      } else {
        setData({
          ...Data,
          [name]: value,
        });
      }
    }
  };

  //helper func to handle error on input value
  const errorInputFunc = (validation, setError) => {
    if (validation) {
      setError(true);
    } else {
      setError(false);
    }
  };

  // handle error on input value
  useEffect(() => {
    errorInputFunc(stringContainsNumber(Data.FirstName), setFirstError);
    errorInputFunc(stringContainsNumber(Data.LastName), setLastError);
  }, [Data.FirstName, Data.LastName]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
    } else if (firstError === true || lastError === true) {
      setValidated(false);
    } else {
      setloading(true);
      await axios
        .post(`${config.apiGateway.URL}dashboard/drivers`, Data, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenRef}`,
          },
        })
        .then((res) => {
          toast.success("Driver Add Successfully.");
          const assigne = async () => {
            await axios
              .post(
                `${config.apiGateway.URL}dashboard/drivers/vehicle/assign`,
                {
                  DriverID: res.data.driver[0][0],
                  VehicleID: rowSelected.VehicleID,
                },
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${tokenRef}`,
                  },
                }
              )
              .then((res) => {
                if (res?.data?.result[1] === 1) {
                  toast.success("Vehicle Assigned Successfully");
                  router.push("/driversManagement");
                } else {
                  toast.error("Vehicle Assigned Error");
                }
              })
              .catch((error) => toast.error(error?.message));
          };
          Data.SelectedVehiclePlateNumber !== "" && assigne();
        })
        .catch((error) => {
          toast.error(`Error: ${error?.message}`);
        })
        .finally(() => {
          setloading(false);
          router.push("/driversManagement");
        });
      setValidated(true);
    }
  };
  return (
    <>
      <Card>
        <Card.Header className="h3">Add New Driver</Card.Header>
        <Card.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row>
              {/* <Col md="8"> */}
              <Col md={12}>
                <Row>
                  <CustomInput
                    value={Data.FirstName}
                    handleChange={handleChange}
                    Name="FirstName"
                    Label="First Name"
                    isInvalid={firstError ? true : false}
                    feedBack={
                      firstError ? "Please enter a valid first name" : ""
                    }
                  />
                  <CustomInput
                    value={Data.LastName}
                    handleChange={handleChange}
                    Name="LastName"
                    Label="Last Name"
                    isInvalid={lastError ? true : false}
                    feedBack={lastError ? "Please enter a valid last name" : ""}
                  />
                  <CustomInput
                    Type="date"
                    value={Data.DateOfBirth}
                    handleChange={handleChange}
                    Name="DateOfBirth"
                    Label="Date Of Birth"
                    min="1900-01-01"
                    max={`${maxLicenceBirthDate}`}
                  />

                  <Form.Group className="col-12 col-md-6 col-lg-4 mb-3">
                    <Form.Label>Nationality</Form.Label>
                    <Select options={options} onChange={handleChange} />
                  </Form.Group>

                  <CustomInput
                    value={Data.PhoneNumber}
                    handleChange={handleChange}
                    Name="PhoneNumber"
                    Label="Phone Number"
                    Type="number"
                    min={0}
                    onKeyDown={blockInvalidChar}
                  />

                  <CustomInput
                    Type="email"
                    value={Data.Email}
                    handleChange={handleChange}
                    Name="Email"
                    Label="Email"
                  />

                  <CustomInput
                    value={Data.DLNumber}
                    handleChange={handleChange}
                    Name="DLNumber"
                    Label="Licence Number"
                    Type="number"
                    min={0}
                    onKeyDown={blockInvalidChar}
                  />
                  <CustomInput
                    Type="date"
                    value={Data.DLExpirationDate}
                    handleChange={handleChange}
                    Name="DLExpirationDate"
                    Label="Licence Expiration Date"
                    min={`${minLicenceExDate}`}
                  />
                  <CustomInput
                    value={Data.Department}
                    handleChange={handleChange}
                    Name="Department"
                    Label="Department"
                  />
                  <CustomInput
                    value={Data.RFID}
                    handleChange={handleChange}
                    Name="RFID"
                    Label="RFID"
                  />

                  <Form.Group
                    controlId="formFile"
                    className="col-12 col-md-6 col-lg-4 mb-3"
                  >
                    <Form.Label>Upload Image</Form.Label>
                    <Form.Control
                      className="border-primary"
                      type="file"
                      onChange={handleChange}
                      name="Image"
                    />
                  </Form.Group>
                  <CustomInput
                    disabled={true}
                    value={Data.SelectedVehiclePlateNumber}
                    handleChange={handleChange}
                    Name="SelectedVehiclePlateNumber"
                    Label="Selected Vehicle Plate Number"
                  />
                  <h4>WASL Integration (Optional)</h4>
                  <CustomInput
                    value={Data.IdentityNumber}
                    handleChange={handleChange}
                    Name="IdentityNumber"
                    Label="Identity Number"
                    required={false}
                  />
                  <CustomInput
                    Type={"text"}
                    value={Data.DateOfBirthHijri}
                    handleChange={handleChange}
                    Name="DateOfBirthHijri"
                    Label="Date Of Birth Hijri"
                    required={false}
                  />
                  <CustomInput
                    value={Data.MobileNumber}
                    handleChange={handleChange}
                    Name="MobileNumber"
                    Label="Mobile Number"
                    required={false}
                    Type="number"
                    min={0}
                    onKeyDown={blockInvalidChar}
                  />
                </Row>
              </Col>
              {/* <Col md="4"> */}
              {/* <Col md={`${assigne ? "4" : "12"}`}> */}
              {/* {assigne && (
                  <Card>
                    <Card.Body>
                      <div className="input-group mb-3">
                        <input
                          type="text"
                          className={`form-control ${style.Search}`}
                          onChange={(e) => setTreeFilter(e.target.value)}
                          placeholder="Enter Serial Number..."
                        />
                      </div>
                      <MenuTree
                        setTreeVehicleID={setTreeVehicleID}
                        treeFilter={treeFilter}
                      />
                    </Card.Body>
                  </Card>
                )} */}

              {/* <Card>
                  <Card.Body>
                    <div className="input-group mb-3">
                      <input
                        type="text"
                        className={`form-control ${style.Search}`}
                        onChange={(e) => setTreeFilter(e.target.value)}
                        placeholder="Enter Serial Number..."
                      />
                    </div>
                    <MenuTree
                      setTreeVehicleID={setTreeVehicleID}
                      treeFilter={treeFilter}
                    />
                  </Card.Body>
                </Card> */}
              {/* </Col> */}
            </Row>
            <Model
              header={"Vehicles List"}
              show={modalShow}
              onHide={() => setModalShow(false)}
              onUpdate={assignVehicleHandler}
              disabled={rowSelected ? false : true}
              updateButton={"Assign to Driver"}
            >
              <AgGridDT
                rowHeight={"auto"}
                columnDefs={columns}
                rowData={vehiclesData}
                rowSelection={"single"}
                paginationPageSize={10}
                defaultColDef={defaultColDef}
                onGridReady={onGridReady}
                overlayNoRowsTemplate={t("loading")}
                ref={gridRef}
                onSelectionChanged={(e) =>
                  setRowSelected([...e.api.getSelectedRows()][0])
                }
                onFirstDataRendered={onFirstDataRendered}
              />
            </Model>
            <Row>
              <div className="w-25 d-flex flex-wrap flex-md-nowrap">
                <Button
                  className="px-3 py-2 text-nowrap me-3 mb-2 mb-md-0"
                  onClick={(e) => {
                    e.preventDefault();
                    // setassigne((prev) => !prev);
                    setModalShow(true);
                  }}
                >
                  <FontAwesomeIcon className="me-2" icon={faCar} size="sm" />
                  Assign Vehicle to Driver
                </Button>
                <Button
                  type="submit"
                  // disabled={loading}
                  className="px-3 py-2 text-nowrap me-3 mb-2 mb-md-0"
                >
                  {!loading ? (
                    <FontAwesomeIcon
                      className="mx-2"
                      icon={faCheck}
                      size="sm"
                    />
                  ) : (
                    <FontAwesomeIcon
                      className="mx-2 fa-spin"
                      icon={faSpinner}
                      size="sm"
                    />
                  )}
                  Save
                </Button>
                <Button
                  className="px-3 py-2 text-nowrap me-3 ms-0"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("/driversManagement");
                  }}
                >
                  <FontAwesomeIcon className="mx-2" icon={faTimes} size="sm" />
                  Cancel
                </Button>
              </div>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
}

// translation ##################################
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["main"])),
    },
  };
}
// translation ##################################
