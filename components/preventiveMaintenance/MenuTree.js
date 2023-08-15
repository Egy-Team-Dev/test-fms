import React, { useEffect, useState } from "react";
import Tree, { TreeNode } from "rc-tree";
import Image from "next/image";
import "rc-tree/assets/index.css";
import Styles from "../../styles/Tree.module.scss";
import { useSelector } from "react-redux";
import { GetStatusString, iconUrl } from "../../helpers/helpers";
import { encryptName } from "../../helpers/encryptions";
import axios from "axios";
import useToken from "../../hooks/useToken";
import config from "../../config/config";
export const filterBySerialNumber = (data, inputValue) => {
  const clonedData1 = _.cloneDeep(data);
  const clonedDataAlt1 = clonedData1[0].children;

  const results = clonedDataAlt1?.filter((object) => {
    return (
      object?.children?.filter((item) => {
        if (item.SerialNumber.startsWith(inputValue)) {
          item["highlight"] = true;
          return item.SerialNumber;
        }
      }).length > 0
    );
  });
  return results;
};

const MenuTree = ({
  setTreeVehicleID,
  treeFilter,
  setCheckedVehicles,
  setData,
  Data,
  setDueValueMsg,
  vehicleId,
}) => {
  const [lists, setLists] = useState([]);
  const [statusIcons] = useState({});
  const [TreeStyleHeight] = useState(0);
  const { tokenRef } = useToken();

  useEffect(() => {
    tokenRef &&
      (async function () {
        await axios
          .get(
            `${config.apiGateway.URL}dashboard/management/maintenance/info/vehs`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${tokenRef}`,
              },
            }
          )
          .then(({ data }) => {
            // console.log("data", data);
            if (treeFilter.length > 0) {
              let resultsF = data.result.filter((item) =>
                item.DisplayName.startsWith(treeFilter)
              );
              return setLists(resultsF);
            }

            setLists(data.result);
          })
          .catch((err) => console.log(err))
          .finally(() => {
            vehicleId && setCheckedVehicles([String(vehicleId)]);
          });
      })();
  }, [treeFilter, tokenRef]);

  const stateReducer = useSelector((state) => state);

  const onSelect = (_, e) => {
    setTreeVehicleID(e?.node?.data?.VehicleID);
  };

  const onCheck = (selectedKeys, info) => {
    // selectedKeys.push(+vehicleId);
    setCheckedVehicles(selectedKeys);
    setDueValueMsg("");

    let VehicleIDList = [];

    selectedKeys?.map((item) => {
      VehicleIDList.push(
        lists.filter((itemF) => itemF.VehicleID === +item)[0]?.VehicleID
      );
    });

    if (Data.PeriodType === 9) {
      // 9 === "ByMileage"
      if (info.checked) {
        if (selectedKeys.length < 2) {
          let listsFiltered = lists.filter(
            (list) => list.VehicleID === +selectedKeys[0]
          );
          setData({
            ...Data,
            StartValue: listsFiltered[0]?.Mileage,
            NextValue: 0,
            VehicleID: VehicleIDList,
          });
        } else {
          setData({
            ...Data,
            StartValue: 0,
            NextValue: 0,
            VehicleID: VehicleIDList,
            NotifyPeriod: "Percentage",
          });
        }
      } else {
        if (selectedKeys.length < 2) {
          let listsFiltered = lists.filter(
            (list) => list.VehicleID === +selectedKeys[0]
          );
          setData({
            ...Data,
            StartValue:
              listsFiltered[0] !== undefined ? listsFiltered[0]?.Mileage : 0,
            NextValue: 0,
            VehicleID: VehicleIDList,
          });
        } else {
          setData({
            ...Data,
            StartValue: 0,
            NextValue: 0,
            VehicleID: VehicleIDList,
            NotifyPeriod: "Percentage",
          });
        }
      }
    }
  };

  const loop = (data) =>
    data?.map((item, index) => {

      return (
        <TreeNode
          className="foo"
          key={item?.VehicleID}
          data={item}
          icon={
            <div className="position-relative">
              <Image
                src={iconUrl(item?.VehicleStatus)}
                width={11}
                height={20}
                alt={GetStatusString(statusIcons[item?.VehicleID])}
                title={GetStatusString(statusIcons[item?.VehicleID])}
              />
            </div>
          }
          isLeaf={true}
          title={
            <div className="d-flex align-items-center">
              <div
                className="me-1"
                title={item?.DisplayName}
                style={{ fontSize: "10px" }}
              >
                {item?.DisplayName}
              </div>
            </div>
          }
        />
      );
    });

  return (
    <>
      {lists?.length > 0 ? (
        <div className="position-relative">
          <div style={{ minHeight: "40vh" }} id="menu-scrollbar">
            <div
              className={`tree_root ${stateReducer.config.darkMode && Styles.dark
                }`}
              style={{ height: TreeStyleHeight }}
            >
              <Tree
                selectable={true}
                showLine
                onSelect={onSelect}
                checkable
                onCheck={onCheck}
                defaultCheckedKeys={[String(vehicleId)]}
              >
                {loop(lists)}
              </Tree>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center">Loading...</p>
      )}
    </>
  );
};
export default MenuTree;
