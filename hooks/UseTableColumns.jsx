import { useMemo } from "react";
import { useTranslation } from "next-i18next";
import moment, { months } from "moment";
import { param } from "jquery";
import {
  formatDuration,
  formatDurationV2,
  formatDurDates,
} from "helpers/helpers";

const UseTableColumns = () => {
  const { t } = useTranslation("Table");
  const handleFullName = (params) => {
    return params?.data?.FirstName
      ? `${params?.data?.FirstName}-${params?.data?.LastName}`
      : "No Driver";
  };

  const handlePeriod = (params) => {
    let strData = params?.data?.StrDate?.split("T")[0];
    let endData = params?.data?.EndDate?.split("T")[0];

    return `${strData} To: ${endData}`;
  };

  // Convert the UTC time to local time
  const handlePeriodLocal = (params) => {
    let strData = moment.utc(
      params?.data?.Period?.split(" TO ")[0],
      "YYYY-MM-DD HH:mm:ss"
    );
    let endData = moment.utc(
      params?.data?.Period?.split(" TO ")[1],
      "YYYY-MM-DD HH:mm:ss"
    );

    return `${strData.local().format("YYYY-MM-DD HH:mm:ss")} To: ${endData
      .local()
      .format("YYYY-MM-DD HH:mm:ss")}`;
  };

  function isFloat(n) {
    return n % 1 !== 0;
  }

  const handleToRoundNum = (data) => Math.round(data);

  const handleToFixed = (data) => (isFloat(data) ? data?.toFixed(2) : data);

  const handleToLocaleString = (data) => data?.toLocaleString();

  const handleToFixedDistance = (params) =>
    handleToFixed(+params?.data?.Distance);

  const handleToFixedFuleL = (params) => handleToRoundNum(params?.data?.fule_L);

  const handleToFixedFuel_SR = (params) =>
    +params?.data?.fuel_SR > 0.5
      ? handleToRoundNum(+params?.data?.fuel_SR)
      : Number.parseFloat(params?.data?.fuel_SR).toFixed(2);

  const handleToAvgSpeed = (params) => handleToFixed(+params?.data?.Speed);

  const handleToFixedAvgWeight = (params) => {
    let AvgWeight = isFloat(+params?.data?.AvgWeight)
      ? +params?.data?.AvgWeight?.toFixed(2)
      : +params?.data?.AvgWeight;
    return AvgWeight?.toLocaleString();
  };

  const handleMin_weight = (params) =>
    handleToLocaleString(+params?.data?.Min_weight);

  const handleMax_weight = (params) =>
    handleToLocaleString(+params?.data?.Max_weight);

  const handleZoneTime = (data) => {
    let history = data?.split("T")[0];
    let dateFull = data?.split("T")[1];
    let dateNow = dateFull?.split(".")[0];
    let morNight = dateNow?.split(":")[0] <= 12 ? "AM" : "PM";
    return `${history} ${dateNow} ${morNight}`;
  };

  const handleExitTime = (params) => handleZoneTime(params?.data?.ExitTime);

  const handleEnterTime = (params) => handleZoneTime(params?.data?.EnterTime);

  const handleZone_In_Time = (params) => handleZoneTime(params?.data?.zoneIn);
  const handleRecordDateTime = (params) =>
    handleZoneTime(params?.data?.zoneOut);
  const handleMongoDate = (value) =>
    moment
      .utc(value, ["YYYY-MM-DD HH:mm:ss", "DD-MM-YYYY HH:mm"])
      .local()
      .format("YYYY-MM-DD HH:mm");

  const getMapUrl = (lat, lng, address) =>
    `<a href='https://www.google.com/maps/search/?api=1&query=${lat},${lng}' target='_blank'>${address}</a>`;

  const createMapUrl = (lat, lng, address) => {
    var linkText = document.createTextNode(address);
    const resultElement = document.createElement("a");
    resultElement.appendChild(linkText);
    resultElement.href = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    resultElement.target = "_blank";
    return resultElement;
  };

  class MapRenderer {
    init(params) {
      this.eGui = createMapUrl(
        params.data.Latitude,
        params.data.Longitude,
        params.data.Address
      );
    }
    getGui() {
      return this.eGui;
    }
  }

  class TripStrMapRenderer {
    init(params) {
      this.eGui = createMapUrl(
        params.data.StrLat,
        params.data.StrLng,
        params.data.StrAddress
      );
    }
    getGui() {
      return this.eGui;
    }
  }
  class TripEndMapRenderer {
    init(params) {
      this.eGui = createMapUrl(
        params.data.StrLat,
        params.data.StrLng,
        params.data.StrAddress
      );
    }
    getGui() {
      return this.eGui;
    }
  }
  const handleSecondsDuration = (s) =>
    moment(new Date(s * 1e3))
      .utc()
      .format("HH:mm:ss");

  const handleinZone_Duration = (params) =>
    `0d:${params?.data?.inZone_Duration}`;

  const handleDAT_Score = (params) => `${params?.data?.DAT_Score}%`;

  const handleCalcUserVehiclesOfflineDays = (params) => {
    let days = Math.floor(
      (new Date(Date.now()) - new Date(params?.data?.LastUpdateTime)) /
        1000 /
        60 /
        60 /
        24
    );
    return days > 0 ? days : 0;
  };

  const handleDuringPeriod = (params) => `From ${params?.data?.DuringPeriod}`;

  const handleGroupName = (params) => {
    if (params?.data?.Group_Name) {
      return params?.data?.Group_Name === null
        ? "Ungrouped"
        : params?.data?.Group_Name;
    } else {
      return params?.data?.GroupName === null
        ? "Ungrouped"
        : params?.data?.GroupName;
    }
  };

  const handleBoolean = (params) => {
    return params?.data?.SeatBeltStatus ? "True" : "False";
  };

  const handleOfflineDays = (params) => {
    let days = Math.floor(
      (new Date(Date.now()) -
        new Date(
          moment(params?.data?.LastUpdateTime)
            .format()
            ?.split("+")[0]
            ?.split("T")[0]
        )) /
        1000 /
        60 /
        60 /
        24
    );
    return days;
  };

  const handleStartDay = (params) => {
    let strData = moment(params?.data?.StrDate).format("YYYY-MM-DD HH:mm:ss");
    return `${strData}`;
  };

  const handleEndDay = (params) => {
    let endData = moment(params?.data?.EndDate).format("YYYY-MM-DD HH:mm:ss");
    return `${endData}`;
  };

  const handleSeatBelt = (params) => {
    return params?.data?.SeatBeltStatus === "yes" ? "True" : "False";
  };
  const handleEngine = (params) => {
    return params?.data?.EngineStatus === "on" ? "True" : "False";
  };
  let filterParamsForDate = {
    comparator: (filterLocalDateAtMidnight, cellValue) => {
      const originalDate = new Date(cellValue);
      originalDate.setHours(0);
      originalDate.setMinutes(0);
      originalDate.setSeconds(0);
      originalDate.setMilliseconds(0);

      return new Date(originalDate) < filterLocalDateAtMidnight
        ? -1
        : new Date(originalDate) > filterLocalDateAtMidnight
        ? 1
        : 0;
    },
  };
  const Working_Hours_and_Mileage_Daily_BasisColumn = useMemo(
    () => [
      {
        headerName: `${t("Vehicle_Id")}`,
        field: "VehicleID",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("Plate_Number")}`,
        field: "PlateNumber",
      },
      {
        headerName: `${t("Display_Name")}`,
        field: "DisplayName",
      },
      {
        headerName: `${t("Period")}`,
        field: "Period",
        // valueGetter: handlePeriod,
        valueGetter: handlePeriodLocal,
      },
      {
        headerName: `${t("Distance")}`,
        field: "Distance",
        valueGetter: handleToFixedDistance,
      },
      {
        headerName: `${t("W.Hours")}`,
        field: "Duration",
        // valueGetter: (params) => (params?.data?.Duration / 3600).toFixed(2),
      },
      {
        headerName: `${t("Fule-L")}`,
        field: "fule_L",
        valueGetter: handleToFixedFuleL,
      },
      {
        headerName: `${t("F.Cost_SR")}`,
        field: "fuel_SR",
        valueGetter: handleToFixedFuel_SR,
      },
      {
        headerName: `${t("DriverName")}`,
        field: "DriverName",
      },
      {
        headerName: `${t("Group_Name")}`,
        field: "Group_Name",
        valueGetter: handleGroupName,
      },
    ],
    [t]
  );

  const Working_Hours_and_Mileage_PeriodColumn = useMemo(
    () => [
      {
        headerName: `${t("Vehicle_Id")}`,
        field: "VehicleID",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("Plate_Number")}`,
        field: "PlateNumber",
      },
      {
        headerName: `${t("Display_Name")}`,
        field: "DisplayName",
      },
      {
        headerName: `${t("Period")}`,
        field: "Period",
        valueGetter: handlePeriodLocal,
      },

      {
        headerName: `${t("Distance")}`,
        field: "Distance",
        valueGetter: handleToFixedDistance,
      },
      {
        headerName: `${t("W.Hours")}`,
        field: "Duration",
        // valueGetter: (params) => (params?.data?.Duration / 3600).toFixed(2),
      },
      {
        headerName: `${t("Fule-L")}`,
        field: "fule_L",
        valueGetter: handleToFixedFuleL,
      },
      {
        headerName: `${t("F.Cost_SR")}`,
        field: "fuel_SR",
        valueGetter: handleToFixedFuel_SR,
      },
      {
        headerName: `${t("DriverName")}`,
        field: "DriverName",
        // valueGetter: handleFullName,
      },
      {
        headerName: `${t("Group_Name")}`,
        field: "Group_Name",
        valueGetter: handleGroupName,
      },
    ],
    [t]
  );

  const Custom_Running_TimeColumn = useMemo(
    () => [
      {
        headerName: `${t("Vehicle_Id")}`,
        field: "VehicleID",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("Plate_Number")}`,
        field: "PlateNumber",
      },
      {
        headerName: `${t("Display_Name")}`,
        field: "DisplayName",
      },
      {
        headerName: `${t("Period")}`,
        field: "Period",
        valueGetter: handlePeriodLocal,
      },

      {
        headerName: `${t("Distance")}`,
        field: "Distance",
        valueGetter: handleToFixedDistance,
      },
      {
        headerName: `${t("W.Hours")}`,
        field: "Duration",
        // valueGetter: (params) => (params?.data?.Duration / 3600).toFixed(2),
      },
      {
        headerName: `${t("Fule-L")}`,
        field: "fule_L",
        valueGetter: handleToFixedFuleL,
      },
      {
        headerName: `${t("F.Cost_SR")}`,
        field: "fuel_SR",
        valueGetter: handleToFixedFuel_SR,
      },
      {
        headerName: `${t("DriverName")}`,
        field: "DriverName",
      },
      {
        headerName: `${t("Group_Name")}`,
        field: "Group_Name",
        valueGetter: handleGroupName,
      },
    ],
    [t]
  );

  const Trip_ReportColumn = useMemo(
    () => [
      {
        headerName: `${t("Vehicle_Id")}`,
        field: "VehicleID",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("Plate_Number")}`,
        field: "PlateNumber",
        valueGetter: (params) =>
          params?.data?.PlateNumber.length == 0
            ? "N/A"
            : params?.data?.PlateNumber,
      },

      {
        headerName: `${t("Display_Name")}`,
        field: "DisplayName",
      },
      {
        headerName: `${t("DriverID")}`,
        field: "DriverID",
      },
      {
        headerName: `${t("DriverName")}`,
        field: "DriverName",
      },
      {
        headerName: `${t("Start_Time")}`,
        field: "StrDate",
        valueGetter: (params) => handleMongoDate(params.data.StrDate),
        filter: "agDateColumnFilter",
        filterParams: filterParamsForDate,
      },
      {
        headerName: `${t("End_Time")}`,
        field: "EndDate",
        valueGetter: (params) => handleMongoDate(params.data.EndDate),
        filter: "agDateColumnFilter",
        filterParams: filterParamsForDate,
      },
      {
        headerName: `${t("Distance")}`,
        field: "Distance",
        valueGetter: handleToFixedDistance,
      },
      {
        headerName: `${t("Duration")}`,
        field: "Duration",
        // valueGetter: (params) =>
        //   formatDurationV2(params?.data?.Duration || 0 * 1e3, 5),
        // formatDuration(params?.data?.Duration || 0 * 1e3, 5),
      },
      {
        headerName: `${t("Fule-L")}`,
        field: "fule_L",
        valueGetter: handleToFixedFuleL,
      },
      {
        headerName: `${t("Fuel_Cost")}`,
        field: "fuel_SR",
        valueGetter: handleToFixedFuel_SR,
      },
      {
        headerName: `${t("Max_Speed")}`,
        field: "MaxSpeed",
        filter: "agNumberColumnFilter",
      },
      // {
      //   headerName: `${t("AVG_Speed")}`,
      //   field: "avgSpeed",
      //   filter: "agNumberColumnFilter",
      //   // valueGetter: handleToAvgSpeed,
      // },
      {
        headerName: `${t("Start_Address")}`,
        field: "StrAddress",
        cellRenderer: TripStrMapRenderer, //({ data }) => getMapUrl(data?.Latitude ?? 0, data?.Longitude ?? 0),
        cellRendererParams: {},
      },
      {
        headerName: `${t("End_Address")}`,
        field: "EndAddress",
        cellRenderer: TripEndMapRenderer, //({ data }) => getMapUrl(data?.Latitude ?? 0, data?.Longitude ?? 0),
        cellRendererParams: {},
      },
      {
        headerName: `${t("Start_Coordinate")}`,
        field: "startCoordinates",
        // valueGetter: ({ data }) =>
        //   `(${(data?.StrLat || 0).toFixed(5)}, ${(data?.StrLng || 0).toFixed(
        //     5
        //   )})`,
      },
      {
        headerName: `${t("End_Coordinate")}`,
        field: "endCoordinates",

        // valueGetter: ({ data }) =>
        //   `(${(data?.EndLat || 0).toFixed(5)}, ${(data?.EndLng || 0).toFixed(
        //     5
        //   )})`,
      },
    ],
    [t]
  );

  const Fuel_Summary_ReportColumn = useMemo(
    () => [
      {
        headerName: `${t("Vehicle_Id")}`,
        field: "VehicleID",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("Plate_Number")}`,
        field: "PlateNumber",
      },
      {
        headerName: `${t("Display_Name")}`,
        field: "DisplayName",
      },
      {
        headerName: `${t("Period")}`,
        field: "Period",
        valueGetter: handlePeriodLocal,
      },
      {
        headerName: `${t("Distance")}`,
        field: "Distance",
        valueGetter: handleToFixedDistance,
      },
      {
        headerName: `${t("Fule-L")}`,
        field: "fule_L",
        valueGetter: handleToFixedFuleL,
      },
      {
        headerName: `${t("Fuel_Cost")}`,
        field: "fuel_SR",
        valueGetter: handleToFixedFuel_SR,
      },
      {
        headerName: `${t("Group_Name")}`,
        field: "Group_Name",
        valueGetter: handleGroupName,
      },
    ],
    [t]
  );

  const Driver_LoggingColumn = useMemo(
    () => [
      {
        headerName: `${t("Vehicle_Id")}`,
        field: "VehicleID",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("DriverName")}`,
        field: "DriverName",
      },
      {
        headerName: `${t("DriverID")}`,
        field: "DriverID",
      },
      {
        headerName: `${t("Plate_Number")}`,
        field: "PlateNumber",
      },
      {
        headerName: `${t("Display_Name")}`,
        field: "DisplayName",
      },
      {
        headerName: `${t("Period")}`,
        field: "Period",
        valueGetter: handlePeriodLocal,
      },
      {
        headerName: `${t("Distance")}`,
        field: "Distance",
        valueGetter: handleToFixedDistance,
      },
      {
        headerName: `${t("Fule-L")}`,
        field: "fule_L",
        valueGetter: handleToFixedFuleL,
      },
      {
        headerName: `${t("Fuel_Cost")}`,
        field: "fuel_SR",
        valueGetter: handleToFixedFuel_SR,
      },
      {
        headerName: `${t("Group_Name")}`,
        field: "Group_Name",
        valueGetter: handleGroupName,
      },
    ],
    [t]
  );

  const Driving_Statistics_Per_PeriodColumn = useMemo(
    () => [
      {
        headerName: `${t("Vehicle_Id")}`,
        field: "VehicleID",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("Plate_Number")}`,
        field: "PlateNumber",
      },
      {
        headerName: `${t("DriverName")}`,
        field: "DriverName",
      },
      {
        headerName: `${t("DriverID")}`,
        field: "DriverID",
      },
      {
        headerName: `${t("Display_Name")}`,
        field: "DisplayName",
      },
      {
        headerName: `${t("Period")}`,
        field: "Period",
        valueGetter: handlePeriodLocal,
        filter: "agTextColumnFilter",
      },
      {
        headerName: `${t("Distance")}`,
        field: "Distance",
        valueGetter: handleToFixedDistance,
      },
      {
        headerName: `${t("W.Hours")}`,
        field: "W_Hours",
      },
      {
        headerName: `${t("Rapid_Acceleration")}`,
        field: "RapidAccel",
      },
      {
        headerName: `${t("Harsh_Braking_count")}`,
        field: "HarshBraking",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("Overspeed")}`,
        field: "OverSpeed",

        filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("Max_Speed")}`,
        field: "MaxSpeed",

        filter: "agNumberColumnFilter",
      },

      {
        headerName: `${t("DAT_Score")}`,
        field: "DAT_Score",
        cellStyle: (params) => {
          if (params?.data?.DAT_Score >= 85) {
            return { backgroundColor: "#32cd32" };
          } else if (params?.data?.DAT_Score >= 75) {
            return { backgroundColor: "#e5de00" };
          } else if (params?.data?.DAT_Score >= 50) {
            return { backgroundColor: "#f01e2c" };
          }
        },
        valueGetter: handleDAT_Score,
      },
      {
        headerName: `${t("Group_Name")}`,
        field: "Group_Name",
        valueGetter: handleGroupName,
      },
    ],
    [t]
  );

  const Zone_ActivityColumn = useMemo(
    () => [
      {
        headerName: `${t("Group")}`,
        field: "Group_Name",
        valueGetter: handleGroupName,
      },
      {
        headerName: `${t("Vehicle_Id")}`,
        field: "VehicleID",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("Geo_ID")}`,
        field: "GeoID",
      },
      {
        headerName: `${t("Geo_Name")}`,
        field: "GeoName",
      },
      {
        headerName: `${t("Plate_Number")}`,
        field: "PlateNumber",
      },
      {
        headerName: `${t("DriverName")}`,
        field: "DriverName",
      },
      {
        headerName: `${t("Display_Name")}`,
        field: "DisplayName",
      },
      // {
      //   headerName: `${t("Enter_Zone")}`,
      //   field: "StartAddress",
      //   valueGetter: (param) =>
      //     param?.data?.StartAddress ? param.data.StartAddress : "N/A",
      // },
      {
        headerName: `${t("Start_Date")}`,
        field: "EnterTime",
        valueGetter: (params) => handleMongoDate(params?.data?.StartDate),
        filter: "agDateColumnFilter",
        filterParams: filterParamsForDate,
      },
      // {
      //   headerName: `${t("Exit_Zone")}`,
      //   field: "EndAddress",
      //   valueGetter: (param) =>
      //     param?.data?.EndAddress ? param.data.EndAddress : "N/A",
      // },
      {
        headerName: `${t("Finish_Date")}`,
        field: "ExitTime",
        valueGetter: (params) => handleMongoDate(params?.data?.FinishDate),
        filter: "agDateColumnFilter",
        filterParams: filterParamsForDate,
      },
      {
        headerName: `${t("Duration")}`,
        field: "Duration",
        // valueGetter: (params) =>
        //   formatDurationV2(params?.data?.Duration || 0 * 1e3, 5),

        // formatDurDates(params?.data?.EnterTime, params?.data?.ExitTime, 5),
      },
    ],
    [t]
  );

  const Geofences_LogColumn = useMemo(
    () => [
      {
        headerName: `${t("Group_Name")}`,
        field: "Group_Name",
        valueGetter: handleGroupName,
      },
      {
        headerName: `${t("Vehicle_Id")}`,
        field: "VehicleID",
        // filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("Plate_Number")}`,
        field: "PlateNumber",
      },
      {
        headerName: `${t("Display_Name")}`,
        field: "DisplayName",
      },
      {
        headerName: `${t("Geo_ID")}`,
        field: "GeoID",
      },
      {
        headerName: `${t("Geo_Name")}`,
        field: "GeoName",
      },
      {
        headerName: `${t("Operation")}`,
        field: "Operation",
      },
      {
        headerName: `${t("Time")}`,
        field: "RecordDateTime",
        valueGetter: ({ data }) => handleMongoDate(data?.RecordDateTime),
        filter: "agDateColumnFilter",
        filterParams: filterParamsForDate,
      },
      {
        headerName: `${t("Coordinates")}`,
        field: "coordinates",
      },
      // {
      //   headerName: `${t("Speed")}`,
      //   field: "Speed",
      //   // filter: "agNumberColumnFilter",
      // },
    ],
    [t]
  );

  const Zones_Summary_ActivitiesColumn = useMemo(
    () => [
      {
        headerName: `${t("Zone_Name")}`,
        field: "geo1geoname",
      },
      {
        headerName: `${t("Number_of_Vehicle")}`,
        field: "numberofVehicle",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("Trip_count")}`,
        field: "countTrips",
      },
      {
        headerName: `${t("Duration")}`,
        field: "Duration",
        // valueGetter: (params) =>
        //   formatDurationV2(params?.data?.Duration || 0 * 1e3, 5),
      },
      {
        headerName: `${t("During_Period")}`,
        field: "Period",
        valueGetter: handlePeriodLocal,
      },
    ],
    [t]
  );

  const Zones_Summary_Activities_DailyColumn = useMemo(
    () => [
      // {
      //   headerName: `${t("Vehicle_Id")}`,
      //   field: "VehicleID",
      // },
      {
        headerName: `${t("Zone_Name")}`,
        field: "geo1geoname",
      },
      {
        headerName: `${t("Number_of_Vehicle")}`,
        field: "numberofVehicle",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("Trip_count")}`,
        field: "countTrips",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("Duration")}`,
        field: "Duration",
        // valueGetter: (params) =>
        //   formatDuration(params?.data?.Duration || 0 * 1e3, 5),
      },
      {
        headerName: `${t("During_Period")}`,
        field: "Period",
        valueGetter: handlePeriodLocal,
      },
    ],
    [t]
  );

  const In_Zone_DetailsColumn = useMemo(
    () => [
      {
        headerName: `${t("Group_Name")}`,
        field: "Group_Name",
      },
      {
        headerName: `${t("Vehicle_Id")}`,
        field: "VehicleID",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("Plate_Number")}`,
        field: "PlateNumber",
      },
      {
        headerName: `${t("Display_Name")}`,
        field: "DisplayName",
      },
      {
        headerName: `${t("Geo_ID")}`,
        field: "GeoId",
      },
      {
        headerName: `${t("Zone_Name")}`,
        field: "GeoName",
      },
      {
        headerName: `${t("Zone_In_Time")}`,
        field: "zoneIn",
        valueGetter: ({ data }) => handleMongoDate(data?.zoneIn),
        filter: "agDateColumnFilter",
        filterParams: filterParamsForDate,
      },
      {
        headerName: `${t("Zone_Out_time")}`,
        field: "zoneOut",
        valueGetter: ({ data }) => handleMongoDate(data?.zoneOut),
        filter: "agDateColumnFilter",
        filterParams: filterParamsForDate,
      },
      {
        headerName: `${t("In_Zone_Duration")}`,
        field: "inZone_Duration",
        valueGetter: (params) =>
          formatDurDates(params?.data?.zoneIn, params?.data?.zoneOut, 5),
        // valueGetter: handleinZone_Duration,
      },
    ],
    [t]
  );

  const In_Zone_SummaryColumn = useMemo(
    () => [
      {
        headerName: `${t("Group_Name")}`,
        field: "Group_Name",
      },
      {
        headerName: `${t("Vehicle_Id")}`,
        field: "VehicleID",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("Plate_Number")}`,
        field: "PlateNumber",
      },
      {
        headerName: `${t("Display_Name")}`,
        field: "DisplayName",
      },
      {
        headerName: `${t("Geo_ID")}`,
        field: "GeoID",
      },
      {
        headerName: `${t("Zone_Name")}`,
        field: "GeoName",
      },
      {
        headerName: `${t("count_Trips")}`,
        field: "countTrips",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("In_Zone_Duration")}`,
        field: "TotalINTime",
        valueGetter: (params) =>
          formatDurDates(params?.data?.zoneIn, params?.data?.zoneOut, 5),
      },
    ],
    [t]
  );

  const Weight_Statistics_ReportColumn = useMemo(
    () => [
      {
        headerName: `${t("Vehicle_Id")}`,
        field: "VehicleID",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("Plate_Number")}`,
        field: "PlateNumber",
      },
      {
        headerName: `${t("Display_Name")}`,
        field: "DisplayName",
      },

      {
        headerName: `${t("Time")}`,
        field: "Time",
        valueGetter: ({ data }) => handleMongoDate(data?.Time),
      },

      {
        headerName: `${t("Avg_weight")}`,
        field: "AvgWeight",
        valueGetter: handleToFixedAvgWeight,
      },

      {
        headerName: `${t("Group_Name")}`,
        field: "Group_Name",
        valueGetter: handleGroupName,
      },
    ],
    [t]
  );

  const Weight_Detailed_ReportColumn = useMemo(
    () => [
      {
        headerName: `${t("Group_Name")}`,
        field: "Group_Name",
        valueGetter: handleGroupName,
      },
      {
        headerName: `${t("Vehicle_Id")}`,
        field: "VehicleID",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("Plate_Number")}`,
        field: "PlateNumber",
      },
      {
        headerName: `${t("Display_Name")}`,
        field: "DisplayName",
      },
      {
        headerName: `${t("Time")}`,
        field: "Time",
        valueGetter: ({ data }) => handleMongoDate(data?.Time),
      },
      {
        headerName: `${t("weight")}`,
        field: "weight",
      },
      {
        headerName: `${t("Voltage_Reading")}`,
        field: "VoltageReading",
      },
      {
        headerName: `${t("Speed")}`,
        field: "Speed",
        filter: "agNumberColumnFilter",
      },

      {
        headerName: `${t("Speed_Limit")}`,
        field: "speedLimit",
      },
      {
        headerName: `${t("Vehicle_Status")}`,
        field: "VehicleStatus",
        valueGetter: ({ data }) =>
          data?.VehicleStatus ? data?.VehicleStatus : "N/A",
      },
    ],
    [t]
  );

  const Temperature_Summary_ReportColumn = useMemo(
    () => [
      {
        headerName: `${t("Vehicle_Id")}`,
        field: "VehicleID",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("Plate_Number")}`,
        field: "PlateNumber",
      },
      {
        headerName: `${t("Display_Name")}`,
        field: "DisplayName",
      },
      // {
      //   headerName: `${t("Serial_Number")}`,
      //   field: "SerialNumber",
      // },
      {
        headerName: `${t("Period")}`,
        field: "Period",
        valueGetter: handlePeriodLocal,
      },
      {
        headerName: `${t("Max_T1")}`,
        field: "MaxT1",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("Min_T1")}`,
        field: "MinT1",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("Max_T2")}`,
        field: "MaxT2",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("Min_T2")}`,
        field: "MinT2",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("Max_T3")}`,
        field: "MaxT3",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("Min_T3")}`,
        field: "MinT3",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("Max_T4")}`,
        field: "MaxT4",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("Min_T4")}`,
        field: "MinT4",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("AVG_T3")}`,
        field: "avgT3",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("Avg_T4")}`,
        field: "avgT4",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("Max_Hum")}`,
        field: "MaxHum",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("Min_Hum")}`,
        field: "MinHum",
        filter: "agNumberColumnFilter",
      },
    ],
    [t]
  );

  const Temperature_Detailed_ReportColumn = useMemo(
    () => [
      {
        headerName: `${t("Group_Name")}`,
        field: "Group_Name",
      },
      {
        headerName: `${t("Vehicle_Id")}`,
        field: "VehicleID",
      },
      {
        headerName: `${t("Plate_Number")}`,
        field: "PlateNumber",
      },
      {
        headerName: `${t("Display_Name")}`,
        field: "DisplayName",
      },

      {
        headerName: `${t("Record_Date_Time")}`,
        field: "RecordDateTime",
        valueGetter: ({ data }) => handleMongoDate(data?.RecordDateTime),
        filter: "agDateColumnFilter",
        filterParams: filterParamsForDate,
      },
      {
        headerName: `${t("Speed")}`,
        field: "Speed",
      },
      {
        headerName: `${t("Temp1")}`,
        field: "Temp1",
      },
      {
        headerName: `${t("Temp2")}`,
        field: "Temp2",
      },
      {
        headerName: `${t("Temp3")}`,
        field: "Temp3",
      },
      {
        headerName: `${t("Temp4")}`,
        field: "Temp4",
      },
      {
        headerName: `${t("Hum1")}`,
        field: "Hum1",
      },
      {
        headerName: `${t("Hum2")}`,
        field: "Hum2",
      },
      {
        headerName: `${t("Hum3")}`,
        field: "Hum3",
      },
      {
        headerName: `${t("Hum4")}`,
        field: "Hum4",
      },
      {
        headerName: `${t("Vehicle_Status")}`,
        field: "VehicleStatus",
      },
      {
        headerName: `${t("Address")}`,
        field: "Address",
      },
    ],
    [t]
  );

  const Speed_Over_Duration_ReportColumn = useMemo(
    () => [
      {
        headerName: `${t("Vehicle_Id")}`,
        field: "VehicleID",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("Display_Name")}`,
        field: "DisplayName",
      },
      {
        headerName: `${t("Group_Name")}`,
        field: "Group_Name",
        valueGetter: handleGroupName,
      },
      {
        headerName: `${t("Plate_Number")}`,
        field: "PlateNumber",
      },
      {
        headerName: `${t("Start_Time")}`,
        field: "StrDate",
        valueGetter: ({ data }) => handleMongoDate(data?.StrDate),
        filter: "agDateColumnFilter",
        filterParams: filterParamsForDate,
      },
      {
        headerName: `${t("End_Time")}`,
        field: "EndDate",
        valueGetter: ({ data }) => handleMongoDate(data?.EndDate),
        filter: "agDateColumnFilter",
        filterParams: filterParamsForDate,
      },
      {
        headerName: `${t("Max_Speed")}`,
        field: "MaxSpeed",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("Start_Address")}`,
        field: "StrAddress",
        cellRenderer: TripStrMapRenderer, //({ data }) => getMapUrl(data?.Latitude ?? 0, data?.Longitude ?? 0),
        cellRendererParams: {},
      },
      {
        headerName: `${t("End_Address")}`,
        field: "EndAddress",
        cellRenderer: TripEndMapRenderer, //({ data }) => getMapUrl(data?.Latitude ?? 0, data?.Longitude ?? 0),
        cellRendererParams: {},
      },
      {
        headerName: `${t("Start_Coordinate")}`,
        valueGetter: ({ data }) =>
          `(${(data?.StrLat || 0).toFixed(5)}, ${(data?.StrLng || 0).toFixed(
            5
          )})`,
      },
      {
        headerName: `${t("End_Coordinate")}`,
        valueGetter: ({ data }) =>
          `(${(data?.EndLat || 0).toFixed(5)}, ${(data?.EndLng || 0).toFixed(
            5
          )})`,
      },
      {
        headerName: `${t("Duration")}`,
        // valueGetter: ({ data }) => handleSecondsDuration(data?.Duration),
        valueGetter: (params) =>
          formatDurDates(params?.data?.StrDate, params?.data?.EndDate, 5),
      },
      {
        headerName: `${t("Duration_in_Seconds")}`,
        field: "Duration",
        valueGetter: (params) => {
          try {
            return Math.round(
              moment(params?.data?.EndDate).diff(
                moment(params?.data?.StrDate)
              ) / 1e3
            );
          } catch (e) {
            return 0;
          }
        },
        filter: "agNumberColumnFilter",
      },
      {
        headerName: `${t("Count")}`,
        field: "Count",
        filter: "agNumberColumnFilter",
      },
    ],
    [t]
  );

  const Over_Speed_ReportColumn = useMemo(
    () => [
      {
        headerName: `${t("Vehicle_Id")}`,
        field: "VehicleID",
      },
      {
        headerName: `${t("Display_Name")}`,
        field: "DisplayName",
      },
      {
        headerName: `${t("Group_Name")}`,
        field: "Group_Name",
        valueGetter: handleGroupName,
      },
      {
        headerName: `${t("Plate_Number")}`,
        field: "PlateNumber",
      },
      {
        headerName: `${t("Time")}`,
        field: "RecordDateTime",
        valueGetter: ({ data }) => handleMongoDate(data?.RecordDateTime),
        filter: "agDateColumnFilter",
        filterParams: filterParamsForDate,
      },

      {
        headerName: `${t("Over_Speed")}`,
        filter: "agNumberColumnFilter",
        field: "OverSpeed",
      },
      {
        headerName: `${t("Address")}`,
        field: "Address",
        cellRenderer: MapRenderer, //({ data }) => getMapUrl(data?.Latitude ?? 0, data?.Longitude ?? 0),
        cellRendererParams: {},
      },
    ],
    [t]
  );

  const Offline_Vehicles_ReportColumn = useMemo(
    () => [
      {
        headerName: `${t("Group_Name")}`,
        field: "GroupName",
        valueGetter: handleGroupName,
      },
      {
        headerName: `${t("Vehicle_Id")}`,
        field: "VehicleID",
      },
      {
        headerName: `${t("Display_Name")}`,
        field: "DisplayName",
      },
      {
        headerName: `${t("Plate_Number")}`,
        field: "PlateNumber",
      },

      {
        headerName: `${t("Last_Online_Date")}`,
        field: "LastUpdateTime",
        valueGetter: ({ data }) => handleMongoDate(data?.LastUpdateTime),
        filter: "agDateColumnFilter",
        filterParams: filterParamsForDate,
      },
      {
        headerName: `${t("Last_Location")}`,
        field: "Address",
      },
      {
        headerName: `${t("Offline_(Days)")}`,
        field: "OfflineDays",
        // valueGetter: handleOfflineDays,
        cellStyle: (params) => {
          if (+params.data.OfflineDays > 2) {
            //mark police cells as red
            return { backgroundColor: "#ffc0cb" };
          }
          return null;
        },
      },
    ],
    [t]
  );

  const User_VehiclesColumn = useMemo(
    () => [
      {
        headerName: `${t("Group_Name")}`,
        field: "Group_Name",
        valueGetter: handleGroupName,
      },
      {
        headerName: `${t("Vehicle_Id")}`,
        field: "VehicleID",
      },
      {
        headerName: `${t("Display_Name")}`,
        field: "DisplayName",
      },
      {
        headerName: `${t("Plate_Number")}`,
        field: "PlateNumber",
      },
      // {
      //   headerName: `${t("Serial_Number")}`,
      //   field: "SerialNumber",
      // },
      {
        headerName: `${t("Last_Online_Date")}`,
        field: "LastUpdateTime",
        valueGetter: ({ data }) => handleMongoDate(data?.LastUpdateTime),
        filter: "agDateColumnFilter",
        filterParams: filterParamsForDate,
      },
      {
        headerName: `${t("Last_Location")}`,
        field: "Address",
      },
      {
        headerName: `${t("Offline_(Days)")}`,
        field: "offlineDays",
        cellStyle: (params) => {
          if (params?.data?.offlineDays > 1) {
            //mark police cells as red
            return { backgroundColor: "#ffc0cb" };
          }
          return null;
        },
      },
    ],
    [t]
  );

  const Vehicle_Idling_and_Parking_ReportsColumn = useMemo(
    () => [
      {
        headerName: `${t("Vehicle_Id")}`,
        field: "VehicleID",
      },
      {
        headerName: `${t("Plate_Number")}`,
        field: "PlateNumber",
      },
      {
        headerName: `${t("Group_Name")}`,
        field: "Group_Name",
      },
      {
        headerName: `${t("Display_Name")}`,
        field: "DisplayName",
      },
      {
        headerName: `${t("Status")}`,
        field: "Status",
      },
      {
        headerName: `${t("Duration")}`,
        field: "Duration",
        // valueGetter: (params) =>
        //   formatDurationV2(params?.data?.Duration || 0 * 1e3, 5),
      },
      {
        headerName: `${t("Start_Time")}`,
        field: "StrDate",
        valueGetter: ({ data }) => handleMongoDate(data?.StrDate),
        filter: "agDateColumnFilter",
        filterParams: filterParamsForDate,
      },
      {
        headerName: `${t("End_Time")}`,
        field: "EndDate",
        valueGetter: ({ data }) => handleMongoDate(data?.EndDate),
        filter: "agDateColumnFilter",
        filterParams: filterParamsForDate,
      },
      {
        headerName: `${t("Start_Address")}`,
        field: "StrAdd",
      },
      {
        headerName: `${t("End_Address")}`,
        field: "EndAdd",
      },
    ],
    [t]
  );

  const Status_ReportColumn = useMemo(() => [
    {
      headerName: `${t("Vehicle_Id")}`,
      field: "VehicleID",
    },
    { headerName: `${t("DisplayName")}`, field: "DisplayName" },
    { headerName: `${t("PlateNumber")}`, field: "PlateNumber" },
    {
      headerName: `${t("Group_Name")}`,
      field: "Group_Name",
      valueGetter: handleGroupName,
    },
    {
      headerName: `${t("RecordDateTime")}`,
      field: "RecordDateTime",
      valueGetter: ({ data }) => handleMongoDate(data?.RecordDateTime),
      filter: "agDateColumnFilter",
      filterParams: filterParamsForDate,
    },
    { headerName: `${t("Latitude")}`, field: "Latitude" },
    { headerName: `${t("Longitude")}`, field: "Longitude" },
    { headerName: `${t("Address")}`, field: "Address" },
    { headerName: `${t("DriverName")}`, field: "DriverName" },
    // { headerName: `${t("FirstName")}`, field: "FirstName" },
    // { headerName: `${t("LastName")}`, field: "LastName" },
    {
      headerName: `${t("SeatBeltStatus")}`,
      field: "SeatBeltStatus",
      valueGetter: handleSeatBelt,
    },
    {
      headerName: `${t("EngineStatus")}`,
      field: "EngineStatus",
      valueGetter: handleEngine,
    },
    { headerName: `${t("VehicleStatus")}`, field: "VehicleStatus" },
    // { headerName: `${t("Direction")}`, field: "Direction" },
    { headerName: `${t("Speed")}`, field: "Speed" },
    { headerName: `${t("Mileage")}`, field: "Mileage" },
    {
      headerName: `${t("door_status")}`,
      field: "DoorStatus",
    },
  ]);

  const Active_Devices_Summary = useMemo(() => [
    {
      headerName: `${t("Account_ID")}`,
      field: "accountID",
      width: 350,
    },
    { headerName: `${t("Account_Name")}`, field: "accountName", width: 350 },
    {
      headerName: `${t("Offline_Count")}`,
      field: "offlineOnlineResult.offline",
    },
    {
      headerName: `${t("Online_Count")}`,
      field: "offlineOnlineResult.online",
      width: 350,
    },

    {
      headerName: `${t("Total_Count")}`,
      field: "offlineOnlineResult.total",
      width: 350,
    },
  ]);

  return {
    Working_Hours_and_Mileage_Daily_BasisColumn,
    Working_Hours_and_Mileage_PeriodColumn,
    Custom_Running_TimeColumn,
    Trip_ReportColumn,
    Fuel_Summary_ReportColumn,
    Driver_LoggingColumn,
    Driving_Statistics_Per_PeriodColumn,
    Zone_ActivityColumn,
    Geofences_LogColumn,
    Zones_Summary_ActivitiesColumn,
    Zones_Summary_Activities_DailyColumn,
    In_Zone_DetailsColumn,
    In_Zone_SummaryColumn,
    Weight_Statistics_ReportColumn,
    Weight_Detailed_ReportColumn,
    Temperature_Summary_ReportColumn,
    Temperature_Detailed_ReportColumn,
    Speed_Over_Duration_ReportColumn,
    Over_Speed_ReportColumn,
    Offline_Vehicles_ReportColumn,
    User_VehiclesColumn,
    Vehicle_Idling_and_Parking_ReportsColumn,
    Status_ReportColumn,
    Active_Devices_Summary,
  };
};

export default UseTableColumns;
