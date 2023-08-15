import { faCheck, faSpinner, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { Button, Card, Form, Row } from "react-bootstrap";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import axios from "axios";
import config from "../../../config/config";
import { toast } from "react-toastify";
import useToken from "../../../hooks/useToken";
import useData from "../useData";
import { useEffect, useCallback, useState } from "react";
import ReactSelect from "../../../components/Select";
import CustomInputForm from "../../../components/CustomInputForm";
import { useForm } from "react-hook-form";

const Edit = () => {
  const router = useRouter();
  const { tokenRef } = useToken();
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [periodType, setPeriodType] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [notifyByPush, setNotifyByPush] = useState(false);
  const [fixedDateCase, setFixedDateCase] = useState(false);
  const [notifyType, setNotifyType] = useState("");
  const [valueNotifyType, setValueNotifyType] = useState(false);
  const [notifyValueError, setNotifyValueError] = useState(false);
  const [notifyDateError, setNotifyDateError] = useState(false);
  const [loading, setloading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);
  const [Data, setData] = useState({});

  const { id } = router.query;

  const { optionsMaintenanceType, optionsPeriodType, optionsNotifyPeriod } =
    useData(selectedVehicles);

  // fetch maintenance data
  useEffect(() => {
    if (!id) {
      router.back();
    } else {
      if (tokenRef) {
        const fetchData = async () => {
          try {
            setLoadingPage(true);
            const respond = await axios.get(
              `${config.apiGateway.URL}dashboard/management/maintenance/${id}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${tokenRef}`,
                },
              }
            );
            setLoadingPage(false);
            setRecurring(respond.data.result[0].Recurring);
            setNotifyByPush(respond.data.result[0].NotifyByPush);
            setFixedDateCase(
              respond.data.result[0].PeriodType === 2 ? true : false
            );
            setData(respond.data.result[0]);
            setSelectedVehicles(respond.data.result);
            setPeriodType(respond.data.result[0].PeriodType);
          } catch (error) {
            toast.error(error?.response?.data?.message);
            setLoadingPage(false);
          }
        };
        fetchData();
      }
    }
  }, [id, tokenRef]);

  // minimum date used in date inputs
  const minDate = new Date().toISOString().slice(0, 10);

  // state of react hook form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  // watch change in input value to calculate values
  const watchMaintenanceType = watch("MaintenanceDueValue") || 0;
  const watchPercentageValue = watch("PercentageValue") || 0;

  // helper func to make Mileage and working hours logic
  const periodTypeFunc = useCallback(
    (vehiclesData) => {
      setValue(
        "StartValue",
        vehiclesData?.length === 1 ? vehiclesData[0]?.StartValue : 0
      );

      setValue(
        "NextValue",
        vehiclesData?.length === 1
          ? +vehiclesData[0]?.StartValue + +watchMaintenanceType
          : 0
      );

      if (notifyType === "1") {
        setValueNotifyType(false);
        setValue(
          "WhenValue",
          vehiclesData?.length === 1
            ? +vehiclesData[0]?.StartValue +
            +watchMaintenanceType * (+watchPercentageValue / 100)
            : 0
        );
      } else if (notifyType === "2") {
        setValueNotifyType(true);
        setValue("WhenValue", +vehiclesData[0]?.WhenValue);
      }
    },
    [notifyType, setValue, watchPercentageValue, watchMaintenanceType]
  );

  // set values of inputs
  useEffect(() => {
    if (Object.keys(Data)?.length > 1) {
      // conditions of period Type equal to Mileage or WorkingHours
      if (periodType === 1 || periodType === 3) {
        periodTypeFunc(selectedVehicles);
        // conditions of period Type equal to fixed date
      } else if (periodType === 2) {
        const StartValue = new Date().toISOString().slice(0, 10);
        setValue("StartValue", StartValue);
        setValue("NextValue", watchMaintenanceType);
      }
    }
  }, [
    periodTypeFunc,
    setValue,
    watchMaintenanceType,
    Data,
    selectedVehicles,
    periodType,
  ]);

  // handle select of a Notify Type
  const onSelectNotifyTypeChange = (selectInput) => {
    setNotifyType(selectInput);
  };

  const onSubmit = async (data) => {
    const MaintenanceType = optionsMaintenanceType?.filter(
      (type) => type.label === data.MaintenanceType
    )[0].value;
    const PeriodType = optionsPeriodType?.filter(
      (type) => type.label === data.PeriodType
    )[0].value;

    const submitedData = {
      ...data,
      Recurring: data.Recurring ? 1 : 0,
      NotifyByPush: data.NotifyByPush ? 1 : 0,
      MaintenanceType,
      PeriodType,
      NextValue: `${data.NextValue}`,
      StartValue: `${data.StartValue}`,
      WhenValue: `${data.WhenValue}`,
      MaintenanceDueValue: `${data.MaintenanceDueValue}`,
      VehicleID: Data.VehicleID,
      WhenPeriod: +notifyType,
      NotifyBySMS: null,
      IsNotified: null,
    };

    // validation when next value smaller than when value or start value smaller than when value
    if (data.NextValue < +data.WhenValue || data.StartValue > +data.WhenValue) {
      setNotifyValueError(true);
      return;
    }
    setNotifyValueError(false);
    // validation when next value date smaller than when value date or start value date smaller than when value date
    if (periodType === 2) {
      if (new Date(data.NextValue) < new Date(data.WhenValue)) {
        setNotifyDateError(true);
        return;
      }
      setNotifyDateError(false);
    }

    setloading(true);
    try {
      const respond = await axios({
        method: "put",
        url: `${config.apiGateway.URL}dashboard/management/maintenance/${id}`,
        data: JSON.stringify(submitedData),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenRef}`,
        },
      });
      toast.success(respond.data.result);
      setloading(false);
      router.push("/preventiveMaintenance");
    } catch (error) {
      toast.error(error.response.data?.message);
      setloading(false);
    }
  };

  return (
    <>
      {loadingPage && <h3 className="text-center pt-5 pb-5">loading...</h3>}
      {Object.keys(Data)?.length > 1 && (
        <Card>
          <Card.Header className="h3">Update Maintenance Plan</Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Row>
                <CustomInputForm
                  required={true}
                  type="text"
                  value={Data.DisplayName}
                  name="vehicleName"
                  label="Vehicle Name"
                  placeholder="Vehicle Name"
                  register={register}
                  errors={errors}
                  disabled={true}
                  errorMsg="Vehicle Name is required."
                />
                <CustomInputForm
                  required={true}
                  type="text"
                  value={
                    optionsMaintenanceType?.filter(
                      (type) => type.value === Data.MaintenanceType
                    )[0]?.label
                  }
                  name="MaintenanceType"
                  label="Maintenance Type"
                  placeholder="Select Maintenance Type"
                  register={register}
                  errors={errors}
                  disabled={true}
                  errorMsg="Select Maintenance Type is required."
                />
                <CustomInputForm
                  required={true}
                  type="text"
                  value={
                    optionsPeriodType?.filter(
                      (type) => type.value === Data.PeriodType
                    )[0]?.label
                  }
                  name="PeriodType"
                  label="Period Type"
                  placeholder="Select Period Type"
                  register={register}
                  errors={errors}
                  disabled={true}
                  errorMsg="Select Period Type is required."
                />
                {!(selectedVehicles?.length > 1) && !fixedDateCase && (
                  <CustomInputForm
                    type="number"
                    disabled={true}
                    value={Data.StartValue}
                    name="StartValue"
                    label="Start Value"
                    register={register}
                    errors={errors}
                    required={true}
                  />
                )}
                <CustomInputForm
                  type={fixedDateCase ? "date" : "number"}
                  value={
                    fixedDateCase
                      ? Data.NextValue
                      : Data.NextValue - Data.StartValue
                  }
                  name="MaintenanceDueValue"
                  label="Maintenance Due Value"
                  placeholder="Maintenance Due Value"
                  register={register}
                  errors={errors}
                  required={true}
                  errorMsg="Maintenance Due Value is required"
                  onFocus={(event) => event.target.select()}
                  min={fixedDateCase ? minDate : 0}
                />

                {!(selectedVehicles?.length > 1) && !fixedDateCase && (
                  <CustomInputForm
                    type="number"
                    disabled={true}
                    value={Data.NextValue}
                    name="NextValue"
                    label="Next Value"
                    register={register}
                    errors={errors}
                    required={true}
                  />
                )}

                <CustomInputForm
                  required={true}
                  type="email"
                  name="NotifyByEmail"
                  label="Email Address"
                  value={Data.NotifyByEmail}
                  placeholder="Email Address"
                  errorMsg="Email Address is required."
                  register={register}
                  errors={errors}
                  validate={true}
                />

                <Row className="d-flex  justify-content-start ms-2 my-2">
                  <Form.Check
                    className="col-6 col-lg-3"
                    name="Recurring"
                    type="checkbox"
                    id="Recurring"
                    label="Recurring"
                    disabled={fixedDateCase ? true : false}
                    {...register("Recurring")}
                    checked={recurring ? true : false}
                    onClick={() => setRecurring(!recurring)}
                  />
                  <Form.Check
                    className="col-6 col-lg-3"
                    name="NotifyByPush"
                    type={"checkbox"}
                    id="NotifyByPush"
                    label="Notify By Push"
                    {...register("NotifyByPush")}
                    checked={notifyByPush ? true : false}
                    onClick={() => setNotifyByPush(!notifyByPush)}
                  />
                </Row>
                <Row>
                  <CustomInputForm
                    required={true}
                    type="text"
                    value={Data.NotifMessage}
                    name="NotifMessage"
                    label="Notify Message"
                    placeholder="Notify Message"
                    register={register}
                    errors={errors}
                    validate={true}
                    errorMsg="Notify Message is required."
                  />
                </Row>
                <ReactSelect
                  placeholder="Select Notify Period"
                  className="mb-3 col-12 col-md-6 col-lg-4"
                  options={optionsNotifyPeriod}
                  onSelectChange={onSelectNotifyTypeChange}
                  defaultValue={{
                    value: "1",
                    label: "Percentage",
                  }}
                  isSearchable={false}
                  label={"Notify Period"}
                  error={false}
                  errorMsg="Select Notify Period is required"
                  isDisabled={fixedDateCase ? true : false}
                />

                {!valueNotifyType && !fixedDateCase && (
                  <CustomInputForm
                    type="number"
                    value={
                      ((Data.WhenValue - Data.StartValue) * 100) /
                      (Data.NextValue - Data.StartValue)
                    }
                    name="PercentageValue"
                    label="Percentage Value"
                    placeholder={"Percentage Value"}
                    register={register}
                    errors={errors}
                    required={true}
                    min={1}
                    max={100}
                    maxLength={3}
                    errorMsg="Percentage Value is required."
                  />
                )}
                {!(selectedVehicles?.length > 1) || fixedDateCase ? (
                  <CustomInputForm
                    type={fixedDateCase ? "date" : "number"}
                    min={fixedDateCase ? minDate : 0}
                    disabled={valueNotifyType || fixedDateCase ? false : true}
                    value={Data.WhenValue}
                    name="WhenValue"
                    label="Notify when Value"
                    register={register}
                    errors={errors}
                    required={true}
                    customError={notifyValueError || notifyDateError}
                    errorMsg={
                      notifyValueError
                        ? "Notify value should be > start value and < next value"
                        : notifyDateError
                          ? "Notify value should be < Maintenance Due Value"
                          : "Notify when Value is required."
                    }
                    onFocus={(event) => event.target.select()}
                    placeholder="Notify when Value"
                  />
                ) : null}
              </Row>
              <div className="w-25 d-flex flex-wrap flex-md-nowrap">
                <Button
                  type="submit"
                  disabled={loading || selectedVehicles.length === 0}
                  className="px-3 py-2 text-nowrap me-3 ms-0  mb-2 mb-md-0"
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
                  className="px-3 py-2 text-nowrap me-3 ms-0 "
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("/preventiveMaintenance");
                  }}
                >
                  <FontAwesomeIcon className="mx-2" icon={faTimes} size="sm" />
                  Cancel
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}
    </>
  );
};

export default Edit;

// translation ##################################
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["main"])),
    },
  };
}
// translation ##################################
