import { useTranslation } from "next-i18next";
import React, { useEffect, useState } from "react";
import { Card, Col } from "react-bootstrap";
import DProgress from "./dProgress";
import { useDispatch, useSelector } from "react-redux";

export default function Index({ loading }) {
  const { VehFullData, VehTotal } = useSelector((state) => state.streamData);

  const [ActiveVehs, setActiveVehs] = useState(0);
  const [OfflineVehs, setOfflineVehs] = useState(0);

  useEffect(() => {
    if (VehFullData) {
      setActiveVehs(VehFullData?.filter((e) => e?.VehicleStatus !== 5)?.length);

      setOfflineVehs(
        VehFullData?.filter((e) => e?.VehicleStatus === 5)?.length
      );
    }
  }, [VehFullData]);

  const { t } = useTranslation("Dashboard");
  const totalVehs = VehTotal?.totalVehs || 0;
  // const ActiveVehs =
  //   VehFullData?.filter((e) => e?.VehicleStatus !== 5)?.length !==
  //   VehTotal?.activeVehs
  //     ? VehFullData?.filter((e) => e?.VehicleStatus !== 5)?.length
  //     : VehTotal?.activeVehs;
  const PercentageActiveVehcles =
    ((ActiveVehs * 100) / totalVehs)?.toFixed(1) || 0;

  // const OfflineVehs =
  //   VehFullData?.filter((e) => e?.VehicleStatus === 5)?.length !==
  //   VehTotal?.offlineVehs
  //     ? VehFullData?.filter((e) => e?.VehicleStatus === 5)?.length
  //     : VehTotal?.offlineVehs || 0;

  const PercentageOfflineVehs =
    ((OfflineVehs * 100) / totalVehs)?.toFixed(1) || 0;

  const AllDrivers = VehTotal?.totalDrivers || 0;
  const ActiveDrivers = VehTotal?.activeDrivers || 0;
  const PercentageActiveDrivers =
    ((ActiveDrivers * 100) / AllDrivers).toFixed(1) || 0;

  return (
    <>
      <Col sm="12">
        <Card>
          <Card.Body>
            <DProgress
              loading={loading}
              duration={1.5}
              name={["Active_Vehicles", "Total_Vehicles"]}
              countStart={[0, 0]}
              countEnd={[ActiveVehs, totalVehs]}
              dateType={t("Monthly")}
              progresCount={PercentageActiveVehcles}
              color={"primary"}
            />
          </Card.Body>
        </Card>
      </Col>
      <Col sm="12">
        <Card>
          <Card.Body>
            <DProgress
              loading={loading}
              duration={1.5}
              name={["Offline_Vehicles"]}
              countStart={[0]}
              countEnd={[OfflineVehs]}
              dateType={t("Annual")}
              progresCount={PercentageOfflineVehs}
              color={"warning"}
            />
          </Card.Body>
        </Card>
      </Col>
      <Col sm="12">
        <Card>
          <Card.Body>
            <DProgress
              loading={loading}
              duration={1.5}
              name={["Active_Drivers", "Total_Drivers"]}
              countStart={[0, 0]}
              countEnd={[ActiveDrivers, AllDrivers]}
              dateType={t("Today")}
              progresCount={PercentageActiveDrivers}
              color={"danger"}
            />
          </Card.Body>
        </Card>
      </Col>
    </>
  );
}
