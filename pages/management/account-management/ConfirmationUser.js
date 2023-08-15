import { useEffect, useState } from "react";
import { Row, Col, Card, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useRouter } from "next/router";

import {
  faArrowLeft,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";

// translation
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { add } from "../../../lib/slices/userInfo";
const ConfirmationUser = () => {
  const { t } = useTranslation("Management");
  const userInfos = useSelector((state) => state?.userInfo);
  const dispatch = useDispatch();
  const router = useRouter();

  const [selectedPermissions, setSelectedPermissions] = useState([]);
  useEffect(() => {
    setSelectedPermissions(userInfos.AddUser3);
  }, [userInfos]);

  const handleAddPermissions = () => {
    dispatch(add({ Finish: "Finish" }));
    router.push("/management/account-management/manageUsers");
  };

  const handleCancel = () => {
    router.push("/management/account-management/manageUsers");
  };

  const handleBackRoute = (e) => {
    e.preventDefault();
    router.back();
  };

  return (
    <div className="container-fluid">
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Row className=" d-flex justify-content-center my-5">
                <Col lg="8">
                  <div className="header-title">
                    <h4 className="card-title">{t("Account_Information")}</h4>
                  </div>

                  <Form>
                    <Row className="p-3 mb-3">
                      <Col lg="12">
                        <Form.Group className="form-group">
                          <Form.Label htmlFor="AccountName">
                            {t("Account_Name")}
                          </Form.Label>
                          <Form.Control
                            type="text"
                            id="AccountName"
                            defaultValue="Account Name"
                            disabled
                          />
                        </Form.Group>
                      </Col>
                      <Col lg="12">
                        <Form.Group className="form-group">
                          <Form.Label htmlFor="parentAccount">
                            {t("Parent_Account")}
                          </Form.Label>
                          <Form.Control
                            type="text"
                            id="parentAccount"
                            defaultValue="Demo"
                            disabled
                          />
                        </Form.Group>
                      </Col>

                      <Col lg="6">
                        <Form.Group className="form-group">
                          <Form.Label htmlFor="billingStart">
                            {t("Billing_Start_on")}
                          </Form.Label>
                          <Form.Control
                            type="text"
                            id="billingStart"
                            defaultValue="17/10/2021"
                            disabled
                          />
                        </Form.Group>
                      </Col>

                      <Col lg="6">
                        <Form.Group className="form-group">
                          <Form.Label htmlFor="NextBilling">
                            {t("Next_Billing_on")}
                          </Form.Label>
                          <Form.Control
                            type="text"
                            id="NextBilling"
                            defaultValue="17/12/2021"
                            disabled
                          />
                        </Form.Group>
                      </Col>

                      <Col lg="12">
                        <Form.Group className="form-group">
                          <Form.Label htmlFor="accountType">
                            {t("Acount_Type")}
                          </Form.Label>
                          <Form.Control
                            type="text"
                            id="accountType"
                            defaultValue="Rental"
                            disabled
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row className="p-3 mb-3">
                      <h4>{t("Subscriptions_List")}</h4>
                      {selectedPermissions?.map((item, key) => (
                        <div key={key}>
                          <span key={key}>{item.mainCategory}</span>
                          <span className="ms-4 d-block w-100" key={key}>
                            {item.subMainCategory}
                          </span>
                          {item.selectedPermissions?.map((itemSub, keySub) => (
                            <span
                              className="ms-5 mt-1 d-block w-100 fw-bold text-dark bg-light ps-3 pt-2 pb-2"
                              key={keySub}
                            >
                              {itemSub}
                            </span>
                          ))}
                        </div>
                      ))}
                      {/* <p className="p-3 rounded lead text-end">
                        {t("Total_Price")} : 0
                      </p> */}
                    </Row>
                  </Form>

                  <div className="mt-5 d-flex justify-content-end">
                    <button
                      onClick={handleBackRoute}
                      className="btn btn-primary px-3 py-2 ms-3"
                    >
                      <FontAwesomeIcon
                        className="me-2"
                        icon={faArrowLeft}
                        size="sm"
                      />
                      {t("Back")}
                    </button>
                    <button
                      onClick={handleAddPermissions}
                      className="btn btn-primary px-3 py-2 ms-3"
                    >
                      <FontAwesomeIcon
                        className="me-2"
                        icon={faCheck}
                        size="sm"
                      />

                      {t("Finish")}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="btn btn-primary px-3 py-2 ms-3"
                    >
                      <FontAwesomeIcon
                        className="me-2"
                        icon={faTimes}
                        size="sm"
                      />

                      {t("Cancel")}
                    </button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
export default ConfirmationUser;

// translation ##################################
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["Management", "main"])),
    },
  };
}
// translation ##################################
