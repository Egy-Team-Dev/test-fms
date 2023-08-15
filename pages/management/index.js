import React, { useState } from "react";
import { Row, Col, Card } from "react-bootstrap";
import Link from "next/link";

// icons
import { FiUsers } from "react-icons/fi";
import { BiCar, BiCreditCardAlt } from "react-icons/bi";
import { BsSdCard } from "react-icons/bs";
import { VscGroupByRefType } from "react-icons/vsc";
import { MdOutlineSensors } from "react-icons/md";
import { RiUserSettingsLine } from "react-icons/ri";
// translation
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useSession } from "next-auth/client";
import { getSession } from "next-auth/client";
import { useDispatch, useSelector } from "react-redux";
import { toggle as tourToggle, disableTour, enableTour } from "lib/slices/tour";
import style from "styles/scss/custom/components/tour-step/tourStep.module.scss";
import Joyride, { ACTIONS, EVENTS, STATUS } from "react-joyride";
import useStepDashboard from "hooks/useStepDashboard";
const Management = () => {
  const { t } = useTranslation(["Tour"]);
  const dispatch = useDispatch();
  const tourState = useSelector((state) => state.tour.run);
  const allSteps = useStepDashboard();
  const handleJoyrideCallback = (data) => {
    const { action, index, status, type } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setState({ stepIndex: 0, steps: steps });
      dispatch(tourToggle());
    } else if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);

      if (index === 11 && action === ACTIONS.PREV) {
        setState({
          stepIndex: nextStepIndex,
          steps: steps,
        });
      } else if (data.action === "close" || data.action === "reset") {
        dispatch(disableTour());
      } else {
        setState({
          stepIndex: nextStepIndex,
          steps: steps,
        });
      }
    }
  };
  const [{ stepIndex, steps }, setState] = useState({
    stepIndex: 0,
    steps: allSteps["managementSteps"],
  });
  const { user } = useSession()[0];
  const userRole =
    useSession()[0]?.user?.mongoRole?.toLowerCase() || useSession()[0]?.user?.user?.mongoRole?.toLowerCase();

  const iconStyle = { fontSize: "3.5rem" };

  const cardsData = () => {
    const { t } = useTranslation("Management");
    return [
      {
        title: t("Manage_Your_Accounts"),
        desc: t("To manage your Accounts and add new accounts click here"),
        icon: <FiUsers style={iconStyle} />,
        // path: `/management/account-management/${user?.id || ""}`
        path: `/management/account-management/${user?.user?.id || user?.id}`,
        btnTitle: t("Manage_Accounts"),
        id: "manage-accounts",
      },
      {
        title: t("Manage_Users"),
        desc: t(
          "To manage your Users, Add new Users, Manage User's Vehicles and Edit Users Role please click here"
        ),
        icon: <RiUserSettingsLine style={iconStyle} />,
        path: "/management/account-management/manageUsers",
        btnTitle: t("Manage_Users"),
        id: "manage-users",
      },
      {
        title: t("Manage_Your_Vehicles"),
        desc: t("To manage your Vehicles please click here"),
        icon: <BiCar style={iconStyle} />,
        path: "/management/VehicleManagment",
        btnTitle: t("Manage_Vehicles"),
        id: "manage-vehicles",
      },
      {
        title: t("Manage_Devices"),
        desc: t("Manage_Devices_Desc"),
        icon: <MdOutlineSensors style={iconStyle} />,
        path: "/management/device-management",
        btnTitle: t("Manage_Devices"),
        hideItem: userRole == "admin" || user.role == "admin",
        id: "manage-devices",
      },
      {
        title: t("Manage_Your_SIM_Cards"),
        desc: t("To manage your SIM Cards please click here"),
        icon: <BsSdCard style={iconStyle} />,
        path: "/management/sim-management",
        btnTitle: t("Manage SIM Cards"),
        hideItem: userRole == "admin" || user.role == "admin",
      },
      {
        title: t("Manage_Your_Drivers"),
        desc: t(
          "To manage your drivers and assign drivers to your vehicle please click here"
        ),
        icon: <FiUsers style={iconStyle} />,
        path: "/driversManagement",
        btnTitle: t("Manage Drivers"),
        id: "manage-divers",
      },
      {
        title: t("Manage_Your_Groups"),
        desc: t(
          "To manage your drivers and assign drivers to your vehicle please click here"
        ),
        icon: <VscGroupByRefType style={iconStyle} />,
        path: "/management/ManageGroupsVehicles",
        btnTitle: t("Manage Groups"),
        id: "manage-groups",
      },
      {
        title: t("Manage_Your_Payments"),
        desc: t("To manage your invoice"),
        icon: <BiCreditCardAlt style={iconStyle} />,
        path: `/payment/${user?.user?.id || user?.id}`,
        btnTitle: t("Manage_Payments"),
        hideItem: userRole == "admin" || user.role == "admin",
      },
    ];
  };

  return (
    <div className="mx-3" id="management">
      <Joyride
        steps={steps}
        continuous
        callback={handleJoyrideCallback}
        run={tourState}
        stepIndex={stepIndex}
        showSkipButton
        locale={{
          skip: <span className={style["skip-tour"]}>{t("skip_tour")}</span>,
          back: <span className={style["skip-tour"]}>{t("back")}</span>,
          next: <span>{t("next")}</span>,
          last: <span>{t("last")}</span>,
        }}
        styles={{
          options: {
            primaryColor: "#1e8178",
            overlayColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 50000,
            width: "379px",
            backgroundColor: "#E0EAE9",
          },
        }}
      />

      <Row>
        {cardsData().map(
          ({ title, desc, icon, path, btnTitle, hideItem, id }, idx) => {
            if (hideItem) return null;
            return (
              <Col md="6" key={idx} id={id || ""}>
                <Card
                  className="shadow-sm border-1"
                  style={{ height: "calc(100% - 2rem)" }}
                >
                  <Card.Body>
                    <Row>
                      <Col
                        sm={3}
                        className="mx-auto text-center d-flex align-items-center justify-content-center"
                      >
                        {icon}
                      </Col>
                      <Col sm={9}>
                        <h5 className="mb-2">{title}</h5>
                        <p className="mb-3 fs-6">{desc}</p>
                        <Link href={path}>
                          <a disable className="btn px-3 py-2 btn-primary">
                            {btnTitle}
                          </a>
                        </Link>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            );
          }
        )}
      </Row>
    </div>
  );
};

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (
    session?.user?.mongoRole?.toLowerCase() == "user" ||
    session?.user?.user?.role?.toLowerCase() == "user"
    //  ||session?.user?.actormode
  ) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      ...(await serverSideTranslations(context.locale, [
        "Management",
        "Tour",
        "main",
      ])),
    },
  };
}

export default Management;
