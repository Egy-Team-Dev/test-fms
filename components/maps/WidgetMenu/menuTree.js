import React, { useEffect, useState } from "react";
import Tree, { TreeNode } from "rc-tree";
import "rc-tree/assets/index.css";
import Styles from "styles/Tree.module.scss";
import { useSelector, useDispatch } from "react-redux";
import { GetStatusString, iconUrl, syncMapWithTree } from "helpers/helpers";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import { addVehMapFiltered } from "lib/slices/StreamData";
import { toast } from "react-toastify";
const MenuTree = ({
  treeData,
  ToggleConfig,
  serialNumberFilter,
  addressFilter,
  speedFromFilter,
  speedToFilter,
  displayNameFilter,
  plateNumberFilter,
  setVehChecked,
  vehChecked,
  vehicleIcon,
  setclusterToggle
}) => {
  // function getSpeedLimit(index) { return JSON.parse( localStorage.getItem(encryptName("userData"))).vehData[index].SpeedLimit}
  const { t } = useTranslation("common");
  const { myMap } = useSelector((state) => state.mainMap);
  const [statusIcons] = useState({});
  const [TreeStyleHeight, setTreeStyleHeight] = useState(0);
  const { VehFullData } = useSelector((state) => state.streamData);
  const darkMode = useSelector((state) => state.config.darkMode);
  const dispatch = useDispatch();

  const defaultExpandedKeys = ["All", "Default"];
  const zoomAuto=useSelector((state)=>state.ToggleZoomAuto.value)
useEffect(() => {
  let minLat = vehChecked[0]?.Latitude;
  let maxLat = vehChecked[0]?.Latitude;
  let minLng = vehChecked[0]?.Longitude;
  let maxLng = vehChecked[0]?.Longitude;

  vehChecked.forEach((marker) => {
    const { Latitude, Longitude } = marker;

    if(Latitude && Longitude)
    {
      minLat = Math.min(minLat, Latitude);
    maxLat = Math.max(maxLat, Latitude);
    minLng = Math.min(minLng, Longitude);
    maxLng = Math.max(maxLng, Longitude);
    }

  });
//   var centerLat = (minLat + maxLat) / 2;
// var centerLng = (minLng + maxLng) / 2;


if(zoomAuto)
{
  if(minLat && minLng && maxLat && maxLng)
  {
    console.log(myMap?.fitBounds([[minLat, minLng], [maxLat, maxLng]]))
  }
}
}, [VehFullData])

  useEffect(() => {
 
    try{
      dispatch(addVehMapFiltered(treeData))
    }
    catch(e){
     toast.error(e)
    }

    myMap && syncMapWithTree(myMap, treeData, VehFullData, vehChecked);
  }, [treeData, vehChecked, VehFullData, myMap]);

  const handleGroups = (groups) => {
    if (groups["null"]) {
      groups["Un Group"] = [...groups["null"]];
    }
    if (groups["default"]) {
      groups["Default"] = [...(groups["Default"] ?? []), ...groups["default"]];
    }
    delete groups["null"];
    delete groups["default"];
    if (groups["Un Group"]?.length) {
      const UnGroup = groups["Un Group"];
      delete groups["Un Group"];
      groups = { "Un Group": UnGroup, ...groups };
    }

    const result = [
      {
        title: "All",
        children: [],
      },
    ];
    //  for in objects 
    for (let key in groups) {
      if (Object.hasOwn(groups, key))
        result[0]?.children?.push({
          title: key,
          children: groups[key],
        });

    }
    return result;
  };

  const onCheck = (selectedKeys, info) => {
    const byGroup = info?.checkedNodesPositions.filter(
      (i) => i.pos.split("-").length === 2
    );
    if (byGroup.length > 0) {
      if (info?.checked) {
        setclusterToggle(true)
        const filterParentNodes = info?.checkedNodes
          ?.filter((x) => !x.children)
          ?.map((i) => i?.data);
        setVehChecked(filterParentNodes?.map((x) => x));
      } else {
        setVehChecked(
          info?.checkedNodes.filter((x) => !x.children).map((i) => i?.data)
        );
      }
    } else if (info?.checkedNodes?.length > 0) {
      if (info?.checked) {
        const filterParentNodes = info?.checkedNodes
          ?.filter((x) => !x.children)
          ?.map((i) => i?.data);
        setVehChecked(filterParentNodes?.map((x) => x));
      } else {

        setVehChecked(
          info?.checkedNodes.filter((x) => !x.children).map((i) => i?.data)
        );
      }
    } else {
     setclusterToggle(false)
      setVehChecked(
        info?.checkedNodes.filter((x) => !x.children).map((i) => i?.data)
      );
    }
  };

  const groupBy = (arr, key) => {
    return arr.reduce(
      (acc, item) => (
        (acc[item[key]] = [...(acc[item[key]] || []), item]), acc
      ),
      {}
    );
  };

  let arrToSort = treeData && [...treeData];

  let groups = groupBy(
    arrToSort.sort((a, b) => a.GroupID - b.GroupID),
    "GroupName"
  );


  document?.querySelector('.rc-tree-list-holder-inner')?.style?.height = TreeStyleHeight + 'px';
  let widgetMenuHeight;

  useEffect(() => {

    widgetMenuHeight = document.getElementById("widget_menu")?.clientHeight;
    const treeHeight = document.querySelector(".tree_root")?.getBoundingClientRect().top;

    const setSize = () => {
      widgetMenuHeight && setTreeStyleHeight(widgetMenuHeight - treeHeight);
      window.addEventListener("resize", setSize);
    }

    setSize();

  }, [widgetMenuHeight]);

  const handleShowConfigItems = (x, item) => {

    switch (x) {
      case "Speed":
        return (
          <>
            {item["Speed"] ?? 0}{" "}
            <span style={{ fontSize: "0.438rem" }}>km/h</span>
          </>
        );
      case "Mileage":
        return (
          <>
            {item["Mileage"] / 1000 ?? 0}{" "}
            <span style={{ fontSize: "0.438rem" }}>km</span>
          </>
        );
      case "TotalWeight":
        if (item["WeightReading"] > 0) {
          return (
            <>
              {item["WeightReading"]}
              <span style={{ fontSize: "0.438rem" }}>kg</span>
            </>
          );
        } else {
          return null;
        }
      case "Temp":
        var listOfTemps = [item?.Temp1, item?.Temp2, item?.Temp3, item?.Temp4];
        var listOfFilteredTemps = listOfTemps.filter((item) => item !== 3000);

        if (listOfFilteredTemps.length > 0) {
          let AVGListOfFilteredTemps =
            listOfFilteredTemps.reduce((acc, item) => acc + item, 0) /
            listOfFilteredTemps.length;

          return (
            <>
              {AVGListOfFilteredTemps?.toFixed(1) ?? 0}{" "}
              <span style={{ fontSize: "0.438rem" }}>C</span>
            </>
          );
        } else {
          return "Disconnected";
        }
      case "Humidy":
        var listOfHums = [
          item["Hum1"],
          item["Hum2"],
          item["Hum3"],
          item["Hum4"],
        ];
        var listOfFilteredHums = listOfHums.filter(
          (item) => item >= 1 && item <= 100
        );

        if (listOfFilteredHums.length > 0) {
          let AVGListOfFilteredHums =
            listOfFilteredHums.reduce((acc, item) => acc + item, 0) /
            listOfFilteredHums.length;
          return (
            <>
              {AVGListOfFilteredHums?.toFixed(1) ?? 0}{" "}
              <span style={{ fontSize: "0.438rem" }}>%</span>
            </>
          );
        } else {
          return "Disconnected";
        }
      case "EngineStatus":
        return item["EngineStatus"] == true ? "On" : "Off";

      case "Direction":
        return item["Direction"] !== 0 ? item["Direction"] : "0";
      default:
        return item[x];
    }
  };

 

  const loop = (data) =>
    data?.map((item, index) => {
      if (item?.children) {
        return (
          <TreeNode
            key={`${item?.title}_${index}`}
            icon={<i className={Styles.cars__icon} />}
            data={item}
            defaultExpandAll={true}
            autoExpandParent={true}
            defaultExpandedKeys={defaultExpandedKeys}
            title={
              <span
                className="d-flex align-items-center"
                style={{ marginTop: "7px", fontSize: "12px" }}
              >
                {item?.title}
                <span className="badge bg-secondary px-1 mx-2">
                  {item?.title === "All"
                    ? treeData?.length
                    : item?.children?.length}
                </span>
              </span>
            }
          >
            {loop(item?.children)}
          </TreeNode>
        );
      }

      return (
        <TreeNode

          key={item?.SerialNumber}
          data={item}
          defaultExpandAll={true}
          autoExpandParent={true}
          defaultExpandedKeys={defaultExpandedKeys}
          className={`${Styles.treeItem} border-bottom`}
          icon={
            <div

              className={`position-relative  ${darkMode ? "bg-primary p-1" : "bg-transparent p-0"
                } d-flex justify-content-center rounded-1`}
              style={{ padding: "3px" }}
            >
              <Image
                src={iconUrl(
                  item?.configJson,
                  vehicleIcon,
                  item?.VehicleStatus
                )}
                width={11}
                height={20}
                alt={GetStatusString(statusIcons[item?.SerialNumber])}
                title={GetStatusString(statusIcons[item?.SerialNumber])}
              />
            </div>
          }
          isLeaf={true}
          title={
            <div className="d-flex align-items-center flex-column w-100" >
              <div className="d-flex align-items-start justify-content-start " >
                {ToggleConfig?.ToggleConfigSettings?.length > 0 &&
                  ToggleConfig?.ToggleConfigSettings?.map((itemToggle, key) => {
                    if (itemToggle.value) {
                      return (
                        <div
                          key={key}

                          className={`${Styles.menuItem} me-1 border-bottom ${serialNumberFilter?.length ||
                            addressFilter?.length ||
                            speedFromFilter?.length ||
                            speedToFilter?.length ||
                            displayNameFilter?.length ||
                            plateNumberFilter?.length
                            ? "text-danger"
                            : ""
                            }`}
                          title={Object.values(itemToggle)[0]}
                          style={{
                            fontSize: "13px",
                            marginBottom: "10px",
                            paddingBottom: '5px',
                            overflow: "hidden",
                            marginTop: "4px",
                            fontWeight: "600"

                          }}
                        >
                          ({item[itemToggle.name]} )
                        </div>
                      );
                    }
                  })}
              </div>
              {/* data Icons */}
              <div className="d-flex align-items-center justify-content-start w-100">
                {ToggleConfig?.ToggleConfig &&
                  ToggleConfig?.ToggleConfig?.map((x, key) => {
                    if (x.value) {
                      return (
                        <div key={key}>
                          {handleShowConfigItems(x.name, item) && (
                            <div
                              key={key}
                              title={t(Object.values(x)[0])}
                              className="fw-bold me-1"
                              style={{
                                fontSize: "11px",
                                backgroundColor:
                                  item.Speed >  item.SpeedLimit
                                    ? x.name === "Speed"
                                      ? "#D9514E"
                                      : "#246c66"
                                    : "#246c66",
                                borderRadius: "5px",
                                marginTop: "-3px",
                                color: "#fff",
                                minWidth: "30px",
                                textAlign: "center",
                                padding: "0px 8px",
                              }}
                            >
                              {handleShowConfigItems(x.name, item)}
                            </div>
                          )}
                        </div>
                      );
                    }
                  })}
              </div>
            </div>
          }
        />
      );
    });

  return (
    <div className="position-relative">
      <div style={{ minHeight: "100vh", maxWidth: "auto", overflowY: 'auto' }} id="menu-scrollbar">
        <div
          className={`tree_root ${darkMode && Styles.dark}`}
          id="menu-tree"
          style={{
            height: 'calc(80vh - 240px)',
            overflow: 'hidden  scroll',
          }}
        >
          <Tree
            checkable
            // style={{ overflow: 'scroll', backgroundColor: "black" }}
            selectable={false}
            showLine={true}
            defaultExpandAll={true}
            autoExpandParent={true}
            defaultExpandedKeys={defaultExpandedKeys}
            checkedKeys={[...vehChecked.map((v) => v.SerialNumber)]}
            onCheck={onCheck}
          // height={TreeStyleHeight}

          >
            {loop(handleGroups(groups))}
          </Tree>
        </div>
      </div>
    </div >
  );
};
export default MenuTree;
