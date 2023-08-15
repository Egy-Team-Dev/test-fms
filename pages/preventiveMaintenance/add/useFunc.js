const useFunc = (Data, setData, setDueValueMsg, setPercentageValMsg) => {
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "Recurring" || name === "NotifyByPush") {
      return setData({
        ...Data,
        [name]: e.target.checked ? 1 : 0,
      });
    }

    if (name === "PercentageValue") {
      if (value) {
        const valueHandle = Math.max(1, Math.min(100, Number(+value)));
        let NotifywhenValue =
          +Data.MaintenanceDueValue * (+valueHandle / 100) + +Data.StartValue;

        return setData({
          ...Data,
          NotifywhenValue,
          [name]: valueHandle,
        });
      } else {
        return setData({
          ...Data,
          NotifywhenValue: 0,
          [name]: value,
        });
      }
    }
    if (name === "MaintenanceDueValue") {
      if (Data.PercentageValue) {
        let NotifywhenValue =
          +value * (+Data.PercentageValue / 100) + +Data.StartValue;
        return setData({
          ...Data,
          NextValue: Data.StartValue > 0 && +value + +Data.StartValue,
          NotifywhenValue,
          [name]: value,
        });
      } else {
        return setData({
          ...Data,
          NextValue: Data.StartValue > 0 && +value + +Data.StartValue,
          [name]: value,
        });
      }
    }

    setData({
      ...Data,
      [name]: value,
    });
  };

  const checkIfNumber = (e) => {
    return !/[0-9]/.test(e.key) ? true : false;
  };

  const handleMaintenanceDueValueOnKeyPress = (e) => {
    if (Data.StartValue === 0) {
      e.preventDefault();

      setDueValueMsg("Please Select a vehicle");
    }
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault();

      setDueValueMsg("Please Enter Number Only! ");
    }

    if (/[0-9]/.test(e.key) && Data.StartValue !== 0) {
      setDueValueMsg("");
    }
  };

  const handlePercentageValueOnKeyPress = (e) => {
    if (checkIfNumber(e)) {
      e.preventDefault();
      setPercentageValMsg("Please Enter Number Only! ");
    }

    if (!checkIfNumber(e)) {
      setPercentageValMsg("");
    }
  };

  return {
    handleChange,
    handleMaintenanceDueValueOnKeyPress,
    handlePercentageValueOnKeyPress,
  };
};

export default useFunc;
