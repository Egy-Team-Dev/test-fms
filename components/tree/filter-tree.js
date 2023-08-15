import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import "rc-tree/assets/index.css";
import { useDispatch, useSelector } from "react-redux";
import { Col, Image, Row } from "react-bootstrap";
import Styles from "../../styles/Filter_tree.module.scss";

import { filterVehFullData } from "../../lib/slices/StreamData";

const FilterTree = ({ active }) => {
  const { t } = useTranslation("Dashboard");
  const { config } = useSelector((state) => state);
  const dispatch = useDispatch();

  const handleCarStatus = (id) => dispatch(filterVehFullData(id));

  const cars = [
    {
      id: 1,
      title: t("Running"),
      img: "/assets/images/cars/car0/1.png",
    },
    {
      id: 0,
      title: t("Stopped"),
      img: "/assets/images/cars/car0/0.png",
    },
    {
      id: 2,
      title: t("Idling"),
      img: "/assets/images/cars/car0/2.png",
    },
    {
      id: 5,
      title: t("Offline"),
      img: "/assets/images/cars/car0/5.png",
    },
    {
      id: 101,
      title: t("Over_Speed"),
      img: "/assets/images/cars/car0/101.png",
    },
    {
      id: 100,
      title: t("Over_Street_Speed"),
      img: "/assets/images/cars/car0/100.png",
    },
    {
      id: 201,
      title: t("Invalid_Locations"),
      img: "/assets/images/cars/car0/201.png",
    },{
      id: 204,
      title: t("Sleeping_Mode"),
      img: "/assets/images/cars/car0/204.png",
    }
  ];
  const [Status, setStatus] = useState("");
  // const [check, setCheck] = useState(false);
  // const [Data, setData] = useState([]);
  const [activeLink, setActiveLink] = useState(null);

  // useEffect(() => {
  //   // setData(stateReducer.firebase.Vehicles);
  // }, [stateReducer]);

  const handleRadio = (event) => {
    // add to list
    if (event.target.checked) {
      setStatus(event.target.value);
      // setCheck(true);
    } else {
      // remove from list
      setStatus(Status.find((state) => state == event.target.value));
    }
  };
  return (
    <div className="mt-3">
      <Row className={`text-center rounded ${Styles.cars}`}>
        {cars?.map((car) => (
          <Col
            data-toggle="tooltip"
            data-placement="bottom"
            data-original-title={car.title}
            title={car.title}
            key={`car_icon_${car?.id}`}
            onClick={() => setActiveLink(car.id)}
            className={` 
            m-1 ${Styles.cars__car} ${active && Styles.active}
            ${
              activeLink === car?.id
                ? config.language == "ar"
                  ? Styles.btnActiveAr
                  : Styles.btnActive
                : ""
            }
            `}
            xs={1}
          >
            <input
              type="radio"
              onChange={(e) => handleRadio(e)}
              value={car?.id}
              className="btn-check btnCar"
              name="options"
              id={car?.id}
              autoComplete="off"
              onClick={() => handleCarStatus(car?.id)}
            />
            <label
              className={`btn ${
                config.darkMode ? "btn-outline-light" : "btn-outline-primary"
              } border-0 p-1`}
              htmlFor={car?.id}
            >
              <Image
                width={14}
                src={car?.img}
                alt={car?.title}
                title={car?.title}
              />
            </label>
          </Col>
        ))}
      </Row>
    </div>
  );
};
export default FilterTree;
