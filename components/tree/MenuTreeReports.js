import { useEffect, useState } from "react";
import Tree, { TreeNode } from "rc-tree";
import Image from "next/image";
import "rc-tree/assets/index.css";
import Styles from "styles/Tree.module.scss";
import { useSelector } from "react-redux";
import { GetStatusString, iconUrl } from "helpers/helpers";

const MenuTreeReports = ({
  vehData,
  treeFilter,
  setVehChecked,
  vehChecked,
}) => {
  const [TreeStyleHeight, setTreeStyleHeight] = useState(0);

  const defaultExpandedKeys = ["All"];

  const groupBy = (arr, key) =>
    arr?.reduce(
      (acc, item) => (
        (acc[item[key]] = [...(acc[item[key]] || []), item]), acc
      ),
      {}
    );

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
        children: [groups],
      },
    ];
    for (let key in result[0]?.children[0]) {
      if (Object.hasOwn(result[0]?.children[0], key))
        result[0]?.children?.push({
          title: key,
          children: result[0]?.children[0][key],
        });
    }
    result[0]?.children?.splice(0, 1);
    return result;
  };

  const groups = groupBy(
    vehData?.sort((a, b) => a.GroupID - b.GroupID) || [],
    "GroupName"
  );

  const darkMode = useSelector((state) => state.config.darkMode);
  const clientHeight = document.getElementById("widget_menu")?.clientHeight;
  useEffect(() => {
    const setSize = () =>
      clientHeight && setTreeStyleHeight(clientHeight / 1.4);
    window.addEventListener("resize", setSize);
    setSize();
  }, [clientHeight]);

  const onCheck = (selectedKeys, info) => {
    const byGroup = info?.checkedNodesPositions.filter(
      (i) => i.pos.split("-").length === 2
    );
    if (byGroup.length > 0) {
      if (info?.checked) {
        const filterParentNodes = info?.checkedNodes
          ?.filter((x) => !x.children)
          ?.map((i) => i?.data);
        setVehChecked([...vehChecked, filterParentNodes?.map((x) => x)].flat());
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
      setVehChecked(
        info?.checkedNodes.filter((x) => !x.children).map((i) => i?.data)
      );
    }
  };

  const loop = (data) =>
    data?.map((item) => {
      if (item?.children) {
        return (
          <TreeNode
            defaultExpandAll={true}
            autoExpandParent={true}
            defaultExpandedKeys={defaultExpandedKeys}
            key={item.GroupID}
            icon={<i className={Styles.cars__icon} />}
            data={item}
            title={
              <span
                className="d-flex align-items-center"
                style={{ fontSize: "12px" }}
              >
                {item?.title}
                <span className="badge bg-secondary px-1 mx-2">
                  {item?.title === "All"
                    ? vehData?.length
                    : item.children?.length}
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
          defaultExpandAll={true}
          autoExpandParent={true}
          defaultExpandedKeys={defaultExpandedKeys}
          style={{ height: "30px", marginRight: "10px" }}
          key={item?.SerialNumber}
          data={item}
          icon={
            <div
              className={`position-relative  ${
                darkMode ? "bg-primary p-1" : "bg-transparent p-0"
              } d-flex justify-content-center  rounded-1 `}
              style={{ padding: "3px" }}
            >
              <Image
                src={iconUrl(
                  item?.configJson,
                  "/assets/images/cars/car0/",
                  item?.VehicleStatus
                )}
                width={11}
                height={20}
                alt={GetStatusString(item?.VehicleStatus)}
                title={GetStatusString(item?.VehicleStatus)}
              />
            </div>
          }
          isLeaf={true}
          title={
            <div
              className={`d-flex align-items-center ${
                treeFilter && "text-danger"
              }`}
            >
              <div
                className="me-1"
                title={item?.DisplayName}
                style={{ fontSize: "10px" }}
              >
                {item?.DisplayName}
              </div>
              <div
                title={item?.DisplyName}
                className="fw-bold me-1"
                style={{ fontSize: "11px" }}
              >
                ({item?.SerialNumber})
              </div>
            </div>
          }
        />
      );
    });

  return (
    <div className="position-relative">
      <div style={{ minHeight: "25vh", maxWidth: "auto" }} id="menu-scrollbar">
        <div
          className={`tree_root ${darkMode && Styles.dark}`}
          style={{ height: TreeStyleHeight }}
        >
          {vehData?.length > 0 ? (
            <Tree
              checkable
              selectable={false}
              showLine={true}
              onCheck={onCheck}
              height={TreeStyleHeight}
              defaultExpandAll={true}
              autoExpandParent={true}
              checkedKeys={
                vehChecked ? [...vehChecked?.map((v) => v?.SerialNumber)] : []
              }
              defaultExpandedKeys={defaultExpandedKeys}
            >
              {loop(handleGroups(groups))}
            </Tree>
          ) : (
            <div
              style={{ height: "100px" }}
              className="d-flex align-items-center justify-content-center fs-4 text-black-50"
            ></div>
          )}
        </div>
      </div>
    </div>
  );
};
export default MenuTreeReports;
