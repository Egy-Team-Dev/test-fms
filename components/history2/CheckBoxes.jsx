// import { Form, Col } from "react-bootstrap";
// import { useCallback, useState } from "react";
// import { toast } from "react-toastify";
// import axios from "axios";
// import { useSelector } from "react-redux";
// import { useTranslation } from "next-i18next";
// import { useRouter } from "next/router";

// const CheckBoxes = ({
//   chartModal,
//   setchartModal,
//   L,
//   setAllMarkers,
//   allMarkers,
// }) => {
//   const [isLandMarkChecked, setIsLandMarkChecked] = useState(false);
//   const [isGeofencesChecked, setIsGeofencesChecked] = useState(false);
//   const [landMarks, setLandMarks] = useState([]);
//   const [geofences, setGeofences] = useState([]);
//   const { myMap } = useSelector((state) => state.mainMap);
//   const { t } = useTranslation("history");
//   const { locale } = useRouter();

//   const DrawShape = useCallback((item) => {
//     switch (item.GeoFenceType) {
//       case 1: // Polygon
//         L.polygon(item.GeofencePath, {
//           color: "red",
//           ID: item.ID,
//           type: "polygon",
//           Speed: item.Speed,
//         }).addTo(myMap.groups.drawGroup);
//         break;

//       case 2: // Circle
//         L.circle(item.GeofencePath, {
//           color: "red",
//           radius: +item.GeofenceRadius,
//           ID: item.ID,
//           type: "circle",
//           Speed: item.Speed,
//         }).addTo(myMap.groups.drawGroup);
//         break;

//       case 3: // Rectangle
//         L.rectangle(item.GeofencePath, {
//           color: "red",
//           ID: item.ID,
//           type: "rectangle",
//           Speed: item.Speed,
//         }).addTo(myMap.groups.drawGroup);
//         break;
//     }
//   }, []);

//   const handleLandMarks = useCallback(
//     async (checked) => {
//       setIsLandMarkChecked(checked);
//       if (checked) {
//         if (landMarks.length > 0) {
//           landMarks?.map((landmark) => {
//             L?.marker(L.latLng(landmark.Latitude, landmark.Longitude), {
//               icon: new L.divIcon({
//                 html: `<img alt='mu' src='assets/images/landmarks/Home.png' />`,
//                 className: "landMarksIcons",
//                 iconSize: L.point(7, 7),
//               }),
//             }).addTo(myMap.groups.poiGroup);
//           });
//         } else {
//           toast.warning("please wait...");
//           const response = await axios.get(`landmarks`);
//           if (response.status === 200) {
//             const results = response?.data?.marks;

//             results?.map((landmark) => {
//               L?.marker(L.latLng(landmark.Latitude, landmark.Longitude), {
//                 icon: new L.divIcon({
//                   html: `<img alt='mu' src='assets/images/landmarks/Home.png' />`,
//                   className: "landMarksIcons",
//                   iconSize: L.point(7, 7),
//                 }),
//               }).addTo(myMap.groups.poiGroup);
//             });
//             setLandMarks(results);
//           } else {
//             toast.error(response?.data?.error?.message);
//           }
//         }
//       } else {
//         myMap.groups.poiGroup.clearLayers();
//       }
//     },
//     [landMarks]
//   );

//   const handleViewGeofences = useCallback(
//     async (checked) => {
//       setIsGeofencesChecked(checked);
//       if (checked) {
//         if (geofences.length > 0) {
//           geofences?.map((item) => DrawShape(item));
//         } else {
//           try {
//             toast.warning("please wait...");
//             const response = await axios.get(`geofences`);

//             if (response.status === 200) {
//               let handledData = response.data?.allGeoFences?.map(
//                 (item) => item.handledData
//               );
//               await handledData?.map((item) => {
//                 // check if a circle
//                 if (item.GeoFenceType === 2) {
//                   let GeofencePath = [];
//                   item.GeofencePath?.map((item) => {
//                     item?.map((item) => GeofencePath.push(+item));
//                   });
//                   item.GeofencePath = GeofencePath;
//                 } else {
//                   item.GeofencePath = item.GeofencePath?.map((item) =>
//                     item?.map((item) => +item)
//                   );
//                 }
//               });

//               await handledData?.map((item) => DrawShape(item));

//               setGeofences(handledData);
//             }

//             response.data?.allGeoFences.length === 0 &&
//               toast.warning(t("There_is_no_GeoFences_Right_Now!"));
//           } catch (error) {
//             toast.error(error?.message);
//           }
//         }
//       } else {
//         myMap.groups.drawGroup.clearLayers();
//       }
//     },
//     [geofences]
//   );

//   return (
//     <Form className="row">
//       <Col sm="6">
//         <Form.Check
//           className="text-primary"
//           type="checkbox"
//           id="Show All Markers"
//           label={t("show_all_markers_key")}
//           style={{ fontSize: locale === "ar" ? "11px" : "14px" }}
//           defaultChecked={allMarkers}
//           onChange={(e) => setAllMarkers(e.target.checked)}
//         />
//       </Col>

//       <Col sm="6">
//         <Form.Check
//           className="text-primary"
//           type="checkbox"
//           id="Show graphs"
//           label={t("show_graphs_key")}
//           style={{ fontSize: locale === "ar" ? "11px" : "14px" }}
//           defaultChecked={chartModal}
//           onChange={(e) => setchartModal(e.target.checked)}
//         />
//       </Col>
//       <Col sm="6">
//         <Form.Check
//           className="text-primary"
//           type="checkbox"
//           id="View Landmarks"
//           label={t("view_landmarks_key")}
//           style={{ fontSize: locale === "ar" ? "11px" : "14px" }}
//           defaultChecked={isLandMarkChecked}
//           onChange={(e) => handleLandMarks(e.target.checked)}
//         />
//       </Col>
//       <Col sm="6">
//         <Form.Check
//           className="text-primary"
//           type="checkbox"
//           id="View Geofences"
//           label={t("view_geofences_key")}
//           style={{ fontSize: locale === "ar" ? "11px" : "14px" }}
//           defaultChecked={isGeofencesChecked}
//           onChange={(e) => handleViewGeofences(e.target.checked)}
//         />
//       </Col>
//     </Form>
//   );
// };

// export default CheckBoxes;
