import React, { useEffect } from "react";
import { useSelector } from "react-redux";

const Progress = (props) => {
  const { VehFullData, VehTotal } = useSelector((state) => state.streamData);
  useEffect(() => {
    //progressbar
    const progressBarInit = (elem) => {
      const currentValue = elem.getAttribute("aria-valuenow");
      elem.style.width = "0%";
      elem.style.transition = "width 1.5s";
      elem.style.width = !props.loading && currentValue + "%";
    };
    const customProgressBar = document.querySelectorAll(
      '[data-toggle="progress-bar"]'
    );
    Array.from(customProgressBar, (elem) => {
      return progressBarInit(elem);
    });
  }, [props.loading, props.progresCount, VehFullData, VehTotal]);
  return (
    <div
      className={`progress bg-soft-${props.softcolors} ${props.className}`}
      style={props.style}
    >
      <div
        className={`progress-bar bg-${props.color}`}
        data-toggle="progress-bar"
        role="progressbar"
        aria-valuenow={props.value}
        aria-valuemin={props.minvalue}
        aria-valuemax={props.maxvalue}
      />
    </div>
  );
};
export default Progress;
