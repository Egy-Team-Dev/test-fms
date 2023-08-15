import { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import TextField from "@mui/material/TextField";
import { fetchAllReportsTypes } from "services/scheduledReports";
import { useSelector, useDispatch } from "react-redux";
import { addReport } from "lib/slices/addNewScheduledReport";
import { DateRangePicker, DatePicker } from "rsuite";
import { useTranslation } from "next-i18next";
import moment from "moment";

const Report = ({
  setHourValue,
  setDayValue,
  setKeyValue,
  setMonthDay,
  hourValue,
  dayValue,
  setReports,
  reportData,
  reports,
}) => {
  const { t } = useTranslation(["scheduledReports", "common", "main"]);
  const [reportsType, setReportsType] = useState([]);
  const [disapledReport, setDisapledReport] = useState([]);
  const [avilableReport, setAvilableReport] = useState([]);
  const [selectedOption, setSelectedOption] = useState("Daily");
  const dispatch = useDispatch();
  const { darkMode } = useSelector((state) => state.config);

  const options = [
    { value: "Daily", label: t("daily") },
    { value: "Weekly", label: t("weekly") },
    { value: "Monthly", label: t("monthly") },
  ];

  const ScheduleFrequency = {
    daily: 0,
    weekly: 1,
    monthly: 2,
  };

  const days = [
    { value: "saturday", label: t("saturday") },
    { value: "sunday", label: t("sunday") },
    { value: "monday", label: t("monday") },
    { value: "tuesday", label: t("tuesday") },
    { value: "wednesday", label: t("wednesday") },
    { value: "thursday", label: t("thursday") },
    { value: "friday", label: t("friday") },
  ];

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      background: darkMode ? "rgb(21,24,36)" : "",
      border: darkMode ? "1px solid #30384f" : "",
      "&:hover": {
        border: darkMode ? "1px solid #30384f" : "",
      },
      color: darkMode ? "#fff" : "",
    }),

    option: (providing, state) => ({
      ...providing,
      backgroundColor: darkMode ? "rgb(21,24,36)" : "",
      color: darkMode ? "#fff" : "",

      color: state.isDisabled && "#c8c8c8",
    }),

    placeholder: (based) => ({
      ...based,
      color: darkMode ? "#fff" : "",
    }),
    singleValue: (defaultStyles) => ({
      ...defaultStyles,
      color: darkMode ? "#fff" : "",
    }),

    menu: (provided) => ({
      ...provided,
      backgroundColor: darkMode ? "rgb(21,24,36)" : "#fff",
    }),
    multiValueLabel: (styles, { data }) => ({
      ...styles,
      background: darkMode ? "#222738" : "",
      color: darkMode ? "#fff" : "",
      borderRadius: "0",
    }),
    multiValueRemove: (styles, { data }) => ({
      ...styles,
      color: darkMode ? "#fff" : "",
      backgroundColor: darkMode ? "#222738" : "",
      borderRadius: "0",
    }),
  };

  useEffect(async () => {
    if (reportsType.length === 0) {
      const res = await fetchAllReportsTypes();
      const reporstOption = res.report;

      reporstOption.map((report) => {
        if (
          report.ReportID === 1 ||
          report.ReportID === 6 ||
          report.ReportID === 9 ||
          report.ReportID === 21
        ) {
          disapledReport.push({
            value: report.ReportTitle,
            label: t(`${report.ReportResourceTitle.replace(/\s/g, "_")}_key`),
            id: report.ReportID,
            isDisabled: true,
          });
        } else {
          avilableReport.push({
            value: report.ReportTitle,
            label: t(`${report.ReportResourceTitle.replace(/\s/g, "_")}_key`),
            id: report.ReportID,
          });
        }

        setReportsType([
          {
            label: t("Available_Report"),
            options: avilableReport,
          },
          {
            label: t("Coming_Soon"),
            options: disapledReport,
          },
        ]);
      });
    }
    if (reportData) {
      setSelectedOption(reportData?.data?.FrequencyTitle);

      setReports(reportData?.data?.reportName);

      // if (reportData.FrequencyTitle === "monthly") {
      //   setDayValue(reportData.Value);
      // }
    }
  }, [reportData?.data?.FrequencyTitle]);

  const handleChange = (e) => {
    setSelectedOption(e.value);
  };

  const handleSelectHour = (e) => {
    setHourValue(new Date(e).getUTCHours());
    // setHourValue(new Date(e).getHours());
  };

  const handleSelectDay = (e) => {
    setDayValue(e.value.substring(0, 3));
  };

  const handleMonthDay = (e) => {
    setMonthDay(new Date(e).toLocaleDateString().split("/")[1]);
  };

  const handleSelectReport = (e) => {
    setReports(e);
  };

  const renderSwitch = (param) => {
    setKeyValue(param);
    switch (param) {
      case "Daily":
        return (
          <>
            <p className="mb-1">{t("hour")}</p>
            <DatePicker
              className="w-100"
              format="HH"
              editable={false}
              onChange={handleSelectHour}
            />
          </>
        );
      case "Weekly":
        return (
          <div className="d-flex align-items-center gap-5">
            <div className="w-50">
              <p className="mb-1">{t("day")}</p>
              <Select
                styles={customStyles}
                onChange={handleSelectDay}
                placeholder={dayValue || t("Please_Choose_A_Day")}
                defaultValue={dayValue || ""}
                options={days}
              />
            </div>
            <div className="w-50">
              <p className="mb-1">{t("hour")}</p>
              <DatePicker
                className="w-100"
                format="HH"
                editable={false}
                onChange={handleSelectHour}
              />
            </div>
          </div>
        );
      case "Monthly":
        return (
          <div className="d-flex align-items-center gap-5">
            <div className="w-50">
              <p className="mb-1">{t("day")}</p>
              <DatePicker
                style={{ width: 220, input: { color: darkMode ? "#fff" : "" } }}
                onChange={handleMonthDay}
              />
            </div>
            <div className="w-50">
              <p className="mb-1">{t("hour")}</p>
              <DatePicker
                className="w-100"
                format="HH"
                editable={false}
                onChange={handleSelectHour}
              />
            </div>
          </div>
        );
      default:
        return (
          <>
            <p className="mb-1">{t("hour")}</p>
            <DatePicker
              className="w-100"
              format="HH"
              editable={false}
              onChange={handleSelectHour}
            />
          </>
        );
    }
  };

  return (
    <div className="d-flex flex-column align-items-center">
      <div className=" d-flex w-100 align-items-center gap-5 justify-content-center mb-5">
        <h3
          style={{
            width: "fit-content",
          }}
        >
          {t("Report_Included")}
        </h3>
        <Select
          styles={customStyles}
          className="w-50 scheduledReport_select"
          options={reportsType}
          isMulti
          onChange={handleSelectReport}
          isDisabled={reportData && true}
          placeholder={reportData?.data?.reportName || t("select")}
          defaultValue={reportData?.data?.reportName || ""}
        />
      </div>

      <div className="d-flex  w-100  align-items-center gap-5 justify-content-center ">
        <h3
          style={{
            alignSelf: "flex-start",
            width: "fit-content",
          }}
        >
          {t("Report_Frequency")}
        </h3>

        <div className="w-50">
          <div className="mb-3">
            <p className="mb-1">{t("Schedule_Frequency")}</p>
            <Select
              styles={customStyles}
              onChange={handleChange}
              placeholder={t("daily")}
              options={options}
              value={options[ScheduleFrequency[selectedOption]]}
              defaultValue={options[0]}
            />
          </div>

          <div className="mb-5">{renderSwitch(selectedOption)}</div>
        </div>
      </div>
    </div>
  );
};

export default Report;
