import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { faCheck, faSpinner, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import config from "../../../config/config";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { toast } from "react-toastify";
import useToken from "../../../hooks/useToken";
import { CustomInput } from "../../../components/CustomInput";
import CustomSelectBox from "../../../components/CustomSelectBox";

export default function EditVehicles() {
  const router = useRouter();
  const { tokenRef } = useToken();
  const { id } = router.query;

  const [dueValueMsg, setDueValueMsg] = useState("");
  const [percentageValMsg, setPercentageValMsg] = useState("");

  const [loading, setloading] = useState(false);

  const [validated, setValidated] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [Data, setData] = useState({});
  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      let mainData = { ...Data };
      delete mainData.ID;

      setLoadingUpdate(true);

      await axios
        .put(
          `${config.apiGateway.URL}dashboard/management/maintenance/${id}`,
          mainData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tokenRef}`,
            },
          }
        )
        .then(() => {
          toast.success("Driver Updated Successfully.");
          router.push("/preventiveMaintenance");
        })
        .catch((error) => {
          toast.error(`Error: ${error?.message}`);
        })
        .finally(() => {
          setLoadingUpdate(false);
        });
    }
    setValidated(true);
  };

  useEffect(() => {
    setloading(true);
    tokenRef &&
      (async function () {
        await axios
          .get(
            `${config.apiGateway.URL}dashboard/management/maintenance/${id}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${tokenRef}`,
              },
            }
          )
          .then(({ data }) => {
            const allD = data.result[0];

            for (let item in data.result[0]) {
              if (allD[item] === null) {
                allD[item] = 0;
              }

              if (allD[item] === true) {
                allD[item] = 1;
              }

              if (allD[item] === false) {
                allD[item] = 0;
              }
            }
            setData(data.result[0]);
          })
          .catch((err) => {
            window.location.href = "/preventiveMaintenance";
            toast.error(err.message);
          })
          .finally(() => {
            setloading(false);
          });
      })();
  }, [tokenRef]);

  const optionsMaintenanceType = useMemo(() => {
    return [
      {
        value: 1,
        label: "Engine Oil Change",
      },
      {
        value: 2,
        label: "Change Vehicle Brakes",
      },
      {
        value: 3,
        label: "Vehicle License Renew",
      },
      {
        value: 4,
        label: "Vehicle Wash",
      },
      {
        value: 5,
        label: "Tires Change",
      },
      {
        value: 6,
        label: "Transmission Oil Change",
      },
      {
        value: 7,
        label: "Filter Change",
      },
      {
        value: 8,
        label: "Others",
      },
    ];
  }, []);

  const optionsPeriodType = useMemo(() => {
    return [
      {
        value: 9,
        label: "By Mileage",
      },
      {
        value: 10,
        label: "By Fixed Date",
      },
      {
        value: 11,
        label: "By Working Hours",
      },
    ];
  }, []);

  const optionsNotifyPeriod = useMemo(() => {
    return [
      {
        value: "Percentage",
        label: "Percentage",
      },
      {
        value: "Value",
        label: "Value",
      },
    ];
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "Recurring" || name === "NotifyByPush") {
      setData({
        ...Data,
        [name]: e.target.checked ? 1 : 0,
      });
    } else if (name === "PercentageValue") {
      if (value) {
        const valueHandle = Math.max(1, Math.min(100, Number(+value)));
        let NotifywhenValue =
          +Data.MaintenanceDueValue * (+valueHandle / 100) + +Data.StartValue;

        setData({
          ...Data,
          NotifywhenValue,
          [name]: valueHandle,
        });
      } else {
        setData({
          ...Data,
          NotifywhenValue: 0,
          [name]: value,
        });
      }
    } else if (name === "MaintenanceDueValue") {
      if (Data.PercentageValue) {
        let NotifywhenValue =
          +value * (+Data.PercentageValue / 100) + +Data.StartValue;
        setData({
          ...Data,
          NextValue: Data.StartValue > 0 && +value + +Data.StartValue,
          NotifywhenValue,
          [name]: value,
        });
      } else {
        setData({
          ...Data,
          NextValue: Data.StartValue > 0 && +value + +Data.StartValue,
          [name]: value,
        });
      }
    } else {
      setData({
        ...Data,
        [name]: value,
      });
    }
  };

  const checkIfNumber = (e) => {
    return !/[0-9]/.test(e.key) ? true : false;
  };

  const handleMaintenanceDueValueOnKeyPress = (e) => {
    if (Data.StartValue === 0) {
      e.preventDefault();
      setDueValueMsg("Please Select a vehicle");
    }
    if (checkIfNumber(e)) {
      e.preventDefault();
      setDueValueMsg("Please Enter Number Only! ");
    }

    if (!checkIfNumber(e)) {
      setDueValueMsg("");
    }
  };

  const handlePercentageValueOnKeyPress = (e) => {
    if (checkIfNumber(e)) {
      e.preventDefault();
      setPercentageValMsg("Please Enter Number Only! ");
    }

    if (!checkIfNumber(e)) {
      setPercentageValMsg("");
    }
  };

  return (
    <>
      <Card>
        <Card.Header className="h3">
          Update Maintenance Plan {Data?.DisplayName}
        </Card.Header>
        <Card.Body>
          <>
            {loading ? (
              <h3 className="text-center pt-5 pb-5">loading...</h3>
            ) : (
              <Row>
                <Col lg="12">
                  <Form
                    noValidate
                    validated={validated}
                    onSubmit={handleSubmit}
                  >
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

                      <Form.Group
                        className="col-md-4 mb-3"
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
                          checked={Data.Recurring}
                        />
                        <Form.Check
                          className="col-6 col-lg-3"
                          onChange={handleChange}
                          name="NotifyByPush"
                          type={"checkbox"}
                          id="NotifyByPush"
                          label="Notify By Push"
                          checked={Data.NotifyByPush}
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

                      {Data.NotifyPeriod ? (
                        <>
                          {Data.NotifyPeriod === "Percentage" ? (
                            <>
                              <Form.Group
                                className="col-md-4 mb-3"
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
                                  <p className="text-danger">
                                    {percentageValMsg}
                                  </p>
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
                          ) : (
                            <>
                              <CustomInput
                                required={true}
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
                          <Form.Group
                            className="col-md-4 mb-3"
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
                    </Row>
                    <div className="w-25 d-flex flex-wrap flex-md-nowrap">
                      <Button
                        type="submit"
                        disabled={loadingUpdate}
                        className="px-3 py-2 text-nowrap me-3 ms-0 ms-md-3 mb-2 mb-md-0"
                      >
                        {!loadingUpdate ? (
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
              </Row>
            )}
          </>
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
