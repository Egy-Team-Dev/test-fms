import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faSpinner, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Button, Card, Col, Row, Form } from "react-bootstrap";
import { toast } from "react-toastify";
// import { useTranslation } from "next-i18next";
import { Formik } from "formik";
import Input from "components/formik/Input";
import ReactSelect from "components/formik/ReactSelect/ReactSelect";
import { AddDeviceValidation } from "helpers/yup-validations/management/DeviceManagement";
import {
  fetchDeviceTypes,
  fetchSingleDevice,
  fetchAllUnAssignedSimCardData,
  updateDevice,
} from "services/management/DeviceManagement";
import Spinner from "components/UI/Spinner";

const EditDevice = ({
  editId,
  updateAssignedTable,
  updateUnassignedTable,
  handleModel,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [allDeviceTypesOptions, setAllDeviceTypesOptions] = useState([]);
  const [unAssignedSimCardsOptions, setUnAssignedSimCardsOptions] = useState(
    []
  );
  const [deviceData, setDeviceData] = useState({});
  const [disableInputs, setDisableInputs] = useState(false);
  const [serialNumberInput, setSerialNumberInput] = useState("");
  const [phoneNumberInput, setPhoneNumberInput] = useState("");
  const [chosenType, setChosenType] = useState("");

  useEffect(() => {
    (async () => {
      setLoadingPage(true);
      try {
        // fetch device data
        const fetchDevice = await fetchSingleDevice(editId);
        let device = fetchDevice.result[0];
        setDeviceData(device);
        // fetch device types for select
        const fetchDevTypes = await fetchDeviceTypes();
        setAllDeviceTypesOptions(
          fetchDevTypes?.allDeviceTypes?.map((ele) => {
            return { value: ele.ID, label: ele.DeviceType };
          })
        );
        // fetch unAssignedSimCards for select
        const fetchUnAssignedSimCardsData =
          await fetchAllUnAssignedSimCardData();
        const unAssignedSimcards = fetchUnAssignedSimCardsData.result.map(
          (ele) => {
            return {
              value: ele.ID,
              label: ele.PhoneNumber,
              provID: ele.ProviderID,
            };
          }
        );
        setUnAssignedSimCardsOptions([
          {
            value: device.SimID,
            label: device.PhoneNumber,
            provID: device.ProviderID,
          },
          ...unAssignedSimcards,
        ]);
      } catch (error) {
        toast.error(error.response.data?.message);
      }
      setLoadingPage(false);
    })();
  }, [editId]);

  // options for sim provider for react select
  const statusOptions = [
    { value: 0, label: "Used" },
    { value: 1, label: "Ready to Use" },
    { value: 2, label: "Returned" },
    { value: 3, label: "Deffected" },
  ];

  // options for sim provider for react select
  const simProviderOptions = [
    { value: 1, label: "Mobily" },
    { value: 2, label: "STC" },
    { value: 3, label: "Zain" },
    { value: 4, label: "Lebara" },
  ];

  const onSubmit = async (data) => {
    const submitData = {
      ...deviceData,
      ...data,
      ProviderID: chosenType ? chosenType : data.ProviderID,
    };
    if (submitData.SimID) {
      submitData.SimID = submitData.SimID[0]?.value || submitData.SimID;
    }
    setLoading(true);
    try {
      const respond = await updateDevice(editId, submitData);
      setLoading(false);
      toast.success(respond?.message);
      handleModel();
      updateAssignedTable();
      updateUnassignedTable();
    } catch (error) {
      setLoading(false);
      toast.error(
        error.response?.data?.message ||
          "Something went wrong, Try again later!"
      );
    }
  };

  const initialValues = {
    SerialNumber: deviceData.SerialNumber,
    DeviceTypeID: deviceData.DeviceTypeID,
    Status: deviceData.Status,
    SimID: deviceData.SimID,
    PhoneNumber: deviceData.PhoneNumber,
    ProviderID: deviceData.ProviderID,
    simSelected: deviceData.SimSerialNumber,
  };

  // const getFormData = (values) => {
  //   if (values.simSelected) {
  //     setDisableInputs(true);
  //     setSerialNumberInput(values.simSelected[0]?.label || "");
  //     setPhoneNumberInput(values.simSelected[0]?.value || "");
  //     setChosenType(values.simSelected[0]?.provID);
  //   }
  // };

  return (
    <div className="container-fluid">
      {loadingPage && <Spinner />}
      {Object.keys(deviceData).length > 0 &&
        allDeviceTypesOptions.length > 0 &&
        unAssignedSimCardsOptions.length > 0 && (
          <Card className="py-0 mb-2">
            <Card.Body className="py-0">
              <Formik
                initialValues={initialValues}
                validationSchema={AddDeviceValidation}
                onSubmit={onSubmit}
              >
                {(formik) => {
                  // setTimeout(() => getFormData(formik.values), 0);
                  return (
                    <Form onSubmit={formik.handleSubmit}>
                      <Row>
                        <Col className="mx-auto" md={12}>
                          <Row>
                            <h4 className="mb-3">Edit Device</h4>
                            <Input
                              placeholder="Serial Number"
                              label="Serial Number"
                              name="SerialNumber"
                              type="text"
                              className={"col-6 mb-3"}
                              onFocus={(event) => event.target.select()}
                            />

                            <ReactSelect
                              options={allDeviceTypesOptions}
                              label="Device Type"
                              placeholder="Select Device Type"
                              name="DeviceTypeID"
                              className={"col-6 mb-3"}
                              isSearchable={true}
                            />

                            <ReactSelect
                              options={statusOptions}
                              defaultValue={deviceData?.Status}
                              label="Status"
                              placeholder="Select Status"
                              name="Status"
                              className={"col-12 mb-3"}
                              isSearchable={true}
                            />

                            <h4 className="mb-3">Edit SIM Card</h4>
                            <ReactSelect
                              options={unAssignedSimCardsOptions}
                              label="Select a SIM card"
                              placeholder="Select a SIM card"
                              name="SimID"
                              defaultValue={deviceData?.SimID}
                              className={"col-12 mb-3"}
                              isSearchable={true}
                              isObject={true}
                            />

                            {/* <Input
                              placeholder="Serial Number"
                              label="Serial Number"
                              name="simSerialNumber"
                              type="text"
                              className={"col-6 mb-3"}
                              disabled={disableInputs ? true : false}
                              onFocus={(event) => event.target.select()}
                              value={
                                (formik.values.simSerialNumber =
                                  serialNumberInput
                                    ? serialNumberInput
                                    : deviceData.SimSerialNumber)
                              }
                            />

                            <Input
                              placeholder="Phone Number"
                              label="Phone Number"
                              name="phoneNumber"
                              type="text"
                              className={"col-6 mb-3"}
                              disabled={disableInputs ? true : false}
                              onFocus={(event) => event.target.select()}
                              value={
                                (formik.values.phoneNumber = phoneNumberInput
                                  ? phoneNumberInput
                                  : deviceData.PhoneNumber)
                              }
                            />

                            <ReactSelect
                              options={simProviderOptions}
                              label="SIM Provider"
                              placeholder="Select SIM Provider"
                              name="ProviderID"
                              className={"col-12 mb-3"}
                              isSearchable={true}
                              isDisabled={disableInputs ? true : false}
                              value={
                                chosenType
                                  ? simProviderOptions.find(
                                      (option) => option.value === chosenType
                                    )
                                  : simProviderOptions.find(
                                      (option) =>
                                        option.value ===
                                        formik.values.ProviderID
                                    )
                              }
                            /> */}
                          </Row>
                        </Col>
                      </Row>
                      <Row>
                        <Col className="mx-auto" md={12}>
                          <div className="w-25 d-flex flex-wrap flex-md-nowrap">
                            <Button
                              type="submit"
                              className="px-3 py-2 text-nowrap me-3 mb-2 mb-md-0"
                              disabled={loading}
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
                              onClick={() => {
                                handleModel();
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
                        </Col>
                      </Row>
                    </Form>
                  );
                }}
              </Formik>
            </Card.Body>
          </Card>
        )}
    </div>
  );
};

export default EditDevice;
