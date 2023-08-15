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
import useStreamDataState from "../../../hooks/useStreamDataState";
import { encryptName } from "../../../helpers/encryptions";

const Add = () => {
  const router = useRouter();
  const { tokenRef } = useToken();
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [selectedVehiclesData, setSelectedVehiclesData] = useState([]);
  const [maintenanceType, setMaintenanceType] = useState("");
  const [periodType, setPeriodType] = useState("");
  const [fixedDateCase, setFixedDateCase] = useState(false);
  const [notifyType, setNotifyType] = useState("");
  const [valueNotifyType, setValueNotifyType] = useState(false);
  const [vehiclesError, setVehiclesError] = useState(false);
  const [valueNotifyPeriodError, setValueNotifyPeriodError] = useState(false);
  const [notifyValueError, setNotifyValueError] = useState(false);
  const [notifyDateError, setNotifyDateError] = useState(false);

  const [loading, setloading] = useState(false);
  const [Data, setData] = useState({
    MaintenanceType: 1,
    NotifyPeriod: "Percentage",
    PeriodType: 1,
    NextValue: 0,
    StartValue: 0,
    MaintenanceDueValue: "",
    VehicleID: [],
    Recurring: 0,
    NotifyByEmail: "",
    NotifyBySMS: 0,
    NotifyByPush: 0,
    NotifMessage: "",
    WhenValue: "",
    WhenPeriod: 0,
    IsNotified: 0,
  });

  const { optionsMaintenanceType, optionsPeriodType, optionsNotifyPeriod } =
    useData(selectedVehicles);

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
  const VehFullData = useSelector((state) => state.streamData.VehFullData);

  // update localstorage with new vehicles data
  const { indexStreamLoader } = useStreamDataState(VehFullData);
  useEffect(() => {
    tokenRef && indexStreamLoader(tokenRef);
  }, [tokenRef]);

  // helper func to make Mileage and working hours logic
  const periodTypeFunc = useCallback(
    (vehiclesData, vehiclesDataType, type) => {
      setValue(
        "StartValue",
        vehiclesData?.length === 1
          ? vehiclesData[0]?.[`${type}`]
          : vehiclesData?.length > 1
          ? vehiclesDataType
          : 0
      );

      setValue(
        "NextValue",
        vehiclesData?.length === 1
          ? vehiclesData[0]?.[`${type}`] + +watchMaintenanceType
          : vehiclesData?.length > 1
          ? vehiclesDataType.map((vehicle) => vehicle + +watchMaintenanceType)
          : 0
      );

      if (notifyType === "1") {
        setValueNotifyType(false);
        setValue(
          "WhenValue",
          vehiclesData?.length === 1
            ? vehiclesData[0]?.[`${type}`] +
                +watchMaintenanceType * (+watchPercentageValue / 100)
            : vehiclesData?.length > 1
            ? vehiclesDataType.map(
                (vehicle) =>
                  vehicle +
                  +watchMaintenanceType * (+watchPercentageValue / 100)
              )
            : 0
        );
      } else if (notifyType === "2") {
        setValueNotifyType(true);
        setValue("WhenValue", 0);
      }
      setFixedDateCase(false);
    },
    [notifyType, setValue, watchPercentageValue, watchMaintenanceType]
  );

  // fetch all vehicles data form local storage
  useEffect(() => {
    const userData =
      localStorage.getItem(encryptName("userData")) &&
      JSON.parse(localStorage.getItem(encryptName("userData")) || {});
    setVehicles(userData?.vehData);

    // add selected vehciles to state
    const vehcilesId = selectedVehicles?.map((vehicle) => vehicle.value);
    const vehiclesData = userData?.vehData?.filter((driver) =>
      vehcilesId.includes(driver.VehicleID)
    );
    setSelectedVehiclesData(vehiclesData);

    const vehiclesMileage = vehiclesData?.map((vehicle) => vehicle.Mileage);
    const vehiclesHours = vehiclesData?.map((vehicle) => vehicle.WorkingHours);

    // conditions of period Type equal to Mileage
    if (periodType === 1) {
      periodTypeFunc(vehiclesData, vehiclesMileage, "Mileage");
      // conditions of period Type equal to WorkingHours
    } else if (periodType === 3) {
      periodTypeFunc(vehiclesData, vehiclesHours, "WorkingHours");
      // conditions of period Type equal to Fixed DAte
    } else if (periodType === 2) {
      setFixedDateCase(true);
      const StartValue = new Date().toISOString().slice(0, 10);
      setValue("StartValue", StartValue);
      setValue("NextValue", watchMaintenanceType);
    }
  }, [
    selectedVehicles,
    periodType,
    periodTypeFunc,
    setValue,
    watchMaintenanceType,
  ]);

  // vehicles options to select a vehicle or more
  const vehiclesOptions = vehicles?.map((vehicle) => {
    return {
      value: vehicle?.VehicleID,
      label: vehicle?.DisplayName,
    };
  });

  // handle select of a vehicle or more
  const onSelectVehiclesChange = (selectInput) => {
    setSelectedVehicles(selectInput);
  };
  // handle select of Maintenance Type
  const onSelectMaintenanceTypeChange = (selectInput) => {
    setMaintenanceType(selectInput);
  };
  // handle select of a Period Type
  const onSelectPeriodTypeChange = (selectInput) => {
    setPeriodType(selectInput);
  };
  // handle select of a Notify Type
  const onSelectNotifyTypeChange = (selectInput) => {
    setNotifyType(selectInput);
  };

  const onSubmit = async (data) => {
    const StartValue =
      data?.StartValue?.length > 1 && typeof data?.StartValue !== "string"
        ? [...data?.StartValue]
        : [data?.StartValue];
    const NextValue =
      data?.NextValue?.length > 1 && typeof data?.NextValue !== "string"
        ? [...data?.NextValue]
        : [data?.NextValue];
    const WhenValue =
      data?.WhenValue?.length > 1 && typeof data?.WhenValue !== "string"
        ? [...data?.WhenValue]
        : [data?.WhenValue];
    const VehicleId = selectedVehicles.map((vehicle) => vehicle?.value);

    const Vehicles = VehicleId?.map((id, index) => {
      return {
        vehicleId: id,
        StartValue: periodType === 2 ? StartValue[0] : StartValue[index],
        NextValue: periodType === 2 ? NextValue[0] : NextValue[index],
        WhenValue: periodType === 2 ? WhenValue[0] : WhenValue[index],
      };
    });

    const submitedData = {
      MaintenanceDueValue: data.MaintenanceDueValue,
      NotifMessage: data.NotifMessage,
      NotifyByEmail: data.NotifyByEmail,
      PercentageValue: data.PercentageValue,
      Vehicles,
      Recurring: data.Recurring ? 1 : 0,
      NotifyByPush: data.NotifyByPush ? 1 : 0,
      MaintenanceType: maintenanceType,
      PeriodType: periodType,
      NotifyPeriod: notifyType,
      WhenPeriod: notifyType,
      NotifyBySMS: null,
      IsNotified: null,
    };

    // validation when no select vehicle
    if (selectedVehicles.length < 1) {
      setVehiclesError(true);
      return;
    }
    setVehiclesError(false);
    // validation when select more than one vehicle and select value option in period type
    if (selectedVehicles.length > 1 && notifyType === "2" && periodType !== 2) {
      setValueNotifyPeriodError(true);
      return;
    }
    setValueNotifyPeriodError(false);
    // validation when next value smaller than when value or start value smaller than when value
    if (
      Vehicles[0]?.NextValue < +Vehicles[0]?.WhenValue ||
      Vehicles[0]?.StartValue > +Vehicles[0]?.WhenValue
    ) {
      setNotifyValueError(true);
      return;
    }
    setNotifyValueError(false);
    // validation when next value date smaller than when value date or start value date smaller than when value date
    if (periodType === 2) {
      if (new Date(Vehicles[0]?.NextValue) < new Date(Vehicles[0]?.WhenValue)) {
        setNotifyDateError(true);
        return;
      }
      setNotifyDateError(false);
    }

    setloading(true);
    try {
      const respond = await axios({
        method: "post",
        url: `${config.apiGateway.URL}dashboard/management/maintenance`,
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
      <Card>
        <Card.Header className="h3">Add Maintenance Plan</Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row>
              <ReactSelect
                placeholder="Select vehicles"
                className="mb-3 col-12 col-md-6 col-lg-4"
                options={vehiclesOptions}
                onSelectChange={onSelectVehiclesChange}
                defaultValue={[]}
                isSearchable={true}
                label="Select vehicles"
                error={vehiclesError ? true : false}
                errorMsg="Select vehicles is required"
                isMulti={true}
              />
              <ReactSelect
                placeholder="Select Maintenance Type"
                className="mb-3 col-12 col-md-6 col-lg-4"
                options={optionsMaintenanceType}
                onSelectChange={onSelectMaintenanceTypeChange}
                defaultValue={{
                  value: 1,
                  label: "Engine Oil Change",
                }}
                isSearchable={false}
                label="Maintenance Type"
                error={false}
                errorMsg="Select Maintenance Type is required"
              />
              <ReactSelect
                placeholder="Select Period Type"
                className="mb-3 col-12 col-md-6 col-lg-4"
                options={optionsPeriodType}
                onSelectChange={onSelectPeriodTypeChange}
                defaultValue={{
                  value: 1,
                  label: "By Mileage",
                }}
                isSearchable={false}
                label="Period Type"
                error={false}
                errorMsg="Select Period Type is required"
              />
              {!(selectedVehiclesData?.length > 1) && !fixedDateCase && (
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
                value={Data.MaintenanceDueValue}
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

              {!(selectedVehiclesData?.length > 1) && !fixedDateCase && (
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
                />
                <Form.Check
                  className="col-6 col-lg-3"
                  name="NotifyByPush"
                  type={"checkbox"}
                  id="NotifyByPush"
                  label="Notify By Push"
                  {...register("NotifyByPush")}
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
                error={valueNotifyPeriodError ? true : false}
                errorMsg="Select Notify Period is required"
                isDisabled={fixedDateCase ? true : false}
              />

              {!valueNotifyType && !fixedDateCase && (
                <CustomInputForm
                  type="number"
                  value={Data.PercentageValue}
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
              {!(selectedVehiclesData?.length > 1) || fixedDateCase ? (
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
                  <FontAwesomeIcon className="mx-2" icon={faCheck} size="sm" />
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
