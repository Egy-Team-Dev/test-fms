import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSelector, useDispatch } from "react-redux";
import Styles from "styles/WidgetMenu.module.scss";
import ChartCpm from "components/history/chart";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { encryptName } from "helpers/encryptions";
import { useRouter } from "next/router";
import useStreamDataState from "../hooks/useStreamDataState";
import axios from "axios";
import { toast } from "react-toastify";
import { useTranslation } from "next-i18next";
import style from "styles/scss/custom/components/tour-step/tourStep.module.scss";
import {
  toggle as tourToggle,
  disableTour,
  enableTour,
} from "../lib/slices/tour";
import Joyride, {
  ACTIONS,
  CallBackProps,
  EVENTS,
  STATUS,
  Step,
} from "react-joyride";

const StepperComp = dynamic(() => import("components/history/stepper"), {
  ssr: false,
});
const MapWithNoSSR = dynamic(() => import("components/history/map"), {
  ssr: false,
});
const History = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation("Tour");
  const router = useRouter();
  const { config } = useSelector((state) => state);
  const [toggleMinuTrack, setToggleMinuTrack] = useState(true);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [chartModal, setchartModal] = useState(false);
  const [geofences, setGeofences] = useState([]);
  const [landMarks, setLandMarks] = useState([]);
  const [SelectedLocations, setSelectedLocations] = useState([]);
  const handleToggleMinuTrack = () => setToggleMinuTrack((prev) => !prev);
  const htmlTag = document.getElementsByTagName("html")[0];
  const tourState = useSelector((state) => state.tour.run);

  const historySteps = [
    {
      content: (
        <div className={style["basic__step"]}>
          <h4>History</h4>
          <p>
            Welcome to our history page! We'll help you navigate our components
            for an optimal experience. Let's explore features together!
          </p>
        </div>
      ),
      disableBeacon: true,
      hideCloseButton: true,
      placement: "center",
      spotlightPadding: 10,
      target: "#widget-menu",
    },
    {
      content: (
        <div className={style["basic__step"]}>
          <h4>Date Picker</h4>
          <p>Pick day or date range to get this period Steps. </p>
        </div>
      ),
      disableBeacon: true,
      hideCloseButton: true,
      placement: "right",
      spotlightPadding: 10,
      target: "#history-date-picker",
    },
    {
      content: (
        <div className={style["basic__step"]}>
          <h4>Config Menu</h4>
          <p>Choose configuration you want to add to steps.</p>
        </div>
      ),
      disableBeacon: true,
      hideCloseButton: true,
      placement: "right",
      spotlightPadding: 0,
      target: "#config-toggle-btn",
    },
  ];

  const handleConfigToggle = (value) => {
    setIsConfigOpen(value);
  };

  const [{ stepIndex, steps }, setState] = useState({
    stepIndex: 0,
    steps: historySteps,
  });
  // const { myMap } = useSelector((state) => state.mainMap);
  // const { VehMapFiltered, VehFullData } = useSelector(
  //   (state) => state.streamData
  // );
  // const { trackStreamLoader } = useStreamDataState(VehMapFiltered);

  // if (window != undefined) {
  //   let userData = JSON.parse(
  //     localStorage.getItem(encryptName("userData")) ?? "{}"
  //   );
  //   if (!userData) {
  //     if (myMap) {
  //       myMap?.deselectAll();
  //       trackStreamLoader(myMap);
  //     }
  //   }

  // }

  const handleJoyrideCallback = (data) => {
    setToggleMinuTrack(true);
    const { action, index, status, type } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      // Need to set our running state to false, so we can restart if we click start again.
      setState({ stepIndex: 0, steps: historySteps });
      dispatch(tourToggle());
    } else if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);

      if (data.action === "close" || data.action === "reset") {
        dispatch(disableTour());
      } else {
        setState({
          stepIndex: nextStepIndex,
          steps: historySteps,
        });
      }
    }
  };

  useEffect(() => {
    const getDatavehs = async () => {
      return await axios
        .get(`vehicles/settings?withloc=1`)
        .then((res) => {
          let vehsIds = res.data?.map((veh) => veh.VehicleID);
          let params =
            window != undefined && +window.location.search.split("=")[1];

          if (params && !vehsIds.includes(params)) {
            router.push("/notFound");
          }
        })
        .catch((error) => {
          toast.error(error?.response?.data?.message);
          return [];
        });
    };
    getDatavehs();
  }, []);

  const map = useRef();

  return (
    <div id="map" className="mt-5 position-relative">
      <Joyride
        steps={historySteps}
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
            zIndex: 10901,
            width: "379px",
            // padding: "16px",
            backgroundColor: "#E0EAE9",
          },
        }}
      />
      <ChartCpm
        chartModal={chartModal}
        setchartModal={setchartModal}
        SelectedLocations={SelectedLocations}
      />
      <MapWithNoSSR map={map} />
      <aside className={`${config.darkMode && Styles.dark}`}>
        <nav
          id="widget-menu"
          className={`${Styles.nav} ${
            htmlTag.getAttribute("dir") === "ltr" && Styles.history_nav
          }  ${
            toggleMinuTrack && Styles.active
          } position-absolute rounded shadow-lg pt-5 `}
          // overflow-hidden

          style={{ opacity: 1 }}
        >
          <StepperComp
            map={map}
            chartModal={chartModal}
            geofences={geofences}
            setGeofences={setGeofences}
            landMarks={landMarks}
            setLandMarks={setLandMarks}
            handleConfigToggle={handleConfigToggle}
            setchartModal={setchartModal}
            SelectedLocations={SelectedLocations}
            setSelectedLocations={setSelectedLocations}
          />
        </nav>
        <div
          id="vehicle-menu"
          onClick={handleToggleMinuTrack}
          className={`${Styles.hamburger} ${
            htmlTag.getAttribute("dir") === "ltr" && Styles.history_hamburger
          } ${toggleMinuTrack && Styles.active}`}
        >
          <span className={Styles.hamburger__patty} />
          <span className={Styles.hamburger__patty} />
          <span className={Styles.hamburger__patty} />
        </div>
      </aside>
    </div>
  );
};

export default History;

// translation ##################################
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "main",
        "common",
        "Dashboard",
        "Table",
        "history",
        "Tour",
      ])),
    },
  };
}
