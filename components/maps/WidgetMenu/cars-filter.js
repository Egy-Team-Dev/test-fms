import React, { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import "rc-tree/assets/index.css";
import { Button, Col, Image, Row } from "react-bootstrap";
import Styles from "../../../styles/Filter_tree.module.scss";
import {useRouter} from 'next/router';
const FilterTree = ({
  active,
  config,
  carsIconsFilter,
  setcarsIconsFilter,
  handleMainFilter,
  vehicleIcon,
  setVehChecked
}) => {
  const { t } = useTranslation("Dashboard");
  const [lang,setlang]=useState()
const router = useRouter();
  const FilterCars = (id) => {
    handleMainFilter("null", false);
    setcarsIconsFilter((prev) => (prev === id ? null : id));
  };
  useEffect(() => {
 if(typeof window !== 'undefined'){
  setlang(window.location.href.includes('/ar'))
 }
  },[])


  const cars = [
    {
      id: 1,
      title: t("Running"),
      img: `${vehicleIcon}1.png`,
    },
    {
      id: 0,
      title: t("Stopped"),
      img: `${vehicleIcon}0.png`,
    },
    {
      id: 2,
      title: t("Idling"),
      img: `${vehicleIcon}2.png`,
    },
    {
      id: 5,
      title: t("Offline"),
      img: `${vehicleIcon}5.png`,
    },
    {
      id: 101,
      title: t("Over_Speed"),
      img: `${vehicleIcon}101.png`,
    },
    {
      id: 100,
      title: t("Over_Street_Speed"),
      img: `${vehicleIcon}100.png`,
    },
    {
      id: 201,
      title: t("Invalid_Locations"),
      img: `${vehicleIcon}201.png`,
    },
    {
      id: 204,
      title: t("Sleep_mode"),
      img: `${vehicleIcon}204.png`,
    },
  ];
  return (
    <div className="mt-3">
      <Row className={`text-center rounded ${Styles.cars}`}>
        {cars?.map((car) => (
          <Col
            data-toggle         = "tooltip"
            data-placement      = "bottom"
            data-original-title = {car.title}
            title               = {car.title}
            key                 = {`car_icon_${car?.id}`}
            onClick             = {() => {
              setVehChecked([])
              FilterCars(car?.id)
            }}
            className           = {` 
            m-1 ${Styles.cars__car} ${active && Styles.active}
            ${
              carsIconsFilter === car?.id
                ? lang
                  ? Styles.btnActiveAr
                  : Styles.btnActive
                : ""
            }
            `}
            xs={1}
          >
            <Button
              type="buttun"
              className={`${
                carsIconsFilter === car?.id ? "" : "bg-transparent opacity-2"
              }  border-0 p-1`}
            >
              <Image
                width={14}
                src={car?.img}
                alt={car?.title}
                title={car?.title}
              />
            </Button>
          </Col>
        ))}
      </Row>
    </div>
  );
};
export default FilterTree;
