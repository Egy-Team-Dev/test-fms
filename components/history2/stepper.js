import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Typography from "@mui/material/Typography";
import { DateRangePicker } from "rsuite";
import { useRouter } from "next/router";
import dateFormat from "dateformat";
import moment from "moment";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { BiTimeFive } from "react-icons/bi";
import { FcCalendar } from "react-icons/fc";
import { Button, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSlidersH, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "next-i18next";
import formatHourNumber from "utils/formatHourNumber";
import { encryptName } from "helpers/encryptions";
import PlayVideo from "./PlayVideo";
import Settings from "./Settings";

const { afterToday } = DateRangePicker;

import { Resources } from "components/maps/Resources";
import CheckBoxes from "./CheckBoxes";

const StepperComp = ({
  chartModal,
  setchartModal,
  setSelectedLocations,
  AllSteps,
  setAllSteps,
}) => {
  const { t } = useTranslation("history");

  const L = require("leaflet");
  const { query, locale } = useRouter();
  const { myMap } = useSelector((state) => state.mainMap);
  const darkMode = useSelector((state) => state.config.darkMode);

  const [loading, setloading] = useState(false);

  const [selectedStep, setselectedStep] = useState("null");
  const [AllLocations, setAllLocations] = useState({});

  const [selectedSteps, setSelectedSteps] = useState([]);

  const [stats, setStats] = useState(0);

  const [stopCar, setStopCar] = useState(false);

  const newToken = useSelector((state) => state?.auth?.user?.new_token);
  const userData = JSON.parse(
    localStorage.getItem(encryptName("userData")) ?? "{}"
  );

  const fullPathGroup = useMemo(
    () => L.featureGroup().addTo(myMap),
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
  const [IsFromState, setIsFromState] = useState({});
  const [isToggleConfigOpen, setisToggleConfigOpen] = useState(false);

  let isFromStateRef = useRef();
  isFromStateRef.current = false;

  const [workstep, setWorkstep] = useState({});
  const [msgEmptyData, setMsgEmptyData] = useState("");

  const [pathSteps, setPathSteps] = useState([]);
  const [rangeDraw, setRangeDraw] = useState({
    label: "",
    min: 0,
    max: pathSteps.length - 1,
    step: 1,
    value: {
      min: 0,
      max: pathSteps.length - 1,
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

  const dateNow = new Date();
  const year = dateNow.getFullYear();
  const getMonth = dateNow.getMonth() + 1;
  const month = getMonth < 10 ? `0${getMonth}` : getMonth;
  const day =
    dateNow.getDate() < 10 ? `0${dateNow.getDate()}` : dateNow.getDate();

  useEffect(() => {
    if (stats) {
      if (currentSLocation !== selectedSteps.length) {
        setTimeout(() => {
          myMap?.UpdateMarker(selectedSteps[currentSLocation], {
            history: true,
          });
          setCurrentSLocation((prevState) => prevState + 1);
        }, speedCar);
      } else {
        setStats(0);
      }
    } else {
      myMap?.UpdateMarker(selectedSteps[currentSLocation], {
        history: true,
      });
    }
  }, [stats, currentSLocation, myMap, selectedSteps, speedCar]);

  const handleselectedStep = async (item, index) => {
    setselectedStep(null);
    setSelectedLocations([]);
    setSelectedSteps([]);
    setPathSteps([]);
    myMap?.deselectAll();
    fullPathGroup.clearLayers();
    document.getElementById("pause")?.removeAttribute("disabled");

    if (selectedStep != index) {
      setselectedStep(index);
      const { StrDate, EndDate } = item;

      let currSelectedLocations;

      let locInfo = userData?.vehData.find(
        (v) => +v?.VehicleID === +item?.VehicleID
      );

      delete locInfo.RecordDateTime;

      setLocInfo(locInfo);

      currSelectedLocations = AllLocations[item.ID] ?? [];

      const isFromState = !!currSelectedLocations.length;

      setIsFromState(isFromState);
      isFromStateRef.current = isFromState;

      if (
        !currSelectedLocations.length &&
        (item.StrEvent == "Parked" || item.IsIdle)
      ) {
        const steps = {
          ...locInfo,
          RecordDateTime: item.StrDate,
          EndDate: item.EndDate,
          Latitude: item.StrLat,
          Longitude: item.StrLng,
          Duration: item.Duration,
          Address: item.StrAdd,
          Speed: 0,
          VehicleStatus: item.StrEvent == "Parked" ? 0 : 2,
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
        !currSelectedLocations.length &&
        item.StrEvent !== "Parked" &&
        !item.IsIdle
      ) {
        const expSteps = Math.ceil(item.Duration / 20);
        let interval;
        let progress = `please wait, expected requested point count id ${expSteps}...`;
        try {
          toast.warning(progress);
          setloading(true);
          interval = setInterval(() => {
            toast.warning(progress);
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
              `vehicles/historyplayback?VehID=${query?.VehID}&pageNumber=${pageno}&pageSize=${pagesize}&strDate=${StrDate}&endDate=${EndDate}&mode=1`
            );

            if (res.status === 200) {
              const newData = res.data.historylocations.map((data) => ({
                ID: data._id,
                VehicleID: data.VehicleID,
                RecordDateTime: data.RecordDateTime,
                Latitude: data.Latitude,
                Longitude: data.Longitude,
                Direction: data.Direction,
                Speed: data.Speed,
                Address: data.Address,
                VehicleStatus: data.VehicleStatus,
              }));
              resPage = resPage.concat(newData);
              const message =
                newData.length == pagesize
                  ? `${resPage.length} Records Fetched, up to ${
                      resPage[resPage.length - 1]?.RecordDateTime ??
                      item.EndDate
                    }, out of about ${expSteps} ...`
                  : `Fetching data is completed, start drawing ${resPage.length} records`;
              drawStepsPath(newData);
              toast.dismiss();
              toast.info(message);
            } else {
              toast.error(res.toString());
            }
          }
          if (resPage.length) {
            currSelectedLocations = [...resPage];
            currSelectedLocations = currSelectedLocations.sort(
              (a, b) => new Date(b.RecordDateTime) - new Date(a.RecordDateTime)
            );
            currSelectedLocations = currSelectedLocations
              .reduce(
                // Forword Reducer function
                (pv, cv) => {
                  if (!pv.length) return [cv];
                  const lv = pv[pv.length - 1];
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
              .reverse();
            currSelectedLocations = currSelectedLocations.reduce((pv, cv) => {
              pv.push({
                ...cv,
                IdleSince:
                  cv.Speed > 0
                    ? 0
                    : cv.Duration +
                      (pv.length > 0 ? pv[pv.length - 1].IdleSince : 0),
                IdleStart:
                  cv.Speed > 0
                    ? null
                    : pv.length > 0
                    ? pv[pv.length - 1]?.IdleStart
                    : cv.RecordDateTime,
              });
              return pv;
            }, []);

            setAllLocations((prev) => {
              var crn = { ...prev };
              crn[item.ID] = [...currSelectedLocations];
              return crn;
            });
          }
        } catch (err) {
          console.log("Error: ", err);
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

      AllSteps[item.ID].maxIdleSince = maxIdleSince;
      AllSteps[item.ID].excessiveIdle = maxIdleSince > item.maxIdle;

      setAllSteps(AllSteps);

      setSelectedSteps(currSelectedLocations);
      setSelectedLocations(currSelectedLocations);
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
        apidata.length &&
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
      const latlngs = apidata.length && handleSteps(apidata);

      latlngs.length &&
        L.polyline(latlngs, { color: "#808080", smoothFactor: 3 }).addTo(
          fullPathGroup
        );
      latlngs.length && myMap.fitBounds(fullPathGroup.getBounds());
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
            case 204:
              return t("VehicleSleeping");
            case 101:
              return t("VehicleOverSpeed");
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
          const content = `<p style="margin-left: 1rem !important" ><i class="${Resources.Icons?.VehicleStatus} pe-1"></i> VehicleStatus : ${vs}</p>
            <p style="margin-left: 1rem !important" ><i class="${Resources.Icons?.RecordDateTime} pe-1"></i> ${si?.RecordDateTime}</p>
            <p style="margin-left: 1rem !important" >${si?.Latitude} , ${si?.Longitude}</p>
            <p style="margin-left: 1rem !important" ><i class="${Resources.Icons?.Direction} pe-1"></i> Direction : ${si?.Direction}</p>
            <p style="margin-left: 1rem !important" ><i class="${Resources.Icons?.Speed} pe-1"></i> ${si?.Speed} <span style="font-size: 0.6rem;">KM/h</span></p>
            <p style="margin-right: 1rem !important; margin-left: 1rem !important; margin-bottom: 1rem !important" ><i class="${Resources.Icons?.Address} pe-1"></i> ${si?.Address}</p>`;
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

        // function onMouseLeave() {
        //   setTimeout(() => {
        //     this.closePopup();
        //     this.unbindPopup();
        //   }, 2e1);
        // }
        const workstepLength = Object.keys(workstep)?.length;
        const marker =
          workstepLength &&
          L.marker(latlng, {
            icon,
            WorkStepID: workstep.ID,
            LocID: ID,
            VehicleStatus,
          });
        workstepLength && marker.on("click", onMouseEnter);
        // marker.on("mouseover", onMouseEnter).on("mouseout", onMouseLeave);
        workstepLength && marker.addTo(fullPathGroup);
        workstepLength &&
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
      for (let i = 0; i < stepGuides.length - 1; i++) {
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

        const marker = L.marker(step.latlng, {
          icon,
          pvID: step.pvID,
          cvID: step.cvID,
        });
        marker.setRotationAngle(step.rotation);
        marker.addTo(fullPathGroup);
      });
    },
    [L, fullPathGroup, icons]
  );

  const handleDate = useCallback(
    (e) => {
      setloading(true);
      setAllLocations({});
      setAllSteps({});
      setStopCar(true);
      setselectedStep(null);
      setSelectedLocations([]);
      setSelectedSteps([]);
      setMsgEmptyData("");
      myMap?.deselectAll();
      fullPathGroup.clearLayers();
      document.getElementById("pause")?.removeAttribute("disabled");
      const dateformat = e?.map((x) => x?.toString().split(" GMT")[0]);
      const updateFormat = dateformat?.map((x) => dateFormat(x, "isoDateTime"));
      let endFormat = updateFormat?.map((x) => x.split("+")[0]);
      let endHours = endFormat[1].split("T")[1].split(":")[0];
      let endDay = endFormat[1].split("T")[0].split("-")[2];
      let firstDay = endFormat[0].split("T")[0].split("-")[2];

      let nowDate = new Date();

      let nowHours = new Date().getHours();

      const getMonth = nowDate.getMonth() + 1;
      const month = getMonth < 10 ? `0${getMonth}` : getMonth;
      const day =
        nowDate.getDate() < 10 ? `0${nowDate.getDate()}` : nowDate.getDate();

      if (endHours > nowHours && firstDay == endDay) {
        endFormat = [
          endFormat[0],
          `${year}-${month}-${day}T${
            nowDate.getHours() < 10
              ? `0${nowDate.getHours()}`
              : nowDate.getHours()
          }:${nowDate.getMinutes()}:00`,
        ];
      }

      (async () => {
        await axios
          .get(
            `vehicles/historysteps?VehID=${query?.VehID}&pageNumber=1&pageSiz=10000&strDate=${endFormat[0]}&endDate=${endFormat[1]}`
          )
          .then(({ data }) => {
            if (data?.historysteps?.length) {
              const historysteps = data.historysteps.map((s) => ({
                ...s,
                IsIdle: s.StrEvent == "Trip" && !s.Distance,
                maxIdle: 60 * 10,
                maxIdleSince: 0,
                excessiveIdle: false,
              }));
              const allHistorysteps = {};
              historysteps.forEach((item) => {
                allHistorysteps[item.ID] = item;
              });
              setloading(false);
              setAllSteps(allHistorysteps);
              if (drawOptions.getAllLocations) {
                historysteps.forEach((step, idx) => {
                  setTimeout(() => {
                    handleselectedStep(step, idx);
                  }, 2000);
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
    },
    [newToken, drawOptions.getAllLocations, query?.VehID]
  );

  const handleClose = () => {
    setselectedStep(0 - 1);
    myMap?.deselectAll();
    fullPathGroup.clearLayers();
  };

  useEffect(() => {
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
    pathSteps.length &&
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
      return "goldenrod";
    } else {
      if (item?.StrEvent == "Trip") {
        return "#2f857d";
      } else {
        if (item?.StrEvent == "Parked") {
          return "#737388";
        } else {
          return "red";
        }
      }
    }
  };
  return (
    <>
      <Card
        className="px-2 menuTreeHistory  position-relative"
        style={{ backgroundColor: darkMode && "rgb(21 25 37)" }}
      >
        <button
          onClick={() => setisToggleConfigOpen((prev) => !prev)}
          type="button"
          className="config_btn2 btn-config-settings"
          style={{
            backgroundColor: darkMode && "rgb(21 25 37)",
            left: locale === "ar" ? "0" : "",
            right: !(locale === "ar") ? "0" : "",
          }}
        >
          <FontAwesomeIcon icon={faSlidersH} />
        </button>

        <DateRangePicker
          className="d-inline-block w-100 mx-auto my-2 border border-primary rounded"
          onOk={(e) => handleDate(e)}
          onChange={(e) => handleDate(e)}
          placeholder={t("select_date_range")}
          format="yyyy-MM-dd hh:mm aa"
          placement="bottomEnd"
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
        <Settings
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
          isFromState={isFromStateRef.current}
          drawOptions={drawOptions}
          drawselectedsteps={drawselectedsteps}
        />
        <CheckBoxes
          chartModal={chartModal}
          setchartModal={setchartModal}
          L={L}
          setAllMarkers={setAllMarkers}
          allMarkers={allMarkers}
        />

        <PlayVideo
          AllSteps={AllSteps}
          loading={loading}
          selectedSteps={selectedSteps}
          setStats={setStats}
          setCurrentSLocation={setCurrentSLocation}
          currentSLocation={currentSLocation}
          setStopCar={setStopCar}
          setSpeedCar={setSpeedCar}
          speedCar={speedCar}
          stats={stats}
          stopCar={stopCar}
        />

        {loading && (
          <FontAwesomeIcon
            className="mx-2 mt-3 fa-spin text-info fs-4 d-block mx-auto"
            icon={faSpinner}
            size="sm"
          />
        )}
        <Stepper
          nonLinear
          activeStep={selectedStep}
          orientation="vertical"
          className="p-0 pe-1 mt-4"
          style={{
            overflowY: !Object.keys(AllSteps)?.length && "hidden",
            overflowX: !Object.keys(AllSteps)?.length ? "auto" : "hidden",
          }}
        >
          {Object.values(AllSteps)?.map((item, index) => {
            var hours = formatHourNumber(Math.floor(item?.Duration / 3600));
            var minutes = formatHourNumber(
              Math.floor((item?.Duration % 3600) / 60)
            );
            var seconds = formatHourNumber(item?.Duration % 60);
            return (
              <Step key={item?.ID}>
                <StepLabel
                  style={{
                    backgroundColor:
                      index === selectedStep ? "#ebf3f2" : "#FFF",
                    border: `1px solid ${
                      index === selectedStep ? "#2F857D" : "#FFF"
                    }`,
                    borderRadius: "16px",
                    padding: "0 6px",
                  }}
                >
                  <Button
                    id="StepBtn"
                    disabled={loading}
                    className="py-0 px-3 my-0  border-0 w-100 d-flex justify-content-between align-items-center"
                    style={{
                      backgroundColor:
                        index === selectedStep ? "#ebf3f2" : "#FFF",
                      height: "32px",
                      color: "#2f857d",
                      fontSize: "12px",
                      borderRadius: "16px",
                    }}
                    title={item?.IsIdle ? "Idle" : item?.StrEvent}
                    onClick={() => handleselectedStep(item, index)}
                  >
                    <span className="">
                      {moment(item?.StrDate).utc().format("DD/MM/YYYY hh:mm a")}
                    </span>
                    {" | "}
                    <span className="">
                      <BiTimeFive /> {hours}:{minutes}:{seconds}
                    </span>
                  </Button>
                </StepLabel>
                <StepContent>
                  <strong
                    style={{
                      color: "#2f857d",
                      fontWeight: "900",
                      fontSize: "13px",
                    }}
                  >
                    {t("Address")}:{" "}
                    <Typography
                      style={{
                        color: !darkMode ? "rgb(34 39 55)" : "rgb(223 233 235)",
                        display: "inline",
                        fontSize: "13px",
                      }}
                    >
                      {item?.StrAdd}
                    </Typography>
                  </strong>
                  <br />
                  <strong
                    style={{
                      color: " #2f857d",
                      fontWeight: "900",
                      fontSize: "13px",
                    }}
                  >
                    {t("Duration")}:{" "}
                  </strong>
                  <Typography
                    style={{
                      color: !darkMode ? "rgb(34 39 55)" : "rgb(223 233 235)",
                      display: "inline",
                      fontSize: "13px",
                    }}
                  >
                    {hours}:{minutes}:{seconds}
                  </Typography>
                  <br />
                  {item.maxIdleSince ? (
                    <>
                      <strong
                        style={{
                          color: " #2f857d",
                          fontWeight: "900",
                          fontSize: "13px",
                        }}
                      >
                        {t("Max_Idle")}:{" "}
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
                                fontSize: "13px",
                                display: "inline-block",
                              }
                            : {
                                color: !darkMode
                                  ? "rgb(34 39 55)"
                                  : "rgb(223 233 235)",
                                display: "inline",
                                fontSize: "13px",
                              }
                        }
                      >
                        {item.maxIdleSince}
                      </Typography>
                      <br />
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
                          fontSize: "13px",
                        }}
                      >
                        {t("Mileage")}:{" "}
                      </strong>
                      <Typography
                        style={{
                          color: !darkMode
                            ? "rgb(34 39 55)"
                            : "rgb(223 233 235)",
                          display: "inline",
                          fontSize: "13px",
                        }}
                      >
                        {item?.EndMil - item?.StrMil}
                      </Typography>
                    </>
                  ) : null}
                  <br />
                  <strong
                    style={{
                      color: " #2f857d",
                      fontWeight: "900",
                      fontSize: "13px",
                    }}
                  >
                    {t("Coordinates")} :
                    <Typography
                      style={{
                        color: !darkMode ? "rgb(34 39 55)" : "rgb(223 233 235)",
                        fontSize: "13px",
                        display: "inline",
                      }}
                    >
                      ({item?.StrLat} , {item?.StrLng})
                    </Typography>
                  </strong>

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
          {!Object.keys(AllSteps)?.length && !loading && (
            <div>
              <div className="col-md-12 text-center mt-5">
                <FcCalendar size="3rem" className="mb-3" />
                <h5>
                  {msgEmptyData
                    ? msgEmptyData
                    : `${t("please_select_a_valid_date_key")}.`}
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
