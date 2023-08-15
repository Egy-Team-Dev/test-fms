import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Row, Col, Form, Card, Button } from "react-bootstrap";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

import { FiUpload } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";

import { userConfigImg } from "../lib/slices/config";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SystemSettings = () => {
  const { t } = useTranslation("setting");
  const { config } = useSelector((state) => state);
  const [logo, setLogo] = useState(null);
  const [logo2, setLogo2] = useState(null);
  const [check, setCheck] = useState(false);

  const handleLogoChange = (event) => {
    setLogo(event.target.files[0]);
    setLogo2(URL.createObjectURL(event.target.files[0]));
  };

  const handleSubmitData = async (event) => {
    setCheck(true);
    event.preventDefault();
    event.persist();

    let formData = new FormData();
    formData.append("image", logo);
  };

  return (
    <Card>
      <Card.Body className="py-4">
        <h3 className="mb-4 ">System Settings</h3>
        <Form id="form" className="text-center mt-3 mx-auto">
          <div className="d-flex  justify-content-center gap-5 align-items-center">
            <div className="position-relative ">
              <input
                id="upload"
                accept="image/*"
                type="file"
                className="d-none"
                onChange={handleLogoChange}
              />
              <div
                className="show-user-image "
                style={{
                  border: "1px solid rgb(82 131 123)",
                  width: '100px',
                  height: '100px'
                }}
              >
                {logo2 ? (
                  <img src={logo2} />
                ) : (
                  <svg
                    width="50"
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
              </div>

              <label
                htmlFor="upload"
                style={{ cursor: "pointer" }}
                className="btn btn-primary text-white next  shadow-none position-absolute pos-icon"
              >
                <FiUpload color="white" size={".8rem"} />
              </label>
            </div>

            <Box
              component="form"
              sx={{
                "& > :not(style)": { m: 1, width: "30ch" },
              }}
              noValidate
              autoComplete="off"
            >
              <TextField id="filled-basic" label="TITLE" variant="filled" />
            </Box>
          </div>

          <Button
            type="button"
            name="next"
            className="btn btn-primary next action-button  px-5 py-2 shadow-none"
            value="submit"
            onClick={handleSubmitData}
          >
            {check ? "Loading..." : "Submit"}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default SystemSettings;

// translation ##################################
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["setting", "main"])),
    },
  };
}
// translation ##################################
