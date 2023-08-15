import {
  locConfigModel,
  locDataModel,
  Date2KSA,
  Date2UTC,
  WeightVoltToKG,
  isDateExpired,
} from "../helpers/helpers";
import dynamic from "next/dynamic";
import moment from "moment"

const { Mapjs } = dynamic(() => import("../components/maps/leafletchild"), {
  ssr: false,
});

const StreamHelper = () => {
  const { latLng } = require("leaflet");

  const groupBykey = (list, key) => {
    return list.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };
  const CalcVehTotal = (FullVehData) => {
    const statusGroups = groupBykey(FullVehData, "VehicleStatus");
    const totalDrivers =
      FullVehData.filter((v) => v["DriverID"])?.length ?? 0;
    const VehTotal = {
      totalVehs: FullVehData.length,
      activeVehs:
        FullVehData.length -
        (statusGroups[5]?.length || 0 + statusGroups[600]?.length || 0),
      offlineVehs:
        (statusGroups[5]?.length || 0) + (statusGroups[600]?.length || 0), //
      idlingVehs: statusGroups[2]?.length ?? 0, //
      RunningVehs: statusGroups[1]?.length ?? 0, //
      stoppedVehs: statusGroups[0]?.length ?? 0, //
      ospeedVehs: statusGroups[101]?.length ?? 0, //
      osspeedVehs: statusGroups[100]?.length ?? 0, //
      invalidVehs: statusGroups[203]?.length ?? 0, //
      totalDrivers: totalDrivers,
      activeDrivers:
        totalDrivers -
        (statusGroups[5]?.filter((v) => v["DriverID"])?.length ?? 0),
    };
    return VehTotal;
  };
  const holdStatus = [600, 5, 0, 2];
  const CalcMileage = (Mileage) => (Mileage ?? 0).toFixed(2);
  const CalcDuration = (newInfo, oldInfo) => {
    if (oldInfo?.lastTrip) {
      // let RecordDateTimeNew = new Date(Date2KSA(newInfo.RecordDateTime)).getTime()
      let RecordDateTimeNew = new Date(Date2KSA(new Date())).getTime()
      let RecordDateTimeOld = new Date(oldInfo.lastTrip[1]).getTime()
      return Math.abs(
        RecordDateTimeNew - RecordDateTimeOld
      ); //in ms
    } else {
        return Math.abs(
          new Date(new Date().getTime()) -
            new Date(oldInfo?.lastTrips ?? newInfo?.lastTrips)
        ); //in ms
      
    
    }
  };

  const calcTimeDiff = (date) => {
    let a = new Date(date)
    let b = new Date()
    let c = b.getTime() - a.getTime()
    const hours = c / (1000 * 60 * 60);
    return hours;
  }

  const CalcDistance = (newInfo, oldInfo) =>
    parseFloat(
      CalcMileage(
        latLng(newInfo.Latitude ?? 0, newInfo.Longitude ?? 0).distanceTo(
          latLng(oldInfo.Latitude ?? 0, oldInfo.Longitude ?? 0)
        )
      )
    );
  const aggregate = (VehFullData, newInfo, oldInfo) => {
    // [newInfo.SpeedLimit] = [oldInfo.SpeedLimit];
    newInfo.SpeedLimit = oldInfo.SpeedLimit;
    switch (newInfo.DeviceTypeID) {
      case 1:
        newInfo.Mileage = parseFloat(oldInfo.Mileage ?? 0);
        newInfo.Mileage += !holdStatus.includes(newInfo.VehicleStatus)
          ? CalcDistance(newInfo, oldInfo)
          : 0;
        newInfo.Mileage = newInfo.Mileage.toFixed(1);
        break;
      default:
        break;
    }
    newInfo.VehicleStatus = CalcVstatus(newInfo);
    
    newInfo.Duration = CalcDuration(newInfo, oldInfo);
    newInfo.Duration +=
      newInfo.VehicleStatus == oldInfo.VehicleStatus &&
      Number.isInteger(oldInfo.Duration)
        ? oldInfo.Duration
        : 0;
    /*
      1- get data from local storage
      2- filter data by VehicleID and asign it to (selectedVehicle)
      3- check if selectedVehicle have those keys (EndEvent , EndDate)
      4- if not make a request to get the updated selected Vehicle
      5- do updateing on local storage by the updated selected Vehicle
      6- check if EngineStatus in _locInfo is not equal to EngineStatus in the updated selected Vehicle
      7- if not do updateing on local storage by the updated selected Vehicle on (EndEvent , EndDate)
      8- if yes do updateing on local storage by the updated selected Vehicle on (EndDate)
    */

    newInfo.WeightReading = WeightVoltToKG(newInfo, oldInfo);

    if (oldInfo != null) {
      if (oldInfo.SyncAdd == undefined)
        oldInfo.SyncAdd = Object.assign(
          {},
          {
            Address: oldInfo.Address,
            RecordDateTime: oldInfo.RecordDateTime,
            Longitude: oldInfo.Longitude,
            Latitude: oldInfo.Latitude,
          }
        );
      var SyncAdd = oldInfo.SyncAdd;

      if (
        !Mapjs?.helpers?.isValidAddress(newInfo.Address) &&
        Mapjs?.helpers?.isValidAddress(SyncAdd.Address)
      )
        newInfo.Address = SyncAdd.Address;
    }
  };

  const CalcVstatus = (newInfo) => {
    var Status = 5;
    // if (isDateExpired(newInfo)) {
    //   newInfo.VehicleStatus = 5;
    //   Status = 5;
    // }
    // else 

    var duration = calcTimeDiff(newInfo.RecordDateTime);
    // || (newInfo.EngineStatus && duration * 60 > 10)
    // &&  duration > 4
    if((!newInfo.EngineStatus && duration > 48) || (newInfo.EngineStatus && duration > 12)){
      Status = 5
    }

    // sleep mode
    else if(!newInfo.EngineStatus && duration < 48 &&  duration > 4 ){
      Status = 204
    }


      // check feul cutoff 
      else if (newInfo.IsFuelCutOff == true || newInfo.IsFuelCutOff == 1 ) {
        Status = 203;
      } 

       // check poweroff
    else if (newInfo.IsPowerCutOff ||  (!newInfo.EngineStatus && newInfo.Speed > 0) || newInfo.IsFuelCutOff == true || newInfo.IsFuelCutOff == 1) {
      Status = 201;
    } 

        // check running
        else if (newInfo.EngineStatus == 1 && newInfo.Speed <= 5) {
          Status = 2;
        } 

          // check overspeed
    else if (
      newInfo.EngineStatus == 1 &&
      newInfo.Speed > newInfo.SpeedLimit 
      // && newInfo.alarmCode === 2
    ) {
      Status = 101;
    }

    else if (
      newInfo.EngineStatus == 1 &&
      newInfo.Speed <= newInfo.SpeedLimit &&
      newInfo.Speed > 5
    ) {
      Status = 1;
    }

    else if (!newInfo.EngineStatus && newInfo.Speed > 0) {
      Status = 300;
    } 


     else if (!newInfo.EngineStatus &&  duration < 4) {
      Status = 0;
    }

  
   


    return Status;
  };

  const tolocInfo = function (_message, config = false) {
    var data = _message.val();
    var _locInfo = Object.assign({}, config ? locConfigModel : locDataModel);

    //let {DeviceTypeID,DeviceType: _, ...transdata} = data;
    if(!config) delete data['DeviceTypeID'];
    return Object.assign(_locInfo, data);
  };
  const objTolocInfo = function (data, config = false) {
    var _locInfo = Object.assign({}, config ? locConfigModel : locDataModel);
    return Object.assign(_locInfo, data);
  };

  const fbtolocInfo = (_message, VehFullData, _initial = false) => {
    var data = _message?.val ? _message.val() : _message;
    if (data == null) return { locInfo: null, updated: false };

    var _newInfo = { ...locDataModel };
    _newInfo = { ..._newInfo, ...data };

    _newInfo.SerialNumber = _newInfo.SerialNumber ?? _newInfo.Serial;
    _newInfo.RecordDateTime = moment.utc(_newInfo.RecordDateTime);

    _newInfo.Mileage = CalcMileage(_newInfo.Mileage);
    if (isDateExpired(_newInfo)) _newInfo.VehicleStatus = 5;
    delete _newInfo.Serial;

    let _oldInfo = {
      ...VehFullData.find((x) => x.SerialNumber == _newInfo.SerialNumber),
    };
    if (JSON.stringify(_oldInfo) == "{}") {
      return { locInfo: null, updated: false };
    }

    if (
      _oldInfo.Latitude > 0 &&
      _newInfo.RecordDateTime != null &&
      new Date(_newInfo.RecordDateTime) < new Date(_oldInfo.RecordDateTime)
    )
      return { locInfo: _oldInfo, updated: false };
    if (_initial) setTimeout(() => {}, Math.floor(Math.random() * 5 * 6e4) + 1);
    // let _oldInfoCopy = JSON.parse(JSON.stringify(_oldInfo));
    aggregate(VehFullData, _newInfo, _oldInfo, _initial);
    if (_oldInfo?.lastTrip != null) {
      // do update by setLocalStorage
      let lastTrip = [...JSON.parse(JSON.stringify(_oldInfo))?.lastTrip]
      if (
        (_newInfo?.EngineStatus && _oldInfo?.lastTrip[0]) ||
        (!_newInfo?.EngineStatus && !_oldInfo?.lastTrip[0])
      ) {
        // _oldInfoCopy.lastTrip[1] = new Date(_newInfo.RecordDateTime);
      } else {
        lastTrip[0] = _newInfo.EngineStatus;
        lastTrip[1] = new Date(_newInfo.RecordDateTime);
      }
      _oldInfo?.lastTrip = lastTrip
      // _oldInfo = { ..._oldInfoCopy };
    }
    
    
    
    Object.assign(_oldInfo, _newInfo); //_oldInfo = { ..._oldInfo, ...locInfo };//join fix and updated data
    return { locInfo: _oldInfo, updated: true };
  };
  const checkNewOfflines = (VehFullData) => {
    var newOfflines = VehFullData?.filter(x => x?.VehicleStatus != 5 && x?.VehicleStatus != 600).map(x => { return {...x, VehicleStatus: CalcVstatus(x)};});
    return newOfflines.filter(x => x?.VehicleStatus == 5 || x?.VehicleStatus == 600);
  };

  return {
    groupBykey,
    holdStatus,
    CalcMileage,
    CalcVehTotal,
    CalcDuration,
    CalcDistance,
    aggregate,
    CalcVstatus,
    tolocInfo,
    objTolocInfo,  
    fbtolocInfo,
    checkNewOfflines,
  };
};

export default StreamHelper;
