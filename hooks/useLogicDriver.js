const useLogicDriver = (
  setName,
  setPhoneNumber,
  setEmail,
  setDepartment,
  setLicence,
  setlicenceExpiration,
  setRfid,
  setWaslIntegration
) => {
  const handleName = (e) => {
    setName(e.target.value);
  };
  const handlePhoneNumber = (e) => {
    setPhoneNumber(e.target.value);
  };
  const handleEmail = (e) => {
    setEmail(e.target.value);
  };
  const handleDepartment = (e) => {
    setDepartment(e.target.value);
  };
  const handleLicence = (e) => {
    setLicence(e.target.value);
  };
  const handleLicenceExpiration = (e) => {
    setlicenceExpiration(e.target.value);
  };
  const handleRfid = (e) => {
    setRfid(e.target.value);
  };
  const handleWaslIntegration = (e) => {
    setWaslIntegration(e.target.value);
  };

  return {
    handleName,
    handlePhoneNumber,
    handleEmail,
    handleDepartment,
    handleLicence,
    handleLicenceExpiration,
    handleRfid,
    handleWaslIntegration,
  };
};

export default useLogicDriver;
