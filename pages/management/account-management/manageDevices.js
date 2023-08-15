import React, { useEffect, useMemo, useState } from "react";
import { Row, Col, Card, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserEdit,
  faCar,
  faEdit,
  faTrash,
  faUserSlash,
  faPlus,
  faFileCsv,
  faFileExport,
  faRandom,
} from "@fortawesome/free-solid-svg-icons";
// translation
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";

import { fetchDevices } from "../../../lib/slices/addDevicesInfo";
import useToken from "../../../hooks/useToken";
import AgGridDT from "../../../components/AgGridDT";

const ManageDevices = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation("Management");
  const { allDevicesInfo, error } = useSelector(
    (state) => state.addDevicesInfo
  );
  const Assigned = allDevicesInfo.filter((ele) => ele.VehicleID !== null);
  const UnAssigned = allDevicesInfo.filter((ele) => ele.VehicleID === null);

  const [, /* gridColumnApi */ setGridColumnApi] = useState(null);
  const [, /* gridColumnApi */ setGridColumnApi2] = useState(null);

  const [gridApi, setGridApi] = useState(null);
  const [gridApi2, setGridApi2] = useState(null);

  const { tokenRef } = useToken();
  useEffect(() => {
    dispatch(fetchDevices(tokenRef));
  }, [dispatch, tokenRef]);

  const columnsAssigned = useMemo(
    () => [
      {
        headerName: `${t("Serial Number")}`,
        field: "SerialNumber",
        minWidth: 150,
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: `${t("Status")}`,
        field: "Status",
        // valueGetter: handleFullName,
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
        headerName: `${t("Device Type")}`,
        field: "DeviceTypeID",
        minWidth: 150,
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: "Actions",
        field: "DriverID",
        minWidth: 380,
        cellRenderer: () => (
          <div>
            <>
              <button className="btn btn-outline-primary m-1">
                <FontAwesomeIcon className="pe-2" icon={faEdit} size="lg" />
                {/* {t("user_role")} */}
                edit
              </button>
              <button className="btn btn-outline-primary m-1">
                <FontAwesomeIcon className="pe-2" icon={faTrash} size="lg" />
                {/* {t("user_info")} */}
                delete
              </button>
              <button className="btn btn-outline-primary m-1">
                <FontAwesomeIcon
                  className="pe-2"
                  icon={faUserSlash}
                  size="lg"
                />
                {/* {t("manage_vehicles")} */}
                Deactivate
              </button>
              <button className="btn btn-outline-primary m-1">
                <FontAwesomeIcon className="pe-2" icon={faCar} size="lg" />
                {/* {t("reset_password")} */}
                Show Vehicles
              </button>
            </>
          </div>
        ),
      },
    ],
    [t]
  );

  const columnsUnassigned = useMemo(
    () => [
      {
        headerName: `${t("Device Serial Number")}`,
        field: "SerialNumber",
        minWidth: 150,
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: `${t("Device Type")}`,
        field: "DeviceTypeID",
        minWidth: 120,
        //  valueFormatter: "value?.toFixed(2)",
        unSortIcon: true,
      },
      {
        headerName: "Actions",
        field: "DriverID",
        minWidth: 380,
        cellRenderer: () => (
          <div>
            <button className="btn btn-outline-primary m-1">
              <FontAwesomeIcon className="pe-2" icon={faUserEdit} size="lg" />
              {t("Complete_User_Creation")}
            </button>
          </div>
        ),
      },
    ],
    [t]
  );

  const onFirstDataRendered = (params) => {
    params.api.paginationGoToPage(0);
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };
  //the export btn func
  const onBtnExport = () => {
    gridApi.exportDataAsCsv();
  };
  const onGridReady2 = (params) => {
    setGridApi2(params.api);
    setGridColumnApi2(params.columnApi);
  };
  //the export btn func
  const onBtnExport2 = () => {
    gridApi2.exportDataAsCsv();
  };

  const defaultColDef = useMemo(() => {
    return {
      sortable: true,
      flex: 1,
      resizable: true,
      filter: true,
    };
  }, []);

  return (
    <div className="container-fluid mt-3">
      <Row>
        <Row className="g-3">
          <Col sm="12">
            <Card className="h-100">
              <Card.Header className="d-flex justify-content-between">
                <div className="w-100 header-title d-flex justify-content-between align-items-center p-3 flex-column flex-md-row">
                  <div>
                    <Link
                      href="/management/account-management/AddDevicesInfo"
                      passHref
                    >
                      <button
                        type="button"
                        className="btn btn-primary  px-3 py-2 me-3 mb-2"
                      >
                        <FontAwesomeIcon
                          className="me-2"
                          icon={faPlus}
                          size="sm"
                        />
                        {t("Add_Device")}
                      </button>
                    </Link>
                    <button
                      type="button"
                      className="btn btn-primary  px-3 py-2 me-3 mb-2"
                    >
                      <FontAwesomeIcon
                        className="me-2"
                        icon={faFileCsv}
                        size="sm"
                      />
                      {t("Add_Bulk_of_Devices")}
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary  px-3 py-2 me-3 mb-2"
                      onClick={onBtnExport}
                    >
                      <FontAwesomeIcon
                        className="me-2"
                        icon={faFileExport}
                        size="sm"
                      />
                      {t("Export_Assigned_Devices")}
                    </button>
                  </div>
                  <Form.Floating className=" custom-form-floating-sm form-group m-0">
                    <Form.Control
                      type="email"
                      className=""
                      id="floatingInput6"
                      placeholder="Place Holder"
                    />
                    <label htmlFor="floatingInput">{t("main:search")}</label>
                  </Form.Floating>
                </div>
              </Card.Header>
              <Card.Body>
                <AgGridDT
                  columnDefs={columnsAssigned}
                  rowData={Assigned}
                  paginationNumberFormatter={function (params) {
                    return params.value.toLocaleString();
                  }}
                  onFirstDataRendered={onFirstDataRendered}
                  defaultColDef={defaultColDef}
                  onGridReady={onGridReady}
                  suppressMenuHide={true}
                />

              </Card.Body>
            </Card>
          </Col>

          {/* ================== second table  ===================== */}
          <Col sm="12">
            <Card className="h-100">
              <nav className="navbar navbar-dark navbar-lg shadow rounded p-3">
                <h3>{t("Unassigned_Devices")}</h3>
              </nav>
              <Card.Header className="d-flex justify-content-between">
                <div className="w-100 header-title d-flex justify-content-between align-items-center p-3">
                  <div>
                    <button
                      type="button"
                      className="btn btn-primary  px-3 py-2 me-3 mb-2"
                    >
                      <FontAwesomeIcon
                        className="me-2"
                        icon={faRandom}
                        size="sm"
                      />
                      {t("Transfer_Device_to_Account")}
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary  px-3 py-2 me-3 mb-2"
                      onClick={onBtnExport2}
                    >
                      <FontAwesomeIcon
                        className="me-2"
                        icon={faFileExport}
                        size="sm"
                      />
                      {t("Export_Unassigned_Devices")}
                    </button>
                  </div>
                  <Form.Floating className=" custom-form-floating-sm form-group m-0">
                    <Form.Control
                      type="email"
                      className=""
                      id="floatingInput6"
                      placeholder="Place Holder"
                    />
                    <label htmlFor="floatingInput">{t("main:search")}</label>
                  </Form.Floating>
                </div>
              </Card.Header>
              <Card.Body>

                <AgGridDT
                  columnDefs={columnsUnassigned}
                  rowData={UnAssigned}
                  paginationNumberFormatter={function (params) {
                    return params.value.toLocaleString();
                  }}
                  onFirstDataRendered={onFirstDataRendered}
                  defaultColDef={defaultColDef}
                  onGridReady={onGridReady2}
                  overlayNoRowsTemplate="Loading..."
                />

              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Row>
    </div>
  );
};

export default ManageDevices;

// translation ##################################
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["Management", "main"])),
    },
  };
}

// translation ##################################
