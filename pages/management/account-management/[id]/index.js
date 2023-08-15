import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Row, Col, Card, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import HideActions from "hooks/HideActions";
import UseDarkmode from "../../../../hooks/UseDarkmode";
import {
  faCheck,
  faTimes,
  faUsers,
  faPlug,
  faUsersCog,
  faUserEdit,
} from "@fortawesome/free-solid-svg-icons";

// CardCountStart Component
import CardCountStart from "../../../../components/CardCountStart";

// translation
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import Link from "next/link";
import { useSelector } from "react-redux";
import { fetchData } from "../../../../helpers/helpers";
import useToken from "../../../../hooks/useToken";
import { Modal } from "react-bootstrap";
import { FormCheck } from "react-bootstrap";
import axios from "axios";
import config from "../../../../config/config";
import AgGridDT from "../../../../components/AgGridDT";

//  second table action btn
export const CompleteBtn = () => {
  const { t } = useTranslation("Management");
  return (
    <button className="btn btn-outline-primary m-1">
      <FontAwesomeIcon className="pe-2" icon={faUserEdit} size="lg" />{" "}
      {t("Complete_Account")}
    </button>
  );
};

const AccountManagement = () => {
  const { t } = useTranslation("Management");

  const [, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [accountName, setAccountName] = useState("");
  const [parentAccount, setParentAccount] = useState("");
  const [billingPeriod, setBillingPeriod] = useState("");
  const [billingStartedOn, setBillingStartedOn] = useState("");
  const [nextBillingDate, setNextBillingDate] = useState("");
  const [accountTag, setAccountTag] = useState("");
  const [IsDistributor, setIsDistributor] = useState(false);

  const [accountType, setAccountType] = useState("");
  const [identity, setIdentity] = useState("");
  const [mobileNum, setMobileNum] = useState("");
  const [phoneNumber, setPhoneNumber] = useState();
  const [email, setEmail] = useState();
  const [managerPhoneNumber, setManagerPhoneNumber] = useState();
  const [recordIssueDateHijri, setRecordIssueDateHijri] = useState();
  const [extensionNumber, setExtensionNumber] = useState();
  const [managerName, setManagerName] = useState();
  const [managerMobileNumber, setManagerMobileNumber] = useState();

  const [unassignedDevices, setUnassignedDevices] = useState([]);
  const [token, setToken] = useState("");
  const [idForNowAccount, setIdForNowAccount] = useState(1);
  const [accountInfos, setAccountInfos] = useState([]);
  const [allAccountInfos, setAllAccountInfos] = useState([]);
  const [assignedGridApi, setAssignedGridApi] = useState(null);
  const [assignedGridColumnApi, setAssignedGridColumnApi] = useState(null);
  const [unassignedGridApi, setUnassignedGridApi] = useState(null);
  const [unassignedGridColumnApi, setUnassignedGridColumnApi] = useState(null);
  const [allAccountData] = useState([]);
  const [parentAccounts, setParentAccounts] = useState([]);
  const [accStatus, setAccStatus] = useState([]);
  const [allUnAssignedAccountInfos, setAllUnAssignedAccountInfos] = useState(
    []
  );

  const rowHeight = 65;

  const allAccountInfo = useSelector((state) => state?.accountInfo);

  const { tokenRef } = useToken();

  useEffect(async () => {
    const response = await axios({
      method: "get",
      url: `dashboard/management/accounts/statistics`,
    });
    setAccStatus(...response.data.accountsStatistics);
  }, [tokenRef]);

  useEffect(() => {
    setToken(tokenRef);
  }, [tokenRef]);

  useEffect(() => {
    allAccountInfos.forEach((item) => {
      if (item.AccountID === idForNowAccount) {
        setAccountName(item.AccountName);
        setNextBillingDate(item.NextBillingDate.split("T")[0]);
        setParentAccount(item.ParentAccountID);
        setIsDistributor(item.IsDistributor);
      }
    });
    // if (!modalShowVehicle) {
    //   setAccountName("");
    //   setNextBillingDate("");
    //   setParentAccount("");
    //   setIsDistributor("");
    //   setIdForNowAccount(1);
    // }
  }, [idForNowAccount, modalShowVehicle]);

  useEffect(() => {
    accountInfos?.length > 0 &&
      setAllAccountInfos([...accountInfos, ...allAccountInfo.AllData]);
  }, [accountInfos]);

  useEffect(() => {
    allAccountData?.length === 0 &&
      token &&
      fetchData(
        token,
        setLoading,
        setAccountInfos,
        // setAllAccountData,
        `${config.apiGateway.URL}dashboard/management/accounts`
      );

    // allAccountData, setAllAccountData

    // parentAccounts;
    allUnAssignedAccountInfos?.length === 0 &&
      token &&
      fetchData(
        token,
        setLoading,
        setAllUnAssignedAccountInfos,
        `${config.apiGateway.URL}dashboard/management/accounts/inactive`
      );

    parentAccounts?.length === 0 &&
      token &&
      fetchData(
        token,
        setLoading,
        setParentAccounts,
        `${config.apiGateway.URL}dashboard/management/accounts/parents`
      );
  }, [allAccountData, token, parentAccounts]);

  const handleNextBillingDateInTable = (params) => {
    return `${params.data.NextBillingDate?.split("T")[0]}`;
  };

  const handleStatusID = (params) => {
    return params.data.StatusID ? "Active" : "InActive";
  };

  const handleIsDistributor = (params) => {
    return params.data.IsDistributor ? "Distributed" : "Undistributed";
  };

  const handleEditAccount = (id) => {
    setIdForNowAccount(id);

    allAccountInfos.forEach((item) => {
      if (item.AccountID === id) {
        setAccountName(item.AccountName);
        setNextBillingDate(item.NextBillingDate.split("T")[0]);
        setParentAccount(item.ParentAccountID);
        setIsDistributor(item.IsDistributor);
      }
    });

    setModalShowVehicle(true);
  };

  const handleCloseEdit = () => {
    setModalShowVehicle(false);
  };

  const handleStatusAction = async (AccountID) => {
    // setLoading(true);
    // accountInfos.forEach((item) => {
    //   if (item.AccountID === AccountID) {
    //     item.StatusID = item.StatusID ? 0 : 1;
    //   }
    // });

    let currItem = accountInfos.filter((item) => item.AccountID === AccountID);

    setAllAccountInfos([...allAccountInfos]);

    await axios
      .put(
        `dashboard/management/accounts/${AccountID}`,
        {
          StatusID: currItem[0].StatusID ? 0 : 1,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        if (response.status === 200) {
          fetchData(
            token,
            setLoading,
            setAccountInfos,
            // setAllAccountData,
            `${config.apiGateway.URL}dashboard/management/accounts`
          );
          fetchData(
            token,
            setLoading,
            setAllUnAssignedAccountInfos,
            `${config.apiGateway.URL}dashboard/management/accounts/inactive`
          );
        }
      })
      .finally(() => {
        setIdForNowAccount(1);
      })
      .catch((err) => console.log(err));
  };

  const columnsAssigned = useMemo(
    () => [
      {
        headerName: `${t("Account_Name")}`,
        field: "AccountName",
        cellRenderer: (params) => (
          <>
            <div>{params.value}</div>
            <div
              className=" w-100"
              style={{ marginTop: "-10px", display: "flex", gap: "1rem" }}
            >
              <a
                target="_blank"
                href={`/management/ItemVehicleManagment/${params.data.AccountID}`}
              >
                <span>
                  {/* {t("user_role")} */}
                  {t("Manage_Vehicles")}
                </span>
              </a>

              <a
                href={`/management/account-management/manageUsers`}
                target="_blank"
              >
                <span>
                  {/* {t("user_info")} */}
                  {t("Manage_Users")}
                </span>
              </a>

              <a
                // target="_black"
                // href={`/management/ItemVehicleManagment/${params.data.AccountID}`}
                // href={`http://track.saferoad.net/Subscription/Index?AccountID=${params.data.AccountID}`}
                href=""
                style={{ display: "flex", gap: "1rem" }}
                onClick={(e) => e.preventDefault()}
              >
                <span onClick={() => handleEditAccount(params.data.AccountID)}>
                  {/* {t("manage_vehicles")} */}
                  {t("Edit")}
                </span>
              </a>

              <button
                disabled
                className="bg-transparent border-0"
                target="_black"
                // href={`/management/ItemVehicleManagment/${params.data.AccountID}`}
                href={`http://track.saferoad.net/Subscription/Index?AccountID=${params.data.AccountID}`}
                style={{ display: "flex", gap: "1rem" }}
              >
                <span disabled>
                  {/* {t("reset_password")} */}
                  {t("Subscriptions")}
                </span>
              </button>

              <a
                onClick={(e) => e.preventDefault()}
                href=""
                // href={`/management/ItemVehicleManagment/${params.data.AccountID}`}
                // href={`http://track.saferoad.net/Subscription/Index?AccountID=${params.data.AccountID}`}
                style={{ display: "flex", gap: "1rem" }}
              >
                <span onClick={() => handleStatusAction(params.data.AccountID)}>
                  {/* {t("reset_password")} */}
                  {params.data.StatusID ? t("Suspend") : t("Activate")}
                </span>
              </a>
            </div>
          </>
        ),
        minWidth: 400,
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: `${t("Next_Billing_Date")}`,
        field: "NextBillingDate",
        valueGetter: handleNextBillingDateInTable,
        minWidth: 150,
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: `${t("Parent_Account")}`,
        field: "ParentAccountID",
        minWidth: 150,
        // valueFormatter:
        //   'value?.slice(5).replace("T", " ").replace(".000Z", "")',
        unSortIcon: true,
      },
      {
        headerName: `${t("Status")}`,
        field: "StatusID",
        valueGetter: handleStatusID,
        minWidth: 120,
        //  valueFormatter: "value?.toFixed(2)",
        unSortIcon: true,
      },
      {
        headerName: `${t("Reseller")}`,
        field: "IsDistributor",
        valueGetter: handleIsDistributor,
        minWidth: 120,
        //  valueFormatter: "value?.toFixed(2)",
        unSortIcon: true,
      },
    ],
    [t, allAccountInfos, accountInfos]
  );

  const columnsUnAssigned = useMemo(
    () => [
      {
        headerName: `${t("Account_Name")}`,
        field: "AccountName",
        cellRenderer: (params) => (
          <Link href={`Driver`}>
            <a className="text-decoration-underline">{params.value}</a>
          </Link>
        ),
        minWidth: 150,
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: `${t("Next_Billing_Date")}`,
        field: "NextBillingDate",
        valueGetter: handleNextBillingDateInTable,
        minWidth: 150,
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: `${t("Parent_Account")}`,
        field: "ParentAccountID",
        minWidth: 150,
        // valueFormatter:
        //   'value?.slice(5).replace("T", " ").replace(".000Z", "")',
        unSortIcon: true,
      },
      {
        headerName: `${t("Status")}`,
        field: "StatusID",
        valueGetter: handleStatusID,
        minWidth: 120,
        //  valueFormatter: "value?.toFixed(2)",
        unSortIcon: true,
      },
      {
        headerName: `${t("Reseller")}`,
        field: "IsDistributor",
        valueGetter: handleIsDistributor,
        minWidth: 50,
        //  valueFormatter: "value?.toFixed(2)",
        unSortIcon: true,
      },
      {
        headerName: `${t("Actions")}`,
        field: "ID",
        minWidth: 210,
        cellRenderer: () => (
          <div>
            {allUnAssignedAccountInfos.length > 0 && (
              <>
                <button className="btn btn-outline-primary m-1" disabled>
                  <FontAwesomeIcon
                    className="pe-2"
                    icon={faUserEdit}
                    size="lg"
                  />
                  {t("Complete_User_Creation")}
                </button>
              </>
            )}
          </div>
        ),
      },
    ],
    [t, allAccountInfos, allUnAssignedAccountInfos]
  );

  const onFirstDataRendered = (params) => {
    params.api.paginationGoToPage(0);
  };

  const onAssignedGridReady = (params) => {
    setAssignedGridApi(params.api);
    setAssignedGridColumnApi(params.columnApi);
  };
  const onUnassignedGridReady = (params) => {
    setUnassignedGridApi(params.api);
    setUnassignedGridColumnApi(params.columnApi);
  };

  const onExportClick = () => {
    // gridApi.exportDataAsCsv();
  };

  const defaultColDef = useMemo(() => {
    return {
      sortable: true,
      flex: 1,
      resizable: true,
      filter: true,
    };
  }, []);

  const handleAccountName = (e) => {
    setAccountName(e.target.value);
  };
  const handleParentAccount = (e) => {
    setParentAccount(e.target.value);
  };
  const handleNextBillingDate = (e) => {
    setNextBillingDate(e.target.value);
  };
  const handleIsDistributorInput = (e) => {
    setIsDistributor(e.target.checked ? 1 : 0);
  };

  const handleSubmitAddAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    const serverDate = {
      accountName,
      parentAccount,
      billingStartedOn,
      nextBillingDate,
      accountTag,
      IsDistributor,
      accountType,
      identity,
      mobileNum,
      billingPeriod,
      phoneNumber,
      email,
      managerPhoneNumber,
      recordIssueDateHijri,
      extensionNumber,
      managerName,
      managerMobileNumber,
    };

    accountInfos?.length > 0
      ? setAccountInfos([...accountInfos, serverDate])
      : setAccountInfos([serverDate]);
    unassignedDevices.length > 0
      ? setUnassignedDevices([...unassignedDevices, serverDate])
      : setUnassignedDevices([serverDate]);

    setOpen(false);
    setLoading(false);
    setAccountName("");
    setParentAccount("");
    setBillingStartedOn("");
    setNextBillingDate("");
    setAccountTag("");
    setIsDistributor(false);
    setAccountType("");
    setIdentity("");
    setMobileNum("");
    setBillingPeriod("");
    setPhoneNumber("");
    setEmail("");
    setManagerPhoneNumber("");
    setRecordIssueDateHijri("");
    setExtensionNumber("");
    setManagerName("");
    setManagerMobileNumber("");
  };

  const [modalShowVehicle, setModalShowVehicle] = useState(false);
  const [validated] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    setModalShowVehicle(true);

    allAccountInfos.forEach((item) => {
      if (item.AccountID === idForNowAccount) {
        item.AccountName = accountName;
        item.NextBillingDate = `${nextBillingDate}T00:00:00.000Z`;
        item.ParentAccountID = +parentAccount;
        item.IsDistributor = IsDistributor;
        // item.CompanyID = 2;

        // var today = new Date();

        // var date =
        //   today.getFullYear() +
        //   "-" +
        //   (today.getMonth() + 1) +
        //   "-" +
        //   today.getDate();

        // item.AccountName = accountName;
        // item.ParentAccountID = parentAccount;
        // // item.StatusID = 1;
        // item.BillingPeriod = "Yearly";
        // item.BillingStarted = `${date}T00:00:00.000Z`;
        // item.NextBillingDate = `${nextBillingDate}T00:00:00.000Z`;
        // item.IsDistributor = IsDistributor;
        // item.DatabaseConnectionString = "";
        // item.ThemeName = "";
        // item.AccountTags = null;
        // item.IdentityNumber = null;
        // item.CommercialRecordNumber = null;
        // item.CommercialRecordIssueDateHijri = null;
        // item.phoneNumber = null;
        // item.extensionNumber = null;
        // item.emailAddress = null;
        // item.managerName = null;
        // item.managerPhoneNumber = null;
        // item.managerMobileNumber = null;
        // item.dateOfBirthHijri = null;
        // item.BusinessType = "Corporate";
        // item.referencKey = null;
        // item.CompanyID = 2;
        // item.AccountTypeID = 1;
        // item.create_date = `${date}T00:00:00.000Z`;
        // item.Create_Time = null;
        // item.Accounting_Id = null;
      }
    });

    let currItem = allAccountInfos.filter(
      (item) => item.AccountID === idForNowAccount
    );

    setAllAccountInfos([...allAccountInfos]);
    let api = `dashboard/management/accounts/${idForNowAccount}`;
    await axios
      .put(
        api,
        {
          // ...currItem[0],
          NextBillingDate: nextBillingDate,
          AccountName: accountName,
          IsDistributor,
          ParentAccountID: parentAccount,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        if (response.status === 200) {
          setModalShowVehicle(false);
        }
      })
      .finally(() => {
        setAccountName("");
        setNextBillingDate("");
        setParentAccount("");
        setIsDistributor("");
        setIdForNowAccount(0);
        setLoading(false);
        setModalShowVehicle(false);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="container-fluid">
      <Row>
        <CardCountStart
          icon={faUsers}
          iconColor="primary"
          title="Total_Accounts"
          countEnd={accStatus?.totalAccounts}
        />
        <CardCountStart
          icon={faUsers}
          iconColor="success"
          title="Active_Accounts"
          countEnd={accStatus?.activeAccounts}
        />
        <CardCountStart
          icon={faPlug}
          iconColor="warning"
          title="Suspended_Accounts"
          countEnd={accStatus?.inActiveAccounts}
        />
        <CardCountStart
          icon={faUsersCog}
          iconColor="info"
          title="Distributor_Accounts"
          countEnd={accStatus?.distributorAccounts}
        />
      </Row>
      <Row>
        <Row className="g-3">
          <Col sm="12">
            <Card className="h-100">
              <nav className="navbar navbar-dark navbar-lg shadow rounded p-3">
                <h3>{t("Manage_Accounts")}</h3>
              </nav>
              <Card.Header className="d-flex justify-content-between">
                <div className="w-100 header-title d-flex justify-content-between align-items-center p-3">
                  <div>
                    <Link
                      href="/management/account-management/AccountWizard"
                      passHref
                    >
                      <button
                        type="button"
                        className="btn btn-primary  px-3 py-2 me-3 "
                      >
                        {t("Add_Account")}
                      </button>
                    </Link>
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                <AgGridDT
                  rowHeight={rowHeight}
                  columnDefs={columnsAssigned}
                  rowData={accountInfos}
                  paginationNumberFormatter={function (params) {
                    return params.value.toLocaleString();
                  }}
                  onFirstDataRendered={onFirstDataRendered}
                  defaultColDef={defaultColDef}
                  onGridReady={onAssignedGridReady}
                  gridApi={assignedGridApi}
                  gridColumnApi={assignedGridColumnApi}
                  onCellMouseOut={HideActions}
                  overlayNoRowsTemplate="Loading..."
                  suppressMenuHide={true}
                />
              </Card.Body>
            </Card>
          </Col>

          {/* ================== second table  ===================== */}
          <Col sm="12">
            <Card className="h-100">
              <Card.Header className="d-flex justify-content-between">
                <div className="w-100 header-title d-flex justify-content-between align-items-center p-3">
                  <div>
                    <h3>{t("Incompleted_Accounts")}</h3>
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                <AgGridDT
                  rowHeight={rowHeight}
                  columnDefs={columnsUnAssigned}
                  rowData={allUnAssignedAccountInfos}
                  suppressExcelExport={true}
                  paginationNumberFormatter={function (params) {
                    return params.value.toLocaleString();
                  }}
                  onFirstDataRendered={onFirstDataRendered}
                  defaultColDef={defaultColDef}
                  onGridReady={onUnassignedGridReady}
                  gridApi={unassignedGridApi}
                  gridColumnApi={unassignedGridColumnApi}
                  // onCellMouseOver={(e) =>
                  //   (e.event.path[1].dataset.test = "showActions")
                  // }
                  onCellMouseOut={HideActions}
                  overlayNoRowsTemplate="Loading..."
                  suppressMenuHide={true}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Col sm={12}>
          <Modal
            show={modalShowVehicle}
            onHide={handleCloseEdit}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            keyboard={false}
          >
            <Modal.Header
              closeButton
              style={{
                background: UseDarkmode("#222738", "#FFFFFF"),
                borderBottomColor: UseDarkmode("#151824", "#DDD"),
              }}
            >
              <Modal.Title id="contained-modal-title-vcenter">
                Submit Vehicle Information
              </Modal.Title>
            </Modal.Header>
            <Modal.Body
              style={{
                background: UseDarkmode("#222738", "#FFFFFF"),
                borderBottomColor: UseDarkmode("#151824", "#DDD"),
              }}
            >
              <Row className="d-flex justify-content-center">
                <Col md="12">
                  <Form
                    noValidate
                    validated={validated}
                    onSubmit={handleSubmit}
                  >
                    <Row className="p-3 mb-3">
                      <Col lg="4">
                        <Form.Group
                          className="form-group"
                          controlId="validationCustom01"
                        >
                          <Form.Label htmlFor="displayName">
                            Account Name
                          </Form.Label>
                          <Form.Control
                            onChange={handleAccountName}
                            type="text"
                            id="displayName"
                            required
                            defaultValue={accountName}
                          />
                        </Form.Group>
                      </Col>

                      <Col lg="4">
                        <Form.Group className="form-group">
                          <Form.Label htmlFor="NextBillingDate">
                            {t("Next_Billing_Date")}
                          </Form.Label>
                          <Form.Control
                            style={{ letterSpacing: "1.5px" }}
                            type="date"
                            id="NextBillingDate"
                            onChange={handleNextBillingDate}
                            defaultValue={nextBillingDate}
                          />
                        </Form.Group>
                      </Col>
                      <Col lg="4">
                        <Form.Group className="form-group">
                          <Form.Label>{t("Parent_Account")}</Form.Label>
                          {/* <Select
                            onChange={handleParentAccount}
                            options={parentAccounts}
                          /> */}

                          <select
                            className="form-select form-select-lg mb-3"
                            onChange={handleParentAccount}
                          >
                            {parentAccounts?.length > 0
                              ? parentAccounts?.map((item) =>
                                  parentAccounts?.indexOf(item) === 0 ? (
                                    <option
                                      key={item.AccountID}
                                      selected
                                      value={item.AccountID}
                                    >
                                      {item.AccountName}
                                    </option>
                                  ) : (
                                    <option
                                      key={item.AccountID}
                                      value={item.AccountID}
                                    >
                                      {item.AccountName}
                                    </option>
                                  )
                                )
                              : "Loading..."}
                          </select>
                        </Form.Group>
                      </Col>
                      <Col lg="4">
                        <Form.Group className="form-group">
                          <Form.Check className=" form-check-inline">
                            <FormCheck.Input
                              type="checkbox"
                              className="form-check-input"
                              id="IsDistributor"
                              checked={IsDistributor}
                              onChange={handleIsDistributorInput}
                            />
                            <FormCheck.Label
                              className="form-check-label px-3 fs-5"
                              htmlFor="IsDistributor"
                            >
                              {t("Reseller")}
                            </FormCheck.Label>
                          </Form.Check>
                        </Form.Group>
                      </Col>
                      <Col lg="12">
                        <div className="mt-5 d-flex justify-content-end">
                          <button
                            className="btn btn-primary px-3 py-2 ms-3"
                            type="submit"
                          >
                            <FontAwesomeIcon
                              className="mx-2"
                              icon={faCheck}
                              size="sm"
                            />
                            {loading ? "Loading...." : "Submit"}
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary px-3 py-2 ms-3"
                            onClick={() => setModalShowVehicle(false)}
                          >
                            <FontAwesomeIcon
                              className="mx-2"
                              icon={faTimes}
                              size="sm"
                            />
                            Cancel
                          </button>
                        </div>
                      </Col>
                    </Row>
                  </Form>
                </Col>
              </Row>
            </Modal.Body>
          </Modal>
        </Col>
      </Row>
    </div>
  );
};

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["Management", "main"])),
    },
  };
}

export default AccountManagement;
