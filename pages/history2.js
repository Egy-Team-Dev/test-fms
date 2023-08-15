import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import ChartCpm from "components/history2/chart";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const StepperComp = dynamic(() => import("components/history2/stepper"), {
  ssr: false,
});
const MapWithNoSSR = dynamic(() => import("components/history2/map"), {
  ssr: false,
});
const History = () => {
  const map = useRef();

  const { config } = useSelector((state) => state);
  const [toggleMinuTrack, setToggleMinuTrack] = useState(true);
  const [chartModal, setchartModal] = useState(false);

  const [SelectedLocations, setSelectedLocations] = useState([]);

  const handleToggleMinuTrack = () => setToggleMinuTrack((prev) => !prev);

  const htmlTag = document.getElementsByTagName("html")[0];

  const [AllSteps, setAllSteps] = useState({});

  return (
    <div id="map" className="mt-5 position-relative history_page_2">
      <ChartCpm
        chartModal={chartModal}
        setchartModal={setchartModal}
        SelectedLocations={SelectedLocations}
      />
      <MapWithNoSSR map={map} />
      <aside>
        <nav
          className={`nav ${
            htmlTag.getAttribute("dir") === "ltr" && 'history_nav'
          }  ${
            toggleMinuTrack && 'active'
          } position-absolute rounded shadow-lg pt-5 overflow-hidden`}
          id="widget_menu"
          style={{ opacity: 1 }}
        >
          <StepperComp
            map={map}
            chartModal={chartModal}
            setchartModal={setchartModal}
            SelectedLocations={SelectedLocations}
            setSelectedLocations={setSelectedLocations}
            AllSteps={AllSteps}
            setAllSteps={setAllSteps}
          />
        </nav>
        <div
          onClick={handleToggleMinuTrack}
          className={`hamburger ${
            htmlTag.getAttribute("dir") === "ltr" && 'history_hamburger'
          } ${toggleMinuTrack && 'active'}`}
        >
          <span className={'hamburger__patty'} />
          <span className={'hamburger__patty'} />
          <span className={'hamburger__patty'} />
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
        "history",
        "Table",
      ])),
    },
  };
}
