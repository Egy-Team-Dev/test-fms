import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { useDispatch, useSelector } from "react-redux";
import { MapContainer } from "react-leaflet";
import "leaflet.heat";

import { toast } from "react-toastify";
import axios from "axios";
import { DHeatMap, setDriverHeatMap } from "lib/slices/driverHeatmap";
import { Saferoad } from "./leafletchild";

const Map = ({ id }) => {
  const ZOOM = 12;
  const [heatMap, setHeatMap] = useState([]);
  const [center, setCenter] = useState();
  const myMap = useSelector((state) => DHeatMap(state));

  const L = require("leaflet");
  require("helpers/plugins/leaflet-heat-map");
  const dispatch = useDispatch();

  const DrawHeatMap = (data) => {
    L.heatLayer(data, {
      gradient: { 0.4: "blue", 0.65: "lime", 1: "red" },
      minOpacity: 0.5,
      maxZoom: 25,
      radius: 25,
      blur: 15,
      max: 1.0,
    }).addTo(myMap.groups?.drawGroup);
  };

  useEffect(() => {
    const handleViewVehiclesHeatMap = async () => {
      if (heatMap.length > 0) {
        DrawHeatMap(heatMap);
      } else {
        try {
          toast.info("please wait...");

          const { data } = await axios.get(
            `/dashboard/driverVehicles/driver/heatmap/${id}`
          );

          const records = [];
          data?.heatMap.forEach((record) => {
            records.push([record.Latitude, record.Longitude]);
          });
          if (records?.length) {
            DrawHeatMap(records);
            toast.success("Geofences Are Displayed!");
            setHeatMap(records);

            // get the center of heat map
            const latLngs = records.map((rec) => L.latLng(rec));
            const bounds = L.latLngBounds(latLngs);
            setCenter(bounds.getCenter());

            myMap.flyTo(bounds.getCenter(), records.length > 4000 ? 7 : ZOOM);
          }
          !records.length && toast.warning("There are no data for now.");
        } catch (err) {
          toast.error(err?.response?.data?.message);
        }
      }
    };
    if (id) handleViewVehiclesHeatMap();
  }, [L, myMap, id]);

  useEffect(() => {
    try {
      myMap.off();
      myMap.remove();
    } catch (e) {
      console.log("not map");
    }

    dispatch(
      setDriverHeatMap(
        Saferoad?.map("map", {
          popupSettings: { dontShowPopUp: true },
        })
          .setZoom(heatMap.length > 4000 ? 7 : ZOOM)
          .setView(L.latLng(center || 24.629778, 46.799308))
      )
    );
  }, [L, Saferoad]);

  return (
    <>
      <div style={{ width: "100%", height: "445px" }} id="map">
        <MapContainer></MapContainer>
      </div>
    </>
  );
};

export default Map;
