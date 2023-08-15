﻿import moment from "moment";
import { Saferoad } from "./leafletchild";
import * as translation from "../../public/assets/map-translation.js";
export var Resources = getResources();

// export var popupData = getPopupData();

function getResources() {
  var Icons = {
    RecordDateTime: "fas fa-clock",
    Speed: "fas fa-tachometer-alt",
    Direction: "fab fa-safari",
    EngineStatus: "fab fa-whmcs",
    VehicleStatus: "fas fa-wifi",
    Mileage: "fas fa-expand-alt",
    Duration: "far fa-hourglass",
    DriverUrl: "far fa-user",
    GroupName: "fas fa-users-cog",
    PlateNumber: "fab fa-deploydog",
    SimCardNumber: "fas fa-sim-card",
    SerialNumber: "fas fa-barcode",
    IgnitionStatus: "fas fa-plug",
    weightreading: "fas fa-weight-hanging",
    Temp: "fas fa-temperature-low",
    HUM: "fas fa-wind",
    Address: "fas fa-map-marked-alt",
    VehicleID: "fas fa-key",
    SeatBelt: "fa-solid fa-user-shield",
    LangLat: "fa-solid fa-location-dot",
    Invalid: "fa-solid fa-list-check",
  };
  var resources = {
    Tips: {
      RecordDateTime: "Record Date",
      Speed: "Speed",
      Direction: "Direction",
      EngineStatus: "Engine Status",
      VehicleStatus: "Vehicle Status",
      Mileage: "Mileage",
      Duration: "Duration",
      DriverUrl: "Driver Name",
      GroupName: "Group Name",
      PlateNumber: "Plate Number",
      SimCardNumber: "Sim Number",
      SerialNumber: "Serial Number",
      IgnitionStatus: "Ignition Control",
      weightreading: "Actual Weight",
      Temp: "Temperature Sensor 1",
      HUM: "Humidity Sensor 1",
      Address: "Address",
      NA: "Not Available",
      DriverNA: "No Driver",
      AllGroups: "All Groups",
      SeatBelt: "Seat Belt",
    },
    Icons: Icons,
    Actions: {
      Title: "Options",
      FullHistory: "Full History PlayBack",
      EditInformation: "Edit Information",
      CalibrateMileage: "Calibrate Mileage",
      CalibrateWeight: "Calibrate Weight",
      ShareLocation: "Share Location",
      SubmitCommand: "Submit New Command",
      DisableVehicle: "Disable Vehicle",
      EnableVehicle: "Enable Vehicle",
    },
    guides: {
      SelectPOint: "Please Select A point",
      NameRequired: "Please Enter the name",
      Processing: "Processing",
    },
    Status: {
      EngineOn: "On",
      EngineOff: "Off",
      VehicleOffline: "Offline",
      VehicleOverSpeed: "Over Speed",
      VehicleSleeping: "Sleep Mode",
      VehicleOverStreetSpeed: "OverStreet Speed",
      VehicleStopped: "Stopped",
      VehicleRunning: "Running",
      VehicleIdle: "Idle",
      VehicleInvalid: "Invalid Status",
      IgnitionEnabled: "Installed",
      IgnitionDisabled: "Not Installed",
    },
    paymentLabels: {
      cardNumber: "Card Number",
      expirationDate: "MM/YY",
      cvv: "CVV",
      cardHolder: "Card Holder Name",
    },
  };

  //   if ("body".attr("data-lang") == "ar") {
  //     resources = {
  //       Tips: {
  //         RecordDateTime: "تاريخ الحركة",
  //         Speed: "السرعة",
  //         Direction: "الاتجاه",
  //         EngineStatus: "حالة المحرك",
  //         VehicleStatus: "حالة المركبات",
  //         Mileage: "الاميال (كم)",
  //         Duration: "المدة",
  //         DriverUrl: "اسم السائق",
  //         GroupName: "اسم المجموعة",
  //         PlateNumber: "رقم اللوحة",
  //         SimCardNumber: "الرقم التسلسلي للشريحة",
  //         SerialNumber: "الرقم التسلسلي للجهاز",
  //         IgnitionStatus: "جهاز تحكم التشغيل",
  //         weightreading: "الوزن الفعلي",
  //         Temp: "حساس الحرارة 1",
  //         HUM: "حساس الرطوبة 1",
  //         Address: "العنوان",
  //         NA: "غير متاح",
  //         DriverNA: "غير معرف",
  //         AllGroups: "الجميع",
  //       },
  //       Icons: Icons,
  //       Actions: {
  //         Title: "خيارات",
  //         FullHistory: "تتبع التاريخ كاملا للمركبة",
  //         EditInformation: "تحرير معلومات المركبة",
  //         CalibrateMileage: "إعادة تعيين الأميال",
  //         CalibrateWeight: "إعادة تعين اعدادات الوزن",
  //         ShareLocation: "مشاركة الموقع",
  //         SubmitCommand: "تقديم امر جديد",
  //         DisableVehicle: "ايقاف التشغيل",
  //         EnableVehicle: "السماح بالتشغيل",
  //       },
  //       guides: {
  //         SelectPOint: "الرجاء اختيار الموقع",
  //         NameRequired: "الرجاء ادخال الاسم",
  //         Processing: "تحميل",
  //       },
  //       Status: {
  //         EngineOn: "تعمل",
  //         EngineOff: "لا تعمل",
  //         VehicleOffline: "مطفئة",
  //         VehicleOverSpeed: "تجاوز السرعة",
  //         VehicleOverStreetSpeed: "تجاوز سرعة الطريق",
  //         VehicleStopped: "متوقفة",
  //         VehicleRunning: "تسير",
  //         VehicleIdle: "سكون",
  //         VehicleInvalid: "حالة مجهولة",
  //         IgnitionEnabled: "مركب",
  //         IgnitionDisabled: "غير مركب",
  //       },
  //       paymentLabels: {
  //         cardNumber: "رقم البطاقة",
  //         expirationDate: "MM/YY",
  //         cvv: "CVV",
  //         cardHolder: "اسم حامل البطاقة",
  //       },
  //     };
  //   }

  return resources;
}

const getIconPopup = (id) => Resources.Icons[id];

const getAvg = (vals, navalue, dev = 1) => {
  vals = vals.filter((x) => x && x != navalue && !isNaN(x));
  let avg = !vals.length
    ? navalue
    : vals.reduce((a, b) => a + b, 0) / vals.length;
  return avg == navalue ? navalue : avg / dev;
};

// This Function of all data in popup in track and historyplayback pages
export function popupData(locInfo) {
  var currentLocale;
  let lang;
if (window.location.pathname.split("/")[1] === "ar") {
  currentLocale = translation.mapArabic;
  lang = "ar/";
} else if (window.location.pathname.split("/")[1] === "fr") {
  currentLocale = translation.mapFrench;
  lang = "fr/";
} else if (window.location.pathname.split("/")[1] === "es") {
  currentLocale = translation.mapSpanish;
  lang = "es/";
} else {
  currentLocale = translation.mapEnglish;
  lang = "";
}
  var driver = () =>
    locInfo?.DriverID != null
      ? `<span> ${
          !isNaN(locInfo?.DriverID)
            ? locInfo?.DriverName
            : `<i class="fa-solid fa-key"></i>: ${locInfo?.DriverID.substring(
                0,
                10
              ).padEnd(13, ".")}`
        }</span>`
      : Resources.Tips.DriverNA;

  return [
    {
      id: "RecordDateTime",
      Tooltip: currentLocale.Record_Date,
      val: moment(locInfo?.RecordDateTime)
        .utc()
        .local()
        .format("LL hh:mm:ss a"),
      icon: getIconPopup("RecordDateTime"),
    },
    {
      id: "VehicleID",
      Tooltip: currentLocale.Vehicle_ID,
      val: locInfo?.VehicleID,
      unit: "",
      icon: getIconPopup("VehicleID"),
    },
    {
      id: "Speed",
      Tooltip: currentLocale.Speed,
      val: locInfo?.Speed,
      unit: "km/h",
      icon: getIconPopup("Speed"),
    },
    {
      id: "Direction",
      Tooltip: currentLocale.Direction,
      val: locInfo?.Direction ?? "Unknown" + " &deg;",
      icon: getIconPopup("Direction"),
    },

    {
      id: "VehicleStatus",
      Tooltip: currentLocale.Vehicle_Status,
      val:
        Saferoad.Popup.Helpers.VStatusToStr(locInfo?.VehicleStatus) ??
        "Unknown",
      icon: getIconPopup("VehicleStatus"),
    },
    {
      id: "EngineStatus",
      Tooltip: currentLocale.EngineStatus,
      val:
        Saferoad.Popup.Helpers.EStatusToStr(locInfo?.EngineStatus) ?? "Unknown",
      unit: "",
      icon: getIconPopup("EngineStatus"),
    },
    {
      id: "Mileage",
      Tooltip: currentLocale.Mileage,
      val: locInfo?.Mileage / 1000 ?? "Unknown",
      unit: "KM",
      icon: getIconPopup("Mileage"),
    },
    {
      id: "Duration",
      Tooltip: currentLocale.Duration,
      val: Saferoad.Popup.Helpers.DurationToStr(locInfo?.Duration) ?? "Unknown",
      unit: "",
      icon: getIconPopup("Duration"),
    },
    {
      id: "DriverName",
      Tooltip: currentLocale.Driver_Name,
      val: driver(),
      icon: getIconPopup("DriverUrl"),
      DriverID: locInfo?.RFID || locInfo?.DriverID,
    },

    {
      id: "GroupName",
      Tooltip: currentLocale.Group_Name,
      val: locInfo?.GroupName ?? "UnGrouped",
      icon: getIconPopup("GroupName"),
    },
    {
      id: "PlateNumber",
      Tooltip: currentLocale.PlateNumber,
      val: locInfo?.PlateNumber ?? "Unknown",
      unit: "",
      icon: getIconPopup("PlateNumber"),
    },
    {
      id: "SimSerialNumber",
      Tooltip: currentLocale.SimNumber,
      val: locInfo?.SimSerialNumber ?? "Unknown",
      unit: "",
      icon: getIconPopup("SimCardNumber"),
    },
    {
      id: "SerialNumber",
      Tooltip: currentLocale.SerialNumber,
      val: locInfo?.SerialNumber ?? "Unknown",
      icon: getIconPopup("SerialNumber"),
    },
    {
      id: "IgnitionStatus",
      Tooltip: "Ignition Control",
      val:
        Saferoad.Popup.Helpers.IgnitionToStr(locInfo?.IgnitionStatus) ??
        "Unknown",
      icon: getIconPopup("IgnitionStatus"),
    },
    {
      id: "TotalWeight",
      Tooltip: currentLocale.ActualWeight,
      val: locInfo?.WeightReading > 0 ? locInfo?.WeightReading : "Unknown",
      unit: locInfo?.WeightReading > 0 ? "kg" : "",
      icon: getIconPopup("weightreading"),
    },
    {
      id: "Temp1",
      Tooltip: currentLocale.temperature,
      val:
        getAvg(
          [locInfo?.Temp1, locInfo?.Temp2, locInfo?.Temp3, locInfo?.Temp4],
          3000,
          10
        ) == 3000
          ? "Not Available"
          : getAvg(
              [locInfo?.Temp1, locInfo?.Temp2, locInfo?.Temp3, locInfo?.Temp4],
              3000,
              10
            ),
      unit:
        getAvg(
          [locInfo?.Temp1, locInfo?.Temp2, locInfo?.Temp3, locInfo?.Temp4],
          3000,
          10
        ) == 3000
          ? ""
          : "C",
      icon: getIconPopup("Temp"),
    },

    {
      id: "Hum1",
      Tooltip: currentLocale.HumiditySensor1,
      val:
        getAvg(
          [locInfo?.Hum1, locInfo?.Hum2, locInfo?.Hum3, locInfo?.Hum4],
          -1,
          10
        ) == -1
          ? "Not Available"
          : getAvg(
              [locInfo?.Hum1, locInfo?.Hum2, locInfo?.Hum3, locInfo?.Hum4],
              -1,
              10
            ),
      unit:
        getAvg(
          [locInfo?.Hum1, locInfo?.Hum2, locInfo?.Hum3, locInfo?.Hum4],
          -1,
          10
        ) == -1
          ? ""
          : "%",

      icon: getIconPopup("HUM"),
    },
    {
      id: "SeatBelt",
      Tooltip: currentLocale.SeatBelt,
      val: locInfo?.SeatBelt ? "Yes" : "No" ?? "No",
      icon: getIconPopup("SeatBelt"),
    },
    {
      id: "Address",
      Tooltip: "Address",
      val: locInfo?.Address ?? "Unknown",
      icon: getIconPopup("Address"),
    },

    {
      id: "Latitude , Longitude",
      Tooltip: currentLocale.LatitudeLongitude,
      val: `${locInfo?.Latitude ?? "Unknown"} , ${
        locInfo?.Longitude ?? "Unknown"
      }`,
      icon: getIconPopup("LangLat"),
    },
    {
      id: "Invalid",
      Tooltip: currentLocale.Invalid_Locations,
      val: locInfo?.Invalid ?? "Unknown",
      icon: getIconPopup("Invalid"),
    },
  ];
}
