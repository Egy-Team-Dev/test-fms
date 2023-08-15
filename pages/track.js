import { Suspense, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import dynamic from "next/dynamic";
import useStreamDataState from "hooks/useStreamDataState";
import Actions from "components/track/Actions";
import ConfigPopup from "components/track/ConfigPopup";
import { Button } from "react-bootstrap";
import { updateStRunning } from "lib/slices/StreamData";
import { convertJsonToExcel } from "../helpers/helpers";
import MenuBottom from "components/maps/menu-bottom/index";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { toggle as tourToggle, disableTour, enableTour } from "lib/slices/tour";
import style from "styles/scss/custom/components/tour-step/tourStep.module.scss";
import Joyride, { ACTIONS, EVENTS, STATUS } from "react-joyride";
import { color } from "@mui/system";
import { getSession } from "next-auth/client";
import useStepDashboard from "hooks/useStepDashboard";

const WidgetMenu = dynamic(() => import("components/maps/WidgetMenu"), {
  loading: () => <header />,
  // ssr: false,
});
const MapWithNoSSR = dynamic(() => import("components/maps/vector"), {
  ssr: false,
});

const Map = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation("Tour");
  const { myMap } = useSelector((state) => state.mainMap);
  const [showConfigPopup, setShowConfigPopup] = useState(false);
  const { VehFullData, VehMapFiltered, running } = useSelector(
    (state) => state.streamData
  );
  const { trackStreamLoader } = useStreamDataState(VehFullData);
  const [clusterToggle, setclusterToggle] = useState(false);


  const [mainFilter, setmainFilter] = useState(null);
  const [carsIconsFilter, setcarsIconsFilter] = useState(null);
  const [serialNumberFilter, setserialNumberFilter] = useState("");
  const [addressFilter, setaddressFilter] = useState("");
  const [speedFromFilter, setspeedFromFilter] = useState("");
  const [speedToFilter, setspeedToFilter] = useState("");

  const [displayNameFilter, setDisplayNameFilter] = useState("");
  const [plateNumberFilter, setPlateNumberFilter] = useState("");

  const [allTreeData, setAllTreeData] = useState([]);
  const [vehChecked, setVehChecked] = useState([]);
  const [destroyed, setDestroyed] = useState(false);
  const [toggleMinuTrack, setToggleMinuTrack] = useState(false);

  const tourState = useSelector((state) => state.tour.run);

  const allSteps = useStepDashboard();

  const [{ stepIndex, steps }, setState] = useState({
    stepIndex: 0,
    steps: allSteps["track"],
  });
  const handleJoyrideCallback = (data) => {
    const { action, index, status, type } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setState({ stepIndex: 0, steps: steps });
      dispatch(tourToggle());
      if (toggleMinuTrack) {
        setToggleMinuTrack((prev) => !prev);
      }
    } else if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);

      if (index === 11 && action === ACTIONS.PREV) {
        setToggleMinuTrack((prev) => !prev);
        setState({
          stepIndex: nextStepIndex,
          steps: steps,
        });
      } else if (data.action === "close" || data.action === "reset") {
        dispatch(disableTour());
      } else {
        setState({
          stepIndex: nextStepIndex,
          steps: steps,
        });
      }
    }
  };

  const handleToggleMinuTrack = () => {
    setToggleMinuTrack((prev) => !prev);
    if (tourState) {
      dispatch(disableTour());
      setTimeout(() => {
        dispatch(enableTour());
        setState({ stepIndex: 12, steps: steps });
      }, 800);
    }
  };

  const {
    config: { darkMode },
  } = useSelector((state) => state);

  useEffect(() => {
    const markers = myMap?.activeGroup()?.getLayers();
    const seenVehicleIDs = new Set();
       markers?.filter((marker) => {
      const vehicleID = marker.id;
      if (!seenVehicleIDs.has(vehicleID)) {
        seenVehicleIDs.add(vehicleID);
        return true;
      }
      myMap.removeVehicle(marker);
    });
  }, [myMap?.activeGroup()?.getLayers()]);

  useEffect(() => {
    if (myMap && !running) {
      myMap?.deselectAll();
      trackStreamLoader();

      dispatch(updateStRunning());
    }
  }, [myMap]);

  useEffect(() => {
    const htmlTag = document.getElementsByTagName("html")[0];
    darkMode
      ? htmlTag.setAttribute("darkMode", true)
      : htmlTag.setAttribute("darkMode", false);
  }, [darkMode]);

  // Transforms object key and returns a new array with the new Key
  const changeRowDataKeys = (data) => {
    const newArr = data.map((obj) => {
      const newObj = {};
      //You have to add a condition on the Object key name and perform your actions
      Object.keys(obj).forEach((key) => {
        if (key === "RecordDateTime") {
          delete newObj.RecordDateTime;
        } else if (key === "SyncAdd") {
          delete newObj.SyncAdd;
        } else if (obj[key] === null || !obj[key]) {
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

  const handleDownLoadDataVehs = () => {
    const ids = document
      ?.getElementById("downLoadDataVehs")
      ?.getAttribute("data-id")
      .split(",")
      .map((item) => +item);

    const allData = VehFullData.filter((item) => ids.includes(+item.VehicleID));

    convertJsonToExcel(changeRowDataKeys(allData), "selectedVehicles");
  };

  return (
    <div id="map" className="mt-5 position-relative">
      <Joyride
        steps={steps}
        continuous
        callback={handleJoyrideCallback}
        run={tourState}
        stepIndex={stepIndex}
        showSkipButton
        locale={{
          skip: <span className={style["skip-tour"]}>{t("skip_tour")}</span>,
          back: <span className={style["skip-tour"]}>{t("back")}</span>,
          next: <span>{t("next")}</span>,
          last: <span>{t("last")}</span>,
        }}
        styles={{
          options: {
            primaryColor: "#1e8178",
            overlayColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 50000,
            width: "379px",
            // padding: "16px",
            backgroundColor: "#E0EAE9",
          },
        }}
      />

      <MapWithNoSSR myMap={myMap} />

      <Suspense fallback={"loading"}>
        <WidgetMenu
          setVehChecked={setVehChecked}
          vehChecked={vehChecked}
          setDestroyed={setDestroyed}
          allTreeData={allTreeData}
          setAllTreeData={setAllTreeData}
          toggleMinuTrack={toggleMinuTrack}
          setToggleMinuTrack={setToggleMinuTrack}
          handleToggleMinuTrack={handleToggleMinuTrack}
          //////////
          setmainFilter={setmainFilter}
          setcarsIconsFilter={setcarsIconsFilter}
          setserialNumberFilter={setserialNumberFilter}
          setaddressFilter={setaddressFilter}
          setspeedFromFilter={setspeedFromFilter}
          setspeedToFilter={setspeedToFilter}
          setDisplayNameFilter={setDisplayNameFilter}
          setPlateNumberFilter={setPlateNumberFilter}
          mainFilter={mainFilter}
          carsIconsFilter={carsIconsFilter}
          serialNumberFilter={serialNumberFilter}
          addressFilter={addressFilter}
          speedFromFilter={speedFromFilter}
          speedToFilter={speedToFilter}
          displayNameFilter={displayNameFilter}
          plateNumberFilter={plateNumberFilter}
          setclusterToggle={setclusterToggle}
        />
      </Suspense>
      <MenuBottom
        setDestroyed={setDestroyed}
        destroyed={destroyed}
        setVehChecked={setVehChecked}
        //////
        setmainFilter={setmainFilter}
        setcarsIconsFilter={setcarsIconsFilter}
        setserialNumberFilter={setserialNumberFilter}
        setaddressFilter={setaddressFilter}
        setspeedFromFilter={setspeedFromFilter}
        setspeedToFilter={setspeedToFilter}
        setDisplayNameFilter={setDisplayNameFilter}
        setPlateNumberFilter={setPlateNumberFilter}
        setclusterToggle={setclusterToggle}
        clusterToggle={clusterToggle}
      />
      {/* leafletchild actions */}
      <Actions
        vehChecked={vehChecked}
        allTreeData={allTreeData}
        setAllTreeData={setAllTreeData}
        setVehChecked={setVehChecked}
      />

      <Suspense fallback={"loading"}>
        <Button
          id="ConfigPopup"
          className="d-none"
          onClick={() => setShowConfigPopup(true)}
        ></Button>
        {showConfigPopup ? (
          <ConfigPopup
            vehChecked={vehChecked}
            show={showConfigPopup}
            setShow={setShowConfigPopup}
          />
        ) : null}
      </Suspense>
      {/* downLoadDataVehs */}
      <Suspense fallback={"loading"}>
        <Button
          id="downLoadDataVehs"
          className="d-none"
          onClick={() => handleDownLoadDataVehs()}
        ></Button>
      </Suspense>
    </div>
  );
};
export default Map;
// translation ##################################
export async function getServerSideProps(context) {
  const session = await getSession({ req: context.req });
  if (session?.user?.mongoRole == "support") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      ...(await serverSideTranslations(context.locale, [
        "main",
        "common",
        "Tour",
        "Dashboard",
        "Table",
      ])),
    },
  };
}
