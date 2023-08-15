import React, { useEffect, useState } from "react";
import Tree, { TreeNode } from "rc-tree";
import Image from "next/image";
import "rc-tree/assets/index.css";
import Styles from "../../../styles/Tree.module.scss";
import { useSelector } from "react-redux";
import {
  GetStatusString,
  handleGroups,
  iconUrl,
} from "../../../helpers/helpers";
import axios from "axios";

const MenuTree = ({
  vehicleId,
  treeFilter,
  vehicleIds,
  setVehicleIds,
  setVehicleIdsChecked,
}) => {
  const [lists, setLists] = useState([]);
  const [listsCopy, setListsCopy] = useState([]);
  const [altLists, setAltLists] = useState([]);
  const [listsVehs, setListsVehs] = useState([]);

  const [altVehicleIds, setAltVehicleIds] = useState([]);

  const [loading, setLoading] = useState(true);
  const [statusIcons] = useState({});
  const [TreeStyleHeight] = useState(0);
  const [badgeCount, setBadgeCount] = useState(0);

  const groupBy = (arr, key) =>
    arr?.reduce(
      (acc, item) => (
        (acc[item[key]] = [...(acc[item[key]] || []), item]), acc
      ),
      {}
    );

  const defaultExpandedKeys = ["All"];

  useEffect(() => {
    (async function () {
      try {
        setLoading(true);
        const assignedVehs = await axios.get(`geofences/geofence/${vehicleId}`);

        if (listsVehs.length > 0) {
          if (assignedVehs.status === 200) {
            setAltLists(listsVehs);
            setVehicleIds(assignedVehs.data.vehicles);
            setAltVehicleIds(assignedVehs.data.vehicles);
            setVehicleIdsChecked(assignedVehs.data.vehicles);
            setLoading(false);
          }
        } else {
          const resVehs = await axios.get(
            "dashboard/management/maintenance/info/vehs"
          );

          setLoading(true);
          if (resVehs.status === 200) {
            setAltLists(resVehs.data.result);
            setListsVehs(resVehs.data.result);

            setVehicleIds(assignedVehs.data.vehicles);
            setAltVehicleIds(assignedVehs.data.vehicles);
            setVehicleIdsChecked(assignedVehs.data.vehicles);
            setLoading(false);
          }
        }
      } catch (err) {
        console.log(err);
      }
    })();
  }, [vehicleId]);
  const handleImageStatus = (status) => {
    let iconUrl = "/assets/images/cars/car0/";
    switch (status) {
      case 0:
        return (iconUrl += status + ".png");
        break;
      case 1:
        return (iconUrl += status + ".png");
        break;
      case 2:
        return (iconUrl += status + ".png");
        break;
      case 5:
        return (iconUrl += status + ".png");
        break;
      case 100:
        return (iconUrl += status + ".png");
      case 101:
        return (iconUrl += status + ".png");
        break;
      case 204:
        return (iconUrl += VehicleStatus + ".png");
        break;
      case 600:
        return (iconUrl += VehicleStatus + ".png");
        break;
      default:
        return (iconUrl += "201.png");
    }
  };
  useEffect(() => {
    const handleGroupsTree = () => {
      const arrToSort = [...altLists];
      let groups = groupBy(
        arrToSort.sort((a, b) => a.GroupID - b.GroupID),
        "GroupName"
      );
      let result = handleGroups(groups);

      setLists(result);
      setListsCopy(result);

      const allBadgeArr = result[0]?.children?.map((i) => i?.children?.length);
      const allBadgeCount = allBadgeArr
        ?.filter((item) => item != undefined)
        .reduce((sum, current) => sum + current, 0);
      setBadgeCount(allBadgeCount);
    };

    altLists.length > 0 && handleGroupsTree();
  }, [altLists.length]);

  useEffect(() => {
    let filterAfterTime = setTimeout(() => {
      if (treeFilter.length > 0) {
        let altListsFiltered = altLists.filter(
          (item) =>
            item.DisplayName.includes(treeFilter) ||
            item.SerialNumber.startsWith(treeFilter)
        );

        let groups = groupBy(altListsFiltered || [], "GroupName");

        let result = handleGroups(groups);

        setLists(result);
        setVehicleIds([...altVehicleIds]);

        const allBadgeArr = result[0]?.children?.map(
          (i) => i?.children?.length
        );
        const allBadgeCount = allBadgeArr
          ?.filter((item) => item != undefined)
          .reduce((sum, current) => sum + current, 0);
        setBadgeCount(allBadgeCount);
      } else {
        setLists([...listsCopy]);
        setVehicleIds([...altVehicleIds]);

        const allBadgeArr = listsCopy[0]?.children?.map(
          (i) => i?.children?.length
        );
        const allBadgeCount = allBadgeArr
          ?.filter((item) => item != undefined)
          .reduce((sum, current) => sum + current, 0);
        setBadgeCount(allBadgeCount);
      }
    }, 500);

    return () => clearTimeout(filterAfterTime);
  }, [treeFilter]);

  const stateReducer = useSelector((state) => state);

  const handleFilterTree = () =>
    treeFilter?.length > 0 && lists?.map((item) => item);

  const onCheck = (selectedKeys) =>
    setVehicleIdsChecked(
      selectedKeys.filter((item) => !isNaN(+item))?.map((item) => +item)
    );

  const loop = (data) =>
    data?.map((item) => {
      if (item?.children) {
        return (
          <TreeNode
            key={`${item?.title}`}
            icon={<i className={Styles.cars__icon} />}
            data={item}
            defaultCheckedKeys={vehicleIds?.map((item) => String(item))}
            title={
              <span
                className="d-flex align-items-center"
                style={{
                  fontSize: "12px",
                }}
              >
                {item?.title}
                <span className="badge bg-secondary px-1 mx-2">
                  {item?.title === "All" ? badgeCount : item?.children?.length}
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
          key={item?.VehicleID}
          data={item}
          defaultCheckedKeys={vehicleIds?.map((item) => String(item))}
          className="TreeNode"
          icon={
            <div className="position-relative">
              <Image
                src={handleImageStatus(item?.VehicleStatus)}
                width={11}
                height={20}
                alt={GetStatusString(statusIcons[item?.SerialNumber])}
                title={GetStatusString(statusIcons[item?.SerialNumber])}
              />
            </div>
          }
          style={{ height: "50px" }}
          isLeaf={true}
          title={
            <div className="d-flex align-items-center flex-column">
              <div className="d-flex align-items-center justify-content-between">
                <div
                  className="me-1 border-bottom"
                  title={item?.DisplayName}
                  style={{
                    fontSize: "10px",
                    width: "6rem",
                    overflow: "hidden",
                  }}
                >
                  {item?.DisplayName}
                </div>
              </div>
            </div>
          }
        />
      );
    });

  return (
    <>
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : lists?.length > 0 ? (
        <div className="position-relative">
          <div style={{ minHeight: "40vh" }} id="menu-scrollbar">
            <div
              className={`tree_root ${
                stateReducer?.config?.darkMode && Styles.dark
              }`}
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
                defaultCheckedKeys={vehicleIds?.map((item) => String(item))}
                onCheck={onCheck}
                filterTreeNode={handleFilterTree}
                height={TreeStyleHeight - 80}
              >
                {loop(lists)}
              </Tree>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center">There Is No Vehicles</p>
      )}
    </>
  );
};
export default MenuTree;
