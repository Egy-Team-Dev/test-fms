import React, { useEffect, useState } from "react";
import VerticalNav from "./vertical-nav";
// import Scrollbar from "smooth-scrollbar";
import { useSelector, useDispatch } from "react-redux";
import { sidebarMini, toggle } from "../lib/slices/toggleSidebar";
import { useRouter } from "next/router";
import axios from "axios";
import { useSession } from "next-auth/client";
import { encryptName } from "../helpers/encryptions";

const Sidebar = () => {
  const isActiveSideBar = useSelector((state) => state.toggleMenu.value);
  const dispatch = useDispatch();
  const router = useRouter();
  const [disableBtns, setDisableBtns] = useState(false);
  const { user } = useSession()[0]?.user;
  const [systemData, setSystemData] = useState({});

  const { systemConfig } = useSelector((state) => state);
  const { language } = useSelector((state) => state.config);

  useEffect(() => {
    // Scrollbar.init(document.getElementById("my-scrollbar"));
    router.events.on("routeChangeComplete", () => dispatch(sidebarMini()));

    // if (JSON.parse(localStorage.getItem(encryptName("systemConfig")))?.title) {
    //   setSystemData(
    //     JSON.parse(localStorage.getItem(encryptName("systemConfig")))
    //   );
    // }
  }, [dispatch, router.events, systemConfig]);

  // useEffect(async () => {
  //   const response = axios
  //     .get(`/invoices?pageSize=1&pageNumber=1`)
  //     .catch((err) => {
  //       router.push(`/payment/${user?.id || ""}`);
  //       setDisableBtns(true);
  //     });
  // }, []);

  const handleToggleMenu = () => {
    if (!disableBtns) {
      dispatch(toggle());
    }
  };

  return (
    <>
      <aside
        className={`sidebar sidebar-default navs-rounded-all  ${
          isActiveSideBar && "sidebar-mini"
        } ${!disableBtns && "sidebar-hover"} `}
      >
        <div className="sidebar-header d-flex align-items-center justify-content-start">
          <a
            className="navbar-brand d-flex align-items-center"
            href={`/${language === "ar" ? language : ""}`}
          >
            {systemData?.logo ? (
              <div
                style={{
                  width: "50px",
                  height: "50px",
                }}
              >
                <img src={systemData?.logo} alt="logo" className="w-100" />
              </div>
            ) : (
              <svg
                width="30"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 30 30"
              >
                <defs>
                  <linearGradient
                    id="linear-gradient"
                    x1="5.72"
                    y1="31.07"
                    x2="24.28"
                    y2="-1.07"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0" stopColor="#0994b8" />
                    <stop offset="0.27" stopColor="#0d97b9" />
                    <stop offset="0.53" stopColor="#189fbe" />
                    <stop offset="0.78" stopColor="#2bacc5" />
                    <stop offset="1" stopColor="#42bccd" />
                  </linearGradient>
                </defs>
                <rect
                  className="cls-1"
                  fill="url(#linear-gradient)"
                  width="30"
                  height="30"
                  rx="5.29"
                />
                <path
                  className="cls-2"
                  fill="#fff"
                  d="M21.27,11.13c.54,0,1,0,1.27,0l0,.22-1.21,6.3c-.75,3.89-4.93,6.71-8.89,6.71-2.49,0-5.26-1.79-5.7-4.06,9,0,15-4.55,13.9-6a4,4,0,0,0-1.63-1c-.55-.22-1.12-.4-1.56-.55l-.24-.09c-.66-.27-.9-.61-.2-.93A11.65,11.65,0,0,1,21.27,11.13Zm.59-5.53H10.35A1.45,1.45,0,0,0,8.93,6.77L7,16.7v0c7.39.6,9.06-1.74,7.65-2.19-.42-.14-.79-.27-1.11-.41-2.06-.85-2.07-1.7.46-2.64,2.75-1,7.63-1,8.65-1l.61-3.19A1.45,1.45,0,0,0,21.86,5.6Z"
                />
              </svg>
            )}

            {systemData?.title ? (
              <p className="logo-title">{systemData?.title}</p>
            ) : (
              <svg
                width="85"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 80 21.78"
                className="logo-title"
              >
                <path d="M8.2,12.86A3.79,3.79,0,0,1,7,15.9a5.23,5.23,0,0,1-3.44,1,12.8,12.8,0,0,1-1.87-.14A6.15,6.15,0,0,1,0,16.32l.63-2a7.93,7.93,0,0,0,1.28.35,7.94,7.94,0,0,0,1.59.16,3.47,3.47,0,0,0,1.7-.31,1.23,1.23,0,0,0,.53-1.15,1.08,1.08,0,0,0-.42-.87,5.38,5.38,0,0,0-1.85-.72,3.86,3.86,0,0,1-1.78-.92,2.46,2.46,0,0,1-.56-1.77A3.68,3.68,0,0,1,2.38,6.21,4.88,4.88,0,0,1,5.72,5.1a11.51,11.51,0,0,1,3.18.41l-.57,2a9.54,9.54,0,0,0-2.62-.38,2.88,2.88,0,0,0-1.59.36,1.31,1.31,0,0,0-.54,1.18A.94.94,0,0,0,4,9.45a5.38,5.38,0,0,0,1.69.64,4.3,4.3,0,0,1,2,1A2.51,2.51,0,0,1,8.2,12.86Z" />
                <path d="M10,12.43l.38-2.6a5.36,5.36,0,0,1,1.87-3.49A5.89,5.89,0,0,1,16,5.1a10.41,10.41,0,0,1,4.42.82l-1.6,10.76h-2.2l0-1.15a9.16,9.16,0,0,1-1.78,1,4.57,4.57,0,0,1-1.83.37,3,3,0,0,1-1.92-.61,3.25,3.25,0,0,1-1.07-1.6A4.92,4.92,0,0,1,10,12.43Zm4.23,2.23a4.15,4.15,0,0,0,2.5-.93l.91-6.11a6.16,6.16,0,0,0-1.94-.32,2.65,2.65,0,0,0-1.78.61A3,3,0,0,0,13,9.86l-.35,2.28C12.36,13.82,12.89,14.66,14.2,14.66Z" />
                <path d="M21.89,7.37l.3-2h1.57L24,3.87A4.57,4.57,0,0,1,25.36,1a4,4,0,0,1,2.82-1,7.32,7.32,0,0,1,2,.25l-.57,2.07a9.18,9.18,0,0,0-1.3-.14,1.67,1.67,0,0,0-1.22.43,2.58,2.58,0,0,0-.61,1.48l-.19,1.24H29l-.31,2H26L23.89,21.78H21.3L23.45,7.37Z" />
                <path d="M28.71,12.23l.36-2.41a7.07,7.07,0,0,1,.48-1.66,4.8,4.8,0,0,1,1-1.51,5.25,5.25,0,0,1,1.66-1.11,5.57,5.57,0,0,1,2.27-.44A4.4,4.4,0,0,1,37.36,6a2.83,2.83,0,0,1,1.09,2.32,4.09,4.09,0,0,1-.43,1.9,3.08,3.08,0,0,1-1.52,1.34,7.87,7.87,0,0,1-3.25.52,12.81,12.81,0,0,1-1.95-.15l-.05.37a2,2,0,0,0,.4,1.81,2.49,2.49,0,0,0,1.9.63,14.58,14.58,0,0,0,3.39-.46l-.08,2.08A13.75,13.75,0,0,1,33,16.9,6,6,0,0,1,31,16.6a3.66,3.66,0,0,1-1.44-.91,3.29,3.29,0,0,1-.81-1.48A5,5,0,0,1,28.71,12.23Zm2.92-2.56-.09.59a9.3,9.3,0,0,0,1.67.16,4.11,4.11,0,0,0,2-.39,1.55,1.55,0,0,0,.66-1.45,1.24,1.24,0,0,0-.44-1,2,2,0,0,0-1.28-.36C32.73,7.2,31.88,8,31.63,9.67Z" />
                <path d="M41.32,5.33h1l-.18,2a9.41,9.41,0,0,1,2.11-1.48,5.68,5.68,0,0,1,2.19-.73l-.17,1.22a6,6,0,0,0-2.1.69,9.66,9.66,0,0,0-2.1,1.45l-1.22,8.22H39.62Z" />
                <path d="M46.75,12.55l.46-3.1A5.26,5.26,0,0,1,47.67,8a4.47,4.47,0,0,1,1-1.4,5.29,5.29,0,0,1,1.58-1,5.15,5.15,0,0,1,2.08-.41A4.66,4.66,0,0,1,54,5.4a3.5,3.5,0,0,1,1.29.85,3.31,3.31,0,0,1,.75,1.38,4.39,4.39,0,0,1,.07,1.82l-.45,3.1a5.93,5.93,0,0,1-.46,1.51,4.59,4.59,0,0,1-1,1.4,5.4,5.4,0,0,1-1.58,1,5,5,0,0,1-2.09.41,4.6,4.6,0,0,1-1.68-.29,3.36,3.36,0,0,1-1.3-.86,3.21,3.21,0,0,1-.75-1.37A4.61,4.61,0,0,1,46.75,12.55Zm1.67-3L48,12.46a3,3,0,0,0,.54,2.44,2.7,2.7,0,0,0,2.21.9,3.63,3.63,0,0,0,2.47-.9,3.93,3.93,0,0,0,1.26-2.44l.43-2.91a2.91,2.91,0,0,0-.53-2.44,2.72,2.72,0,0,0-2.21-.9,3.62,3.62,0,0,0-2.48.9A3.92,3.92,0,0,0,48.42,9.55Z" />
                <path d="M58.19,12.47l.43-2.92a5.05,5.05,0,0,1,1.73-3.24A5.19,5.19,0,0,1,63.8,5.1,9.29,9.29,0,0,1,66,5.35,6.46,6.46,0,0,1,67.63,6L66,16.68H65l.14-1.46a7.93,7.93,0,0,1-1.89,1.22,4.8,4.8,0,0,1-2,.46,2.88,2.88,0,0,1-2.5-1.2A4.29,4.29,0,0,1,58.19,12.47Zm3.5,3.31a4.2,4.2,0,0,0,1.83-.48,6.44,6.44,0,0,0,1.67-1.16l1.12-7.41a6.74,6.74,0,0,0-2.68-.52,3.61,3.61,0,0,0-2.57.93,4.17,4.17,0,0,0-1.23,2.49l-.41,2.75a3.6,3.6,0,0,0,.33,2.49A2.13,2.13,0,0,0,61.69,15.78Z" />
                <path d="M77.54,16.68h-1l.13-1.37a8.77,8.77,0,0,1-1.89,1.15,4.87,4.87,0,0,1-2,.44,2.9,2.9,0,0,1-2.51-1.2,4.29,4.29,0,0,1-.57-3.23l.43-2.92a5.11,5.11,0,0,1,1.74-3.24A5.17,5.17,0,0,1,75.31,5.1a8.11,8.11,0,0,1,1.27.12,5,5,0,0,1,1.4.41L78.8.23H80Zm-4.34-.9A4.44,4.44,0,0,0,75,15.32a6.11,6.11,0,0,0,1.68-1.13L77.8,6.77a6.32,6.32,0,0,0-2.66-.56,3.62,3.62,0,0,0-2.58.93,4.17,4.17,0,0,0-1.23,2.49l-.41,2.75a3.6,3.6,0,0,0,.33,2.49A2.13,2.13,0,0,0,73.2,15.78Z" />
              </svg>
            )}
          </a>
          <div
            className="sidebar-toggle shadow-lg"
            data-toggle="sidebar"
            data-active="true"
            onClick={handleToggleMenu}
          >
            <i className="icon d-flex align-items-center justify-content-center">
              <svg
                width="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.25 12.2744L19.25 12.2744"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.2998 18.2988L4.2498 12.2748L10.2998 6.24976"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </i>
          </div>
        </div>
        <div
          className="sidebar-body pt-0 data-scrollbar"
          data-scroll="1"
          id="my-scrollbar"
        >
          <div className="collapse navbar-collapse" id="sidebar">
            {!disableBtns && <VerticalNav />}
          </div>
        </div>
        <div className="sidebar-footer" />
      </aside>
    </>
  );
};

export default Sidebar;
