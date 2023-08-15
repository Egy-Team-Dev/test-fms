import React, { useEffect, useState } from "react";
import Tree, { TreeNode } from "rc-tree";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import "rc-tree/assets/index.css";
import Styles from "../../../styles/Tree.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { SyncOnExpand } from "../../../lib/slices/vehicleProcessStatus";
import {
  GetStatusString,
  handleCheckKey,
  handleFilterVehs,
  handleGroups,
  iconUrl,
} from "../../../helpers/helpers";

import Car1 from "../../../public/assets/images/cars/carsSVG/car1";
import Car2 from "../../../public/assets/images/cars/carsSVG/car2";

import Car3 from "../../../public/assets/images/cars/carsSVG/car3";
import Car4 from "../../../public/assets/images/cars/carsSVG/car4";

import Car5 from "../../../public/assets/images/cars/carsSVG/car5";
import Car6 from "../../../public/assets/images/cars/carsSVG/car6";

import Car7 from "../../../public/assets/images/cars/carsSVG/car7";

import {
  FormControl,
  InputGroup,
  DropdownButton,
  Dropdown,
  // OverlayTrigger,
  // Tooltip,
} from "react-bootstrap";
// import useStreamDataState from "../../../hooks/useStreamDataState";

let listOfFilterMap = ["Speed", "Address", "SerialNumber"];

const defaultExpandedKeys = ["All"];

// ************************************************************************
// function generateTreeNodes(treeNode) {
//   const arr = [];
//   const key = treeNode.props.eventKey;
//   for (let i = 0; i < 3; i += 1) {
//     arr.push({ title: `leaf ${key}-${i}`, key: `${key}-${i}` });
//   }
//   return arr;
// }

// function setLeaf(treeData, curKey, level) {
//   const loopLeaf = (data, lev) => {
//     const l = lev - 1;
//     data.forEach((item) => {
//       if (
//         item.key.length > curKey.length
//           ? item.key.indexOf(curKey) !== 0
//           : curKey.indexOf(item.key) !== 0
//       ) {
//         trueToggle
//         return;
//       }
//       if (item.children) {
//         loopLeaf(item.children, l);
//       } else if (l < 1) {
//         // eslint-disable-next-line no-param-reassign
//         item.isLeaf = true;
//       }
//     });
//   };
//   loopLeaf(treeData, level + 1);
// }

// function getNewTreeData(treeData, curKey, child, level) {
//   const loop = (data) => {
//     if (level < 1 || curKey.length - 3 > level * 2) return;
//     data.forEach((item) => {
//       if (curKey.indexOf(item.key) === 0) {
//         if (item.children) {
//           loop(item.children);
//         } else {
//           // eslint-disable-next-line no-param-reassign
//           item.children = child;
//         }
//       }
//     });
//   };
//   loop(treeData);
//   setLeaf(treeData, curKey, level);
// }

const MenuTree = ({
  map,
  trueToggle,
  setTreeData,
  trueToggleSettings,
  statusVeh,
  lists,
  setLists,
}) => {
  const { t } = useTranslation("Dashboard");
  const { myMap } = useSelector((state) => state.mainMap);

  const [statusIcons, setStatusIcons] = useState({});
  const [treeFilter, setTreeFilter] = useState("");
  const [treeFilterFrom, setTreeFilterFrom] = useState("");
  const [treeFilterTo, setTreeFilterTo] = useState("");
  const [TreeStyleHeight, setTreeStyleHeight] = useState(0);
  const [badgeCount, setBadgeCount] = useState(0);
  const [, setLoading] = useState(false);
  // const [expandParentState, setExpandParentState] = useState([]);
  // const [listsTitleVeh, setListsTitleVeh] = useState([]);
  const [filterBy, setFilterBy] = useState("");
  const [placeholderFilter, setPlaceholderFilter] = useState("");
  const dispatch = useDispatch();
  const groupBy = (arr, key) =>
    arr?.reduce(
      (acc, item) => (
        (acc[item[key]] = [...(acc[item[key]] || []), item]), acc
      ),
      {}
    );
  const stateReducer = useSelector((state) => state);

  useEffect(() => {
    if (treeFilterTo === undefined) {
      setTreeFilterTo(2000);
    }
  }, [treeFilterTo]);

  const { streamData } = useSelector((state) => state);

  useEffect(
    (_) => {
      const ele = document.getElementById("widget_menu");
      const setSize = () => ele && setTreeStyleHeight(ele.clientHeight / 1.3);
      window.addEventListener("resize", setSize);
      setLoading(true);
      setSize();

      let groups = groupBy(
        handleFilterVehs(statusVeh, streamData) || [],
        "GroupName"
      );

      let result = handleGroups(groups);

      if (!treeFilter.length > 0 && !treeFilterTo.length > 0) {
        setLists(result);
        setTreeData(result);
      }

      setStatusIcons(streamData.status);

      const allBadgeArr = result[0]?.children?.map((i) => i?.children?.length);
      const allBadgeCount = allBadgeArr?.reduce(
        (sum, current) => sum + current,
        0
      );
      setBadgeCount(allBadgeCount);
    },
    [streamData.VehFullData, statusVeh] // treeFilterTo, treeFilter ,
  );
  useEffect(
    (_) => {
      const ele = document.getElementById("widget_menu");
      const setSize = () => ele && setTreeStyleHeight(ele.clientHeight / 1.3);
      window.addEventListener("resize", setSize);
      setLoading(true);
      setSize();

      let groups = groupBy(
        handleFilterVehs(statusVeh, streamData) || [],
        "GroupName"
      );
      const handleCheckVehicles = (Vehicles) => {
        let filteredVehc;
        if (filterBy === "SerialNumber") {
          filteredVehc = Vehicles.filter((item) =>
            item[filterBy]?.startsWith(treeFilter)
          );
        } else {
          filteredVehc = Vehicles.filter((item) =>
            item[filterBy]?.includes(treeFilter)
          );
        }
        return filteredVehc;
      };
      if (treeFilter.length > 0) {
        if (!filterBy.length > 0) {
          setFilterBy("SerialNumber");
        }
        if (streamData.VehFullData) {
          let filteredVehc = handleCheckVehicles(streamData.VehFullData);
          groups = groupBy(filteredVehc || [], "GroupName");
        }
      }
      if (
        (treeFilterFrom && treeFilterTo) ||
        (treeFilterFrom === 0 && treeFilterTo > 0)
      ) {
        if (streamData.VehFullData) {
          let filteredVehc = streamData.VehFullData.filter(
            (item) =>
              item[filterBy] > treeFilterFrom && item[filterBy] < treeFilterTo
          );
          groups = filteredVehc && groupBy(filteredVehc || [], "GroupName");
        }
      }

      let result = handleGroups(groups);
      setLists(result);
      setTreeData(result);

      setStatusIcons(streamData?.status);

      const allBadgeArr = result[0]?.children?.map((i) => i?.children?.length);
      const allBadgeCount = allBadgeArr?.reduce(
        (sum, current) => sum + current,
        0
      );
      setBadgeCount(allBadgeCount);
    },
    [treeFilter, treeFilterFrom, treeFilterTo, filterBy]
  );

  const onCheck = (selectedKeys, info) => {
    const byGroup = info.checkedNodesPositions.filter(
      (i) => i.pos.split("-").length === 2
    );

    if (byGroup.length > 0) {
      if (info.checked) {
        const filterParentNodes = info?.checkedNodes
          ?.filter((x) => !x.children)
          ?.map((i) => i?.data);
        filterParentNodes?.map((x) => map?.current.pin(x));
      } else {
        if (info?.node?.data?.children) {
          myMap.unpin(info?.node?.data?.children?.map((x) => x?.VehicleID));
        } else {
          myMap.unpin(info?.node?.data?.VehicleID);
        }
      }
    } else if (info.checkedNodes.length > 0) {
      if (info.checked) {
        const filterParentNodes = info?.checkedNodes
          ?.filter((x) => !x.children)
          ?.map((i) => i?.data);
        filterParentNodes?.map((x) => map?.current.pin(x));
      } else {
        myMap.unpin(info?.node?.data?.VehicleID);
      }
    } else {
      if (!info?.node?.data?.children) {
        myMap.unpin(info?.node?.data?.VehicleID);
      } else {
        myMap.deselectAll(true);
      }
    }
  };

  const onExpand = (expandedKeys, info) => {
    if (expandedKeys.length > 0) {
      dispatch(SyncOnExpand(info.node.children));
    } else {
      dispatch(SyncOnExpand([]));
    }
  };

  const handleOnLoad = (loadedKeys, { event, node }) => {
    console.log("loadedKeys, {event, node}", loadedKeys, { event, node });
  };

  const handleTimeOutWithClear = (setTreeFilter, val) => {
    setTreeFilter(val);
  };

  const handleFilter = (e) => {
    handleTimeOutWithClear(setTreeFilter, e.target.value.toLocaleLowerCase());
  };

  const handleFilterFrom = (e) => {
    setTreeFilterFrom(e.target.value.toLocaleLowerCase());
  };

  const handleFilterTo = (e) => {
    handleTimeOutWithClear(setTreeFilterTo, e.target.value.toLocaleLowerCase());
  };

  const handleCheckIncludes = (item, filterBy, treeFilter) => {
    let currItem = String(item[filterBy]);
    return currItem.toLocaleLowerCase().includes(treeFilter);
  };

  const handleCheckIfThereChildren = (
    filteredData,
    parentItem,
    filterBy,
    treeFilter
  ) => {
    if (handleCheckKey(parentItem, "children")) {
      filteredData = parentItem.children.filter((item) => {
        return handleCheckIncludes(item, filterBy, treeFilter);
      });
    } else {
      return handleCheckIncludes(parentItem, filterBy, treeFilter);
    }
  };

  const handleInputFromTo = (item, filterBy, treeFilterFrom, treeFilterTo) => {
    return (
      item[filterBy] >= treeFilterFrom &&
      item[filterBy] <= treeFilterTo &&
      item[filterBy]
    );
  };

  const handleFilterTree = (treeNode) => {
    if (treeFilter?.length > 0) {
      // if not group
      if (!Array.isArray(treeNode?.title?.props?.children)) {
        return;
      }
      let filteredData;
      if (filterBy.length > 0) {
        return handleCheckIfThereChildren(
          filteredData,
          treeNode?.data,
          filterBy,
          treeFilter
        );
      } else {
        return handleCheckIfThereChildren(
          filteredData,
          treeNode?.data,
          "SerialNumber",
          treeFilter
        );
      }
    }

    if (
      (treeFilterFrom?.length > 0 && treeFilterTo?.length > 0) ||
      (treeFilterFrom === 0 && treeFilterTo >= 0)
    ) {
      // if not group
      if (!Array.isArray(treeNode?.title?.props?.children)) {
        return;
      }

      let filteredData;
      if (handleCheckKey(treeNode.data, "children")) {
        filteredData = treeNode?.data?.children?.filter((item) => {
          let currItem = handleInputFromTo(
            item,
            filterBy,
            treeFilterFrom,
            treeFilterTo
          );

          return currItem !== false;
        });
      } else {
        let currItem = handleInputFromTo(
          treeNode?.data,
          filterBy,
          treeFilterFrom,
          treeFilterTo
        );

        return currItem !== false;
      }

      filteredData?.map((item) => item);
    }
  };

  const handleFilterBy = (item) => {
    setFilterBy(item.replace(" ", ""));
    setPlaceholderFilter(item);
    setTreeFilter("");
    setTreeFilterFrom("");
    setTreeFilterTo("");
  };

  const handleFilteredTitle = (word) => {
    if (word.length > 0) {
      return t(word);
    } else {
      return t("Filter_by");
    }
  };

  const handleShowConfigItems = (x, item) => {
    switch (x) {
      case "Temperature":
        let listOfTemps = [
          item["Temp1"],
          item["Temp2"],
          item["Temp3"],
          item["Temp4"],
        ];
        let listOfFilteredTemps = listOfTemps.filter((item) => item !== 3000);

        if (listOfFilteredTemps.length > 0) {
          let AVGListOfFilteredTemps =
            listOfFilteredTemps.reduce((acc, item) => acc + item, 0) /
            listOfFilteredTemps.length;

          return (
            <>
              {AVGListOfFilteredTemps?.toFixed(1)}{" "}
              <span style={{ fontSize: "0.438rem" }}>C</span>
            </>
          );
        } else {
          return "Disconnected";
        }

      case "Humidy":
        let listOfHums = [
          item["Hum1"],
          item["Hum2"],
          item["Hum3"],
          item["Hum4"],
        ];
        let listOfFilteredHums = listOfHums.filter(
          (item) => item >= 1 && item <= 100
        );

        if (listOfFilteredHums.length > 0) {
          let AVGListOfFilteredHums =
            listOfFilteredHums.reduce((acc, item) => acc + item, 0) /
            listOfFilteredHums.length;
          return (
            <>
              {AVGListOfFilteredHums?.toFixed(1)}{" "}
              <span style={{ fontSize: "0.438rem" }}>%</span>
            </>
          );
        } else {
          return "Disconnected";
        }
      case "EngineStatus":
        return item["EngineStatus"] == true ? "On" : "Off";
      case "Speed":
        return (
          <>
            {item["Speed"] + " "}{" "}
            <span style={{ fontSize: "0.438rem" }}>km/h</span>
          </>
        );
      case "Mileage":
        return (
          <>
            {item["Mileage"] + " "}{" "}
            <span style={{ fontSize: "0.438rem" }}>km</span>
          </>
        );
      case "TotalWeight":
        return item["TotalWeight"] !== null ? (
          <>
            {item["TotalWeight"]}
            <span style={{ fontSize: "0.438rem" }}>kg</span>
          </>
        ) : (
          ""
        );
      default:
        return item[x];
    }
  };

  const loop = (data) =>
    data?.map((item) => {

      if (item?.children) {
        return (
          <TreeNode
            key={`${item?.title}`}
            icon={<i className={Styles.cars__icon} />}
            data={item}
            defaultExpandAll={true}
            autoExpandParent={true}
            defaultExpandedKeys={defaultExpandedKeys}
            title={
              <span
                className="d-flex align-items-center"
                style={{
                  fontSize: "12px",
                }}
              >
                {item?.title}
                <span className="badge bg-secondary px-1 mx-2">
                  {item?.title === "All" ? badgeCount : item.children?.length}
                </span>
              </span>
            }
          >
            {loop(item.children)}
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
          className="TreeNode"
          icon={
            <div className="position-relative">
              <Image
                src={iconUrl(item?.VehicleStatus)}
                width={11}
                height={20}
                alt={GetStatusString(statusIcons[item?.SerialNumber])}
                title={GetStatusString(statusIcons[item?.SerialNumber])}
              />

              {/* {iconUrl(item?.VehicleStatus)} */}
            </div>
          }
          style={{ height: "50px" }}
          isLeaf={true}
          title={
            <div className="d-flex align-items-center flex-column">
              <div className="d-flex align-items-center justify-content-between">
                {trueToggleSettings.length > 0 &&
                  trueToggleSettings?.map(
                    (itemToggle, keyToggle) =>
                      handleCheckKey(item, itemToggle) && (
                        <div
                          key={keyToggle}
                          className="me-1 border-bottom"
                          title={item[itemToggle]}
                          style={{
                            fontSize: "10px",
                            width: "6rem",
                            overflow: "hidden",
                          }}
                        >
                          ({item[itemToggle]} )
                        </div>
                      )
                  )}
              </div>
              {/* data Icons */}
              <div className="d-flex align-items-center justify-content-between">
                {trueToggle &&
                  trueToggle?.map((x) => {

                    return (
                      <>
                        {/* {handleShowConfigItems(x, item) && (
                          <div
                            title={x}
                            className="fw-bold me-1"
                            style={{
                              fontSize: "11px",
                              // padding: "0.5px 0px",
                              backgroundColor: "#246c66",
                              borderRadius: "5px",
                              color: "#fff",
                              minWidth: "30px",
                              textAlign: "center",
                              padding: "0px 10px",
                            }}
                          >
                            {handleShowConfigItems(x, item)}
                          </div>
                        )} */}

                        <div
                          title={x}
                          className="fw-bold me-1"
                          style={{
                            fontSize: "11px",
                            // padding: "0.5px 0px",
                            backgroundColor: "#246c66",
                            borderRadius: "5px",
                            color: "#fff",
                            minWidth: "30px",
                            textAlign: "center",
                            padding: "0px 10px",
                          }}
                        >
                          {handleShowConfigItems(x, item)}
                        </div>
                      </>
                    );
                  })}
              </div>
            </div>
          }
        />
      );
    });

  return (
    <div className="position-relative">
      <div style={{ minHeight: "100vh", maxWidth: "auto" }} id="menu-scrollbar">
        <InputGroup>
          {filterBy === "Speed" ? (
            <>
              <span className="mt-2 mx-1">{t("from")}</span>
              <FormControl
                dir="auto"
                className="text-start"
                type="number"
                placeholder={`${t("Enter")} ${placeholderFilter.length > 0
                  ? t(placeholderFilter)
                  : t("SerialNumber")
                  }...`}
                onInput={handleFilterFrom}
              />

              <span className="mt-2 mx-1">{t("To")}</span>
              <FormControl
                type="number"
                className="me-2"
                placeholder={`${t("Enter")} ${placeholderFilter.length > 0
                  ? t(placeholderFilter)
                  : t("SerialNumber")
                  }...`}
                onInput={handleFilterTo}
              />
            </>
          ) : (
            <FormControl
              type="text"
              placeholder={`${t("Enter")} ${placeholderFilter.length > 0
                ? t(placeholderFilter)
                : t("SerialNumber")
                }...`}
              onInput={handleFilter}
            />
          )}
          <DropdownButton
            variant="outline-primary"
            title={handleFilteredTitle(filterBy)}
            id="input-group-dropdown-4"
            align="end"
          >
            {/* placeholderFilter.length > 0 ? placeholderFilter : "Filter By" */}
            {listOfFilterMap?.map((item, key) => (
              <Dropdown.Item
                onClick={() =>
                  handleFilterBy(
                    item,
                    setFilterBy,
                    setPlaceholderFilter,
                    setTreeFilter,
                    setTreeFilterFrom,
                    setTreeFilterTo
                  )
                }
                key={key}
                className="bg-soft-primary nav-link py-2"
                href="#"
              >
                {t(item)}
              </Dropdown.Item>
            ))}
          </DropdownButton>
        </InputGroup>
        <div
          className={`tree_root ${stateReducer.config.darkMode && Styles.dark}`}
          style={{
            height: TreeStyleHeight,
          }}
        >
          <Tree
            selectable={false}
            showLine={true}
            checkable
            defaultExpandAll={true}
            autoExpandParent={true}
            defaultExpandedKeys={defaultExpandedKeys}
            onCheck={onCheck}
            onExpand={onExpand}
            filterTreeNode={handleFilterTree}
            height={TreeStyleHeight - 80}
            onLoad={handleOnLoad}
          >
            {loop(lists)}
          </Tree>
          {/* <Car3  /> */}
        </div>
      </div>
    </div>
  );
};
export default MenuTree;
