import React, { useEffect, useState } from "react";
import Tree, { TreeNode } from "rc-tree";
import Image from "next/image";
import "rc-tree/assets/index.css";
import Styles from "../../../styles/Tree.module.scss";
import { useSelector } from "react-redux";
import { GetStatusString, iconUrl } from "../../../helpers/helpers";
import config from "../../../config/config";
import axios from "axios";
import useToken from "../../../hooks/useToken";

const MenuTree = ({ setTreeVehicleID, treeFilter }) => {
  const [lists, setLists] = useState([]);
  const [statusIcons] = useState({});
  const [TreeStyleHeight] = useState(0);
  const { tokenRef } = useToken();



  useEffect(() => {
    tokenRef &&
      (async function () {
        await axios
          .get(`${config.apiGateway.URL}dashboard/vehicles/info/unassigned/`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tokenRef}`,
            },
          })
          .then(({ data }) => {
            if (treeFilter.length > 0) {
              let resultsF = data?.unAssingedVehs.filter((item) =>
                item.DisplayName.startsWith(treeFilter)
              );
              return setLists(resultsF);
            }

            setLists(data?.unAssingedVehs);
          })
          .catch((err) => console.log(err));
      })();
  }, [treeFilter, tokenRef]);

  const stateReducer = useSelector((state) => state);

  const onSelect = (_, e) => {
    setTreeVehicleID(e?.node?.data?.VehicleID);
  };


  const loop = (data) =>
    data?.map((item) => {

      return (
        <TreeNode
          className="foo"
          key={item?.SerialNumber}
          data={item}
          icon={
            <div className="position-relative">
              <Image
                src={iconUrl(item?.VehicleStatus)}
                width={11}
                height={20}
                alt={GetStatusString(statusIcons[item?.SerialNumber])}
                title={GetStatusString(statusIcons[item?.SerialNumber])}
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
      {lists.length > 0 ? (
        <div className="position-relative">
          <div style={{ minHeight: "40vh" }} id="menu-scrollbar">
            <div
              className={`tree_root ${stateReducer.config.darkMode && Styles.dark
                }`}
              style={{ height: TreeStyleHeight }}
            >
              <Tree selectable={true} showLine onSelect={onSelect} >
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
