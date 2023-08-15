import { faCheck, faSpinner, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
// import { useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { CustomInput } from "../../../components/CustomInput";
import CustomSelectBox from "../../../components/CustomSelectBox";
import style from "../../../styles/ReportsOptions.module.scss";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import MenuTree from "../../../components/preventiveMaintenance/MenuTree";
import axios from "axios";
import config from "../../../config/config";
import { toast } from "react-toastify";
import useToken from "../../../hooks/useToken";
import useData from "../useData";
import useFunc from "./useFunc";
import { useState } from "react";

const Add = () => {
  const router = useRouter();
  const { tokenRef } = useToken();
  const [treeFilter, setTreeFilter] = useState("");
  const [checkedVehicles, setCheckedVehicles] = useState([]);
  const [validated, setValidated] = useState(false);
  const [dueValueMsg, setDueValueMsg] = useState("");
  const [percentageValMsg, setPercentageValMsg] = useState("");

  const [loading, setloading] = useState(false);
  const [Data, setData] = useState({
    MaintenanceType: 1,
    NotifyPeriod: "Percentage",
    PeriodType: 9,
    NextValue: 0,
    StartValue: 0,
    MaintenanceDueValue: 0,
    VehicleID: [],

    Recurring: 0,
    NotifyByEmail: "",
    NotifyBySMS: 0,
    NotifyByPush: 0,
    NotifMessage: "",
    WhenValue: 0,
    WhenPeriod: 0,
    IsNotified: 0,
    NotifywhenValue: 0,
  });

  const { optionsMaintenanceType, optionsPeriodType, optionsNotifyPeriod } =
    useData(checkedVehicles);

  const {
    handleChange,
    handleMaintenanceDueValueOnKeyPress,
    handlePercentageValueOnKeyPress,
  } = useFunc(Data, setData, setDueValueMsg, setPercentageValMsg);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      // event.preventDefault();
      event.stopPropagation();
      setValidated(true);
      setloading(false);
      return;
    }

    setValidated(false);
    setloading(true);

    await axios
      .post(`${config.apiGateway.URL}dashboard/management/maintenance`, Data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenRef}`,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          toast.success("Add Maintenance Successfully");
          router.push("/preventiveMaintenance");
        } else {
          toast.error("Add Maintenance Error");
        }
      })
      .catch((error) => toast.error(error?.message))
      .finally(() => {
        setloading(false);
      });
  };

  return (
    <>
      <Card>
        <Card.Header className="h3">Add Maintenance Plan</Card.Header>
        <Card.Body>
          <Row>
            <Col lg="9">
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Row>
                  <CustomSelectBox
                    name={"MaintenanceType"}
                    Label="Maintenance Type"
                    value={Data.MaintenanceType}
                    handleChange={handleChange}
                    Options={optionsMaintenanceType}
                  />
                  <CustomSelectBox
                    name={"PeriodType"}
                    Label="Period Type"
                    value={Data.PeriodType}
                    handleChange={handleChange}
                    Options={optionsPeriodType}
                  />
                  {checkedVehicles?.length > 1 ||
                    Data.PeriodType == true ? null : (
                    <>
                      <CustomInput
                        Type="number"
                        disabled={true}
                        value={Data.StartValue}
                        Name="StartValue"
                        Label="Start Value"
                      />
                      <CustomInput
                        Type="number"
                        disabled={true}
                        value={Data.NextValue}
                        Name="NextValue"
                        Label="Next Value"
                      />
                    </>
                  )}

                  <Form.Group
                    className="col-12 col-md-6 col-lg-4 mb-3"
                    controlId="Maintenance Due Value"
                  >
                    <Form.Label>Maintenance Due Value</Form.Label>
                    <Form.Control
                      className="border-primary fw-bold"
                      name="MaintenanceDueValue"
                      value={Data.MaintenanceDueValue}
                      onChange={handleChange}
                      type="number"
                      placeholder="Maintenance Due Value"
                      disabled={false}
                      required={true}
                      onKeyPress={handleMaintenanceDueValueOnKeyPress}
                    />
                    <Form.Control.Feedback type="invalid">
                      Maintenance Due Value is required
                    </Form.Control.Feedback>
                    {dueValueMsg && (
                      <p className="text-danger">{dueValueMsg}</p>
                    )}
                  </Form.Group>

                  <CustomInput
                    required={true}
                    Type="email"
                    value={Data.NotifyByEmail}
                    handleChange={handleChange}
                    Name="NotifyByEmail"
                    Label="Email Address"
                  />
                  <Row className="d-flex  justify-content-start ps-5 my-2">
                    {" "}
                    <Form.Check
                      className="col-6 col-lg-3"
                      onChange={handleChange}
                      name="Recurring"
                      type={"checkbox"}
                      id="Recurring"
                      label="Recurring"
                    />
                    <Form.Check
                      className="col-6 col-lg-3"
                      onChange={handleChange}
                      name="NotifyByPush"
                      type={"checkbox"}
                      id="NotifyByPush"
                      label="Notify By Push"
                    />
                  </Row>
                  <Row>
                    <CustomInput
                      required={true}
                      value={Data.NotifMessage}
                      handleChange={handleChange}
                      Name="NotifMessage"
                      Label="Notify Message"
                    />
                  </Row>
                  <CustomSelectBox
                    name={"NotifyPeriod"}
                    Label="Notify Period"
                    value={Data.NotifyPeriod}
                    handleChange={handleChange}
                    Options={optionsNotifyPeriod}
                  />
                  {Data.NotifyPeriod === "Percentage" ? (
                    <>
                      {checkedVehicles?.length > 1 ? (
                        <Form.Group
                          className="col-12 col-md-6 col-lg-4 mb-3"
                          controlId="Percentage Value"
                        >
                          <Form.Label>Percentage Value</Form.Label>
                          <Form.Control
                            className="border-primary fw-bold"
                            name="PercentageValue"
                            value={Data.PercentageValue}
                            onChange={handleChange}
                            type="number"
                            placeholder="Percentage Value"
                            disabled={false}
                            required={true}
                            onKeyPress={handlePercentageValueOnKeyPress}
                            min="1"
                            max="100"
                          />
                          <Form.Control.Feedback type="invalid">
                            Percentage Value is required
                          </Form.Control.Feedback>
                          {percentageValMsg && (
                            <p className="text-danger">{percentageValMsg}</p>
                          )}
                        </Form.Group>
                      ) : (
                        <>
                          <Form.Group
                            className="col-12 col-md-6 col-lg-4 mb-3"
                            controlId="Percentage Value"
                          >
                            <Form.Label>Percentage Value</Form.Label>
                            <Form.Control
                              className="border-primary fw-bold"
                              name="PercentageValue"
                              value={Data.PercentageValue}
                              onChange={handleChange}
                              type="number"
                              placeholder="Percentage Value"
                              disabled={false}
                              required={true}
                              onKeyPress={handlePercentageValueOnKeyPress}
                              min="1"
                              max="100"
                            />
                            <Form.Control.Feedback type="invalid">
                              Percentage Value is required
                            </Form.Control.Feedback>
                            {percentageValMsg && (
                              <p className="text-danger">{percentageValMsg}</p>
                            )}
                          </Form.Group>

                          <CustomInput
                            required={false}
                            disabled={true}
                            Type="number"
                            value={Data.NotifywhenValue}
                            handleChange={handleChange}
                            Name="NotifywhenValue"
                            Label="Notify when Value"
                          />
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {checkedVehicles?.length < 2 && (
                        <CustomInput
                          required={true}
                          Type="number"
                          value={Data.NotifywhenValue}
                          handleChange={handleChange}
                          Name="NotifywhenValue"
                          Label="Notify when Value"
                        />
                      )}
                    </>
                  )}
                </Row>
                <div className="w-25 d-flex flex-wrap flex-md-nowrap">
                  <Button
                    type="submit"
                    disabled={loading || checkedVehicles.length === 0}
                    className="px-3 py-2 text-nowrap me-3 ms-0 ms-md-3 mb-2 mb-md-0"
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
                    className="px-3 py-2 text-nowrap me-3 ms-0 ms-md-3"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push("/preventiveMaintenance");
                    }}
                  >
                    <FontAwesomeIcon
                      className="mx-2"
                      icon={faTimes}
                      size="sm"
                    />
                    Cancel
                  </Button>
                </div>
              </Form>
            </Col>
            <Col lg="3">
              <div className="input-group mb-3">
                <input
                  type="text"
                  className={`form-control ms-3 ${style.Search}`}
                  value={treeFilter}
                  onChange={(e) => setTreeFilter(e.target.value)}
                  placeholder="Enter Serial Number..."
                />
              </div>
              <MenuTree
                setCheckedVehicles={setCheckedVehicles}
                setData={setData}
                Data={Data}
                treeFilter={treeFilter}
                setDueValueMsg={setDueValueMsg}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
};

export default Add;

// translation ##################################
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["main"])),
    },
  };
}
// translation ##################################
