import { useTranslation } from "next-i18next";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  SyncOnCheck,
  SyncOnExpand,
} from "../../../lib/slices/vehicleProcessStatus";

const Logic = () => {
  const { t } = useTranslation("Dashboard");
  const [lists, setLists] = useState([]);
  const [statusIcons, setStatusIcons] = useState({});
  const [treeFilter, setTreeFilter] = useState("");
  const [treeFilterFrom, setTreeFilterFrom] = useState("");
  const [treeFilterTo, setTreeFilterTo] = useState("");
  const [TreeStyleHeight, setTreeStyleHeight] = useState(0);
  const [badgeCount, setBadgeCount] = useState(0);
  const [, setLoading] = useState(false);
  const [checkSearch, setCheckSearch] = useState(false);
  const [filterBy, setFilterBy] = useState("");
  const [placeholderFilter, setPlaceholderFilter] = useState("");

  const dispatch = useDispatch();
  const { myMap } = useSelector((state) => state.mainMap);

  const groupBy = (arr, key) =>
    arr?.reduce(
      (acc, item) => (
        (acc[item[key]] = [...(acc[item[key]] || []), item]), acc
      ),
      {}
    );

  const onCheck = (info) => {
    const byGroup = info.checkedNodesPositions.filter(
      (i) => i.pos.split("-").length === 2
    );

    if (byGroup.length > 0) {
      if (info.checked) {
        const filterParentNodes = info?.checkedNodes?.filter(
          (x) => !x.children
        );

        dispatch(SyncOnCheck(filterParentNodes));
        //dispatch(SyncOnCheck(byGroup[0].node.children));
      } else {
        if (info?.node?.data?.children) {
          myMap.unpin(info?.node?.data?.children?.map((x) => x?.VehicleID));
        } else {
          myMap.unpin(info?.node?.data?.VehicleID);
        }
      }
    } else if (info.checkedNodes.length > 0) {
      if (info.checked) {
        const filterParentNodes = info?.checkedNodes?.filter(
          (x) => !x.children
        );

        dispatch(SyncOnCheck(filterParentNodes));
      } else {
        myMap.unpin(info?.node?.data?.VehicleID);
      }
    } else {
      dispatch(SyncOnCheck([]));

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

  const handleTimeOutWithClear = (
    setCheckSearch,
    checkSearch,
    setTreeFilter,
    val
  ) => {
    // setCheckSearch(!checkSearch);
    // let clearFunc = setTimeout(() => {
    //   setTreeFilter(val);
    // }, 0);

    // if (!checkSearch) {
    //   clearTimeout(clearFunc);
    // }

    setTreeFilter(val);
  };

  const handleFilter = (setCheckSearch, checkSearch, setTreeFilter, e) => {
    handleTimeOutWithClear(
      setCheckSearch,
      checkSearch,
      setTreeFilter,
      e.target.value.toLocaleLowerCase()
    );
  };

  const handleFilterFrom = (setTreeFilterFrom, e) => {
    setTreeFilterFrom(e.target.value.toLocaleLowerCase());
  };

  const handleFilterTo = (setCheckSearch, checkSearch, setTreeFilterTo, e) => {
    handleTimeOutWithClear(
      setCheckSearch,
      checkSearch,
      setTreeFilterTo,
      e.target.value.toLocaleLowerCase()
    );
  };

  const handleShowIconWithConfig = (config) => {
    switch (config) {
      case "Speed":
        return (
          <svg
            width="16px"
            height="16px"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            className="bi bi-speedometer"
          >
            <path d="M8 2a.5.5 0 0 1 .5.5V4a.5.5 0 0 1-1 0V2.5A.5.5 0 0 1 8 2zM3.732 3.732a.5.5 0 0 1 .707 0l.915.914a.5.5 0 1 1-.708.708l-.914-.915a.5.5 0 0 1 0-.707zM2 8a.5.5 0 0 1 .5-.5h1.586a.5.5 0 0 1 0 1H2.5A.5.5 0 0 1 2 8zm9.5 0a.5.5 0 0 1 .5-.5h1.5a.5.5 0 0 1 0 1H12a.5.5 0 0 1-.5-.5zm.754-4.246a.389.389 0 0 0-.527-.02L7.547 7.31A.91.91 0 1 0 8.85 8.569l3.434-4.297a.389.389 0 0 0-.029-.518z" />
            <path
              fillRule="evenodd"
              d="M6.664 15.889A8 8 0 1 1 9.336.11a8 8 0 0 1-2.672 15.78zm-4.665-4.283A11.945 11.945 0 0 1 8 10c2.186 0 4.236.585 6.001 1.606a7 7 0 1 0-12.002 0z"
            />
          </svg>
        );
      case "TotalWeight":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="16px"
            height="16px"
            viewBox="0 0 256 252"
            xmlSpace="preserve"
          >
            <path
              fill="currentColor"
              d="M46.165 111.893c-5.653 0-10.307 4.433-10.751 9.975l-1.33 20.504-13.632 8.202v34.691h6.096v11.305c0 4.988 3.879 8.867 8.756 8.867s8.867-3.99 8.867-8.867v-11.305h58.742v11.305c0 4.988 3.99 8.867 8.867 8.867 4.877 0 8.867-3.99 8.867-8.867v-11.305h6.096v-34.691l-13.632-8.202-1.33-20.504c-.443-5.542-5.098-9.975-10.751-9.975H46.165zm-10.973 58.076a7.426 7.426 0 010-14.852c3.99 0 7.315 3.325 7.315 7.426s-3.214 7.426-7.315 7.426m62.732 3.658H49.268v-18.62c0-1.773 1.552-3.325 3.325-3.325h42.006c1.773 0 3.325 1.441 3.325 3.325v18.731-.111zm21.612-11.084a7.426 7.426 0 11-14.853 0 7.426 7.426 0 0114.853 0M39.293 142.15l1.33-19.95c.332-2.882 2.66-5.098 5.652-5.098h54.863c2.882 0 5.32 2.217 5.542 5.098l1.33 19.95H39.293zm-9.088-69.714c-5.32 0-9.753 4.322-9.753 9.864v62.843l8.978-5.542 1.219-18.398c.776-7.869 7.426-14.076 15.627-14.076h54.752c8.091 0 14.852 6.207 15.627 14.076l1.219 18.288 8.977 5.542V82.189a9.697 9.697 0 00-9.753-9.753H30.205zm168.403 18.785a4.592 4.592 0 116.623-6.361 4.592 4.592 0 01-6.623 6.361zm30.655-8.584a4.59 4.59 0 10-6.36-6.621 4.59 4.59 0 006.36 6.621zm-57.38-25.862a4.59 4.59 0 10-6.36-6.621 4.59 4.59 0 006.36 6.621zm67.211 3.333a4.59 4.59 0 10-6.36-6.621 4.59 4.59 0 006.36 6.621zm-34.82-35.51a4.59 4.59 0 10-6.36-6.621 4.59 4.59 0 006.36 6.621zm25.583 10.434a4.59 4.59 0 10-6.36-6.621 4.59 4.59 0 006.36 6.621zm-47.421-.771a4.59 4.59 0 10-6.36-6.621 4.59 4.59 0 006.36 6.621zm7.743 27.571l-16.368 15.724-1.58 6.822 6.88-1.305 16.368-15.724c4.637 2.618 10.782 2.02 15.012-2.044 5.15-4.947 5.309-12.88.362-18.03s-12.88-5.309-18.03-.362c-4.23 4.065-5.25 9.997-2.644 14.919zm63.789-7.112c0 21.672-13.201 40.348-31.968 48.417V119h-15.232v88.777c0 17.087-13.772 30.858-30.859 30.858h-26.12v11.181H2V215h148v13.484l26.675-.05a20.571 20.571 0 0020.657-20.657V119H182v-15.814c-18.828-8.041-32.083-26.75-32.083-48.466 0-29.073 23.463-52.536 52.536-52.536 28.818 0 52.536 23.462 51.515 52.536zm-12.221-20.618c-11.375-21.68-38.232-30.052-59.912-18.677s-30.052 38.232-18.677 59.912 38.232 30.052 59.912 18.677 30.052-38.232 18.677-59.912z"
            />
          </svg>
        );

      case "Mileage":
        return (
          <svg
            width="16px"
            height="16px"
            viewBox="0 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M326.1 231.9l-47.5 75.5a31 31 0 01-7 7 30.11 30.11 0 01-35-49l75.5-47.5a10.23 10.23 0 0111.7 0 10.06 10.06 0 012.3 14z" />
            <path
              d="M256 64C132.3 64 32 164.2 32 287.9a223.18 223.18 0 0056.3 148.5c1.1 1.2 2.1 2.4 3.2 3.5a25.19 25.19 0 0037.1-.1 173.13 173.13 0 01254.8 0 25.19 25.19 0 0037.1.1l3.2-3.5A223.18 223.18 0 00480 287.9C480 164.2 379.7 64 256 64z"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="32px"
            />
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeMiterlimit={10}
              strokeWidth="32px"
              d="M256 128L256 160"
            />
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeMiterlimit={10}
              strokeWidth="32px"
              d="M416 288L384 288"
            />
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeMiterlimit={10}
              strokeWidth="32px"
              d="M128 288L96 288"
            />
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeMiterlimit={10}
              strokeWidth="32px"
              d="M165.49 197.49L142.86 174.86"
            />
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeMiterlimit={10}
              strokeWidth="32px"
              d="M346.51 197.49L369.14 174.86"
            />
          </svg>
        );

      case "Direction":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 384 512"
            width="16px"
            height="16px"
          >
            <path
              fill="currentColor"
              d="M192 0C86.4 0 0 86.4 0 192c0 76.8 25.6 99.2 172.8 310.4 4.8 6.4 12 9.6 19.2 9.6s14.4-3.2 19.2-9.6C358.4 291.2 384 268.8 384 192 384 86.4 297.6 0 192 0zm0 446.09c-14.41-20.56-27.51-39.12-39.41-55.99C58.35 256.48 48 240.2 48 192c0-79.4 64.6-144 144-144s144 64.6 144 144c0 48.2-10.35 64.48-104.59 198.09-11.9 16.87-25 35.44-39.41 56zm99.93-292.32l-23.21-23.4c-3.85-3.88-10.11-3.9-13.98-.06l-87.36 86.66-37.88-38.19c-3.84-3.88-10.11-3.9-13.98-.06l-23.4 23.21c-3.88 3.85-3.9 10.11-.06 13.98l68.05 68.6c3.85 3.88 10.11 3.9 13.98.06l117.78-116.83c3.88-3.84 3.91-10.1.06-13.97z"
            />
          </svg>
        );

      case "EngineStatus":
        return <i className="fab fa-whmcs" />;

      case "Temperature":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
            width="16px"
            height="16px"
          >
            <path
              fill="currentColor"
              d="M160 322.9V304c0-8.8-7.2-16-16-16s-16 7.2-16 16v18.9c-18.6 6.6-32 24.2-32 45.1 0 26.5 21.5 48 48 48s48-21.5 48-48c0-20.9-13.4-38.5-32-45.1zM256 112C256 50.1 205.9 0 144 0S32 50.1 32 112v166.5C12.3 303.1 0 334 0 368c0 79.5 64.5 144 144 144s144-64.5 144-144c0-34-12.3-64.9-32-89.5V112zM144 464c-52.9 0-96-43.1-96-96 0-27 11.7-47.3 21.5-59.5L80 295.4V112c0-35.3 28.7-64 64-64s64 28.7 64 64v183.3l10.5 13.1C228.3 320.7 240 341 240 368c0 52.9-43.1 96-96 96zM368 0c-44.1 0-80 35.9-80 80s35.9 80 80 80 80-35.9 80-80-35.9-80-80-80zm0 112c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z"
            />
          </svg>
        );

      case "Humidy":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            width="16px"
            height="16px"
          >
            <path
              fill="currentColor"
              d="M16 224h336c59.8 0 106.8-54.6 93.8-116.7-7.6-36.3-36.9-65.6-73.2-73.2-55.9-11.7-105.8 25.4-115.1 76.6-1.6 9 5.8 17.2 14.9 17.2h18.4c7.2 0 12.9-5.2 14.7-12.1 6.6-25.2 33.2-42.4 61.7-33.5 14.3 4.4 25.9 16.1 30.4 30.4 10.3 32.9-14.2 63.3-45.6 63.3H16c-8.8 0-16 7.2-16 16v16c0 8.8 7.2 16 16 16zm144 32H16c-8.8 0-16 7.2-16 16v16c0 8.8 7.2 16 16 16h144c31.4 0 55.9 30.3 45.6 63.3-4.4 14.3-16.1 25.9-30.4 30.4-28.5 8.9-55.1-8.3-61.7-33.5-1.8-6.9-7.5-12.1-14.7-12.1H80.5c-9.2 0-16.6 8.2-14.9 17.2 9.3 51.2 59.2 88.3 115.1 76.6 36.3-7.6 65.6-36.9 73.2-73.2C266.8 310.6 219.8 256 160 256zm235.3 0H243.8c5.4 4.8 10.9 9.6 15.5 15.3 8.1 9.9 13.9 21.1 18.6 32.7h119.2c33.4 0 63.3 24.4 66.5 57.6 3.7 38.1-26.3 70.4-63.7 70.4-27.7 0-51.1-17.7-60-42.4-1.2-3.3-4.1-5.6-7.6-5.6h-33.1c-5 0-9 4.6-7.9 9.5C302.9 443 347 480 400 480c63 0 113.8-52 111.9-115.4-1.8-61.3-55.3-108.6-116.6-108.6z"
            />
          </svg>
        );

      default:
        break;
    }
  };

  const handleFilteredTitle = (word) => {
    if (word.length > 0) {
      return t(word);
    } else {
      return t("Filter_by");
    }
  };

  const handleFilterBy = (
    item,
    setFilterBy,
    setPlaceholderFilter,
    setTreeFilter,
    setTreeFilterFrom,
    setTreeFilterTo
  ) => {
    setFilterBy(item.replace(" ", ""));
    setPlaceholderFilter(item);
    setTreeFilter("");
    setTreeFilterFrom("");
    setTreeFilterTo("");
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
    if (parentItem.hasOwnProperty("children")) {
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

  return {
    lists,
    statusIcons,
    treeFilter,
    treeFilterFrom,
    treeFilterTo,
    TreeStyleHeight,
    badgeCount,
    setLists,
    setStatusIcons,
    setTreeFilter,
    setTreeFilterFrom,
    setTreeFilterTo,
    setTreeStyleHeight,
    setBadgeCount,
    setLoading,
    checkSearch,
    filterBy,
    placeholderFilter,
    setCheckSearch,
    setFilterBy,
    setPlaceholderFilter,
    groupBy,
    onCheck,
    onExpand,

    handleFilter,
    handleFilterFrom,
    handleFilterTo,

    handleShowIconWithConfig,

    handleFilteredTitle,

    handleFilterBy,

    handleCheckIncludes,
    handleCheckIfThereChildren,
    handleInputFromTo,
  };
};

export default Logic;
