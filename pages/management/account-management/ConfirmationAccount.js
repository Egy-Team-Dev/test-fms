import { useEffect, useState } from "react";
import { Row, Col, Card, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";

// translation
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { add, empty } from "../../../lib/slices/accountInfo";
import { toast } from "react-toastify";
import { postData } from "../../../helpers/helpers";
import useToken from "../../../hooks/useToken";
import config from "../../../config/config";

const ConfirmationAccount = () => {
  const { t } = useTranslation("Management");
  const dispatch = useDispatch();
  const router = useRouter();

  const accountInfo = useSelector((state) => state?.accountInfo);

  const [selectedSubScription, setSelectedSubScription] = useState([]);

  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    setSelectedSubScription(accountInfo.AddAccountInfo3);
    let Total = 0;
    accountInfo.AddAccountInfo3?.map((item) => {
      item.selectedData?.map((selectedDataItem) => {
        Total += selectedDataItem[1];
      });
    });
    setTotal(Total);
  }, [accountInfo.AddAccountInfo3]);

  const { tokenRef } = useToken();

  useEffect(() => {
    setToken(tokenRef);
  }, [tokenRef]);

  const handleAddSubScription = () => {
    dispatch(add({ Finish: "Finish" }));
    token &&
      postData(
        token,
        accountInfo.AddAccountInfo1And2,
        toast,
        setLoading,
        `${config.apiGateway.URL}dashboard/management/accounts`
      );

    router.push("/management/account-management/22");
  };

  const handleDeleteAllDataWithGoToMainPage = () => {
    dispatch(empty());
    router.push("/management/account-management/22");
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
                      {selectedSubScription?.map((item, key) => (
                        <>
                          {item.selectedData.length > 0 && (
                            <div key={key}>
                              <span>{item.name}</span>
                              {item.selectedData?.map((itemSub, keySub) => (
                                <div
                                  key={keySub}
                                  className="d-flex ms-5 justify-content-between w-100 mb-1 text-dark bg-light"
                                >
                                  <span className=" d-block w-100 fw-bold text-start ms-2 pt-2 pb-2">
                                    {itemSub[0]}
                                  </span>
                                  <span className="d-block w-100 fw-bold text-end me-2 pt-2 pb-2">
                                    ({itemSub[1]} SAR/Month)
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ))}
                      <p className="p-3 rounded lead text-end">
                        {t("Total_Price")} : {total}
                      </p>
                    </Row>
                  </Form>

                  <div className="mt-5 d-flex justify-content-end">
                    <button className="btn btn-primary px-3 py-2 ms-3">
                      <FontAwesomeIcon
                        className="me-2"
                        icon={faArrowLeft}
                        size="sm"
                      />

                      {t("Back")}
                    </button>
                    <button
                      onClick={handleAddSubScription}
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
                      className="btn btn-primary px-3 py-2 ms-3"
                      onClick={() => handleDeleteAllDataWithGoToMainPage()}
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
export default ConfirmationAccount;

// translation ##################################
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["Management", "main"])),
    },
  };
}
// translation ##################################
