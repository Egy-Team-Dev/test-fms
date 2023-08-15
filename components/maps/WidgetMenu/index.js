import React, {
  useCallback,
  useEffect,
  useMemo,
  useLayoutEffect,
  useState,
  useRef,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSlidersH } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "next-i18next";
import Styles from "styles/WidgetMenu.module.scss";
import { useSelector } from "react-redux";

import MenuTree from "./menuTree";
import FilterTree from "./cars-filter";
import InputsFilter from "./inputsFilter";
import { Resizable } from "react-resizable";
import axios from "axios";
import { toast } from "react-toastify";
import DisplaySettings from "./DisplaySettings";
import ReactSelect from "components/Select";
import Image from "next/image";

const WidgetMenu = ({
  setVehChecked,
  vehChecked,
  allTreeData,
  setAllTreeData,
  setmainFilter,
  setcarsIconsFilter,
  setserialNumberFilter,
  setaddressFilter,
  setspeedFromFilter,
  setspeedToFilter,
  setDisplayNameFilter,
  setPlateNumberFilter,
  mainFilter,
  carsIconsFilter,
  serialNumberFilter,
  addressFilter,
  speedFromFilter,
  speedToFilter,
  displayNameFilter,
  plateNumberFilter,
  toggleMinuTrack,
  setToggleMinuTrack,
  handleToggleMinuTrack,
  setclusterToggle
}) => {
  const { t } = useTranslation("common");
  const ref = useRef();
  const label = { inputProps: { "aria-label": "Switch demo" } };
  const { config } = useSelector((state) => state);
  const { VehFullData, VehTotal } = useSelector((state) => state.streamData);
  const [vehicleIcon, setVehicleIcon] = useState("/assets/images/cars/car0/");
  const { myMap } = useSelector((state) => state.mainMap);
  const zoomAuto=useSelector((state)=>state.ToggleZoomAuto.value)

  useEffect(() => {
    const updated = VehFullData.map((e) => {
      const temp = { ...e };
      if (e.Speed >= e.SpeedLimit) {
        temp = { ...e, VehicleStatus: 101 };
      }
      return temp;
    });

    setAllTreeData(updated);
  }, [VehFullData]);

  const handleFilter = useCallback(
    (TreeDataWithFilter) => {
      return TreeDataWithFilter.filter((ele) => {
        if (serialNumberFilter !== "") {
          return ele?.SerialNumber?.includes(serialNumberFilter);
        } else if (addressFilter !== "") {
          return ele?.Address?.toLowerCase()
            .replace(/\s/g, "")
            .includes(addressFilter.toLowerCase().replace(/\s/g, ""));
        } else if (displayNameFilter !== "") {
          return ele?.DisplayName?.toLowerCase()
            .replace(/\s/g, "")
            .includes(displayNameFilter.replace(/\s/g, "").toLowerCase());
        } else if (plateNumberFilter !== "") {
          return ele?.PlateNumber?.includes(plateNumberFilter);
        } else if (speedFromFilter !== "") {
          return (
            (ele?.Speed >= speedFromFilter &&
              ele?.Speed <= (speedToFilter?.length ? speedToFilter : 200)) ||
            false
          );
        } else if (speedToFilter !== "") {
          return (
            (ele?.Speed <= speedToFilter &&
              ele?.Speed >= (+speedFromFilter?.length ? speedFromFilter : 0)) ||
            false
          );
        } else {
          return ele;
        }
      });
    },
    [
      addressFilter.trim(),
      displayNameFilter.trim(),
      plateNumberFilter,
      serialNumberFilter,
      speedFromFilter,
      speedToFilter,
    ]
  );

  const filteredTreeData = useMemo(() => {
    if (vehChecked.length === VehFullData.length) {
      const selectedVeh = [];

      if (displayNameFilter !== "") {
        selectedVeh = allTreeData.filter((e) =>
          e?.DisplayName?.replace(/\s/g, "")
            .toLowerCase()
            ?.includes(displayNameFilter?.replace(/\s/g, "")?.toLowerCase())
        );
      } else if (serialNumberFilter !== "") {
        selectedVeh = allTreeData.filter((e) =>
          e?.SerialNumber?.includes(serialNumberFilter)
        );
      } else if (plateNumberFilter !== "") {
        selectedVeh = allTreeData.filter((e) =>
          e?.PlateNumber?.includes(plateNumberFilter)
        );
      } else {
        selectedVeh = [];

      }

      if (selectedVeh[0]?.Latitude && selectedVeh[0]?.Longitude) {
        myMap?.setView(
          [selectedVeh[0]?.Latitude, selectedVeh[0]?.Longitude],
          15
        );
      } else {
  //  console.log(zoomAuto)
        //  if (zoomAuto) myMap?.setView([24.629778, 46.799308], 5);
      }

      return VehFullData;
    }
    // with no filters
    if (
      mainFilter == null &&
      carsIconsFilter == null &&
      serialNumberFilter == "" &&
      addressFilter == "" &&
      speedFromFilter == "" &&
      speedToFilter == "" &&
      displayNameFilter == "" &&
      plateNumberFilter == ""
    ) {
      return allTreeData;

      // filter Active  Vehs
    } else if (mainFilter === 5) {
      return handleFilter(
        allTreeData.filter(
          (e) => e.VehicleStatus !== 5 && e.VehicleStatus !== 600
        )
      );
      // filter Offline  Vehs
    } else if (mainFilter === -5 || carsIconsFilter === -5) {
      return handleFilter(
        allTreeData.filter(
          (e) => e.VehicleStatus === 5 || e.VehicleStatus === 600
        )
      );
      // filter Icons Cars  Vehs
    } else if (carsIconsFilter !== null && carsIconsFilter !== -5) {
      if (carsIconsFilter === 1) {
        return handleFilter(allTreeData.filter((e) => e.VehicleStatus == 1));
      } else {
        if (carsIconsFilter === 101) {
          // setAllTreeData
          return handleFilter(
            allTreeData.filter((e, i) => {
              // if(e.Speed >= e.SpeedLimit)
              // {

              //  setAllTreeData(perv=>{
              //   const updated=[...perv]
              //   updated[i]={...perv[i],VehicleStatus:101}
              //   return updated;
              //  })
              // }
              return e.Speed >= e.SpeedLimit || e.VehicleStatus === 101;
            })
          );
        }
        return handleFilter(
          allTreeData.filter((e) => e.VehicleStatus === carsIconsFilter)
        );
      }
    } else if (serialNumberFilter !== "") {
      return (
        allTreeData.filter((e) =>
          e?.SerialNumber?.includes(serialNumberFilter)
        ) || false
      );
    } else if (addressFilter !== "") {
      return (
        allTreeData.filter((e) =>
          e?.Address?.toLowerCase()
            .replace(/\s/g, "")
            .includes(addressFilter.toLowerCase().replace(/\s/g, ""))
        ) || false
      );
    } else if (displayNameFilter !== "") {
      return (
        allTreeData.filter((e) =>
          e?.DisplayName?.replace(/\s/g, "")
            .toLowerCase()

            ?.includes(displayNameFilter?.replace(/\s/g, "")?.toLowerCase())
        ) || false
      );
    } else if (plateNumberFilter !== "") {
      return (
        allTreeData.filter((e) =>
          e?.PlateNumber?.toLowerCase()?.includes(plateNumberFilter.toLowerCase())
        ) || false
      );
    }

    // Speed From
    else if (speedFromFilter !== "") {
      return (
        allTreeData.filter(
          (e) =>
            e?.Speed >= speedFromFilter &&
            e?.Speed <= (speedToFilter?.length ? speedToFilter : 200)
        ) || false
      );
    }
    // Speed To
    else if (speedToFilter !== "") {
      return (
        allTreeData.filter(
          (e) =>
            e?.Speed <= speedToFilter &&
            e?.Speed >= (+speedFromFilter?.length ? speedFromFilter : 0)
        ) || false
      );
    }

    // return allTreeData
  }, [
    mainFilter,
    carsIconsFilter,
    allTreeData,
    addressFilter,
    serialNumberFilter,
    speedToFilter,
    speedFromFilter,
    displayNameFilter,
    plateNumberFilter,
  ]);

  const [ToggleConfig, setToggleConfig] = useState({
    ToggleConfig: [
      { name: "Speed", value: true },
      { name: "Mileage", value: true },
      { name: "TotalWeight", value: true },
      { name: "Direction", value: false },
      { name: "EngineStatus", value: false },
      { name: "Temp", value: false },
      { name: "Humidy", value: false },
    ],
    ToggleConfigSettings: [
      { name: "DisplayName", value: true },
      { name: "PlateNumber", value: true },
    ],
    treeBoxWidth: 21.875 * 16,
  });
  const [isToggleConfigOpen, setisToggleConfigOpen] = useState(false);

  const fetchDataConfigWidgetMenu = async () => {
    await axios
      .get(`config`)
      .then((response) => {
        const configrations = response.data.configs[0].configrations;

        if (configrations) {
          setToggleConfig({
            ToggleConfig: [
              {
                name: "Speed",
                value:
                  configrations["Speed"] || ToggleConfig.ToggleConfig["Speed"],
              },
              {
                name: "Mileage",
                value:
                  configrations["Mileage"] ||
                  ToggleConfig.ToggleConfig["Mileage"],
              },
              {
                name: "TotalWeight",
                value:
                  configrations["TotalWeight"] ||
                  ToggleConfig.ToggleConfig["TotalWeight"],
              },
              {
                name: "Direction",
                value:
                  configrations["Direction"] ||
                  ToggleConfig.ToggleConfig["Direction"],
              },
              {
                name: "EngineStatus",
                value:
                  configrations["EngineStatus"] ||
                  ToggleConfig.ToggleConfig["EngineStatus"],
              },
              {
                name: "Temp",
                value:
                  configrations["Temp"] || ToggleConfig.ToggleConfig["Temp"],
              },
              {
                name: "Humidy",
                value:
                  configrations["Humidy"] ||
                  ToggleConfig.ToggleConfig["Humidy"],
              },
            ],
            ToggleConfigSettings: [
              {
                name: "DisplayName",
                value:
                  configrations["DisplayName"] ||
                  ToggleConfig.ToggleConfigSettings["DisplayName"],
              },
              {
                name: "PlateNumber",
                value:
                  configrations["PlateNumber"] ||
                  ToggleConfig.ToggleConfigSettings["PlateNumber"],
              },
              {
                name: "SerialNumber",
                value:
                  configrations["SerialNumber"] ||
                  ToggleConfig.ToggleConfigSettings["SerialNumber"],
              },
            ],
            treeBoxWidth:
              configrations["treeBoxWidth"] ||
              ToggleConfig.ToggleConfigSettings["treeBoxWidth"],
          });
          configrations["vehicleIcon"]
            ? setVehicleIcon(configrations["vehicleIcon"])
            : setVehicleIcon("/assets/images/cars/car0/");
          localStorage.setItem(
            "VehicleIcon",
            configrations["vehicleIcon"]
              ? configrations["vehicleIcon"]
              : "/assets/images/cars/car0/"
          );
          vehChecked?.map((x) => myMap.unpin(x.VehicleID, { doRezoom: false }));
          vehChecked?.map((x) => myMap.pin(x));
        }
      })
      .catch((error) => toast.error(error?.response?.data?.message));
  };

  const handleSaveUpdates = async () => {
    const _newConfig = {
      configrations: [
        ...ToggleConfig.ToggleConfig?.map((ele) => {
          return { [ele.name]: ele.value };
        }),
        ...ToggleConfig.ToggleConfigSettings?.map((ele) => {
          return { [ele.name]: ele.value };
        }),
        { treeBoxWidth: ToggleConfig.treeBoxWidth },
        { vehicleIcon },
      ],
    };
    setisToggleConfigOpen(false);
    await axios
      .post(`config`, _newConfig)
      .then(() => { })
      .catch((err) => {
        toast.error(err.meesage);
      });
  };

  useEffect(() => {
    setTimeout(() => {
      fetchDataConfigWidgetMenu();
    }, 8000);
  }, []);
 
  const handleConfigActive = (toggle) => {
    if (toggle.value) {
      if (
        ToggleConfig.ToggleConfig.filter((toggle) => toggle.value).length === 1
      )
        return true;
      return false;
    } else {
      if (
        ToggleConfig.ToggleConfig.filter((toggle) => toggle.value).length === 4
      )
        return true;
      return false;
    }
  };
  const handleConfigSettingActive = (toggle) => {
    if (toggle.value) {
      if (
        ToggleConfig.ToggleConfigSettings.filter((toggle) => toggle.value)
          .length === 1
      )
        return true;
      return false;
    } else {
      if (
        ToggleConfig.ToggleConfigSettings.filter((toggle) => toggle.value)
          .length === 2
      )
        return true;
      return false;
    }
  };

  const handleMainFilter = (e, resetCarsFilt = true) => {
    if (resetCarsFilt === true) {
      setcarsIconsFilter(null);
    }
    switch (e?.target?.value ?? "null") {
      case "offline":
        setmainFilter(-5);
        break;
      case "active":
        setmainFilter(5);
        break;
      default:
        setmainFilter(null);
        break;
    }
  };

  const onResize = (event, { size }) => {
    setToggleConfig({
      ...ToggleConfig,
      treeBoxWidth: size.width,
    });
  };
  const VehicleOptions = [
    {
      label: `${t("sedan_key")} 1`,
      value: "/assets/images/cars/car0/",
      img: "/assets/images/cars/car0/1.png",
    },
    {
      label: `${t("minivan_key")}`,
      value: "/assets/images/cars/car1/",
      img: "/assets/images/cars/car1/1.png",
    },
    {
      label: `${t("sedan_key")} 2`,
      value: "/assets/images/cars/car2/",
      img: "/assets/images/cars/car2/1.png",
    },
    {
      label: `${t("pickup_key")}`,
      value: "/assets/images/cars/car3/",
      img: "/assets/images/cars/car3/1.png",
    },
    {
      label: `${t("truck_head_key")}`,
      value: "/assets/images/cars/car4/",
      img: "/assets/images/cars/car4/1.png",
    },
    {
      label: `${t("reefer_truck_key")}`,
      value: "/assets/images/cars/car5/",
      img: "/assets/images/cars/car5/1.png",
    },
    {
      label: `${t("jeep_key")}`,
      value: "/assets/images/cars/car6/",
      img: "/assets/images/cars/car6/1.png",
    },
    {
      label: `${t("bus_key")}`,
      value: "/assets/images/cars/car7/",
      img: "/assets/images/cars/car7/1.png",
    },
    {
      label: `${t("truck_key")}`,
      value: "/assets/images/cars/car8/",
      img: "/assets/images/cars/car8/1.png",
    },
    {
      label: `${t("forklift_key")}`,
      value: "/assets/images/cars/car9/",
      img: "/assets/images/cars/car9/1.png",
    },
    {
      label: `${t("generator_key")}`,
      value: "/assets/images/cars/car10/",
      img: "/assets/images/cars/car10/1.png",
    },
  ];

  const handleIconVehicle = (value) => {
    localStorage.setItem("VehicleIcon", value);
    setVehicleIcon(value);
    vehChecked?.map((x) => myMap.unpin(x.VehicleID, { doRezoom: false }));
    vehChecked?.map((x) => myMap.pin(x));
  };

  const dataMainFilter = [
    {
      id: "btn-check-all",
      text: "All",
      val: "all",
      num: VehTotal?.totalVehs || 0,
      // num: allTreeData?.length,
    },
    {
      id: "btn-check-active",
      text: "Active",
      val: "active",
      num:
        allTreeData?.filter((e) => e?.VehicleStatus !== 5)?.length !==
          VehTotal?.activeVehs
          ? allTreeData?.filter((e) => e?.VehicleStatus !== 5)?.length
          : VehTotal?.activeVehs,
      // num: allTreeData?.filter((e) => e?.VehicleStatus !== 5)?.length,
    },
    {
      id: "btn-check-offline",
      text: "Offline",
      val: "offline",
      num:
        allTreeData?.filter((e) => e?.VehicleStatus === 5)?.length !==
          VehTotal?.offlineVehs
          ? allTreeData?.filter((e) => e?.VehicleStatus === 5)?.length
          : VehTotal?.offlineVehs,
      // num: allTreeData?.filter((e) => e?.VehicleStatus === 5)?.length,
    },
  ];

  return (
    <aside className={`${config.darkMode && Styles.dark}`}>
      <nav
        ref={ref}
        className={`${Styles.nav} ${toggleMinuTrack && Styles.active
          } position-absolute rounded shadow-lg pt-5 overflow-hidden`}
        id="widget-menu"
        style={{
          minWidth: parseInt(ToggleConfig?.treeBoxWidth) + "px",
        }}
      >
        <Resizable
          width={+ToggleConfig?.treeBoxWidth}
          height={200}
          onResize={onResize}
          resizeHandles={["w"]}
          className="box"
          maxConstraints={[700, 100]}
          minConstraints={[21.875 * 16, 100]}
          axis="x"
        >
          <>
            {/* Main Filter */}
            <div style={{ height: "240px" }}>
              <div
                className={`  ${Styles.nav__item} ${toggleMinuTrack && Styles.active
                  }`}
              >
                <div
                  className={`${Styles.section__one} d-flex align-items-center justify-content-center text-center`}
                >
                  {dataMainFilter?.map(({ id, text, val, num }, key) => (
                    <React.Fragment key={key}>
                      <input
                        type="radio"
                        name="filterBtn"
                        className="btn-check"
                        id={id}
                        autoComplete="off"
                        onChange={(e) => handleMainFilter(e, true)}
                        defaultChecked={key == 0 && true}
                        value={val}
                      />
                      <label
                        className="btn btn-outline-primary mx-2 rounded d-flex  justify-content-center flex-column"
                        htmlFor={id}
                        id={`${id}-tour`}
                      >
                        <span>{t(text)}</span>
                        <span>{num}</span>
                      </label>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Cars Filter */}
              <div
                className={`  ${Styles.nav__item} ${toggleMinuTrack && Styles.active
                  } mb-1`}
                id="car-filter"
              >
                <FilterTree
                  config={config}
                  active={toggleMinuTrack}
                  carsIconsFilter={carsIconsFilter}
                  handleMainFilter={handleMainFilter}
                  setcarsIconsFilter={setcarsIconsFilter}
                  vehicleIcon={vehicleIcon}
                  allTreeData={allTreeData}
                  setAllTreeData={setAllTreeData}
                  vehChecked={vehChecked}
                  setVehChecked={setVehChecked}
                />
              </div>

              <div
                className={` ${Styles.nav__item} ${toggleMinuTrack && Styles.active
                  } mb-1`}
              >
                <InputsFilter
                  t={t}
                  serialNumberFilter={serialNumberFilter}
                  setserialNumberFilter={setserialNumberFilter}
                  setaddressFilter={setaddressFilter}
                  addressFilter={addressFilter}
                  speedFromFilter={speedFromFilter}
                  setspeedFromFilter={setspeedFromFilter}
                  speedToFilter={speedToFilter}
                  setspeedToFilter={setspeedToFilter}
                  displayNameFilter={displayNameFilter}
                  setDisplayNameFilter={setDisplayNameFilter}
                  plateNumberFilter={plateNumberFilter}
                  setPlateNumberFilter={setPlateNumberFilter}
                  ToggleConfigSettings={ToggleConfig.ToggleConfigSettings}
                />
              </div>
            </div>
            {/* MenuTree */}
            <div
              className={`${Styles.nav__item} ${toggleMinuTrack && Styles.active
                } border-top pt-2`}
            >
              <MenuTree
                addressFilter={addressFilter}
                serialNumberFilter={serialNumberFilter}
                treeData={filteredTreeData || []}
                ToggleConfig={ToggleConfig}
                speedFromFilter={speedFromFilter}
                speedToFilter={speedToFilter}
                displayNameFilter={displayNameFilter}
                plateNumberFilter={plateNumberFilter}
                setVehChecked={setVehChecked}
                vehChecked={vehChecked}
                setclusterToggle={setclusterToggle}
                vehicleIcon={vehicleIcon}
              />
            </div>

            {/* Config Settings */}
            <button
              id="config-menu"
              onClick={() => setisToggleConfigOpen((prev) => !prev)}
              type="button"
              className={Styles.config_btn}
            >
              <FontAwesomeIcon icon={faSlidersH} />
            </button>

            <div
              className={`${Styles.config} ${isToggleConfigOpen && Styles.active
                }`}
            >
              <button
                onClick={() => setisToggleConfigOpen((prev) => !prev)}
                type="button"
                className={Styles.config_btn_close}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <h4 className={`${Styles.title} pt-2`}>{t("Config")}</h4>
              <div
                className={`sidebar-body pt-3 data-scrollbar menu-scrollbar ${Styles.config_main}`}
                data-scroll="1"
              >
                <div
                  className={`${Styles.nav__item} ${toggleMinuTrack && Styles.active
                    }`}
                >
                  <div className="container">
                    <div className="row">
                      <div className="d-flex justify-content-between align-items-center mt-5">
                        <span
                          className={`text-${config.darkMode ? "light" : "primary"
                            }`}
                        >
                          800px
                        </span>
                        <span
                          className={`text-${config.darkMode ? "light" : "primary"
                            }`}
                        >
                          350px
                        </span>
                      </div>
                      <input
                        style={{
                          transform: "rotate(-180deg)",
                          background: "none",
                        }}
                        type="range"
                        id="WedgitTreeWidthInput"
                        name="volume"
                        step={5}
                        value={ToggleConfig?.treeBoxWidth}
                        onChange={(e) => {
                          setToggleConfig({
                            ...ToggleConfig,
                            treeBoxWidth: e.currentTarget.value,
                          });
                        }}
                        min={parseInt(21.875 * 16)}
                        max="800"
                      />
                    </div>
                    <div
                      className="row"
                      style={{
                        height: "65vh",
                        overflowY: "auto",
                        overflowX: "hidden",
                      }}
                    >
                      <p className="fs-5 text-secondary text-center">
                        {t("vehicle_icon_key")}
                      </p>
                      <ReactSelect
                        onSelectChange={handleIconVehicle}
                        value={vehicleIcon}
                        options={VehicleOptions}
                        defaultValue={VehicleOptions[0]}
                        label={t("select_car_icon_key")}
                        className="mb-3"
                        formatOptionLabel={(guide) => (
                          <div className="d-flex align-items-center ps-3">
                            <span style={{ rotate: "90deg" }}>
                              {/* {guide.icon} */}
                              <Image
                                width={14}
                                height={30}
                                src={guide?.img}
                                alt={guide?.label}
                                title={guide?.label}
                              />
                            </span>

                            <span className="ms-2 text-capitalize px-2">
                              {guide.label}
                            </span>
                          </div>
                        )}
                      />
                      <DisplaySettings
                        nameSettings="Meters_Settings"
                        ToggleConfigSettings={ToggleConfig?.ToggleConfig}
                        ToggleConfigSettingsKey="ToggleConfig"
                        config={config}
                        t={t}
                        setToggleConfig={setToggleConfig}
                        label={label}
                        handleConfigSettingActive={handleConfigActive}
                      />
                      <hr className="mt-2 bg-secondary" />
                      <DisplaySettings
                        nameSettings="Display_Settings"
                        ToggleConfigSettings={
                          ToggleConfig?.ToggleConfigSettings
                        }
                        ToggleConfigSettingsKey="ToggleConfigSettings"
                        config={config}
                        t={t}
                        setToggleConfig={setToggleConfig}
                        label={label}
                        handleConfigSettingActive={handleConfigSettingActive}
                      />

                      <div className="my-3">
                        <button
                          onClick={handleSaveUpdates}
                          id="Save_changesTrackConfig"
                          className="btn btn-primary w-50 d-block px-4 py-2 mx-auto mb-4"
                        >
                          {t("Save_changes")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        </Resizable>
      </nav>
      {/* The Main Btn */}

      <div
        id="track-toggle"
        onClick={handleToggleMinuTrack}
        className={`${Styles.hamburger} ${toggleMinuTrack && Styles.active}`}
      // className={`${Styles.hamburger} `}
      >
        <span className={Styles.hamburger__patty} />
        <span className={Styles.hamburger__patty} />
        <span className={Styles.hamburger__patty} />
      </div>
    </aside>
  );
};

export default WidgetMenu;
