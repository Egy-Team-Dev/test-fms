import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";

import { Card } from "react-bootstrap";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import style from "styles/Reports.module.scss";
import ReportsOptions from "../components/Reports/ReportsOptions";
import { toast } from "react-toastify";
import SideBarReports from "components/Reports/sideBar";
import TableTaps from "components/Reports/TableTaps";
import UseDarkmode from "hooks/UseDarkmode";
import fs from "fs";
import path from "path";
import { toggle as tourToggle, disableTour } from "../lib/slices/tour";
import Joyride, { ACTIONS, EVENTS, STATUS } from "react-joyride";
import useStepDashboard from "hooks/useStepDashboard";
import moment from "moment";
import { setAllVehicles } from "lib/slices/StreamData";
const Reports = ({ dataSideBar }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation("Tour");
  const [controller, setController] = useState(new AbortController());
  const [manuelclose, setManuelclose] = useState(false);
  // const { config } = useSelector((state) => state);
  const version5 = false; //useSelector((state) => state.dateVersion.isV5);
  const [Data_table, setData_table] = useState([]);
  const [reportApi, setReportApi] = useState("");
  const [vehChecked, setVehChecked] = useState([]);

  const [reportsOptionsShow, setReportsOptionsShow] = useState(false);
  const [showCurrentActiveReportOptions, setShowCurrentActiveReportOptions] =
    useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [accounts, setAccounts] = useState([]);

  const tourState = useSelector((state) => state.tour.run);
  const allSteps = useStepDashboard();

  useEffect(() => {
    dispatch(setAllVehicles());
  }, []);
  const [{ stepIndex, steps }, setState] = useState({
    stepIndex: 0,
    steps: allSteps["reports"],
  });
  const handleJoyrideCallback = (data) => {
    const { action, index, status, type } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setState({ stepIndex: 0, steps: steps });
      dispatch(tourToggle());
    } else if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      if (index === 11 && action === ACTIONS.PREV) {
        setToggleMinuTrack((prev) => !prev);
        setState({
          stepIndex: nextStepIndex,
          steps: steps,
        });
      } else if (data.action === "close" || data.action === "reset") {
        dispatch(disableTour());
      } else {
        setState({
          stepIndex: nextStepIndex,
          steps: steps,
        });
      }
    }
  };
  const [fullSelectedReportData, setFullSelectedReportData] = useState({
    name: "",
    api: "",
    pagination: "",
    startDate: "",
    endDate: "",
    minimumSpeed: 0,
    speedDurationOver: 0,
    fuelData: 0,
    overSpeed: 0,
    tripDuration: false,
    data: [],
  });

  const [reportsTitleSelectedId, setReportsTitleSelectedId] = useState(0);
  const [reportsDataSelected, setReportsDataSelected] = useState([]);
  const [reportsTitleSelected, setReportsTitleSelected] = useState("");

  const [dateStatus, setDateStatus] = useState("");

  const [loadingShowReport, setLoadingShowReport] = useState(false);
  const [loadingShowCurrentReport, setLoadingShowCurrentReport] =
    useState(false);
  const [closeAndOpenReportsList, setCloseAndOpenReportsList] = useState(true);

  const [vehiclesError, setVehiclesError] = useState("");

  const [mainApi, setMainApi] = useState([]);

  useEffect(() => {
    if (reportsOptionsShow || showCurrentActiveReportOptions) {
      document.querySelector(".btn-close").onclick = () => {
        setReportsOptionsShow(false);
        setVehiclesError(""); // reset setVehiclesError

        setShowCurrentActiveReportOptions(false);
        setManuelclose(true);

        if (controller) {
          controller.abort();
        }
      };
    }
  }, [reportsOptionsShow, showCurrentActiveReportOptions]);

  // Create a new Date object for the current local time

  // fetch report data

  const fetchReports = async (
    id,
    api,
    name,
    vehChecked,
    fullSelectedReportData
  ) => {
    const newController = new AbortController();
    setController(newController);

    const query = new URL(`https://${api}`).searchParams
    const EndDate = query.get("EndDate")


    try {
      const response = name === "Active_Devices_Summary_Key" ? await axios.post(`dashboard/reports/activeAccountsVehiclesSummary`, { EndDate, accounts }, { signal: controller.signal }) : await axios.get(`${api}`, { signal: controller.signal });
      if (response.data.message) {
        toast.warning(response.data.message);
      }

      if (response.status === 200) {
        if (
          Object.hasOwn(response.data, "result") ||
          (Object.hasOwn(response.data, "vehicles") &&
            (Array.isArray(response.data?.result) ||
              Array.isArray(response.data?.vehicles)))
        ) {
          let newData = [
            ...Data_table,
            {
              ...fullSelectedReportData,
              id,
              total: 0,
              api,
              name,
              vehChecked,
              dateStatus,
              currentPage: 1,
              data: response.data?.result || response.data?.vehicles,
            },
          ];
          setFullSelectedReportData((prev) => ({
            ...prev,
            api,
          }));

          fullSelectedReportData.pagination &&
            setMainApi((prev) => [...prev, { id, mainApi: api }]);

          setData_table([...newData]);

          return { res: newData };
        } else {
          let newData = [
            ...Data_table,
            {
              ...fullSelectedReportData,
              id,
              total: 0,
              api,
              name,
              vehChecked,
              dateStatus,
              currentPage: 1,
              data: [],
            },
          ];

          setFullSelectedReportData((prev) => ({
            ...prev,
            api,
          }));
          fullSelectedReportData.pagination &&
            setMainApi((prev) => [...prev, { id, mainApi: api }]);

          setData_table([...newData]);
          return { res: newData };
        }
      } else {

        toast.error(`Errors:  ${response.data?.message}`);
      }
    } catch (error) {
      toast.error("Errors: " + error.response.data?.message);
    }
  };

  function toLocalISOString(date) {
    const timezoneOffset = date.getTimezoneOffset() * 60000; // Convert minutes to milliseconds
    const localTime = date.getTime() - timezoneOffset; // Get local time by subtracting the timezone offset
    const localDate = new Date(localTime); // Create a new Date object with the local time
    const isoString = localDate.toISOString(); // Convert the local date to ISO string format
    return isoString;
  }

  const handleApi = (fullSelectedReportData) => {
    const HandleDate = () => {
      let day = new Date().getDate();
      let month = new Date().getMonth() + 1;
      let year = new Date().getFullYear();

      // let time = new Date().getTime()
      return {
        year,

        Month: month > 9 ? month : `0${month}`,
        Day: day > 9 ? day : `0${day}`,
      };
    };

    // get last and first date for first report
    let hisF = `${fullSelectedReportData.endDate &&
      fullSelectedReportData.endDate[0].split("T")[0]
      }`; // e.g 2022-07-14
    let dateF = new Date(hisF);
    dateF.setDate(dateF.getDate() + 1);
    // get first date for most reports
    let yearF = HandleDate().year;

    let MonthF = HandleDate().Month;

    let DayF = HandleDate().Day;

    const nowTime = new Date();

    let FDate = moment(`${yearF}-${MonthF}-${DayF}T00:00:00`).utc().format("YYYY-MM-DD HH:mm:ss");

    let [yearL, MonthL, DayL] = [yearF, MonthF, DayF];

    let LDate = `${yearL}-${MonthL}-${DayL}T${nowTime.getUTCHours() < "10"
      ? `0${nowTime.getUTCHours()}`
      : nowTime.getUTCHours()
      }:${nowTime.getMinutes() < "10"
        ? `0${nowTime.getMinutes()}`
        : nowTime.getMinutes()
      }:00`;
    if (!version5) {
      LDate = toLocalISOString(new Date(LDate));
      FDate = toLocalISOString(new Date(FDate));
    }

    let strDate = fullSelectedReportData.startDate
      ? fullSelectedReportData.startDate
      : FDate;
    let endDate = fullSelectedReportData.endDate
      ? fullSelectedReportData.endDate
      : LDate;

    if (version5) {
      strDate = toLocalISOString(new Date(strDate));
      endDate = toLocalISOString(new Date(endDate));
    } else {
      strDate = new Date(strDate).toISOString().slice(0, -1);
      endDate = new Date(endDate).toISOString().slice(0, -1);
    }

    const pS = 100000;
    const fuelPrice = fullSelectedReportData?.fuelData;
    const duration = fullSelectedReportData?.tripDuration
      ? fullSelectedReportData?.tripDuration
      : fullSelectedReportData?.speedDurationOver;

    const speed = fullSelectedReportData?.overSpeed
      ? fullSelectedReportData?.overSpeed
      : fullSelectedReportData?.minimumSpeed;

    const apiFirstSlice = `${reportApi}?`;

    const apiMidSlice = fullSelectedReportData.name !== "Active_Devices_Summary_Key" ? `strDate=${strDate}&EndDate=${endDate}&vehIDs=${vehChecked?.map(
      (v) => v?.VehicleID
    )}&fuelPrice=${fuelPrice}` : `strDate=${strDate}&EndDate=${endDate}&accounts=${JSON.stringify(accounts)}`;
    // const apiEndSlice = `speed=${speed}&duration=${duration}&pageNumber=1&pageSize=${pS}&pagesCount=1000000`
    const apiEndSlice = `speed=${speed}&duration=${duration}`;
    return fullSelectedReportData.name !== "Active_Devices_Summary_Key" ? `${apiFirstSlice}&${apiMidSlice}&${apiEndSlice}` : `${apiFirstSlice}&${apiMidSlice}`;
  };

  const ShowReports = async (Show, name, fullSelectedReportData) => {
    if (Show === "Show") {
      // check if user clicked on the show button
      if (vehChecked.length || (accounts.length && name === "Active_Devices_Summary_Key")) {
        // check if there is a vehChecked
        setVehiclesError(""); // reset setVehiclesError
        setLoadingShowReport(true); // asign loadingShowReport state to true
        const id = Math.random().toString(32).substring(3);
        const api = handleApi(fullSelectedReportData, dateStatus);

        try {
          const { res } = await fetchReports(
            id,
            api,
            name,
            vehChecked,
            fullSelectedReportData
          );

          const lastItem = res.find((tab) => tab.id === id);

          setFullSelectedReportData((prev) => ({
            ...prev,
            id,
            name,

            data: [
              ...prev.data,
              {
                id,
                name,
                api: fullSelectedReportData.api,
                startDate: fullSelectedReportData.startDate,
                endDate: fullSelectedReportData.endDate,

                vehChecked,

              },
            ],
          }));

          setReportsTitleSelected(reportTitle);
          setReportsTitleSelectedId(id);

          setReportsDataSelected(lastItem);
        } catch (error) {
          if (!manuelclose) {
            toast.error("Error: " + error?.response?.data?.message);
          }
        } finally {
          setReportsOptionsShow(false);
          setLoadingShowReport(false);
        }

      } else if (!accounts.length && name === "Active_Devices_Summary_Key") {
        setVehiclesError("Please Select At Least one Account");
      } else {
        setVehiclesError("Please Select At Least one Vehicle");

      }
    } else if (Show === "updateCurrentActiveReportOptions") {

      if (vehChecked.length || accounts.length) {
        // check if there is a vehChecked
        setVehiclesError(""); // reset setVehiclesError
        setLoadingShowCurrentReport(reportsDataSelected.id); // asign loadingShowReport state to true
        const api =  handleApi(fullSelectedReportData, dateStatus);
        const query = new URL(`https://${api}`).searchParams
        const EndDate = query.get("EndDate")
        try {
          // const response = await axios.get(`${api}`);
          const response = name === "Active_Devices_Summary_Key" ? await axios.post(`dashboard/reports/activeAccountsVehiclesSummary`, { EndDate, accounts }) : await axios.get(`${api}`);


          setReportsDataSelected([]);
          setReportsTitleSelected("");
          setReportsTitleSelectedId(0);
          if (response.status === 200) {
            if (
              Object.hasOwn(response.data, "result") &&
              Array.isArray(response.data?.result)
            ) {
              setData_table((prev) => {
                let selectedReport = prev.find(
                  (item) => item.id === fullSelectedReportData.id
                );
                selectedReport?.data = response.data?.result;
                selectedReport?.api = api;
                selectedReport?.startDate = fullSelectedReportData.startDate;
                selectedReport?.endDate = fullSelectedReportData.endDate;
                selectedReport?.vehChecked = vehChecked?.map(
                  (v) => v?.VehicleID
                );

                fullSelectedReportData.pagination &&
                  setMainApi((prev) => {
                    // selectedApi.mainApi = api;
                    return prev;
                  });
                setReportsTitleSelected(selectedReport?.name);
                setReportsTitleSelectedId(selectedReport?.id);

                setReportsDataSelected(selectedReport);
                return prev;
              });
            } else {
              setData_table((prev) => {
                let selectedReport = prev.find(
                  (item) => item.id === fullSelectedReportData.id
                );
                selectedReport?.data = [];
                selectedReport?.api = "";
                selectedReport?.startDate = fullSelectedReportData.startDate;
                selectedReport?.endDate = fullSelectedReportData.endDate;
                selectedReport?.vehChecked = vehChecked?.map(
                  (v) => v?.VehicleID
                );

                fullSelectedReportData.pagination &&
                  setMainApi((prev) => {
                    // selectedApi.mainApi = api;
                    return prev;
                  });
                setReportsTitleSelected(selectedReport?.name);
                setReportsTitleSelectedId(selectedReport?.id);

                setReportsDataSelected(selectedReport);
                return prev;
              });
            }
          } else {
            toast.error(`Error:  ${response.data?.message}`);
          }
        } catch (error) {
          toast.error("Error: " + error.response?.data?.message);
        } finally {
          setLoadingShowCurrentReport(false);
        }
      } else if (accounts.length) {
        toast.error("Please Select At Least one Account");
        return;
      } else {
        toast.error("Please Select At Least one Vehicle");
        return;
      }

    }


  };

  // switching between taps
  const handleTap = (name, id, api, startDate, endDate, vehCh, accCh) => {    
    setReportApi(api);
    setVehChecked(vehCh);
    setFullSelectedReportData((prev) => ({
      ...prev,
      api,
      name,
      id,
      startDate,
      endDate,
    }));

    // filter Data_table by id
    let listFiltered = Data_table.find((item) => item.id === id);

    setFullSelectedReportData((prev) => ({
      ...prev,
      name,
      id,
      api: listFiltered.api,
    }));

    // reset reportsTitleSelectedId to 0
    setReportsTitleSelectedId(0);

    // reset loadingShowReport to false
    setLoadingShowReport(false);

    // add new selected reports's data to setReportsDataSelected
    setReportsDataSelected(listFiltered);

    // add selected report title to setReportsTitleSelected
    setReportsTitleSelected(name);

    // add selected report id to setReportsTitleSelectedId then return it
    setReportsTitleSelectedId(id);
  };

  // handle icon to open Reports List
  const handleCloseAndOpenReportsList = (status) =>
    setCloseAndOpenReportsList(status);

  const handleCloseTab = (e, id) => {
    e.stopPropagation();
    e.persist();

    // filter tabs not match the id
    // let reportTabsFiltered = reportTabs.filter((item) => item[0] !== id);
    let reportTabsFiltered = fullSelectedReportData?.data?.filter(
      (item) => item?.id !== id
    );
    // re set tabs filtered

    // filter Data_table with the last reportTabsFiltered tab
    let listFiltered = Data_table.filter((item) => item.id !== id);
    let lastListFiltered = listFiltered[listFiltered.length - 1];
    setData_table(listFiltered);

    if (lastListFiltered) {
      setReportApi(lastListFiltered.api);
      setFullSelectedReportData((prev) => ({
        ...prev,
        data: reportTabsFiltered,
        id: lastListFiltered.id,
      }));
    } else {
      setFullSelectedReportData((prev) => ({
        ...prev,
        data: reportTabsFiltered,
      }));
    }

    // check if listFiltered have elements if yes re set reportsDataSelected state
    // with new value of allData_tableOther filtered
    listFiltered.length
      ? setReportsDataSelected(lastListFiltered)
      : setReportsDataSelected([]);

    if (!listFiltered.length) {
      setReportsTitleSelected("");
      return setReportsTitleSelectedId(0);
    }
    // re set target title with new last reportTabsFiltered
    if (reportTabsFiltered[reportTabsFiltered.length - 1]) {
      setReportsTitleSelected(
        reportTabsFiltered[reportTabsFiltered.length - 1]?.name
      );
      setReportsTitleSelectedId(
        reportTabsFiltered[reportTabsFiltered.length - 1]?.id
      );
    }
  };
  //////////////////////
  const [dateChange, setDataChange] = useState(new Date("2023-1-1"));

  return (
    <div id="reports">
      <Joyride
        steps={steps}
        continuous
        callback={handleJoyrideCallback}
        run={tourState}
        stepIndex={stepIndex}
        showSkipButton
        locale={{
          skip: <span className={style["skip-tour"]}>{t("skip_tour")}</span>,
          back: <span className={style["skip-tour"]}>{t("back")}</span>,
          next: <span>{t("next")}</span>,
          last: <span>{t("last")}</span>,
        }}
        styles={{
          options: {
            primaryColor: "#1e8178",
            overlayColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 50000,
            width: "379px",
            // padding: "16px",
            backgroundColor: "#E0EAE9",
          },
        }}
      />
      <Card>
        <Card.Body>
          <div className={`position-relative h-100`}>
            <div
              className={`position-absolute ${style.DropdownChild} shadow-sm`}
              style={{
                opacity: closeAndOpenReportsList ? 1 : 0,
                zIndex: closeAndOpenReportsList ? 900 : -1,
                transition: "all 0.5s",
                backgroundColor: UseDarkmode("#151824", "rgb(235 235 235)"),
              }}
            >
              <SideBarReports
                handleCloseAndOpenReportsList={handleCloseAndOpenReportsList}
                reportsTitleSelected={reportsTitleSelected}
                setReportsTitleSelected={setReportsTitleSelected}
                setReportsOptionsShow={setReportsOptionsShow}
                setReportTitle={setReportTitle}
                setReportApi={setReportApi}
                setDateStatus={setDateStatus}
                setFullSelectedReportData={setFullSelectedReportData}
                setData_table={setData_table}
                setVehChecked={setVehChecked}
                setAccounts={setAccounts}
                dataSideBar={dataSideBar}
              // config={config}
              />
              {reportsOptionsShow ? (
                <div className="position-relative">
                  <ReportsOptions
                    show={reportsOptionsShow}

                    setAccounts={setAccounts}
                    onHide={ShowReports}
                    accounts={accounts}
                    reportsTitleSelected={reportsTitleSelected}
                    loadingShowReport={loadingShowReport}
                    dateStatus={dateStatus}
                    setVehiclesError={setVehiclesError}
                    vehiclesError={vehiclesError}
                    setFullSelectedReportData={setFullSelectedReportData}
                    fullSelectedReportData={fullSelectedReportData}
                    vehChecked={vehChecked}
                    setVehChecked={setVehChecked}
                    dateChange={dateChange}
                    setDataChange={setDataChange}
                  />
                </div>
              ) : null}
            </div>
          </div>

          <TableTaps
            fullSelectedReportData={fullSelectedReportData}
            reportsTitleSelectedId={reportsTitleSelectedId}
            handleTap={handleTap}
            // config={config}
            setAccounts={setAccounts}
            accounts={accounts}

            handleCloseTab={handleCloseTab}
            style={style}
            Data_table={Data_table}
            setData_table={setData_table}
            reportsDataSelected={reportsDataSelected}
            reportsTitleSelected={reportsTitleSelected}
            mainApi={mainApi}
            ///////////
            show={showCurrentActiveReportOptions}
            setShow={setShowCurrentActiveReportOptions}
            ShowReports={ShowReports}
            loadingShowCurrentReport={loadingShowCurrentReport}
            dateStatus={dateStatus}
            setVehiclesError={setVehiclesError}
            vehiclesError={vehiclesError}
            setFullSelectedReportData={setFullSelectedReportData}
            vehChecked={vehChecked}
            setVehChecked={setVehChecked}
            setDataChange={setDataChange}
            dateChange={dateChange}
            setDateStatus={setDateStatus}
          />
        </Card.Body>
      </Card>
      <button
        onClick={() => handleCloseAndOpenReportsList(true)}
        className={`${style.hamburger}`}
        style={{
          opacity: closeAndOpenReportsList ? 0 : 1,
          zIndex: closeAndOpenReportsList ? -1 : 888,
          transition: "all 0.2s",
        }}
      >
        <span
          className={`${style.hamburger__patty}`}
          style={{ background: UseDarkmode("#dedee2", "#151824") }}
        />
        <span
          className={`${style.hamburger__patty}`}
          style={{ background: UseDarkmode("#dedee2", "#151824") }}
        />
        <span
          className={`${style.hamburger__patty}`}
          style={{ background: UseDarkmode("#dedee2", "#151824") }}
        />
      </button>
    </div>
  );
};

export default Reports;

// translation ##################################
export async function getStaticProps({ locale }) {
  const filePath = path.join(process.cwd(), "data", "static.json");
  const jsonData = fs.readFileSync(filePath);
  const dataSideBar = JSON.parse(jsonData);

  return {
    props: {
      dataSideBar,
      ...(await serverSideTranslations(locale, [
        "reports",
        "preventiveMaintenance",
        "Table",
        "main",
        "Tour",
      ])),
    },
  };
}
