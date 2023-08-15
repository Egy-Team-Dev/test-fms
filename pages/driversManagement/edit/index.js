import React, { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import {
  faCar,
  faCheck,
  faSpinner,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector } from "react-redux";
import axios from "axios";
import config from "../../../config/config";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { toast } from "react-toastify";
import useToken from "../../../hooks/useToken";
import { CustomInput } from "../../../components/CustomInput";

export default function EditVehicles() {
  const router = useRouter();
  const {
    config: { darkMode },
    auth: { user },
  } = useSelector((state) => state);

  const { id } = router.query;
  const [loading, setloading] = useState(false);
  const [Rqloading, setRqloading] = useState(false);

  const [validated, setValidated] = useState(false);
  const [firstError, setFirstError] = useState(false);
  const [lastError, setLastError] = useState(false);
  const [Data, setData] = useState({});
  const [driverId, setDriverId] = useState("");

  // make min birthday is 17 years old from today
  const date = new Date().setFullYear(new Date().getFullYear() - 17);
  const maxLicenceBirthDate = new Date(date).toISOString().slice(0, 10);

  //make min licence expire Date is today
  const minLicenceExDate = new Date().toISOString().slice(0, 10);

  // helper func to check if input value has number or pure text
  function stringContainsNumber(_string) {
    return /\d/.test(_string);
  }

  // helper func to prevent some characters to put in input
  const blockInvalidChar = (e) =>
    ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault();

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({
      ...Data,
      [name]: value,
    });
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      setRqloading(true);
      await axios
        .put(`${config.apiGateway.URL}dashboard/drivers/${driverId}`, Data, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.new_token}`,
          },
        })
        .then(() => {
          toast.success("Driver Updated Successfully.");
          router.push("/driversManagement");
        })
        .catch((error) => {
          toast.error(error.response.data?.message);
        })
        .finally(() => {
          setRqloading(false);
        });
    }
    setValidated(true);
  };

  useEffect(() => {
    if (!id) {
      router.back();
    }
    setloading(true);
    user?.new_token &&
      (async function () {
        await axios
          .get(`${config.apiGateway.URL}dashboard/drivers/${id}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user?.new_token}`,
            },
          })
          .then(({ data }) => {
            let driver = { ...data?.driver[0] };
            delete driver.DriverID;
            driver.IsDeleted = driver.IsDeleted ? 1 : 0;
            setDriverId(data.driver[0].DriverID);
            setData(driver);
          })
          .catch((err) => {
            toast.error(err.message);
          })
          .finally(() => {
            setloading(false);
          });
      })();
  }, [user?.new_token, id]);

  return (
    <>
      <Card>
        <Card.Header className="h3">Update driver</Card.Header>
        <Card.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            {loading ? (
              <h3 className="text-center pt-5 pb-5">loading...</h3>
            ) : (
              <Row>
                <CustomInput
                  value={Data.FirstName}
                  handleChange={handleChange}
                  Name="FirstName"
                  Label="First Name"
                  isInvalid={firstError ? true : false}
                  feedBack={firstError ? "Please enter a valid first name" : ""}
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
                <CustomInput
                  value={Data.Nationality}
                  handleChange={handleChange}
                  Name="Nationality"
                  Label="Nationality"
                />
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
                  <Form.Control className="border-primary" type="file" />
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
                  Type={"date"}
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
            )}
            <div className="w-25 d-flex flex-wrap flex-md-nowrap">
              <Button
                type="submit"
                disabled={loading}
                className="px-3 py-2 text-nowrap me-3 mb-2 mb-md-0"
              >
                {!Rqloading ? (
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
