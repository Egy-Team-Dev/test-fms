import { useCallback, useEffect, useMemo, useState } from "react";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/router";
import moment from "moment";
import axios from "axios";
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Button, Card, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSlidersH, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "next-i18next";
import formatHourNumber from "utils/formatHourNumber";
import { encryptName } from "helpers/encryptions";
import PlayVideo from "./PlayVideo";
import Settings from "./Settings";
import Styles from "styles/Settings.module.scss";
import { Resources } from "components/maps/Resources";
import ReactSelect from "components/Select";
import { DateRangePicker } from "react-date-range";
import IMask from "imask";

import { SiMicrosoftexcel } from "react-icons/si";
import { BsFillCameraVideoFill } from "react-icons/bs";

const ShowPlaybackCam = dynamic(
  () => import("components/maps/LeaflitActions/ShowPlaybackCam"),
  {
    loading: () => <header />,
  }
);
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import { convertJsonToExcel } from "helpers/helpers";

const StepperComp = ({ geofences, setGeofences, chartModal, setchartModal, setSelectedLocations, landMarks, setLandMarks }) => {

  const { t } = useTranslation("history");

  const L = require("leaflet");
  const { query, locale } = useRouter();
  const { myMap } = useSelector((state) => state.mainMap);
  const { darkMode, language } = useSelector((state) => state.config);

  const [loading, setloading] = useState(false);

  const [AllSteps, setAllSteps] = useState({});
  const [selectedStep, setselectedStep] = useState("null");
  const [AllLocations, setAllLocations] = useState({});

  const [selectedSteps, setSelectedSteps] = useState([]);
  const [showCam, setShowCam] = useState(false);
  const [stats, setStats] = useState(0);

  const newToken = useSelector((state) => state?.auth?.user?.new_token);
  const userData = JSON.parse(
    localStorage.getItem(encryptName("userData")) ?? "{}"
  );
  const fullPathGroup = // L.featureGroup().addTo(myMap);
    useMemo(
      () => (myMap && L ? L.featureGroup().addTo(myMap) : {}),
      [L, myMap]
    );
  const [currentSLocation, setCurrentSLocation] = useState(0);
  const [speedCar, setSpeedCar] = useState(1000);
  const [getAllLocations, setGetAllLocations] = useState(false);
  const [locInfo, setLocInfo] = useState([]);
  const [MinDistance, setMinDistance] = useState(20);
  const [MaxMarkers, setMaxMarkers] = useState(100);
  const [MaxGuides, setMaxGuides] = useState(100);
  const [allMarkers, setAllMarkers] = useState(true);
  const [colorOfMarkers, setColorOfMarkers] = useState("#079aa2");
  const [colorOfGuides, setColorOfGuides] = useState("#079aa2");
  const [markerIcon, setMarkerIcon] = useState("RiMapPinAddFill");
  const [guidesIcon, setGuidesIcon] = useState("FaLocationArrow");
  const [IsFromState, setIsFromState] = useState(false);
  const [isToggleConfigOpen, setisToggleConfigOpen] = useState(false);
  const [workstep, setWorkstep] = useState({});
  const [msgEmptyData, setMsgEmptyData] = useState("");
  const [pathSteps, setPathSteps] = useState([]);
  const [rangeDraw, setRangeDraw] = useState({
    label: "",
    min: 0,
    max: pathSteps?.length - 1,
    step: 1,
    value: {
      min: 0,
      max: pathSteps?.length - 1,
    },
  });

  const [drawOptions, setDrawOptions] = useState({
    MinDistance: +MinDistance,
    MaxMarkers: +MaxMarkers,
    MaxGuides: +MaxGuides,
    allMarkers,
    getAllLocations,
    colorOfMarkers,
    colorOfGuides,
    markerIcon,
    guidesIcon,
  });

  const [Dates, setDates] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const [strDate, setStrDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [address, setAddress] = useState("");
  const [playbackDate, SetPlaybackDate] = useState([]);

  const presentDate = `${new Date().getFullYear()}-${new Date().getMonth() + 1
    }-${new Date().getDate()}`;

  const [HoursFrom, setHoursFrom] = useState("00");
  const [MinutsFrom, setMinutsFrom] = useState("00");
  const [HoursTo, setHoursTo] = useState("23");
  const [MinutsTo, setMinutsTo] = useState("59");

  const [fullDate, setFullDate] = useState({
    strDate: presentDate,
    endDate: presentDate,
    strTime: `00:00:00`,
    endTime: `23:59:00`,
    fullTime: `${presentDate}T00:00:00 ${presentDate}T23:59:00`,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [disableBtn, setDisableBtn] = useState(false);

  const mask = IMask.createMask({
    mask: "Y-M-DTH:MN:S Y-M-DTH:MN:S",
    blocks: {
      Y: {
        mask: IMask.MaskedRange,
        from: 2010,
        to: 2050,
      },
      M: {
        mask: IMask.MaskedRange,
        from: 1,
        to: 12,
      },
      D: {
        mask: IMask.MaskedRange,
        from: 1,
        to: 31,
      },
      H: {
        mask: IMask.MaskedRange,
        from: 0,
        to: 23,
      },
      MN: {
        mask: IMask.MaskedRange,
        from: 0,
        to: 59,
      },
      S: {
        mask: IMask.MaskedRange,
        from: 0,
        to: 59,
      },
    },
  });
  const [validated, setValidated] = useState(true);

  // this to translate the right side of dateRangePicker
  useEffect(() => {
    if (showDatePicker) {
      // this span contain text of the date (thisweek thisweek lastmonth ...)
      const allspan = document.querySelectorAll(".rdrStaticRangeLabel");
      allspan.forEach((s) => (s.textContent = t(s.textContent)));
    }
  }, [showDatePicker]);

  // for moving the Car
  useEffect(() => {
    if (stats === 1) {
      // stats === 1 handle playing video
      setTimeout(() => {
        myMap?.UpdateMarker(selectedSteps[currentSLocation], {
          history: true,
        });
        setCurrentSLocation((prevState) => prevState + 1);
      }, speedCar);
    } else if (stats === 2) {
      // handle go to first step
      myMap?.UpdateMarker(selectedSteps[selectedSteps?.length - 1], {
        history: true,
      });
    } else if (stats === 3) {
      // handle prev ,next and pause
      myMap?.UpdateMarker(selectedSteps[currentSLocation], {
        history: true,
      });
    } else {
      // handle go to last step and stop
      myMap?.UpdateMarker(selectedSteps[0], {
        history: true,
      });
    }
  }, [stats, currentSLocation, myMap, selectedSteps]);

  const handleselectedStep = async (item, index, fromAllSteps) => {
    myMap.deselectAll();
    fullPathGroup.clearLayers();
    setselectedStep(null);
    setSelectedLocations([]);
    setSelectedSteps([]);
    setPathSteps([]);
    document.getElementById("pause")?.removeAttribute("disabled");
    document.getElementById("play")?.removeAttribute("disabled");
    setStats(0);
    setSpeedCar(1000);
    setCurrentSLocation(0);
    if (selectedStep != index) {
      setselectedStep(index);
      const { StrDate, EndDate } = item;
      let currSelectedLocations;

      // this localInfo set from localStorage and the item i passed to it in the bottom
      let locInfo = userData?.vehData.find(
        (v) => v?.VehicleID === item?.VehicleID
      );

      delete locInfo?.RecordDateTime;

      locInfo && setLocInfo(locInfo);

      currSelectedLocations = AllLocations[item.ID] ?? [];

      const isFromState = !!currSelectedLocations?.length;

      setIsFromState(isFromState);

      if (
        !currSelectedLocations?.length &&
        (item.StrEvent == "Parked" || item.IsIdle )
      ) {
        let lat = item?.StrLat ?? 0;
        let lng = item?.StrLng ?? 0;
        if (lat == 0 || lng == 0) {
          let res = await axios.get(
            `vehicles/historyplayback?VehID=${query?.VehID
            }&pageNumber=${1}&pageSiz=${1000}&strDate=${StrDate}&endDate=${EndDate}&mode=1`
          );
          if (res.status === 200) {
            lat = res?.data?.historylocations[0].Latitude ?? 0;
            lng = res?.data?.historylocations[0].Longitude ?? 0;
          }
        }

        const steps = {
          ...locInfo,
          ID: item?._id,
          RecordDateTime: item?.StrDate,
          EndDate: item?.EndDate,
          Latitude: lat,
          Longitude: lng,
          Duration: item?.Duration,
          Address: item?.StrAdd ?? item?.Address,
          Speed: 0,
          VehicleStatus: item?.StrEvent == "Parked" ? 0 : 2,
          DisplayName: locInfo?.DisplayName ?? "NA",
        };
        AllLocations[item.ID] = [steps];
        currSelectedLocations = [steps];
        setAllLocations((prev) => {
          var crn = { ...prev };
          crn[item.ID] = [...currSelectedLocations];
          return crn;
        });
      }

      if (
        !currSelectedLocations?.length &&
        item.StrEvent !== "Parked" &&
        !item.IsIdle
      ) {
        const expSteps = Math.ceil(item.Duration / 20);
        let interval;
        let progress = `please wait, expected requested point count id ${expSteps}...`;
        try {
          setDisableBtn(true);
          !getAllLocations && toast.warning(progress);
          setloading(true);
          interval = setInterval(() => {
            !getAllLocations && toast.warning(progress);
          }, 1e4);
          const pagesize =
            expSteps < 1000
              ? 250
              : expSteps < 5000
                ? 500
                : expSteps < 10000
                  ? 750
                  : 1000;
          let res = {}; //{ data: { historyplayback: [1] } };
          let resPage = [];

          for (
            var pageno = 1;
            (res?.data?.historylocations?.length ?? pagesize) >= pagesize;
            pageno++
          ) {
            // progress = `Start pulling data, please wait`;
            res = await axios.get(
              `vehicles/historyplayback?VehID=${query?.VehID}&pageNumber=${pageno}&pageSiz=${pagesize}&strDate=${StrDate}&endDate=${EndDate}&mode=1`
            );

            if (res.status === 200) {
              setAddress(res?.data?.historylocations[0]?.Address);
              const newData = res?.data?.historylocations.map(function (data) {
                return {
                  ID: data?._id,
                  VehicleID: data?.VehicleID,
                  RecordDateTime: data?.RecordDateTime,
                  Latitude: data?.Latitude,
                  Longitude: data?.Longitude,
                  Direction: data?.Direction,
                  Speed: data?.Speed,
                  Address: data?.Address,
                  Invalid: data?.Invalid,
                  VehicleStatus: data?.VehicleStatus,
                  DisplayName: locInfo?.DisplayName,
                  configJson: locInfo?.configJson,
                };
              });
              resPage = resPage.concat(newData);
              const message =
                newData?.length == pagesize
                  ? `${resPage?.length} Records Fetched, up to ${resPage[resPage?.length - 1]?.RecordDateTime ??
                  item.EndDate
                  }, out of about ${expSteps} ...`
                  : `Fetching data is completed, start drawing ${resPage?.length} records`;
              drawStepsPath(newData);
              toast.dismiss();
              !getAllLocations && toast.info(message);
              setDisableBtn(false);
            } else {
              toast.error(res.toString());
              setDisableBtn(false);
            }
          }
          if (resPage?.length) {
            currSelectedLocations = [...resPage];
            currSelectedLocations = currSelectedLocations.sort(
              (a, b) => new Date(b.RecordDateTime) - new Date(a.RecordDateTime)
            );
            currSelectedLocations = currSelectedLocations
              .reduce(
                // Forword Reducer function
                (pv, cv) => {
                  if (!pv?.length) return [cv];
                  const lv = pv[pv?.length - 1];
                  pv.push({
                    ...cv,
                    Duration:
                      (new Date(lv.RecordDateTime) -
                        new Date(cv.RecordDateTime)) /
                      1000,
                    StepDistance: L.latLng(
                      lv.Latitude,
                      lv.Longitude
                    ).distanceTo(L.latLng(cv.Latitude, cv.Longitude)),
                    EndDate: lv.RecordDateTime,
                    Guide: {},
                  });

                  return pv;
                },
                []
              )
              .reverse().slice(0, currSelectedLocations.length - 1);
            currSelectedLocations = currSelectedLocations.reduce((pv, cv) => {
              pv.push({
                ...cv,
                IdleSince:
                  cv.Speed > 0
                    ? 0
                    : cv.Duration +
                    (pv?.length > 0 ? pv[pv?.length - 1].IdleSince : 0),
                IdleStart:
                  cv.Speed > 0
                    ? null
                    : pv?.length > 0
                      ? pv[pv?.length - 1]?.IdleStart
                      : cv.RecordDateTime,
              });
              return pv;
            }, []);

            if (item.StrEvent == "InProgress") {
              const lastLocation =
                currSelectedLocations[currSelectedLocations.length - 1];
              item.EndDate = lastLocation.RecordDateTime;
              setAllSteps((prev) => {
                var crn = { ...prev };
                crn[item.ID] = { ...item };
                return crn;
              });
            }

            setAllLocations((prev) => {
              var crn = { ...prev };
              crn[item.ID] = [...currSelectedLocations];
              return crn;
            });
          }
        } catch (err) {
          console.log("Error: ", err);
          setloading(false);
        } finally {
          clearInterval(interval);
          setloading(false);
        }
      }

      const maxIdleSince = Math.max(
        ...currSelectedLocations.map((x) =>
          !isNaN(x.IdleSince) ? x.IdleSince : 0
        )
      );
      setAllSteps((prev) => {
        prev[item.ID]?.maxIdleSince = maxIdleSince;
        prev[item.ID]?.excessiveIdle = maxIdleSince > item?.maxIdle;
        return prev;
      });
      if (fromAllSteps && getAllLocations) {
        if (index === Array.from(Object.keys(AllSteps)).length - 1) {
          toast.success('History playback Loaded successfully!')
          setSelectedSteps(currSelectedLocations);
          setSelectedLocations(currSelectedLocations);
          currSelectedLocations &&
            drawInitialVehicle(currSelectedLocations[0], locInfo);
          setWorkstep(item);
          setPathSteps(currSelectedLocations);
          drawselectedsteps(
            item,
            currSelectedLocations,
            locInfo,
            isFromState,
            drawOptions
          );
        }
      } else {
        setSelectedSteps(currSelectedLocations);
        setSelectedLocations(currSelectedLocations);
        currSelectedLocations &&
          drawInitialVehicle(currSelectedLocations[0], locInfo);
        setWorkstep(item);
        setPathSteps(currSelectedLocations);
        drawselectedsteps(
          item,
          currSelectedLocations,
          locInfo,
          isFromState,
          drawOptions
        );
      }
    }
  };
  

  let icons = useCallback((target, currentColor) => {
    const iconsData = {
      RiMapPinAddFill: `<svg style="transform: rotate(0deg)"; stroke=${currentColor} fill=${currentColor} strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><g><path fill="none" d="M0 0h24v24H0z"></path><path d="M18.364 17.364L12 23.728l-6.364-6.364a9 9 0 1 1 12.728 0zM11 10H8v2h3v3h2v-3h3v-2h-3V7h-2v3z"></path></g></svg>`,
      RiMapPinFill: `<svg style="transform: rotate(0deg)"; stroke=${currentColor} fill=${currentColor} strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><g><path fill="none" d="M0 0h24v24H0z"></path><path d="M18.364 17.364L12 23.728l-6.364-6.364a9 9 0 1 1 12.728 0zM12 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0-2a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"></path></g></svg>`,
      RiMapPinRangeFill: `<svg style="transform: rotate(0deg)"; stroke=${currentColor} fill=${currentColor} strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><g><path fill="none" d="M0 0h24v24H0z"></path><path d="M11 17.938A8.001 8.001 0 0 1 12 2a8 8 0 0 1 1 15.938v2.074c3.946.092 7 .723 7 1.488 0 .828-3.582 1.5-8 1.5s-8-.672-8-1.5c0-.765 3.054-1.396 7-1.488v-2.074zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path></g></svg>`,
      RiRoadMapFill: `<svg style="transform: rotate(0deg)"; stroke=${currentColor} fill=${currentColor} strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><g><path fill="none" d="M0 0h24v24H0z"></path><path d="M16.95 11.95a6.996 6.996 0 0 0 1.858-6.582l2.495-1.07a.5.5 0 0 1 .697.46V19l-7 3-6-3-6.303 2.701a.5.5 0 0 1-.697-.46V7l3.129-1.341a6.993 6.993 0 0 0 1.921 6.29L12 16.9l4.95-4.95zm-1.414-1.414L12 14.07l-3.536-3.535a5 5 0 1 1 7.072 0z"></path></g></svg>`,
      RiMapPin4Fill: `<svg style="transform: rotate(0deg)"; stroke=${currentColor} fill=${currentColor} strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><g><path fill="none" d="M0 0h24v24H0z"></path><path d="M11 17.938A8.001 8.001 0 0 1 12 2a8 8 0 0 1 1 15.938V21h-2v-3.062zM5 22h14v2H5v-2z"></path></g></svg>`,
      RiMapPin5Fill: `<svg style="transform: rotate(0deg)"; stroke=${currentColor} fill=${currentColor} strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><g><path fill="none" d="M0 0h24v24H0z"></path><path d="M17.657 15.657L12 21.314l-5.657-5.657a8 8 0 1 1 11.314 0zM5 22h14v2H5v-2z"></path></g></svg>`,
      FaMapMarker: `<svg style="transform: rotate(0deg)"; stroke=${currentColor} fill=${currentColor} strokeWidth="0" viewBox="0 0 384 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path></svg>`,
      FaMapMarkerAlt: `<svg style="transform: rotate(0deg)"; stroke=${currentColor} fill=${currentColor} strokeWidth="0" viewBox="0 0 384 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path></svg>`,
      FaMapSigns: `<svg style="transform: rotate(0deg)"; stroke=${currentColor} fill=${currentColor} strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M507.31 84.69L464 41.37c-6-6-14.14-9.37-22.63-9.37H288V16c0-8.84-7.16-16-16-16h-32c-8.84 0-16 7.16-16 16v16H56c-13.25 0-24 10.75-24 24v80c0 13.25 10.75 24 24 24h385.37c8.49 0 16.62-3.37 22.63-9.37l43.31-43.31c6.25-6.26 6.25-16.38 0-22.63zM224 496c0 8.84 7.16 16 16 16h32c8.84 0 16-7.16 16-16V384h-64v112zm232-272H288v-32h-64v32H70.63c-8.49 0-16.62 3.37-22.63 9.37L4.69 276.69c-6.25 6.25-6.25 16.38 0 22.63L48 342.63c6 6 14.14 9.37 22.63 9.37H456c13.25 0 24-10.75 24-24v-80c0-13.25-10.75-24-24-24z"></path></svg>`,
      FaMapMarkedAlt: `<svg style="transform: rotate(0deg)"; stroke=${currentColor} fill=${currentColor} strokeWidth="0" viewBox="0 0 576 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M288 0c-69.59 0-126 56.41-126 126 0 56.26 82.35 158.8 113.9 196.02 6.39 7.54 17.82 7.54 24.2 0C331.65 284.8 414 182.26 414 126 414 56.41 357.59 0 288 0zm0 168c-23.2 0-42-18.8-42-42s18.8-42 42-42 42 18.8 42 42-18.8 42-42 42zM20.12 215.95A32.006 32.006 0 0 0 0 245.66v250.32c0 11.32 11.43 19.06 21.94 14.86L160 448V214.92c-8.84-15.98-16.07-31.54-21.25-46.42L20.12 215.95zM288 359.67c-14.07 0-27.38-6.18-36.51-16.96-19.66-23.2-40.57-49.62-59.49-76.72v182l192 64V266c-18.92 27.09-39.82 53.52-59.49 76.72-9.13 10.77-22.44 16.95-36.51 16.95zm266.06-198.51L416 224v288l139.88-55.95A31.996 31.996 0 0 0 576 426.34V176.02c0-11.32-11.43-19.06-21.94-14.86z"></path></svg>`,
      FaLocationArrow: `<svg style="transform: rotate(-45deg)"; stroke=${currentColor} fill=${currentColor} strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M444.52 3.52L28.74 195.42c-47.97 22.39-31.98 92.75 19.19 92.75h175.91v175.91c0 51.17 70.36 67.17 92.75 19.19l191.9-415.78c15.99-38.39-25.59-79.97-63.97-63.97z"></path></svg>`,
      BsFillArrowUpCircleFill: `<svg style="transform: rotate(0deg)"; stroke=${currentColor} fill=${currentColor} strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M16 8A8 8 0 1 0 0 8a8 8 0 0 0 16 0zm-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11.5z"></path></svg>`,
      BsArrowUpSquareFill: `<svg style="transform: rotate(0deg)"; stroke=${currentColor} fill=${currentColor} strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M2 16a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2zm6.5-4.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 1 0z"></path></svg>`,
      FaArrowAltCircleUp: `<svg style="transform: rotate(0deg)"; stroke=${currentColor} fill=${currentColor} strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M8 256C8 119 119 8 256 8s248 111 248 248-111 248-248 248S8 393 8 256zm292 116V256h70.9c10.7 0 16.1-13 8.5-20.5L264.5 121.2c-4.7-4.7-12.2-4.7-16.9 0l-115 114.3c-7.6 7.6-2.2 20.5 8.5 20.5H212v116c0 6.6 5.4 12 12 12h64c6.6 0 12-5.4 12-12z"></path></svg>`,
      GoArrowUp: `<svg style="transform: rotate(0deg)"; stroke=${currentColor} fill=${currentColor} strokeWidth="0" viewBox="0 0 10 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5 3L0 9h3v4h4V9h3L5 3z"></path></svg>`,
      MdDoubleArrow: `<svg style="transform: rotate(90deg)"; stroke=${currentColor} fill=${currentColor} strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M15.5 5H11l5 7-5 7h4.5l5-7z"></path><path d="M8.5 5H4l5 7-5 7h4.5l5-7z"></path></svg>`,
      RiArrowUpFill: `<svg style="transform: rotate(0deg)"; stroke=${currentColor} fill=${currentColor} strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><g><path fill="none" d="M0 0h24v24H0z"></path><path d="M13 12v8h-2v-8H4l8-8 8 8z"></path></g></svg>`,
      TbArrowBigUpLines: `<svg style="transform: rotate(0deg)"; stroke=${currentColor} fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><desc></desc><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M9 12h-3.586a1 1 0 0 1 -.707 -1.707l6.586 -6.586a1 1 0 0 1 1.414 0l6.586 6.586a1 1 0 0 1 -.707 1.707h-3.586v3h-6v-3z"></path><path d="M9 21h6"></path><path d="M9 18h6"></path></svg>`,
      TiArrowUpThick: `<svg style="transform: rotate(0deg)"; stroke=${currentColor} fill=${currentColor} strokeWidth="0" version="1.2" baseProfile="tiny" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12 3.172l-6.414 6.414c-.781.781-.781 2.047 0 2.828s2.047.781 2.828 0l1.586-1.586v7.242c0 1.104.895 2 2 2 1.104 0 2-.896 2-2v-7.242l1.586 1.586c.391.391.902.586 1.414.586s1.023-.195 1.414-.586c.781-.781.781-2.047 0-2.828l-6.414-6.414z"></path></svg>`,
    };
    return iconsData[target];
  }, []);

  const drawInitialVehicle = useCallback(
    (firstStep, locInfo) => {
      const step = Object.assign({ ...locInfo }, { ...firstStep });
      return myMap && myMap?.pin(step);
    },
    [myMap]
  );

  const drawselectedsteps = useCallback(
    (
      workstep,
      apidata,
      locInfo,
      isFromState,
      drawOptions,
      isStepsPath = false
    ) => {
      let steps = apidata?.map((step) =>
        Object.assign({ ...locInfo }, { ...step })
      );

      if (isFromState) drawStepsPath(apidata);
      if (isStepsPath) drawStepsPath(apidata);

      drawOptions.allMarkers &&
        apidata?.length &&
        drawStepsMarkers(workstep, apidata, steps, drawOptions);
      drawStepsGuides(steps, drawOptions);
    },
    [drawStepsGuides, drawStepsMarkers, drawStepsPath]
  );

  const drawStepsPath = useCallback(
    (apidata) => {
      const handleSteps = (apidata) =>
        JSON.parse(JSON.stringify(apidata))?.map((ele) => [
          ele.Latitude,
          ele.Longitude,
        ]);
      const latlngs = apidata?.length && handleSteps(apidata);

      latlngs &&
        fullPathGroup &&
        L.polyline(latlngs, { color: "#808080", smoothFactor: 3 }).addTo(
          fullPathGroup
        );
      latlngs && fullPathGroup && myMap.fitBounds(fullPathGroup?.getBounds());
    },
    [L, fullPathGroup, myMap]
  );

  const drawStepsMarkers = useCallback(
    (workstep, apidata, steps, drawOptions) => {
      const MaxMarkers = drawOptions.MaxMarkers || 500;
      let stepMrks = [...steps]
        .sort((a, b) => new Date(b.StepDistance) - new Date(a.StepDistance))
        .filter((x) => x.StepDistance > (drawOptions.MinDistance || 20))
        .slice(0, MaxMarkers);
      stepMrks.concat(
        [...steps].filter((s) => s.VehicleStatus > 1).slice(0, MaxMarkers)
      );

      stepMrks.forEach((step) => {
        let { ID, Latitude, Longitude, VehicleStatus } = step;
        const noIssue = step.VehicleStatus <= 1;
        const facolor =
          step.VehicleStatus == 1
            ? drawOptions?.colorOfMarkers
            : step.VehicleStatus == 2
              ? "black"
              : "maroon";
        const latlng = Latitude && Longitude && L.latLng(Latitude, Longitude);
        const icon = L.divIcon({
          iconAnchor: [5, 15],
          iconSize: noIssue ? null : [20, 20],
          html: icons(drawOptions?.markerIcon, facolor),
        });

        const VStatusToStr = function (VehicleStatus) {
          switch (VehicleStatus) {
            case 600:
            case 5:
              return t("VehicleOffline");
            case 101:
              return t("VehicleOverSpeed");
            case 204:
              return t("VehicleSleeping");
            case 100:
              return t("VehicleOverStreetSpeed");
            case 0:
              return t("VehicleStopped");
            case 1:
              return t("VehicleRunning");
            case 2:
              return t("VehicleIdle");
            default:
              return t("VehicleInvalid");
          }
        };

        function getContent(WorkStepID, apidata, LocID) {
          const si = apidata.find((x) => x.ID == LocID);

          const vs = VStatusToStr(si?.VehicleStatus);
          const content = `
            <p style="margin-left: 1rem !important" ><i></i> Display Name : ${si?.DisplayName
            }</p>
            <p style="margin-left: 1rem !important" ><i class="${Resources.Icons?.VehicleStatus
            } pe-1"></i> VehicleStatus : ${vs}</p>
            <p style="margin-left: 1rem !important" ><i class="${Resources.Icons?.RecordDateTime
            } pe-1"></i> ${moment(si?.RecordDateTime)
              .utc()
              .local()
              .format("LL hh:mm:ss a")}</p>
            <p style="margin-left: 1rem !important" >${si?.Latitude} , ${si?.Longitude
            }</p>
            <p style="margin-left: 1rem !important" ><i class="${Resources.Icons?.Direction
            } pe-1"></i> Direction : ${si?.Direction}</p>
            <p style="margin-left: 1rem !important" ><i class="${Resources.Icons?.Speed
            } pe-1"></i> ${si?.Speed
            } <span style="font-size: 0.6rem;">KM/h</span></p>
            <p style="margin-right: 1rem !important; margin-left: 1rem !important; margin-bottom: 1rem !important" ><i class="${Resources.Icons?.Address
            } pe-1"></i> ${si?.Address}</p>`;
          return content;
        }
        function onMouseEnter() {
          if (this.getPopup()) return;
          const { WorkStepID, LocID, VehicleStatus } = this.options;

          const content = getContent(WorkStepID, apidata, LocID);
          if (VehicleStatus >= 2)
            this.bindPopup(content, { className: "popupDanger" }).openPopup();
          else
            this.bindPopup(content, { className: "popupNormal" }).openPopup();
        }

        const marker =
          workstep &&
          L.marker(latlng, {
            icon,
            WorkStepID: workstep.ID,
            LocID: ID,
            VehicleStatus,
          });
        workstep && marker.on("click", onMouseEnter);
        // marker.on("mouseover", onMouseEnter).on("mouseout", onMouseLeave);
        workstep && fullPathGroup && marker.addTo(fullPathGroup);
        workstep &&
          document.getElementById("pause")?.setAttribute("disabled", "true");
      });
    },
    [L, fullPathGroup, icons, t]
  );

  const drawStepsGuides = useCallback(
    (steps, drawOptions) => {
      // get the center between two points
      const getCenter = (s1, s2) =>
        L.point(
          (s1.Latitude + s2.Latitude) / 2,
          (s1.Longitude + s2.Longitude) / 2
        );

      // get real direction for vehicle
      const getAngle = (s1, s2) => {
        const rotation =
          Math.atan2(s1.Longitude - s2.Longitude, s1.Latitude - s2.Latitude) *
          (180 / Math.PI);
        return rotation >= 0 ? rotation : 360 + rotation;
      };

      let stepGuides = [...steps].map(
        ({ Latitude, Longitude, StepDistance }) => ({
          Latitude,
          Longitude,
          StepDistance,
        })
      );
      for (let i = 0; i < stepGuides?.length - 1; i++) {
        const cv = stepGuides[i + 1];
        const pv = stepGuides[i];
        var center = getCenter(cv, pv);
        var rotation = getAngle(cv, pv);
        stepGuides[i + 1] = {
          ...cv,
          latlng: L.latLng(center.x, center.y),
          rotation,
        };
      }
      stepGuides.shift();
      stepGuides = stepGuides
        .sort((a, b) => new Date(b.StepDistance) - new Date(a.StepDistance))
        .filter((x) => x.StepDistance > (drawOptions.MinDistance || 20))
        .slice(0, drawOptions?.MaxGuides || 500);
      stepGuides.forEach((step) => {
        const icon = L.divIcon({
          iconAnchor: [5, 15],
          iconSize: null,
          html: icons(drawOptions?.guidesIcon, drawOptions?.colorOfGuides),
        });

        const marker =
          step &&
          L.marker(step.latlng, {
            icon,
            pvID: step.pvID,
            cvID: step.cvID,
          });
        step && marker.setRotationAngle(step.rotation);
        step && fullPathGroup && marker.addTo(fullPathGroup);
      });
    },
    [L, fullPathGroup, icons]
  );

  const handleClose = () => {
    setselectedStep(0 - 1);
    myMap?.deselectAll();
    fullPathGroup.clearLayers();
  };

  useEffect(() => {
    document?.body?.setAttribute("typeBody", "history");
    const getConfig = async () => {
      await axios
        .get("config")
        .then((res) => {
          if (res.status === 200) {
            const {
              MinDistance,
              MaxMarkers,
              MaxGuides,
              allMarkers,
              getAllLocations,
              colorOfMarkers,
              colorOfGuides,
              markerIcon,
              guidesIcon,
            } = res?.data?.configs[0]?.historyPlayBackConfigs;
            setDrawOptions(res?.data?.configs[0]?.historyPlayBackConfigs);

            setGetAllLocations(getAllLocations);
            setMinDistance(MinDistance);
            setMaxMarkers(MaxMarkers);
            setMaxGuides(MaxGuides);
            setAllMarkers(allMarkers);
            setColorOfMarkers(colorOfMarkers);
            setColorOfGuides(colorOfGuides);
            setMarkerIcon(markerIcon);
            setGuidesIcon(guidesIcon);
          }
        })
        .catch((err) => {
          toast.error(err.meesage);
        });
    };

    getConfig();
  }, []);

  const handleSaveSettings = async () => {
    setisToggleConfigOpen((prev) => !prev);
    const _newConfig = {
      historyPlayBackConfigs: {
        MinDistance: +MinDistance,
        MaxMarkers: +MaxMarkers,
        MaxGuides: +MaxGuides,
        allMarkers,
        getAllLocations,
        colorOfMarkers,
        colorOfGuides,
        markerIcon,
        guidesIcon,
      },
    };
    setDrawOptions(_newConfig.historyPlayBackConfigs);
    setisToggleConfigOpen(false);
    fullPathGroup.clearLayers();
    pathSteps?.length &&
      drawselectedsteps(
        workstep,
        pathSteps,
        locInfo,
        IsFromState,
        _newConfig.historyPlayBackConfigs,
        true
      );
    try {
      await axios.post("config/history", _newConfig);
    } catch (err) {
      toast.error(err.meesage);
    }
  };

  const handleBackgroundStep = (item) => {
    if (item?.IsIdle) {
      if (item?.StrEvent == "InProgress") {
        return "#2E7CB8";
      } else {
        return "goldenrod";
      }
    } else {
      if (item?.StrEvent == "Trip") {
        return "#2f857d";
      } else {
        if (item?.StrEvent == "Parked") {
          return "#737388";
        }
        if (item?.StrEvent == "InProgress") {
          return "#2E7CB8";
        } else {
          return "red";
        }
      }
    }
  };

  function handleSelect(item) {
    setDates([item.selection]);
    setStrDate(
      `${moment(item.selection.startDate).format(
        "YYYY-MM-DD"
      )}T${HoursFrom}:${MinutsFrom}:00`
    );
    setEndDate(
      `${moment(item.selection.endDate).format(
        "YYYY-MM-DD"
      )}T${HoursTo}:${MinutsTo}:00`
    );

    setFullDate((prev) => ({
      ...prev,
      strDate: `${moment(item.selection.startDate).format("YYYY-MM-DD")}`,
      endDate: `${moment(item.selection.endDate).format("YYYY-MM-DD")}`,
      fullTime: `${moment(item.selection.startDate).format(
        "YYYY-MM-DD"
      )}T${HoursFrom}:${MinutsFrom}:00 ${moment(item.selection.endDate).format(
        "YYYY-MM-DD"
      )}T${HoursTo}:${MinutsTo}:00`,
    }));
  }

  const formatDate = (date) => {
    const format = "YYYYMMDDHHmmss";
    const formatedDate = moment(date).format(format);
    return formatedDate;
  };

  const handleShowCamera = (query) => {
    const vId = Number(query.VehID);
    const dateRanges = {
      start: Dates[0].startDate,
      end: Dates[0].endDate,
    };
    const startDate = formatDate(dateRanges.start);
    const endDate = formatDate(dateRanges.end);
    let location = userData.vehData.filter((item) => {
      return item.VehicleID === vId;
    });
    const serialNumber = location[0].SerialNumber;
    SetPlaybackDate([startDate, endDate]);

    document.getElementById("ShowCamBtn").setAttribute("data-Id", serialNumber);
    setShowCam((prev) => !prev);
  };

  const handleHoursFrom = (value) => {
    setFullDate((prev) => ({
      ...prev,
      strTime: `${value}:${MinutsFrom}:00`,
      fullTime: `${prev.strDate}T${value}:${MinutsFrom}:00 ${prev.endDate}T${HoursTo}:${MinutsTo}:00`,
    }));
    setHoursFrom(value);
  };
  const handleMinutsFrom = (value) => {
    setFullDate((prev) => ({
      ...prev,
      strTime: `${HoursFrom}:${value}:00`,
      fullTime: `${prev.strDate}T${HoursFrom}:${value}:00 ${prev.endDate}T${HoursTo}:${MinutsTo}:00`,
    }));
    setMinutsFrom(value);
  };
  const handleHoursTo = (value) => {
    setFullDate((prev) => ({
      ...prev,
      endTime: `${value}:${MinutsTo}:00`,
      fullTime: `${prev.strDate}T${HoursFrom}:${MinutsFrom}:00 ${prev.endDate}T${value}:${MinutsTo}:00`,
    }));
    setHoursTo(value);
  };
  const handleMinutsTo = (value) => {
    setFullDate((prev) => ({
      ...prev,
      endTime: `${HoursTo}:${value}:00`,
      fullTime: `${prev.strDate}T${HoursFrom}:${MinutsFrom}:00 ${prev.endDate}T${HoursTo}:${value}:00`,
    }));
    setMinutsTo(value);
  };

  const getDateOptions = (nums) =>
    Array.from(Array(nums).keys()).map((it) => ({
      value: it < 10 ? `0${it}` : it,
      label: it < 10 ? `0${it}` : it,
    }));
  const hoursOptions = getDateOptions(24);

  const minutsOptions = getDateOptions(60);

  const handleGetSteps = useCallback(() => {
    let valid = true;
    // Date validation
    if (Date.parse(fullDate.strDate) > Date.parse(fullDate.endDate)) {
      toast.warning("Please make sure that start date is before end date");
      setValidated(false);
      valid = false;
    } else if (fullDate.fullTime.length != 39) {
      toast.warning("Please enter a valid date range");
      setValidated(false);
      valid = false;
    } else {
      setValidated(true);
      valid = true;
    }

    if (valid === true) {
      myMap?.deselectAll();
      fullPathGroup.clearLayers();
      setShowDatePicker(false);

      setloading(true);
      setAllLocations({});
      setAllSteps({});
      setselectedStep(null);
      setSelectedLocations([]);
      setSelectedSteps([]);
      setMsgEmptyData("");
      document.getElementById("pause")?.removeAttribute("disabled");

      const strDateUtc = moment(
        `${moment(fullDate.strDate).format("YYYY-MM-DD")}T${fullDate.strTime}`
      ).utc().format("YYYY-MM-DD HH:mm:ss");

      const endDateUtc = moment(
        `${moment(fullDate.endDate).format("YYYY-MM-DD")}T${fullDate.endTime}`
      ).utc().format("YYYY-MM-DD HH:mm:ss");

      const fullUtcStrDate = `${strDateUtc.split(" ")[0]}T${strDateUtc.split(" ")[1]
        }`;
      const fullUtcEndDate = `${endDateUtc.split(" ")[0]}T${endDateUtc.split(" ")[1]
        }`;

      setStrDate(
        `${moment(Dates[0].startDate).format(
          "YYYY-MM-DD"
        )}T${HoursFrom}:${MinutsFrom}:00`
      );
      setEndDate(
        `${moment(Dates[0].endDate).format(
          "YYYY-MM-DD"
        )}T${HoursTo}:${MinutsTo}:00`
      );

      (async () => {
        await axios
          .get(
            `vehicles/historysteps?VehID=${query?.VehID}&pageNumber=1&pageSiz=10000&strDate=${fullUtcStrDate}&endDate=${fullUtcEndDate}`
          )
          .then(({ data }) => {
            if (data?.historysteps) {
              const historysteps = data.historysteps.map((s) => {
                let ns = {
                  ...s,
                  IsIdle: s?.StrEvent == "Trip" && !s.Distance,
                  maxIdle: 60 * 10,
                  maxIdleSince: 0,
                  excessiveIdle: false,
                };

                if (s?._id) {
                  ns = {
                    ...ns,
                    ID: s?.ID ?? s?._id,
                    IsIdle: s?.IsTrip && !s.Distance,
                    StrEvent: s?.IsTrip ? "Trip" : "Parked",
                    Endvent: s?.IsTrip ? "Parked" : "Trip",
                    StrDate: s?.StrDate,
                    EndDate: s?.EndDate,
                    StrLat: s?.Coord?.[0] ?? 0,
                    StrLng: s?.Coord?.[1] ?? 0,
                  };
                }
                return ns;
              });

              const LastStep = historysteps?.[historysteps.length - 1];
              const dummyEndDate =
                new Date(endDateUtc) > new Date()
                  ? new Date()
                  : new Date(endDateUtc);
              const duration = Math.floor(
                (dummyEndDate - new Date(LastStep?.EndDate ?? strDateUtc)) /
                1000
              );
              if (
                dummyEndDate > new Date(LastStep?.EndDate ?? endDateUtc) ||
                historysteps.length == 0
              ) {
                let dummyStep = {
                  ID: "DummyStep",
                  IsIdle: false,
                  StrDate: LastStep?.EndDate ?? strDateUtc,
                  StrLat: LastStep?.StrLat ?? 0,
                  StrLng: LastStep?.StrLng ?? 0,

                  StrMil: LastStep?.EndMil ?? 0,
                  StrEvent: "InProgress",
                  EndDate: dummyEndDate,

                  EndAdd: LastStep?.EndAdd ?? "",
                  EndMil: LastStep?.EndMil ?? 0,
                  EndEvent: "InProgress",
                  Duration: duration,
                  VehicleID: +query?.VehID,
                };
                dummyStep = { ...LastStep, ...dummyStep };
                historysteps.push(dummyStep);
              }
              const allHistorysteps = {};
              historysteps.forEach((item) => {
                allHistorysteps[item.ID] = item;
                // delete allHistorysteps[item.ID].Address;
                // delete allHistorysteps[item.ID].Coord;
                // delete allHistorysteps[item.ID].DriverID;
                // delete allHistorysteps[item.ID].DriverName;
                // delete allHistorysteps[item.ID].EndDate;
                // delete allHistorysteps[item.ID].EndEvent;
                // delete allHistorysteps[item.ID].EndAdd;
              });

              setloading(false);
              setAllSteps(allHistorysteps);
              if (drawOptions.getAllLocations) {
                toast.info('Loading All History Playback...')
                historysteps.forEach((step, idx) => {
                  setTimeout(() => {
                    handleselectedStep(step, idx, true);
                  }, 500);
                });
              }
              setMsgEmptyData("");
            } else {
              setMsgEmptyData("there is no data");
              toast.info("there is no data");
              setloading(false);
            }
          })
          .catch((error) => {
            toast.error(error.message);
            setloading(false);
          });
      })();
    }
  }, [
    newToken,
    drawOptions.getAllLocations,
    query?.VehID,
    Dates,
    HoursFrom,
    MinutsFrom,
    HoursTo,
    MinutsTo,
    fullDate,
  ]);

  const changeRowDataKeys = (data) => {
    const newArr = data.map((obj) => {
      const newObj = {};
      //You have to add a condition on the Object key name and perform your actions
      Object.keys(obj).forEach((key) => {
        if (
          key === "Address" &&
          typeof obj[key] !== "string" &&
          typeof obj[key] !== "undefined"
        ) {
          delete newObj.Address;
          newObj["Start Address"] = obj[key][0];
          newObj["End Address"] = obj[key][1];
        } else if (key === "Endvent") {
          delete newObj.Endvent;
          newObj["EndEvent"] = obj[key];
        } else if (key === "Coord") {
          delete newObj.Coord;
          newObj["Start Coord"] = `(${(obj[key][0], obj[key][1])})`;
          newObj["End Coord"] = `(${(obj[key][2], obj[key][3])})`;
        } else if (key === "EndAdd") {
          delete newObj.EndAdd;
        } else if (
          key === "StrDate" ||
          key === "EndDate" ||
          key === "RecordDateTime" ||
          (key === "IdleStart" && obj[key])
        ) {
          newObj[key] = moment(obj[key])
            .utc()
            .local()
            .format("YYYY-MM-DD HH:mm:ss A");
        } else if (key === "Guide") {
          delete newObj.Guide;
        } else if (
          obj[key] === "null" ||
          !obj[key] ||
          obj[key].toString().trim() === "null" ||
          obj[key] === ""
        ) {
          newObj[key] = "N/A";
        } else {
          newObj[key] = obj[key];
        }
      });
      let keys = [];
      Object.keys(newObj).forEach((key) => {
        keys.push(key);
      });

      return newObj;
    });
    return newArr;
  };

  const handleExport = (data, name) => {
    convertJsonToExcel(changeRowDataKeys(data), name);
  };

  return (
    <>
      <Card
        className="px-2 menuTreeHistory  position-relative"
        style={{ backgroundColor: darkMode && "rgb(21 25 37)" }}
      >
        <button
          id="config-toggle-btn"
          onClick={() => {
            setisToggleConfigOpen((prev) => !prev);
            setShowDatePicker(false);
          }}
          type="button"
          className={Styles.config_btn2}
          style={{
            backgroundColor: darkMode && "rgb(21 25 37)",
            left: locale === "ar" ? "0" : "",
            right: !(locale === "ar") ? "0" : "",
          }}
        >
          <FontAwesomeIcon icon={faSlidersH} />
        </button>

        <Form.Control
          id="history-date-picker"
          size="md"
          type="text"
          placeholder={fullDate.fullTime}
          value={fullDate.fullTime} // Sat Jan 14 2023 23:59:59 GMT+0200 (Eastern European Standard Time)
          onChange={(e) => {
            const inputValue = e.target.value;
            const maskedInput = mask.resolve(inputValue);
            setFullDate((prev) => ({
              ...prev,
              strDate: maskedInput?.split(" ")[0]?.split("T")[0],
              strTime: maskedInput?.split(" ")[0]?.split("T")[1],
              endDate: maskedInput?.split(" ")[1]?.split("T")[0],
              endTime: maskedInput?.split(" ")[1]?.split("T")[1],
              fullTime: maskedInput,
            }));
          }}
          onClick={() => {
            setShowDatePicker(true);
            setisToggleConfigOpen(false);
          }}
          className={`border border-${!validated && "danger"}`}
        />

        {/* conditional Rendering for Date Range Picker */}
        <div className="align-items-start justify-content-start bg-black">
          {showDatePicker ? (
            <>
              <div
                className="d-flex justify-content-between gap-3"
                style={{
                  backgroundColor: darkMode ? "#222738" : "#fff",
                  width: "35rem",
                }}
              >
                <div
                  className="d-flex flex-row justify-content-start ms-3 py-3 gap-1"
                  style={{ width: "200px" }}
                >
                  <Button
                    size="lg"
                    variant="danger"
                    className="col-2"
                    onClick={() => {
                      setShowDatePicker(false);
                    }}
                  >
                    X
                  </Button>
                  <Button
                    size="lg"
                    variant="primary"
                    className="px-3 col-10"
                    onClick={handleGetSteps}
                    disabled={disableBtn}
                  >
                    {t("Get_Steps")}
                  </Button>
                </div>
                <div
                  className="dateBx d-flex justify-content-between gap-2"
                // style={{ width: "332px", gap: "1rem" }}
                >
                  <div
                    className="inputDateFrom d-flex justify-content-between gap-1"
                  // style={{ width: "50%", gap: "1.5rem" }}
                  >
                    <ReactSelect
                      onSelectChange={handleHoursFrom}
                      value={HoursFrom ? HoursFrom : "00"}
                      options={hoursOptions}
                      defaultValue={{
                        value: HoursFrom ? HoursFrom : "00",
                        label: HoursFrom ? HoursFrom : "00",
                      }}
                      Style={{ marginLeft: "0.7rem" }}
                      className="mb-3  mt-3"
                      cuStyles={{
                        minHeight: "30px",
                      }}
                    />
                    <ReactSelect
                      onSelectChange={handleMinutsFrom}
                      value={MinutsFrom ? MinutsFrom : "00"}
                      options={minutsOptions}
                      defaultValue={{
                        value: MinutsFrom ? MinutsFrom : "00",
                        label: MinutsFrom ? MinutsFrom : "00",
                      }}
                      className="mb-3 mt-3"
                      cuStyles={{
                        minHeight: "30px",
                      }}
                    />
                  </div>
                  <div className="inputDateTo d-flex justify-content-between gap-1">
                    <ReactSelect
                      onSelectChange={handleHoursTo}
                      value={HoursTo ? HoursTo : "23"}
                      options={hoursOptions}
                      defaultValue={{
                        value: HoursTo ? HoursTo : "23",
                        label: HoursTo ? HoursTo : "23",
                      }}
                      className="mb-3 mt-3"
                      cuStyles={{
                        minHeight: "30px",
                      }}
                    />
                    <ReactSelect
                      onSelectChange={handleMinutsTo}
                      options={minutsOptions}
                      defaultValue={{
                        value: MinutsTo ? MinutsTo : "59",
                        label: MinutsTo ? MinutsTo : "59",
                      }}
                      className="mb-3 mt-3 me-3"
                      cuStyles={{
                        minHeight: "30px",
                      }}
                    />
                  </div>
                </div>
              </div>
              <DateRangePicker
                maxDate={moment().toDate()}
                ranges={Dates}
                onChange={handleSelect}
                rangeColors={["#246c66"]}
              />
            </>
          ) : null}
        </div>
        <Settings
          setShowDatePicker={setShowDatePicker}
          handleSaveSettings={handleSaveSettings}
          MinDistance={MinDistance}
          MaxMarkers={MaxMarkers}
          MaxGuides={MaxGuides}
          allMarkers={allMarkers}
          colorOfMarkers={colorOfMarkers}
          colorOfGuides={colorOfGuides}
          markerIcon={markerIcon}
          guidesIcon={guidesIcon}
          setMinDistance={setMinDistance}
          setMaxMarkers={setMaxMarkers}
          setMaxGuides={setMaxGuides}
          setAllMarkers={setAllMarkers}
          setColorOfMarkers={setColorOfMarkers}
          setColorOfGuides={setColorOfGuides}
          setMarkerIcon={setMarkerIcon}
          setGuidesIcon={setGuidesIcon}
          setGetAllLocations={setGetAllLocations}
          getAllLocations={getAllLocations}
          chartModal={chartModal}
          setchartModal={setchartModal}
          geofences={geofences}
          setGeofences={setGeofences}
          setLandMarks={setLandMarks}
          landMarks={landMarks}
          L={L}
          isToggleConfigOpen={isToggleConfigOpen}
          setisToggleConfigOpen={setisToggleConfigOpen}
          t={t}
          rangeDraw={rangeDraw}
          pathSteps={pathSteps}
          setRangeDraw={setRangeDraw}
          fullPathGroup={fullPathGroup}
          workstep={workstep}
          locInfo={locInfo}
          isFromState={IsFromState}
          drawOptions={drawOptions}
          drawselectedsteps={drawselectedsteps}
        />

        <PlayVideo
          AllSteps={AllSteps}
          loading={loading}
          selectedSteps={selectedSteps}
          setStats={setStats}
          setCurrentSLocation={setCurrentSLocation}
          currentSLocation={currentSLocation}
          setSpeedCar={setSpeedCar}
          speedCar={speedCar}
          stats={stats}
        />
        {showCam && (
          <ShowPlaybackCam
            show={showCam}
            setShow={setShowCam}
            dateRange={playbackDate}
          />
        )}

        {loading && (
          <FontAwesomeIcon
            className="mx-2 mt-3 fa-spin text-info fs-4 d-block mx-auto"
            icon={faSpinner}
            size="sm"
          />
        )}
        <div>
          {Object.values(AllSteps).length ? (
            <p className="mt-3 d-flex justify-content-between align-items-center">
              <h4>{t("All_Steps")}</h4>
              <Button
                size="sm"
                id="ShowCamBtn"
                className="d-flex align-items-center justify-content-between gap-2 px-2 py-1"
                onClick={() => handleShowCamera(query)}
              >
                <span>{t("Playback")}</span>
                <BsFillCameraVideoFill />
              </Button>
              <Button
                size="sm"
                className="d-flex align-items-center justify-content-between gap-2 px-2 py-1"
                onClick={() =>
                  handleExport(Object.values(AllSteps), "All Steps")
                }
              >
                <span>{t("Export")}</span> <SiMicrosoftexcel />
              </Button>
            </p>
          ) : (
            ""
          )}
        </div>
        <Stepper
          nonLinear
          activeStep={selectedStep}
          orientation="vertical"
          className="p-0 pe-1 mt-4"
          style={{
            overflowY: !Object.keys(AllSteps ?? {})?.length && "hidden",
            overflowX: !Object.keys(AllSteps ?? {})?.length ? "auto" : "hidden",
          }}
        >
          {Object.values(AllSteps ?? {})?.map((item, index) => {
            var hours = formatHourNumber(Math.floor(item?.Duration / 3600));
            var minutes = formatHourNumber(
              Math.floor((item?.Duration % 3600) / 60)
            );
            var seconds = formatHourNumber(item?.Duration % 60);
            return (
              <Step key={item?.ID}>
                <StepLabel>
                  <Button
                    id="StepBtn"
                    disabled={loading}
                    className="py-0 px-3  border-0 w-100 d-flex justify-content-between align-items-center"
                    style={{
                      backgroundColor: `${handleBackgroundStep(item)}`,
                      height: "40px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    title={item?.IsIdle ? "Idle" : item?.StrEvent}
                    onClick={() => handleselectedStep(item, index)}
                  >
                    <span className="">
                      {t("from")} :
                      {moment(item?.StrDate)
                        .utc()
                        .local()
                        .format("YYYY-MM-DD hh:mm a")}
                    </span>
                    {" | "}
                    <span className="">
                      {t("to")} :{" "}
                      {moment(item?.EndDate)
                        .utc()
                        .local()
                        .format("YYYY-MM-DD hh:mm a")}
                    </span>
                    {AllLocations[item.ID] && (
                      <p className="lead">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="10"
                          height="10"
                          fill="#fff"
                          version="1.1"
                          viewBox="0 0 567.123 567.123"
                          xmlSpace="preserve"
                        >
                          <path d="M0 567.119h567.123V.004H0v567.115zm56.818-283.642l43.556-43.568c5.404-5.404 11.812-8.109 19.217-8.109 7.399 0 13.807 2.705 19.217 8.109l90.092 90.105 199.408-199.409c5.404-5.404 11.811-8.121 19.217-8.121 7.398 0 13.807 2.717 19.217 8.121l43.557 43.55c5.402 5.422 8.113 11.824 8.113 19.217 0 7.405-2.711 13.813-8.113 19.217L248.117 474.764c-5.41 5.422-11.818 8.121-19.217 8.121-7.405 0-13.813-2.705-19.217-8.121L56.818 321.91c-5.41-5.404-8.115-11.812-8.115-19.217 0-7.406 2.699-13.812 8.115-19.216z"></path>
                        </svg>
                      </p>
                    )}
                  </Button>
                </StepLabel>
                <StepContent>
                  <strong
                    style={{
                      color: "#2f857d",
                      fontWeight: "900",
                    }}
                  >
                    {t("Address")} :
                  </strong>
                  <Typography
                    style={{
                      color: !darkMode ? "rgb(34 39 55)" : "rgb(223 233 235)",
                    }}
                  >
                    {item?.Address || address}
                  </Typography>
                  <strong
                    style={{
                      color: " #2f857d",
                      fontWeight: "900",
                    }}
                  >
                    {t("Duration")} :
                  </strong>
                  <Typography
                    style={{
                      color: !darkMode ? "rgb(34 39 55)" : "rgb(223 233 235)",
                    }}
                  >
                    {hours}:{minutes}:{seconds}
                  </Typography>
                  {item.maxIdleSince ? (
                    <>
                      <strong
                        style={{
                          color: " #2f857d",
                          fontWeight: "900",
                        }}
                      >
                        {t("Max_Idle")} :
                      </strong>
                      <Typography
                        style={
                          item.excessiveIdle
                            ? {
                              width: "fit-content",
                              background: "#FA6C51",
                              padding: "1px 8px",
                              borderRadius: "5px",
                              color: "white",
                              fontSize: "0.85rem",
                            }
                            : {
                              color: !darkMode
                                ? "rgb(34 39 55)"
                                : "rgb(223 233 235)",
                            }
                        }
                      >
                        {item.maxIdleSince} Sec
                      </Typography>
                    </>
                  ) : (
                    ""
                  )}
                  {item?.StrEvent == "Trip" ? (
                    <>
                      <strong
                        style={{
                          color: " #2f857d",
                          fontWeight: "900",
                        }}
                      >
                        {t("Mileage")} :
                      </strong>
                      <Typography
                        style={{
                          color: !darkMode
                            ? "rgb(34 39 55)"
                            : "rgb(223 233 235)",
                        }}
                      >
                        {((item?.EndMil - item?.StrMil) / 1000).toFixed(2)} km
                      </Typography>
                    </>
                  ) : null}
                  <strong
                    style={{
                      color: " #2f857d",
                      fontWeight: "900",
                    }}
                  >
                    {t("All_Locations")} :
                  </strong>
                  <Typography
                    style={{
                      color: !darkMode ? "rgb(34 39 55)" : "rgb(223 233 235)",
                    }}
                  >
                    <Button
                      size="sm"
                      className="d-flex align-items-center justify-content-between gap-2 px-2 py-1"
                      disabled={!AllLocations[item.ID]}
                      onClick={() =>
                        handleExport(AllLocations[item.ID], "All Locations")
                      }
                    >
                      <span>{t("Export")}</span> <SiMicrosoftexcel />
                    </Button>
                  </Typography>

                  <strong
                    style={{
                      color: " #2f857d",
                      fontWeight: "900",
                    }}
                  >
                    {t("Coordinates")} :
                  </strong>
                  <Typography
                    style={{
                      color: !darkMode ? "rgb(34 39 55)" : "rgb(223 233 235)",
                    }}
                  >
                    ({item?.StrLat} , {item?.StrLng})
                  </Typography>
                  <Card sx={{ mb: 2 }} className="bg-transparent">
                    <div>
                      <Button
                        variant="primary"
                        onClick={handleClose}
                        style={{
                          marginTop: "1rem",
                        }}
                      >
                        {t("Close")}
                      </Button>
                    </div>
                  </Card>
                </StepContent>
              </Step>
            );
          })}
          {!Object.keys(AllSteps ?? {})?.length && !loading && (
            <div>
              <div className="col-md-12 text-center">
                <i className="fas fa-info-circle p-2 text-info fs-4"></i>
                <h5>
                  {msgEmptyData ? msgEmptyData : t("Select_a_valid_date")}
                </h5>
              </div>
            </div>
          )}
        </Stepper>
      </Card>
    </>
  );
};

export default StepperComp;
