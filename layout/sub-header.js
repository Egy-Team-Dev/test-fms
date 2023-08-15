import React, { useEffect, useState } from "react";
import { Row, Col, Container } from "react-bootstrap";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import Head from "next/head";
import { useRouter } from "next/router";
const SubHeader = ({ pageName = "" }) => {
  const { t } = useTranslation("main");
  const router = useRouter();

  useEffect(() => {
    router.push(pageName);
  }, [pageName, router.pathname]);

  const [state, setState] = useState("");
  useEffect(() => {
    switch (pageName) {
      case "/":
        setState("Dashboard");
        break;
      case "/preventiveMaintenance":
        setState("Preventive_Maintenance");
        break;

      case "/preventiveMaintenance/add":
        setState("Add_Preventive");
        break;
      case "/preventiveMaintenance/edit":
        setState("Update_Preventive");
        break;
      case "/scheduledReports":
        setState("Scheduled_Reports");
        break;
      case "/scheduledReports/add":
        setState("Add_Scheduled_Report");
        break;
      case "/reports":
        setState("Reports");
        break;
      case "/driver/[driverId]":
        setState(t("driver_dashboard_key"));
        break;
      case "/vehicle/[vehicleId]":
        setState(t("vehicle_dashboard_key"));
        break;
      case "/driversManagement":
        setState("Drivers_Management");
        break;
      case "/driversManagement/add":
        setState("Add_Driver");
        break;
      case "/VehiclesCamera":
        setState("Vehicles_Camera");
        break;
      case "/management":
        setState("Management");
        break;
      case "/notify":
        setState("Notify");
        break;
      case "/Setting":
        setState("Setting");
        break;
      case "/payment/[id]":
        setState("Payment");
        break;
      case "/management/account-management/[id]":
        setState("Account_Management");
        break;
      case "/management/account-management/AccountWizard":
        setState("Add_Account");
        break;
      case "/management/account-management/Users/[id]":
        setState("Manage Vehicles");
        break;
      case "/management/account-management/CreateAdminUser":
        setState("Create_Administrator_User");
        break;
      case "/management/account-management/SubScription":
        setState("Add_Subscription");
        break;
      case "/management/account-management/Confirmation":
        setState("Confirmation");
        break;
      case "/management/account-management/ManageUsers":
        setState("Manage_Users");
        break;
      case "/management/account-management/manageUsers":
        setState("Manage_Users");
        break;
      case "/management/account-management/AddUser1":
        setState("Add_User_Info");
        break;
      case "/management/account-management/AddUser2":
        setState("Select_User_Role");
        break;
      case "/management/account-management/AddUser3":
        setState("Add_Subscription");
        break;
      case "/management/account-management/AddUser4":
        setState("Confirmation");
        break;
      case "/management/account-management/SelectUserRole":
        setState("Select_User_Role");
        break;
      case "/management/account-management/CutomizePermissions":
        window.location.href = setState("Cutomize_Permissions");
        break;
      case "/management/account-management/EditUser":
        setState("Edit_User_Info");
        break;
      case "/management/account-management/manageDevices":
        setState("manage_Devices");
        break;
      case "/management/account-management/AddDevicesInfo":
        setState("Add_Devices_Info");
        break;
      case "/management/account-management/AddDevicesInfo2":
        setState("Add_Devices_Info2");
        break;
      case "/management/VehicleManagment":
        setState("Vehicle_Managment");
        break;
      case "/management/ItemVehicleManagment/[id]":
        setState("Vehicle_Managment");
        break;
      case "/management/AddVehicleInfo":
        setState("Add_Vehicle");
        break;
      case "/management/AddVehicleInfo2":
        setState("");
        break;
      case "/management/AddVehicleInfo3":
        setState("");
        break;
      case "/management/AddVehicleInfo4":
        setState("");
        break;
      case "/driversManagement/showVehicles":
        setState("Show_Vehicles");
        break;
      case "/management/sim-management":
        setState("Sim Card Management");
        break;
      case "/management/sim-management/add":
        setState("Add Sim Card");
        break;
      case "/management/device-management":
        setState("Devices_Management");
        break;
      case "/management/device-management/add/add-device":
        setState("Add new device");
        break;
      case "/management/device-management/add/add-sim":
        setState("Add Sim card to the device");
        break;

      default:
        setState("");
        break;
    }
  }, [pageName]);
  return (
    <>
      <Head>
        <title>{t(state) || "Saferoad FMS"}</title>
      </Head>
      <div className="iq-navbar-header" style={{ height: "153px" }}>
        <Container fluid className=" iq-container">
          <Row>
            <Col md="12">
              <div className="d-flex justify-content-between flex-wrap">
                <div>
                  <h1>{t(state)}</h1>
                  {/*<p>We are on a mission to help developers like you build successful projects for FREE.</p>*/}
                </div>
                <div className="d-flex align-items-center">
                  {/*<Link to="" className="btn btn-link btn-soft-light">*/}
                  {/*    <svg width="20" className="me-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">*/}
                  {/*        <path d="M11.8251 15.2171H12.1748C14.0987 15.2171 15.731 13.985 16.3054 12.2764C16.3887 12.0276 16.1979 11.7713 15.9334 11.7713H14.8562C14.5133 11.7713 14.2362 11.4977 14.2362 11.16C14.2362 10.8213 14.5133 10.5467 14.8562 10.5467H15.9005C16.2463 10.5467 16.5263 10.2703 16.5263 9.92875C16.5263 9.58722 16.2463 9.31075 15.9005 9.31075H14.8562C14.5133 9.31075 14.2362 9.03619 14.2362 8.69849C14.2362 8.35984 14.5133 8.08528 14.8562 8.08528H15.9005C16.2463 8.08528 16.5263 7.8088 16.5263 7.46728C16.5263 7.12575 16.2463 6.84928 15.9005 6.84928H14.8562C14.5133 6.84928 14.2362 6.57472 14.2362 6.23606C14.2362 5.89837 14.5133 5.62381 14.8562 5.62381H15.9886C16.2483 5.62381 16.4343 5.3789 16.3645 5.13113C15.8501 3.32401 14.1694 2 12.1748 2H11.8251C9.42172 2 7.47363 3.92287 7.47363 6.29729V10.9198C7.47363 13.2933 9.42172 15.2171 11.8251 15.2171Z" fill="currentColor"></path>*/}
                  {/*        <path opacity="0.4" d="M19.5313 9.82568C18.9966 9.82568 18.5626 10.2533 18.5626 10.7823C18.5626 14.3554 15.6186 17.2627 12.0005 17.2627C8.38136 17.2627 5.43743 14.3554 5.43743 10.7823C5.43743 10.2533 5.00345 9.82568 4.46872 9.82568C3.93398 9.82568 3.5 10.2533 3.5 10.7823C3.5 15.0873 6.79945 18.6413 11.0318 19.1186V21.0434C11.0318 21.5715 11.4648 22.0001 12.0005 22.0001C12.5352 22.0001 12.9692 21.5715 12.9692 21.0434V19.1186C17.2006 18.6413 20.5 15.0873 20.5 10.7823C20.5 10.2533 20.066 9.82568 19.5313 9.82568Z" fill="currentColor"></path>*/}
                  {/*    </svg>*/}
                  {/*    Announcements*/}
                  {/*</Link>*/}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
        {/* {{!-- rounded-bottom if not using animation --}} */}
        <div className="iq-header-img">
          <Image
            quality={100}
            layout="fill"
            src="/assets/images/top-header.jpg"
            alt="header"
            // width={"100%"}
            // height={"100%"}
            className="img-fluid animated-scaleX"
          />
        </div>
      </div>
    </>
  );
};

export default SubHeader;
