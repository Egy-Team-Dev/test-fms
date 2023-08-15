import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref } from "firebase/database";
import configUrls from "config/config";

import { Date2KSA, locConfigModel, handleStorageData } from "helpers/helpers";
import StreamHelper from "helpers/streamHelper";

import {
  addFullVehData,
  countVehTotal,
  UpdateVehicle,
  UpdateVehMapFiltered,
} from "lib/slices/StreamData";
import { updateMapMarkers } from "lib/slices/mainMap";
import { encryptName } from "helpers/encryptions";
import { useSession } from "next-auth/client";
import { toast } from "react-toastify";
import moment from "moment";
import { useTranslation } from "next-i18next";
import { useState } from "react";

function useStreamDataState(VehFullData) {
  const { t } = useTranslation("main");

  const [loading, setLoading] = useState(false);
  // useDispatch to update the global state
  const dispatch = useDispatch();
  const [session] = useSession();
  const userData = JSON.parse(
    localStorage.getItem(encryptName("userData")) ?? "{}"
  );

  const firebaseConfig = {
    databaseURL: configUrls.firebase_config.databaseURL,
  };

  let fbSubscribers = [];
  let updatePatchSet = null;
  //let updatedResult = null;
  let updatedDataObj = VehFullData
    ? Object.fromEntries(VehFullData.map((x) => [x.SerialNumber, x]))
    : {};

  const UpdateAction = (locInfo, patchTimeSec, copyConfig = false) => {
    updatePatchSet = updatePatchSet ?? { StartAt: new Date(), Data: {} };
    updatePatchSet.Data[locInfo?.SerialNumber] = locInfo;

    let updatePatchSetData = Object.values(updatePatchSet.Data);
    if (copyConfig) {
      const userData = JSON.parse(
        localStorage.getItem(encryptName("userData")) ?? "{}"
      );
      updatePatchSetData = updatePatchSetData.map((item) => {
        const targetVeh = userData?.vehData?.find(
          (x) => x?.SerialNumber == item?.SerialNumber
        );
        if (targetVeh?.SerialNumber == item?.SerialNumber) {
          item.configJson = targetVeh?.configJson;
          item.SpeedLimit = targetVeh?.SpeedLimit;
          item.PlateNumber = targetVeh?.PlateNumber;
          item.DisplayName = targetVeh?.DisplayName;
        }
        return item;
      });
    }
    const patchObj = {
      patch: updatePatchSetData,
      isPatched: true,
    };

    const now = new Date();
    // const getLayers = myMap?.activeGroup()?.getLayers();
    // let counter = 0;
    const patchSinceSec = (now.getTime() - updatePatchSet.StartAt) / 1000;
    if (patchSinceSec >= patchTimeSec) {
      // || patchObj?.patch?.length > 100
      dispatch(UpdateVehicle(patchObj));
      dispatch(UpdateVehMapFiltered(patchObj));
      // dispatch(countVehTotal());
      dispatch(updateMapMarkers(patchObj.patch));

      updatePatchSet = null;
    }
  };
  const removeSpecialChar = (str) => str.replace(/(\r\n|\n|\r|\t)/gm, "");

  const FbSubscribe = async (vehicles, onlyOnce = false) => {
    let typeConnnection = "fireBase";
    if (typeConnnection === "fireBase") {
      const { fbtolocInfo, tolocInfo, objTolocInfo } = StreamHelper();
      const patchTimeSec = 5;
      const subid = fbSubscribers.push({ cancel: false }) - 1;
      let SerialNumbers = vehicles?.map((i) => i?.SerialNumber);
      //updatedDataObj = VehFullData ?? {};

      if (SerialNumbers.length < 5000) {
        const App = initializeApp(firebaseConfig, "updatefb");
        const db = getDatabase(App);
        await SerialNumbers?.forEach((SerialNumber) => {
          onValue(
            ref(db, SerialNumber),
            (snapshot) => {
              if (!snapshot.hasChildren()) return;
              if (fbSubscribers[subid].cancel) return;
              const locinfo = tolocInfo(snapshot);
              updatedDataObj[locinfo?.SerialNumber || locinfo?.Serial] =
                locinfo;

              snapshot.exists();
            },
            (error) => {
              console.error("error : ", error);
              toast.error(`Error: ${Object.stringify(error)}`);
            },
            { onlyOnce: onlyOnce }
          );
        });
      } else {
        const batchSize = 500;
        let i = 0;
        setInterval(async () => {
          if (i >= SerialNumbers.length) i = 0;
          if (i == 0)
            SerialNumbers = vehicles
              ?.sort((a, b) => b?.Speed - a?.Speed)
              ?.map((i) => i?.SerialNumber);
          const keys = SerialNumbers.slice(i, i + batchSize);
          const result = await axios.post("vehicles/lastlocations", {
            keys,
          });

          if (result.status == 200) {
            result?.data?.data.forEach((loc) => {
              updatedDataObj[loc?.SerialNumber] = objTolocInfo(loc);
            });
            i += batchSize;
          }
        }, 30e3);
      }

      let counter = 0;

      setInterval(() => {
        const updatedData = Object.values(updatedDataObj);

        const { locInfo, updated } = fbtolocInfo(
          updatedData[counter],
          vehicles
        );
        if (updated) {
          UpdateAction(locInfo, patchTimeSec, true);
        }
        counter++;

        if (counter >= vehicles?.length ?? 1 - 1) {
          counter = 0;
        }
      }, 20);
    }
  };

  const apiGetVehicles = async (localExpireMin = 30, BtnClick = false) => {
    //updatedResult = []; // let updatedResult = [];
    let vehStorage = {};
    let updated = false;

    vehStorage = userData["userId"] == session?.user.id ? userData : {};
    if (!localStorage.getItem(encryptName("updatedStorage"))) {
      localStorage.clear();
      vehStorage = {};
    }

    if (BtnClick) {
      localStorage.removeItem(encryptName("userData"));
      vehStorage = {};
    }

    const isStorageExpired =
      (new Date(vehStorage?.updateTime) ?? new Date(0)) <
      new Date(new Date().setMinutes(new Date().getMinutes() - localExpireMin));
    if (!vehStorage?.vehData?.length || isStorageExpired) {
      let pageNo = 0;
      let pageSize = 500;
      let apiData = [];
      do {
        apiData = await apiLoadVehSettings(++pageNo, pageSize, true, BtnClick); //load full data

        apiData = Object.fromEntries(apiData.map((x) => [x?.SerialNumber, x]));

        updatedDataObj = { ...updatedDataObj, ...apiData };

        dispatch(addFullVehData([...Object.values(updatedDataObj)]));
        // dispatch(countVehTotal());
      } while (Object.keys(apiData).length >= pageSize);
      updated = true;
    } else {
      updatedDataObj = Object.fromEntries(
        vehStorage?.vehData?.map((x) => [x?.SerialNumber, x])
      );
      dispatch(addFullVehData([...Object.values(updatedDataObj)]));
      // dispatch(countVehTotal());
    }

    // if (!Object.keys(updatedDataObj).length) {
    // updatedDataObj = Object.fromEntries(vehStorage.vehData.map(x => [x.SerialNumber,x]));
    // Object.values(updatedDataObj) && dispatch(addFullVehData([...Object.values(updatedDataObj)]));
    // // dispatch(countVehTotal());
    // }
    let udo = Object.values(updatedDataObj);

    if (updated) {
      udo =
        udo.length < 4000
          ? udo
          : udo.map((x) => {
              return {
                VehicleID: x.VehicleID,
                SerialNumber: x.SerialNumber,
                AccountID: x.AccountID,
                DeviceTypeID: x.DeviceTypeID,
                DisplayName: x.DisplayName,
                PlateNumber: x.PlateNumber,
                VehicleStatus: x.VehicleStatus,
                GroupID: x.GroupID,
                GroupName: x.GroupName,
                RecordDateTime: moment.utc(x.RecordDateTime),
                Latitude: x.Latitude,
                Longitude: x.Longitude,
                Speed: x.Speed,
              };
            });
      localStorage.setItem(
        encryptName("userData"),
        JSON.stringify({
          userId: session?.user.id,
          updateTime: new Date(),
          vehData: udo,
        })
      );
      localStorage.setItem(encryptName("updatedStorage"), true);
    }

    return {
      updatedResult: udo,
    };
  };

  const setLocalStorage = (newStorageData) => {
    const oldStorage = JSON.parse(
      localStorage.getItem(encryptName("userData")) ?? "{}"
    );
    try {
      localStorage.setItem(
        encryptName("userData"),
        JSON.stringify({ ...oldStorage, ...newStorageData })
      );
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.code === DOMException.QUOTA_EXCEEDED_ERR
      ) {
        alert("Your storage is full. Please clear some space and try again.");
      } else {
        console.error("Error setting item:", error);
      }
    }
  };

  const apiLoadVehSettings = async (
    pageNumber = 1,
    pageSize = 500,
    withLoc = true,
    BtnClick
  ) => {
    setLoading(true);

    try {
      const res = await axios.get(
        `vehicles/settings?withloc=${
          withLoc ? 1 : 0
        }&pageNumber=${pageNumber}&pageSize=${pageSize}`
      );

      let result =
        res.data?.map((x) => {
          return {
            // ...locConfigModel,
            ...x,
            SpeedLimit: (x?.SpeedLimit ?? 0) > 0 ? x?.SpeedLimit : 120,
            MinVolt: x?.MinVolt ?? 0,
            MaxVolt: x?.MaxVolt ?? 0,
            RecordDateTime: moment.utc(
              x.RecordDateTime || locConfigModel.RecordDateTime
            ),
            SerialNumber: x?.SerialNumber
              ? x?.SerialNumber
              : `NoSerial_${Math.floor(Math.random() * 100000)}`,
          };
        }) || [];

      // // Get an array of vehicle IDs from the result
      const vehicleIds = result.map((vehicle) => vehicle.VehicleID);

      const getLastTrip = async (vehicleIdsArray) => {
        const data = {
          vids: vehicleIdsArray,
        };
        try {
          const response = await axios.post(`vehicles/lastTrip`, data);
          return response.data.lastTrips;
        } catch (error) {
          toast.error("someting went wrong!");
          return [];
        }
      };

      const setLastTrip = async () => {
        const lastTrips = await getLastTrip(vehicleIds);
        const lastTripsMap = {};
        lastTrips.forEach((trip) => {
          lastTripsMap[trip._id] = trip.lastTrip;
        });
        return lastTripsMap;
      };

      const lastTripsMap = await setLastTrip();
      result.forEach((vehicle) => {
        vehicle.lastTrips = lastTripsMap[vehicle.VehicleID] || null;
      });
      setLoading(false);

      return result;
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message);
      setLoading(false);
      return [];
    }
  };

  const trackStreamLoader = async (BtnClick) => {
    await apiGetVehicles(30, BtnClick);

    !BtnClick &&
      // await
      FbSubscribe(Object.values(updatedDataObj));

    dispatch(addFullVehData([...Object.values(updatedDataObj)]));
    // dispatch(countVehTotal());

    // setInterval(() => {
    //   const { checkNewOfflines } = StreamHelper();
    //   // console.log(`total offline before ${Object.values(updatedDataObj)?.filter(x => x?.VehicleStatus == 5 || x?.VehicleStatus == 600).length} offline devices, out of ${Object.values(updatedDataObj)?.length}`);
    //   const newOfflines = checkNewOfflines(Object.values(updatedDataObj));
    //   // console.log(`new ${newOfflines?.length} offline devices, out of ${Object.values(updatedDataObj)?.length}`);
    //   if(newOfflines.length > 0) {
    //     dispatch(addFullVehData([...Object.values(updatedDataObj)]));
    //     // dispatch(countVehTotal());
    //   }
    //   newOfflines.forEach((no) => {
    //       UpdateAction(no);
    //       updatedDataObj[no?.SerialNumber] = { ...no };
    //     });
    //     console.log(`total offline after ${Object.values(updatedDataObj)?.filter(x => x?.VehicleStatus == 5 || x?.VehicleStatus == 600).length} offline devices, out of ${Object.values(updatedDataObj)?.length}`);
    //   }, 10e3);
  };

  return {
    loading,
    trackStreamLoader,
    FbSubscribe,
    setLocalStorage,
  };
}

export default useStreamDataState;
