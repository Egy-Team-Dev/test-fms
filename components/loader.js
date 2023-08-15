import React, { useEffect, useState } from "react";
import { encryptName } from "../helpers/encryptions";
import { useSelector } from "react-redux";

const Loader = () => {
  const [systemTitle, setSystemTitle] = useState();
  const { systemConfig } = useSelector((state) => state);

  // useEffect(() => {
  //   if (JSON.parse(localStorage.getItem(encryptName("systemConfig")))?.title) {
  //     setSystemTitle(
  //       JSON.parse(
  //         localStorage.getItem(encryptName("systemConfig"))
  //       )?.title.split("")
  //     );
  //   }
  // }, []);



  return (
    <>
      <div className="d-flex align-items-center justify-content-center w-100 h-100 min-vh-100">
        {/* <Spinner animation="grow" /> */}
        <div dir="auto" className="custom-loader-animation">
          {systemTitle ? (
            systemTitle.map((e, i) => {
              return (
                <>
                  <span key={i}> {e} </span>
                </>
              );
            })
          ) : (
            <>
              <span>S</span>
              <span>A</span>
              <span>F</span>
              <span>E</span>
              <span>R</span>
              <span>O</span>
              <span>A</span>
              <span>D</span>
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </>
          )}
        </div>
      </div>
    </>
  );
};
export default Loader;
