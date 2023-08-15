import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "next-i18next";

// Bootstrap
import { Col, Form, Modal, Row } from "react-bootstrap";

// Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faSpinner } from "@fortawesome/free-solid-svg-icons";

import { useDispatch, useSelector } from "react-redux";
import { UpdateVehMapFiltered, UpdateVehicle } from "lib/slices/StreamData";
import { toast } from "react-toastify";
import ReactSelect from "components/Select";
import Image from "next/image";
import useStreamDataState from "hooks/useStreamDataState";
import { VehicleOptions } from "helpers/helpers";
import { encryptName } from "helpers/encryptions";
import { updateMapMarkers } from "lib/slices/mainMap";

export default function EditInfo({
  show,
  setShow,
  setVehChecked,
  setAllTreeData,
}) {
  const dispatch = useDispatch();
  const {
    config: { darkMode },
  } = useSelector((state) => state);
  const { t } = useTranslation("common");

  const VehFullData = useSelector((state) => state.streamData.VehFullData);

  const [rqLoading, setRqLoading] = useState(false);
  const { myMap } = useSelector((state) => state.mainMap);
  const id = document
    .getElementById("EditInformationBtn")
    .getAttribute("data-id");

  let locInfo = JSON.parse(
    localStorage.getItem(encryptName("userData"))
  ).vehData.find((x) => x.VehicleID == id);
  // let locInfo = VehFullData.find((x) => x.VehicleID == id);

  const localIcon = VehicleOptions(t).find(
    (x) => x.value == localStorage.getItem("VehicleIcon")
  );

  // const localS =
  //     typeof window !== undefined &&
  //     JSON.parse(localStorage.getItem(encryptName("userData"))).vehData.find(
  //         (x) => x.VehicleID == id
  //     );
  // console.log(localS);

  const [Data, setData] = useState({
    DisplayName: locInfo.DisplayName,
    PlateNumber: locInfo.PlateNumber,
    SpeedLimit: locInfo.SpeedLimit,
    config: locInfo.configJson,
  });

  const Dark = darkMode ? "bg-dark" : "";

  const handleClose = () => setShow(false);

  // Add old data to the inputs
  useEffect(() => {
    if (show) {
      setData({
        DisplayName: locInfo.DisplayName,
        PlateNumber: locInfo.PlateNumber,
        SpeedLimit: locInfo.SpeedLimit,
        config: locInfo.configJson,
      });
    }
  }, [show]);

  const handleRq = (e) => {
    e.preventDefault();
    setRqLoading(true);
    const oldStorage = JSON.parse(
      localStorage.getItem(encryptName("userData")) ?? "{}"
    );
    const { vehData } = oldStorage;
    const Index = VehFullData.findIndex(
      (x) => x.VehicleID == locInfo.VehicleID
    );
    const storageIndex = vehData.findIndex(
      (x) => x.VehicleID == locInfo.VehicleID
    );

    const updated_data = {
      ...VehFullData[Index],
      ...Data,
      configJson: Data.config,
    };
    const updated_Storage_data = {
      ...vehData[storageIndex],
      ...Data,
    };
    axios
      .put(`dashboard/vehicles/updateConfig/${locInfo.VehicleID}`, {
        ...updated_data,
        config: updated_data.configJson,
      })
      .then(() => {
        const updatedvehs = JSON.parse(JSON.stringify(VehFullData));
        if (VehFullData[Index].Speed >= updated_data.SpeedLimit) {
          updated_data.VehicleStatus = 101;
          updated_Storage_data.tempVehStatus = 101;
        } else if (
          VehFullData[Index].Speed < updated_data.SpeedLimit &&
          VehFullData[Index].Speed != 0
        ) {
          updated_data.VehicleStatus = 1;
          updated_Storage_data.VehicleStatus = 1;
        } else {
          updated_data.VehicleStatus = 2;
          updated_Storage_data.VehicleStatus = 2;
        }
        updatedvehs[Index] = updated_data;
        vehData[storageIndex] = updated_Storage_data;
        let patchObj = {
          patch: updatedvehs,
          isPatched: true,
        };
        localStorage.setItem(
          encryptName("userData"),
          JSON.stringify({ ...oldStorage, vehData: vehData })
        );
        setAllTreeData([]);
        dispatch(UpdateVehicle(patchObj));
        dispatch(updateMapMarkers(updatedvehs));
        dispatch(UpdateVehMapFiltered(patchObj));
        setVehChecked([]);
        setTimeout(() => {
          setAllTreeData(updatedvehs);
          myMap.unpin(updated_data.VehicleID);
          myMap.pin(updatedvehs[Index]);
          setVehChecked([updated_data]);
        }, 30);
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message);
      })
      .finally(() => {
        setRqLoading(false);
        handleClose();
      });
  };
  const handlePlateNumberOnKeyPress = (e) => {
    !/[A-Za-z0-9 ]+/.test(e.key) ? e.preventDefault() : false;
  };

  const handleIconVehicle = (value) => {
    const filteredValue = VehicleOptions(t).find(
      (item) => item.value === value
    );
    setData({
      ...Data,
      config: JSON.stringify({
        ...JSON.parse(Data.config),
        icon: filteredValue.name,
      }),
    });
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="md"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton className={`${Dark}`}>
        <Modal.Title id="contained-modal-title-vcenter">
          {t("edit_vehicle_information_key")}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleRq}>
        <Modal.Body className={`${Dark}`}>
          <Row className="p-3 mb-3">
            <Col lg="12">
              <Form.Group className="form-group">
                <Form.Label htmlFor="DisplayName">
                  {t("DisplayName")}
                </Form.Label>
                <Form.Control
                  name="DisplayName"
                  type="text"
                  id="DisplayName"
                  placeholder={t("DisplayName")}
                  value={Data.DisplayName}
                  onChange={(e) =>
                    setData({
                      ...Data,
                      DisplayName: e.target.value,
                    })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="form-group">
                <Form.Label htmlFor="PlateNumber">
                  {t("PlateNumber")}
                </Form.Label>
                <Form.Control
                  name="PlateNumber"
                  type="text"
                  id="PlateNumber"
                  placeholder={t("PlateNumber")}
                  defaultValue={Data.PlateNumber}
                  onChange={(e) =>
                    setData({
                      ...Data,
                      PlateNumber: e.target.value,
                    })
                  }
                  onKeyPress={handlePlateNumberOnKeyPress}
                  required
                />
              </Form.Group>
              <Form.Group className="form-group">
                <Form.Label htmlFor="SpeedLimit">{t("SpeedLimit")}</Form.Label>
                <Form.Control
                  name="SpeedLimit"
                  type="text"
                  id="SpeedLimit"
                  placeholder={t("SpeedLimit")}
                  value={Data.SpeedLimit}
                  onChange={(e) =>
                    setData({
                      ...Data,
                      SpeedLimit: +e.target.value,
                    })
                  }
                  onKeyPress={handlePlateNumberOnKeyPress}
                  required
                />
              </Form.Group>
            </Col>
            <Col lg="12">
              <p className="fs-5 text-secondary text-center">
                {t("vehicle_icon_key")}
              </p>
              <ReactSelect
                onSelectChange={handleIconVehicle}
                value={
                  (
                    VehicleOptions(t).find(
                      (o) => o.name == JSON.parse(Data?.config)?.icon
                    ) ??
                    localIcon ??
                    VehicleOptions(t)[0]
                  ).value
                }
                options={VehicleOptions(t)}
                defaultValue={
                  VehicleOptions(t).find(
                    (o) => o.name == JSON.parse(Data?.config)?.icon
                  ) ??
                  localIcon ??
                  VehicleOptions(t)[0]
                }
                label={t("select_car_icon_key")}
                className="mb-3"
                formatOptionLabel={(guide) => (
                  <div className="d-flex align-items-center ps-3">
                    <span style={{ rotate: "90deg" }}>
                      {/* {guide.icon} */}
                      <Image
                        width={14}
                        height={30}
                        src={guide?.img}
                        alt={guide?.label}
                        title={guide?.label}
                      />
                    </span>

                    <span className="ms-2 text-capitalize px-2">
                      {guide.label}
                    </span>
                  </div>
                )}
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className={`${Dark}`}>
          <div className="d-flex justify-content-around">
            <button
              disabled={rqLoading}
              className="btn btn-primary px-3 py-2 ms-3"
              type="submit"
            >
              {!rqLoading ? (
                <FontAwesomeIcon className="mx-2" icon={faCheck} size="sm" />
              ) : (
                <FontAwesomeIcon
                  className="mx-2 fa-spin"
                  icon={faSpinner}
                  size="sm"
                />
              )}
              {t("Save_changes")}
            </button>
            <button
              className="btn btn-primary px-3 py-2 ms-3"
              onClick={(e) => {
                e.preventDefault();
                handleClose();
              }}
            >
              <FontAwesomeIcon className="mx-2" icon={faTimes} size="sm" />
              {t("cancel_key")}
            </button>
          </div>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
