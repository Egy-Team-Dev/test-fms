import React, { useState, useMemo, useCallback, useEffect } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Row, Col, Card, Button, Modal } from "react-bootstrap";
import { useTranslation } from "next-i18next";
import AgGridDT from "components/AgGridDT";
import HideActions from "hooks/HideActions";
import { fetchAllCamDrivers } from "../../services/driversManagement";
import CameraButton from "../../components/VehiclesCamera/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faFileAlt } from "@fortawesome/free-solid-svg-icons";
import style from "styles/ReportsOptions.module.scss";
import UseDarkmode from "hooks/UseDarkmode";
import { DateRangePicker } from "rsuite";
import dynamic from "next/dynamic";
import moment from "moment";
import UseStreamHelper from "/helpers/streamHelper";

const ShowCam = dynamic(
  () => import("components/maps/LeaflitActions/ShowCam"),
  {
    loading: () => <header />,
  }
);

const ShowPlaybackCam = dynamic(
  () => import("components/maps/LeaflitActions/ShowPlaybackCam"),
  {
    loading: () => <header />,
  }
);

const VehiclesCamera = () => {
  const { t } = useTranslation(["vehiclesCamera", "common"]);
  const [DataTable, setDataTable] = useState(null);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [showCam, setShowCam] = useState(false);
  const [showPlayBackCam, setShowPlayBackCam] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [strDate, setStrDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [dateRange, setDateRange] = useState([]);
  const [playBackSerialNumber, setPlayBackSerialNumber] = useState("");
  const [playbackDate, SetPlaybackDate] = useState([]);
  const [Dates, setDates] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  //Date Configuration for the DateRangePicker
  const formatDate = (date) => {
    const format = "YYYYMMDDHHmmss";
    const formatedDate = moment(date).format(format);
    return formatedDate;
  };

  const { afterToday } = DateRangePicker;
  const dateNow = new Date();
  const year = dateNow.getFullYear();
  const getMonth = dateNow.getMonth() + 1;
  const month = getMonth < 10 ? `0${getMonth}` : getMonth;
  const day =
    dateNow.getDate() < 10 ? `0${dateNow.getDate()}` : dateNow.getDate();

  const handleShowPlayback = () => {
    const dateRanges = {
      start: Dates[0].startDate,
      end: Dates[0].endDate,
    };
    const startDate = formatDate(dateRanges.start);
    const endDate = formatDate(dateRanges.end);
    SetPlaybackDate([startDate, endDate]);

    document
      .getElementById("ShowCamBtn")
      .setAttribute("data-Id", playBackSerialNumber);
    setShowPlayBackCam((prev) => !prev);
  };

  const handleFullName = (params) => {
    return params.data.FirstName === undefined
      ? "Not Available"
      : `${params.data.FirstName} ${params.data.LastName}`;
  };

  //the setting of the AG grid table .. sort , filter , etc...
  const defaultColDef = useMemo(() => {
    return {
      sortable: true,
      flex: 1,
      resizable: true,
      filter: true,
    };
  }, []);

  // fetch all drivers and set the Api of the AG grid table for export pdf
  const onGridReady = useCallback(async (params) => {
    try {
      const respond = await fetchAllCamDrivers();
      setDataTable(respond);

      setGridApi(params.api);
      setGridColumnApi(params.columnApi);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  }, []);

  const handleShowCamera = (serial) => {
    document.getElementById("ShowCamBtn").setAttribute("data-Id", serial);
    setShowCam((prev) => !prev);
  };

  const handlePlayback = () => {
    setIsModelOpen(true);
  };

  const handleDate = (e) => {
    setDates([
      {
        startDate: e[0],
        endDate: e[1],
        key: "selection",
      },
    ]);
  };

  const columns = useMemo(
    () => [
      {
        headerName: `${t("drivers_name")}`,
        field: "DriverName",
        valueGetter: handleFullName,
        minWidth: 190,
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: `${t("plate_number")}`,
        field: "PlateNumber",
        minWidth: 190,
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: `${t("VehicleStatus")}`,
        field: "VehicleStatus",
        minWidth: 120,
        sortable: true,
        cellRenderer: (params) => {
          const { CalcVstatus } = UseStreamHelper();
          let status = CalcVstatus(params.data);
          let text = () => {
            switch (status) {
              case 600:
              case 5:
                return t("Offline");
              case 204:
                return t("Sleeping");
              case 101:
                return t("OverSpeed");
              case 100:
                return t("OverStreetSpeed");
              case 0:
                return t("Stopped");
              case 1:
                return t("Running");
              case 2:
                return t("Idle");
              default:
                return t("Invalid");
            }
          };
          return <span>{text()} </span>;
        },
        unSortIcon: true,
      },
      {
        headerName: `${t("serial_number")}`,
        field: "SerialNumber",
        minWidth: 190,
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: `${t("camera")}`,
        cellRenderer: (params) => (
          <>
            <div className="d-flex justify-content-start align-items-center">
              <CameraButton
                title={"History Playback"}
                isPlayback={true}
                params={params.data}
                handleShowCamera={handlePlayback}
                setPlayBackSerialNumber={setPlayBackSerialNumber}
              />
              <CameraButton
                title={"Show Camera"}
                params={params.data}
                id="ShowCamBtn"
                handleShowCamera={handleShowCamera}
              />
            </div>
          </>
        ),
        minWidth: 350,

        sortable: true,
        unSortIcon: true,
      },
    ],
    [t]
  );
  return (
    <Row className="mx-1">
      <Col sm="12">
        <Card>
          <Card.Body>
            {showCam ? <ShowCam show={showCam} setShow={setShowCam} /> : null}
            {showPlayBackCam ? (
              <ShowPlaybackCam
                show={showPlayBackCam}
                setShow={setShowPlayBackCam}
                dateRange={playbackDate}
              />
            ) : null}
            <AgGridDT
              enableRtl={localStorage?.language === "ar"}
              rowHeight={65}
              columnDefs={columns}
              rowData={DataTable}
              defaultColDef={defaultColDef}
              onGridReady={onGridReady}
              gridApi={gridApi}
              gridColumnApi={gridColumnApi}
            />
          </Card.Body>
        </Card>

        <Modal
          show={isModelOpen}
          onHide={setIsModelOpen}
          size="md"
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header
            closeButton
            style={{
              background: UseDarkmode("#222738", "#FFFFFF"),
              borderBottomColor: UseDarkmode("#151824", "#DDD"),
            }}
          >
            <div
              className={`d-flex justify-content-center align-items-center ${style.bxTitleIcon}`}
            >
              <h5>{t("history_playback")}</h5>
            </div>
          </Modal.Header>
          <Modal.Body
            style={{
              background: UseDarkmode("#222738", "#FFFFFF"),
              overflow: "hidden",
            }}
          >
            <DateRangePicker
              className="d-inline-block w-100  mx-auto my-2 border border-primary rounded"
              onOk={(e) => handleDate(e)}
              onChange={(e) => handleDate(e)}
              placeholder={t("select_date_range")}
              format="yyyy-MM-dd hh:mm aa"
              placement="bottom"
              shouldDisableDate={afterToday()}
              defaultValue={[
                new Date(`${year}-${month}-${day} 00:00`),
                new Date(
                  `${year}-${month}-${day} ${dateNow.getHours()}:${dateNow.getMinutes()}`
                ),
              ]}
              locale={{
                sunday: t("Su"),
                monday: t("Mo"),
                tuesday: t("Tu"),
                wednesday: t("We"),
                thursday: t("Th"),
                friday: t("Fr"),
                saturday: t("Sa"),
                ok: t("OK"),
                today: t("Today"),
                yesterday: t("Yesterday"),
                hours: t("Hours"),
                minutes: t("Minutes"),
                seconds: t("Seconds"),
                last7Days: t("last7Days"),
                January: t("January"),
                February: t("February"),
                March: t("March"),
                April: t("April"),
                May: t("May"),
                June: t("June"),
                July: t("July"),
                August: t("August"),
                September: t("September"),
                October: t("October"),
                november: t("nov"),
                december: t("De"),
              }}
            />
          </Modal.Body>
          <Modal.Footer
            style={{
              background: UseDarkmode("#222738", "#FFFFFF"),
              borderTopColor: UseDarkmode("#151824", "#DDD"),
            }}
          >
            <Button
              className="my-0 mx-auto  py-2 px-5"
              onClick={handleShowPlayback}
            >
              {t("view_playback")}
            </Button>
          </Modal.Footer>
        </Modal>
      </Col>
    </Row>
  );
};

export default VehiclesCamera;

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "driversManagement",
        "main",
        "forms",
        "management",
        "vehiclesCamera",
        "common",
      ])),
    },
  };
}
