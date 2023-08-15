import { Form, Col } from "react-bootstrap";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useSelector } from "react-redux";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

const CheckBoxes = ({
  chartModal,
  setchartModal,
  L,
  setAllMarkers,
  allMarkers,
  geofences,
  setGeofences,
  landMarks, setLandMarks
}) => {
  const [isLandMarkChecked, setIsLandMarkChecked] = useState(false);
  const [isGeofencesChecked, setIsGeofencesChecked] = useState(false);
  // const [landMarks, setLandMarks] = useState([]);
  const [loadingLandMarks, setLoadingLandMarks] = useState(false);
  const [loadingGeofences, setLoadingGeofences] = useState(false);
  const { myMap } = useSelector((state) => state.mainMap);
  const { t } = useTranslation("history");
  const { locale } = useRouter();

  const DrawShape = useCallback(
    (item) => {
      switch (item.GeoFenceType) {
        case 2: // Polygon
          L.polygon(item.GeofencePath, { color: "red" }).addTo(
            myMap.groups.drawGroup
          );
          break;

        case 1: // Circle
          // L.circle(item.GeofencePath, {
          L.circle(
            [item.GeofenceCenterPoint.lat, item.GeofenceCenterPoint.lng],
            {
              color: "red",
              radius: +item.GeofenceRadius,
            }
          ).addTo(myMap.groups.drawGroup);
          break;

        case 3: // Rectangle
          L.rectangle(item.GeofenceBounds, { color: "red" }).addTo(
            myMap.groups.drawGroup
          );
          break;
      }
    },
    [L, myMap?.groups?.drawGroup]
  );

  const handleLandMarks = useCallback(
    async (checked) => {
      setIsLandMarkChecked(checked);
      if (checked) {
        if (landMarks?.length) {
          landMarks?.map((landmark) => {
            L?.marker(L.latLng(landmark.Latitude, landmark.Longitude), {
              icon: new L.divIcon({
                html: `<img alt='mu' src='assets/images/landmarks/Home.png' />`,
                className: "landMarksIcons",
                iconSize: L.point(7, 7),
              }),
            }).addTo(myMap.groups.poiGroup);
          });
        } else {
          toast.warning("please wait...");
          setLoadingLandMarks(true);
          try {
            const response = await axios.get(`landmarks`);
            if (response.status === 200) {
              const results = response?.data?.marks;

              results?.map((landmark) => {
                L?.marker(L.latLng(landmark.Latitude, landmark.Longitude), {
                  icon: new L.divIcon({
                    html: `<img alt='mu' src='assets/images/landmarks/Home.png' />`,
                    className: "landMarksIcons",
                    iconSize: L.point(7, 7),
                  }),
                }).addTo(myMap.groups.poiGroup);
              });
              setLandMarks(results);
            } else {
              toast.error(response?.data?.error?.message);
            }
          } catch (err) {
            console.log("error", err);
          } finally {
            setLoadingLandMarks(false);
          }
        }
      } else {
        myMap.groups.poiGroup.clearLayers();
      }
    },
    [landMarks]
  );

  const handleViewGeofences = useCallback(
    async (checked) => {
    
      setIsGeofencesChecked(checked);
      if (checked) {
        
        if (geofences?.length) {

          geofences?.map((item) => DrawShape(item));
        } else {
          try {
            setLoadingGeofences(true);
            toast.warning("please wait...");
            const response = await axios.get(`geofences`);    
                    if (response.status === 200) {
              let handledData = response.data?.allGeoFences?.map(
                (item) => item.handledData
              );

              await handledData?.map((item) => {
                // check if a circle
                if (item.GeoFenceType === 1) {
                  if (item?.GeofenceRadius == null) {
                    handledData = handledData.filter(
                      (fnc) => fnc.ID != item.ID
                    );
                  } else {
                    let GeofencePath = [];
                    item.GeofencePath?.map((item) => {
                      item?.map((item) => GeofencePath.push(+item));
                    });
                    item.GeofencePath = GeofencePath;
                  }
                } else if (item.GeoFenceType === 3) {
                  const GeofenceBoundsLat1 = +item.GeofenceBounds.split("|")[0]
                    .split(",")[0]
                    .slice(1);
                  const GeofenceBoundsLng1 = +item.GeofenceBounds.split("|")[0]
                    .split(",")[1]
                    .slice(0, -1);

                  const GeofenceBoundsLat2 = +item.GeofenceBounds.split("|")[1]
                    .split(",")[0]
                    .slice(1);
                  const GeofenceBoundsLng2 = +item.GeofenceBounds.split("|")[1]
                    .split(",")[1]
                    .slice(0, -1);

                  const GeofenceBoundsLat3 = +item.GeofenceBounds.split("|")[2]
                    .split(",")[0]
                    .slice(1);
                  const GeofenceBoundsLng3 = +item.GeofenceBounds.split("|")[2]
                    .split(",")[1]
                    .slice(0, -1);

                  const GeofenceBoundsLat4 = +item.GeofenceBounds.split("|")[3]
                    .split(",")[0]
                    .slice(1);
                  const GeofenceBoundsLng4 = +item.GeofenceBounds.split("|")[3]
                    .split(",")[1]
                    .slice(0, -1);

                  item.GeofenceBounds = [
                    [GeofenceBoundsLat1, GeofenceBoundsLng1],
                    [GeofenceBoundsLat2, GeofenceBoundsLng2],
                    [GeofenceBoundsLat3, GeofenceBoundsLng3],
                    [GeofenceBoundsLat4, GeofenceBoundsLng4],
                  ];
                }
              });

              setGeofences(handledData);
              handledData?.map((item) => DrawShape(item));
              toast.success(t("Geofences_Are_Displayed!"));
            }

            response.data?.allGeoFences?.length === 0 &&
              toast.warning(t("There_is_no_GeoFences_Right_Now!"));
          } catch (error) {
            toast.error(error?.message);
          } finally {
            setLoadingGeofences(false);
          }
        }
      } else {
        myMap.groups.drawGroup.clearLayers();
      }
    },
    [geofences]
  );

  return (
    <Form className="row">
      <Col sm="6">
        <Form.Check
          className="text-primary"
          type="checkbox"
          id="Show All Markers"
          label={t("show_all_markers_key")}
          style={{ fontSize: locale === "ar" ? "11px" : "14px" }}
          defaultChecked={allMarkers}
          onChange={(e) => setAllMarkers(e.target.checked)}
        />
      </Col>

      <Col sm="6">
        <Form.Check
          className="text-primary"
          type="checkbox"
          id="Show graphs"
          label={t("show_graphs_key")}
          style={{ fontSize: locale === "ar" ? "11px" : "14px" }}
          defaultChecked={chartModal}
          onChange={(e) => setchartModal(e.target.checked)}
        />
      </Col>
      <Col sm="6">
        <Form.Check
          className="text-primary"
          type="checkbox"
          id="View Landmarks"
          label={t("view_landmarks_key")}
          style={{ fontSize: locale === "ar" ? "11px" : "14px" }}
          defaultChecked={landMarks.length}
          onChange={(e) => handleLandMarks(e.target.checked)}
          disabled={loadingLandMarks}
        />
      </Col>
      <Col sm="6">
        <Form.Check
          className="text-primary"
          type="checkbox"
          id="View Geofences"
          label={t("view_geofences_key")}
          style={{ fontSize: locale === "ar" ? "11px" : "14px" }}
          defaultChecked={geofences.length}
          onChange={(e) => handleViewGeofences(e.target.checked)}
          disabled={loadingGeofences}
        />
      </Col>
    </Form>
  );
};

export default CheckBoxes;
