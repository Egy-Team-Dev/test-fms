import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

import { Saferoad } from "components/maps/leafletchild";
import { useDispatch, useSelector } from "react-redux";
import { setMap } from "../../lib/slices/mainMap";

const Map = ({ myMap }) => {
  const L = require("leaflet");
  const dispatch = useDispatch();
  const VehFullData = useSelector((state) => state.streamData.VehFullData);

  useEffect(() => {
    try {
      myMap.off();
      myMap.remove();
    } catch (e) {
      console.log("not map");
    }

    dispatch(
      setMap(
        Saferoad?.map("MyHomeMap", {
          popupSettings: { newvar: true, dontShowPopUp: false },
        })
          .setZoom(7)
          .setView(L.latLng(24.629778, 46.799308))
      )
    );
  }, [L, Saferoad]);
  // to pin the data in the map
  useEffect(() => {
    if (myMap && VehFullData.length > 0) {
      VehFullData?.map((x) => {
        myMap && myMap.pin(x, false);
      });
    }
  }, [myMap, VehFullData.length]);
  return (
    <>
      <div style={{ width: "100%", height: "100%", minHeight: "62.3vh", borderRadius: "10px" }} id="MyHomeMap"></div>
    </>
  );
};

export default Map;
