import { useState } from "react";

const useStateDriver = (
  initName = "",
  initDepartment = "Cs",
  initWaslIntegration = "Exist",
  initLoading = false
) => {
  const [name, setName] = useState(initName);
  const [phoneNumber, setPhoneNumber] = useState();
  const [email, setEmail] = useState();
  const [department, setDepartment] = useState(initDepartment);
  const [licence, setLicence] = useState();
  const [licenceExpiration, setlicenceExpiration] = useState();
  const [rfid, setRfid] = useState();
  const [waslIntegration, setWaslIntegration] = useState(initWaslIntegration);
  const [loading, setLoading] = useState(initLoading);

  return {
    name,
    setName,
    phoneNumber,
    setPhoneNumber,
    email,
    setEmail,
    department,
    setDepartment,
    licence,
    setLicence,
    licenceExpiration,
    setlicenceExpiration,
    rfid,
    setRfid,
    waslIntegration,
    setWaslIntegration,
    loading,
    setLoading,
  };
};

export default useStateDriver;
