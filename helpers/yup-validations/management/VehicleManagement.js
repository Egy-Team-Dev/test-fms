import * as Yup from "yup";

const numberValidation = (inputName) => {
  return Yup.number()
    .required(`${inputName} is required`)
    .typeError(`${inputName} must be a number`);
};

const stringValidation = (inputName) => {
  return Yup.string().required(`${inputName} is required`).trim();
};

export const vehicleDataValidation = (wirteInOptional) => {
  return Yup.object().shape({
    DisplayName: stringValidation("Display Name"),
    PlateNumber: stringValidation("Plate Number"),
    MakeYear: numberValidation("Manufacturing Year")
      .min(1800, "Manufacturing Year must be greater than or equal to 1800")
      .max(2200, "Manufacturing Year must be less than or equal to 2200"),
    SpeedLimit: Yup.number().min(
      0,
      "Speed Limit must be greater than or equal to 0"
    ),
    LiterPer100KM: Yup.number().min(
      0,
      "Liter Per 100KM must be greater than or equal to 0"
    ),
    Number: wirteInOptional ? stringValidation("Number") : "",
    RightLetter: wirteInOptional ? stringValidation("Right Letter") : "",
    MiddleLetter: wirteInOptional ? stringValidation("Middle Letter") : "",
    LeftLetter: wirteInOptional ? stringValidation("Left Letter") : "",
    SequenceNumber: wirteInOptional ? stringValidation("Sequence Number") : "",
    PlateType: wirteInOptional
      ? numberValidation("Plate Type").min(
          0,
          "Plate Type must be greater than or equal to 0"
        )
      : "",
    ImeiNumber: wirteInOptional ? stringValidation("IMEI Number") : "",
  });
};

export const vehicleAddDevice = Yup.object().shape({
  serialNumber: stringValidation("Serial Number"),
});

export const vehicleAddSim = Yup.object().shape({
  simSerialNumber: stringValidation("Serial Number"),
  phoneNumber:stringValidation('Phone Number')
});

export const vehicleAddGroup = Yup.object().shape({
  MaxParkingTime: Yup.number().min(
    0,
    "Maximum Parking Time must be greater than or equal to 0"
  ),
  MaxIdlingTime: Yup.number().min(
    0,
    "Maximum Idling Time must be greater than or equal to 0"
  )
});
