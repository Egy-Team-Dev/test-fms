import React, { useEffect, useState } from "react";
import { Row, Col, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";

import {
  faMapMarked,
  faHistory,
  faBell,
  faCar,
  faCalendarAlt,
  faClock,
  faTachometerAlt,
  faMapMarkerAlt,
  faCogs,
  faUsers,
  faUsersCog,
  faCertificate,
  faUsersSlash,
  faCog,
  faListUl,
  faClipboardList,
  faLaptop,
  faTools,
  faDollarSign,
  faArrowLeft,
  faArrowRight,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { addFormData } from "../../../lib/slices/addForm";
import { toast } from "react-toastify";
import { useSession } from "next-auth/client";

const inials = {
  AccountName: "",
  StatusID: 1,
  AccountTypeID: 1,
  BillingPeriod: "",
  BillingStarted: "",
  NextBillingDate: "",
  DatabaseConnectionString: "",
  ThemeName: "",
  AccountTags: null,
  IdentityNumber: null,
  CommercialRecordNumber: null,
  CommercialRecordIssueDateHijri: null,
  phoneNumber: null,
  extensionNumber: null,
  emailAddress: null,
  dateOfBirthHijri: null,
  managerName: null,
  managerPhoneNumber: null,
  managerMobileNumber: null,
  BusinessType: "Corporate",
  referencKey: null,
  CompanyID: null,
  Accounting_Id: null,
  firstName: "",
  lastName: "",
  useName: "",
  email: "",
  phonenumber: "",
  password: "",
  confirmPassword: "",
  AllSubscriptions: null,
};

const subScription = () => {
  const [subScriptionData, setSubScriptionData] = useState([]);

  const [session] = useSession();

  const [arrayData, setArrayData] = useState([]);
  // array subscription
  const [subscriptionarray, setSunscriptionArray] = useState([]);

  const id = session?.user?.id || session?.user?.user?.id;

  // check active not active
  const [check, setCheck] = useState(false);
  const { darkMode } = useSelector((state) => state.config);
  const dataRedux = useSelector((item) => item.addFormDatas.data);
  // function to group

  var groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };

  // use Eeffect to get all subscriptions from api
  useEffect(async () => {
    try {
      const fetchData = await axios.get(
        "/dashboard/management/roles/allSubscriptions"
      );
      const datas = fetchData.data.allSubscriptions.map((item) => {
        return { ...item, active: "Active" };
      });
      const data = Object.entries(groupBy(datas, "CategoryID"));
      setArrayData([...arrayData, ...data]);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const dispatch = useDispatch();

  const router = useRouter();

  // useEffect(() => {
  //   localStorage.setItem("subSecribtions", JSON.stringify(subscriptionarray));

  //   dispatch(
  //     addFormData({
  //       subscriptions: JSON.parse(localStorage.getItem("subSecribtions")),
  //     })
  //   );
  // }, [subscriptionarray]);

  // function handle subscription

  const handleSubscription = (data) => {
    const newArrayData = JSON.parse(JSON.stringify(arrayData));
    newArrayData.map(([title, items]) => {
      items.map((dataitem) => {
        if (dataitem.ID == data.ID) {
          // dataitem.active = "UnActive"

          if (dataitem.active == "UnActive") {
            dataitem.active = "Active";
            setSunscriptionArray((prevState) =>
              prevState.filter((id) => id !== dataitem.ID)
            );
            setSubScriptionData((prevState) =>
              prevState.filter((item) => item.ID !== dataitem.ID)
            );
          } else if ((dataitem.active = "Active")) {
            dataitem.active = "UnActive";
            setSunscriptionArray([...subscriptionarray, dataitem.ID]);
            setSubScriptionData([...subScriptionData, dataitem]);
          }
        }
      });
    });
    setArrayData(newArrayData);
  };

  const handleAddAccount = async () => {
    setCheck(true);
    if (!dataRedux?.account?.AccountName) {
      router.push("/management/account-management/AccountWizard");
      toast.error("please Fill Account Name ");
    } else {
      const payload = {
        subscriptions: {
          subscriptionsIds: subscriptionarray,
          StartDate: dataRedux.account.BillingStarted,
          NextBillingDate: dataRedux.account.NextBillingDate,
          IsAutoRenewal: 1,
          Active: 1,
        },
      };
      dispatch(addFormData(payload));
      try {
        const response = await axios({
          method: "post",
          url: "dashboard/management/accounts",
          data: { ...dataRedux, ...payload },
        });
        setCheck(false);
        dispatch(addFormData({ clear: true }));
        localStorage.removeItem("formData");
        toast.success(`${response.data.message}`);
        router.push(`/management/account-management/${id}`);
      } catch (error) {
        toast.error(error?.response?.data?.message);
        if (
          error?.response?.data?.message ===
          "user name already taken, choose another one"
        ) {
          router.back();
        }

        setCheck(false);
      }
    }
  };

  return (
    <div className="container-fluid">
      <Row>
        <Col>
          <Card>
            <Card.Body className="overflow-hidden">
              <div className="header-title"></div>
              <Row>
                <Col md="12">
                  {arrayData.map(([title, items]) => {
                    const titles = {
                      1: "Track",
                      2: "Mange",
                      3: "Operate Vecicle",
                      4: "Reports",
                    };

                    const imagesicons = {
                      "Trace.png": faMapMarked,
                      "History.png": faHistory,
                      "Alerts and notifications.png": faBell,
                      "Operate.png": faCar,
                      "Manage.png": faUsersCog,
                      "Manage.png": faUsersCog,
                      "Previntive Maintenance.png": faTools,
                      "Driving behavior.png": faUsersSlash,
                      "UBI.png": faCertificate,
                      "SubRental.png": faDollarSign,
                      "Taxi.png": faCar,
                      "Dispatch.png": faListUl,
                      "Task.png": faClipboardList,
                      "Schedule.png": faCalendarAlt,
                      "ondemand.png": faClock,
                      "dashboard.png": faTachometerAlt,
                      "System Icons/Location-Marker.png": faMapMarkerAlt,
                      "System Icons/geofence.png": faMapMarkerAlt,
                      "users.png": faTools,
                      "Accounts.png": faUsers,
                      "vehicles.png": faCar,
                    };

                    return (
                      <div className="rounded-2 mb-3 px-3 py-2 border border-3">
                        <>
                          <h3>{titles[title]}</h3>
                          <hr />
                          <Row>
                            {items.map((item) => {
                              return (
                                <>
                                  <Col className="mb-4" md="6">
                                    <div className="dataitem  border border-2 box shadow-sm rounded-2 px-2 py-3  mb-5">
                                      <Row>
                                        <Col
                                          className="d-flex align-items-center my-3"
                                          md="12"
                                          lg="6"
                                        >
                                          <FontAwesomeIcon
                                            className={
                                              titles[title] == "Track"
                                                ? "fa-2x me-2 bg-soft-success  py-2 rounded-2 px-2 "
                                                : titles[title] == "Mange"
                                                ? " py-2 rounded-2 px-2  fa-2x me-2  bg-soft-info"
                                                : titles[title] ==
                                                  "Operate Vecicle"
                                                ? "fa-2x me-2 bg-soft-primary  py-2 rounded-2 px-2 "
                                                : "  py-2 rounded-2 px-2 fa-2x me-2  bg-soft-warning"
                                            }
                                            icon={imagesicons[item.Image]}
                                            size="lg"
                                          />
                                          <div>
                                            <h4
                                              className={`${
                                                darkMode
                                                  ? "text-white"
                                                  : "text-dark"
                                              } text-start h5 mb-2`}
                                            >
                                              {item.Name}
                                            </h4>
                                            <p
                                              className={`${
                                                darkMode
                                                  ? "text-white-50"
                                                  : "text-muted"
                                              } text-start`}
                                            >
                                              {item.Description.substring(
                                                0,
                                                30
                                              )}
                                            </p>
                                            <p
                                              className={`${
                                                darkMode
                                                  ? "text-white"
                                                  : "text-dark"
                                              } text-start`}
                                            >
                                              {item.Price}SAR/Month
                                            </p>
                                          </div>
                                        </Col>
                                        <Col
                                          className="d-flex  justify-content-lg-end"
                                          md="12"
                                          lg="6"
                                        >
                                          <div className="d-flex d-lg-block   price">
                                            <button
                                              className="btn btn-primary mt-3 px-4 py-2 ms-3"
                                              onClick={() =>
                                                handleSubscription(item)
                                              }
                                            >
                                              {item.active}
                                            </button>
                                            <button
                                              className={`btn d-block  btn-outline-primary mt-3 px-3 py-2 ms-3`}
                                              onClick={() =>
                                                handleSubscription(item)
                                              }
                                            >
                                              Suspend
                                            </button>
                                          </div>
                                        </Col>
                                      </Row>
                                    </div>
                                  </Col>
                                </>
                              );
                            })}
                          </Row>
                        </>
                      </div>
                    );
                  })}
                </Col>

                <Col md="12" className="border border-light rounded p-3">
                  <h4>Subscriptions List</h4>
                  <hr className="my-3" />
                  {Object.entries(groupBy(subScriptionData, "CategoryID"))?.map(
                    ([title, items]) => {
                      const titles = {
                        1: "Track",
                        2: "Mange",
                        3: "Operate Vecicle",
                        4: "Reports",
                      };

                      return (
                        <>
                          <h3>{titles[title]}</h3>
                          <Row className="w-50 px-3">
                            {items.map((item) => {
                              return (
                                <>
                                  <Col md="12" className="mb-3">
                                    <div>
                                      <Row>
                                        <Col
                                          className="d-flex align-items-center   "
                                          md="6"
                                        >
                                          <div>
                                            <h4 className=" h5 mb-2">
                                              {item.Name}
                                            </h4>
                                            <p className="">
                                              {item.Description}
                                            </p>
                                          </div>
                                        </Col>
                                        <Col
                                          className="d-flex justify-content-end  "
                                          md="6"
                                        >
                                          <div className="price">
                                            <p className=" ">
                                              {item.Price}SAR/Month
                                            </p>
                                          </div>
                                        </Col>
                                      </Row>
                                    </div>
                                  </Col>
                                </>
                              );
                            })}
                          </Row>
                          <hr />
                        </>
                      );
                    }
                  )}
                </Col>
              </Row>

              <div className="mt-5 d-flex justify-content-end">
                <Link href="/management/account-management/CreateAdminUser">
                  <button className="btn btn-primary px-3 py-2 ms-3">
                    <FontAwesomeIcon
                      className="me-2"
                      icon={faArrowLeft}
                      size="sm"
                    />
                    Back
                  </button>
                </Link>
                <button
                  className="btn btn-primary px-3 py-2 ms-3"
                  onClick={handleAddAccount}
                >
                  <FontAwesomeIcon
                    className="me-2"
                    icon={faArrowRight}
                    size="sm"
                  />
                  {check ? "Loading..." : "Finish"}
                </button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
export default subScription;

// translation ##################################
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["main"])),
    },
  };
}
// translation ##################################
