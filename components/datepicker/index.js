import React, { useState } from "react";
import setHours from "date-fns/setHours";
import setMinutes from "date-fns/setMinutes";

const Datepicker = () => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  return (
    <DatePicker
      className="w-75"
      selected={startDate}
      startDate={startDate}
      endDate={endDate}
      onChange={(update) => {
        setDateRange(update);
      }}
      selectsRange
      showPopperArrow={false}
      monthsShown={2}
      placeholderText="Select Date Range"
      // todayButton="Today"
    />
  );
};

export default Datepicker;
