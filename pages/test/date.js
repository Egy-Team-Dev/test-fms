import React from "react";
import Datepicker from "components/datepicker";
import Third from "components/datepicker/Third";

const date = () => {
  return (
    <div className="mt-5 ps-5">
      <Datepicker />
      <Third/>
    </div>
  );
};

export default date;
