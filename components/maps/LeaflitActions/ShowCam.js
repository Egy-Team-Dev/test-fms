import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";

// Bootstrap
import { Modal } from "react-bootstrap";

// Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import axios from "axios";
import { encryptName } from "helpers/encryptions";
import config from "../../../config/config";


export default function ShowCam({ show, setShow}) {
  const {
    config: { darkMode },
  } = useSelector((state) => state);
  const { t } = useTranslation("common");

  const Dark = darkMode ? "bg-dark" : "";
  const [loading, setloading] = useState(false);
  const [cameraLink, setCameraLink] = useState("");
  const [hasCamera, setHasCamera] = useState(false);
  const SerialNumber = document
    .getElementById("ShowCamBtn")
    .getAttribute("data-id");

  const handleClose = () => setShow(false);


  useEffect(() => {
    const handleShowCam = async () => {
      try {
        setloading(true);
        const loginToken = localStorage.getItem("loginToken");
        let resDeviceStatus;
        if (loginToken !== null) {
          resDeviceStatus = await axios.post(
            `${config.apiGateway.URL}devicestatus`,
            {
              // token: encryptName(loginToken),
              token: loginToken,
              deviceID: SerialNumber,
            }
          );

          if (resDeviceStatus?.data?.data != null) {
            setCameraLink(
              `https://dashcam.saferoad.net/vss/apiPage/RealVideo.html?token=${loginToken}&deviceId=${SerialNumber}&buffer=2000&chs=1_2_3_4&stream=0&wnum=1&panel=1`
            );
            // setCameraLink(
            //   `https://dashcam.saferoad.net/vss/apiPage/ReplayVideo.html?token=${loginToken}&deviceId=${SerialNumber}&chs=1_2_3_4&st=20221201000000&et=20221207235900&wnum=4&panel=1&speed=1&buffer=3000`
            // );

            // setCameraLink(
            //   `https://dashcam.saferoad.net/vss/apiPage/RealVideo.html?token${encryptName(
            //     loginToken
            //   )}=&deviceId=${SerialNumber}&buffer=2000&chs=1_2_3_4&stream=0&wnum=1&panel=`
            // );
            // `https://dashcam.saferoad.net/vss/apiPage/ReplayVideo.html?token=${token}&deviceId=${SerialNumber}&chs=1_2_3_4&st=${startDate}&et=${endDate}&wnum=4&panel=1&speed=4&buffer=3000`
            setloading(false);
            setHasCamera(true);
          } else {
            setloading(false);
            setHasCamera(false);
            toast.warning("This Device Have'nt Camera");
          }
        } else {
          let resLogin = await axios.post(`${config.apiGateway.URL}vss`, {
            username: "coreuser",
            password: "2806c291a1ceabf37b473b93255b65ea",
          });
          if (resLogin.status == 200 && resLogin?.data?.data !== null) {
            // localStorage.setItem(
            //   encryptName("loginToken"),
            //   encryptName(resLogin?.data?.data?.token)
            // );

            localStorage.setItem("loginToken", resLogin?.data?.data?.token);

            resDeviceStatus = await axios.post(
              `${config.apiGateway.URL}devicestatus`,
              {
                token: resLogin?.data?.data?.token,
                deviceID: SerialNumber,
              }
            );
            //this is the playback api
            // `https://dashcam.saferoad.net/vss/apiPage/ReplayVideo.html?token=${resLogin?.data?.data?.token}&amp;deviceId=${SerialNumber}&amp;chs=1_2_3_4&amp;st=20221201000000&amp;et=20221207235900&amp;wnum=4&amp;panel=1&amp;speed=1&amp;buffer=3000`
            if (resDeviceStatus?.data?.data != null) {
              //
              setCameraLink(
               `https://dashcam.saferoad.net/vss/apiPage/RealVideo.html?token=${resLogin?.data?.data?.token}&deviceId=${SerialNumber}&buffer=2000&chs=1_2_3_4&stream=0&wnum=1&panel=1`
              );
              setHasCamera(true);
              // `https://dashcam.saferoad.net/vss/apiPage/ReplayVideo.html?token=${token}&deviceId=${SerialNumber}&chs=1_2_3_4&st=${startDate}&et=${endDate}&wnum=4&panel=1&speed=4&buffer=3000`
              setloading(false);
            } else {
              setloading(false);
              setHasCamera(false);
              toast.warning("This Device Doesn't have Camera Installed");
            }
          } else {
            setloading(false);
            setHasCamera(false);
            setTimeout(() => {
              handleShowCam();
            }, 1000 * 60 * 20); // after 20 minutes
          }
        }
      } catch (error) {
        setloading(false);
        toast.error("Error For Show Camera");
      }
    };

    show && handleShowCam();
  }, [show]);

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size={hasCamera ? "xl" : "md"}
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton className={`${Dark}`}>
        <Modal.Title id="contained-modal-title-vcenter">
          <p className="lead">{t("show_cameras_key")}</p>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body
        style={{
          height: hasCamera ? "80vh" : "auto",
          overflow: hasCamera ? "hidden scroll" : "auto",
        }}
      >
        <div className="d-flex justify-content-center">
          {!loading ? (
            hasCamera ? (
              <iframe
                // src="https://dashcam.saferoad.net/vss/apiPage/ReplayVideo.html?token=101b37b528b9464caaffb73eda49c155&deviceId=767257&chs=1_2_3_4&st=20221201000000&et=20221207235900&wnum=4&panel=1&speed=1&buffer=3000"
                src={cameraLink}
                id="CamIframe"
                style={{
                  border: "0px #ffffff none",
                  height: "800px",
                  width: "100%",
                }}
                name="myiFrame"
                scrolling="no"
                frameborder="1"
                marginheight="0px"
                marginwidth="0px"
                allowfullscreen=""
              />
            ) : (
              <p className="lead">
                {t("this_device_have_not_any_cameras_key")}
              </p>
            )
          ) : (
            <FontAwesomeIcon className="fa-spin" icon={faSpinner} size="sm" />
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
}
