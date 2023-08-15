import { useEffect, useMemo, useState } from "react";
import { Row, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faFileExport,
  faSimCard,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useTranslation } from "next-i18next";

import useToken from "../../hooks/useToken";
import { fetchAllSimCards, fetchData } from "../../helpers/helpers";

import config from "../../config/config";
import axios from "axios";
import { toast } from "react-toastify";
import DeleteModal from "../../components/Modals/DeleteModal";
import AgGridDT from "../../components/AgGridDT";

const SimManagement = () => {
  const { t } = useTranslation("Management");
  const allDataSimCard = useSelector((state) => state?.simCard);
  const [, setLoading] = useState(false);

  const [, /* gridColumnApi */ setGridColumnApi] = useState(null);

  const [gridApi, setGridApi] = useState(null);
  const [gridApiUnassigned] = useState(null);
  const [allDataGrid, setAllDataGrid] = useState([]);
  const [unassignedDevices, setUnassignedDevices] = useState([]);
  // const accountInfo = useSelector((state) => state?.accountInfo);
  const [token, setToken] = useState("");

  const [showModalDelete, setshowModalDelete] = useState(false);
  const [loadingDelete, setloadingDelete] = useState();
  const [Driver, setDriver] = useState({});

  const { tokenRef } = useToken();

  useEffect(() => {
    setToken(tokenRef);
  }, [tokenRef]);

  useEffect(() => {
    if (token) {
      allDataSimCard?.length === 0 &&
        fetchAllSimCards(token, setLoading, setAllDataGrid);
      unassignedDevices?.length === 0 &&
        fetchData(
          token,
          setLoading,
          setUnassignedDevices,
          `${config.apiGateway.URL}dashboard/management/sim/unassigned`
        );
    }
  }, [allDataSimCard, token]);


  const onDelete = async () => {
    setloadingDelete(true);
    await axios
      .delete(`${config.apiGateway.URL}dashboard/management/sim/${Driver.ID}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => toast.success(Driver.FirstName + " deleted successfully"))
      .catch((error) => toast.error("Error: " + error?.message))
      .finally(() => {
        setloadingDelete(false);
        setshowModalDelete(false);
      });
  };

  const columns = useMemo(
    () => [
      {
        headerName: `${t("SIMCard_Serial_Number")}`,
        field: "SimSerialNumber",
        minWidth: 150,
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: `${t("Phone Number")}`,
        field: "PhoneNumber",
        minWidth: 150,
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: `${t("Provider_Name")}`,
        field: "Provider Name",
        minWidth: 150,
        // valueFormatter:
        //   'value?.slice(5).replace("T", " ").replace(".000Z", "")',
        unSortIcon: true,
      },
      {
        headerName: "Actions",
        field: "ID",
        minWidth: 440,
        cellRenderer: (params) => (
          <div>
            <button className="btn btn-outline-primary m-1">
              <FontAwesomeIcon className="pe-2" icon={faEdit} size="lg" />
              {/* {t("user_role")} */}
              edit
            </button>
            <button
              className="btn btn-outline-primary m-1"
              onClick={() => {
                setshowModalDelete(true);
                setDriver(params.data);
              }}
            >
              <FontAwesomeIcon className="pe-2" icon={faTrash} size="lg" />
              {/* {t("user_info")} */}
              delete
            </button>
            {/* <button className="btn btn-outline-primary m-1">
              <FontAwesomeIcon className="pe-2" icon={faUserSlash} size="lg" />
              {t("manage_vehicles")}
              Deactivate
            </button>
            <button className="btn btn-outline-primary m-1">
              <FontAwesomeIcon className="pe-2" icon={faCar} size="lg" />
              {t("reset_password")}
              Show Vehicles
            </button> */}
          </div>
        ),
      },
    ],
    [t, allDataSimCard]
  );

  const columnsUnassigned = useMemo(
    () => [
      {
        headerName: `${t("Device_Serial_Number")}`,
        field: "SimSerialNumber",
        minWidth: 150,
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: `${t("Device Type")}`,
        field: "SimSerialNumber",
        minWidth: 120,
        //  valueFormatter: "value?.toFixed(2)",
        unSortIcon: true,
      },
      {
        headerName: "Actions",
        field: "DriverID",
        minWidth: 200,
        cellRenderer: () => (
          <div>
            <button className="btn btn-outline-primary m-1">
              <FontAwesomeIcon className="pe-2" icon={faEdit} size="lg" />
              {/* {t("manage_vehicles")} */}
              Assin to Device
            </button>
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
          </div>
        ),
      },
    ],
    [t, allDataSimCard]
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

  const onBtnExportUnassigned = () => {
    gridApiUnassigned.exportDataAsCsv();
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
    <div className="container-fluid">
      <Card>
        <Card.Body>
          <Row>
            <h4>Manage SIMCards</h4>
            <Card.Header className="d-flex justify-content-between">
              <div className="w-100 header-title d-flex justify-content-between align-items-center p-3">
                <div>
                  <Link href="/management/AddSimCard" passHref>
                    <button
                      type="button"
                      className="btn btn-primary  px-3 py-2 me-3 "
                    >
                      <FontAwesomeIcon
                        className="me-2"
                        icon={faSimCard}
                        size="sm"
                      />
                      Add SIMCard
                    </button>
                  </Link>

                  <button
                    type="button"
                    className="btn btn-primary  px-3 py-2 me-3 "
                  >
                    <FontAwesomeIcon
                      className="me-2"
                      icon={faSimCard}
                      size="sm"
                    />
                    Add SIMCard Bulk
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary  px-3 py-2 me-3 "
                    onClick={onBtnExport}
                  >
                    <FontAwesomeIcon
                      className="me-2"
                      icon={faFileExport}
                      size="sm"
                    />
                    Export Assigned SIMCards
                  </button>
                </div>
              </div>
            </Card.Header>

            <DeleteModal
              show={showModalDelete}
              loading={loadingDelete}
              // title={"Are you sure?"}
              // description={"Are you sure you want to delete this table?"}
              // confirmText={"Yes, delete it!"}
              // cancelText={"No, cancel"}
              onConfirm={onDelete}
              onCancel={() => {
                setshowModalDelete(false);
                setDriver({});
              }}
            />

            <AgGridDT
              columnDefs={columns}
              rowData={allDataGrid}
              paginationNumberFormatter={function (params) {
                return params.value.toLocaleString();
              }}
              onFirstDataRendered={onFirstDataRendered}
              defaultColDef={defaultColDef}
              onGridReady={onGridReady}
              overlayNoRowsTemplate="Loading..."
            />

            <h4>{t("Unassigned_SIMCards")}</h4>
            <Card.Header className="d-flex justify-content-between">
              <div className="w-100 header-title d-flex justify-content-between align-items-center p-3">
                <div>
                  <button
                    type="button"
                    className="btn btn-primary  px-3 py-2 me-3"
                    onClick={onBtnExportUnassigned}
                  >
                    <FontAwesomeIcon
                      className="me-2"
                      icon={faFileExport}
                      size="sm"
                    />
{t('Export_Unassigned_SIMCards')}                  </button>
                </div>
              </div>
            </Card.Header>
            {/* <div className="table-responsive">
              <table
                id="datatable"
                className="table table-striped text-center table-hover"
                data-toggle="data-table"
              >
                <thead>
                  <tr>
                    {[
                      "SIMCard Serial Number",
                      "Phone Number",
                      "Provider Name",
                      "Actions",
                    ]?.map((el) => {
                      return <th key={el}>{el}</th>;
                    })}
                  </tr>
                </thead>
                <tbody>
                  {Data_table?.map((item, i) => (
                    <tr key={i}>
                      <td>{item.SIMCardSerialNumber}</td>
                      <td>{item.phoneNumber}</td>
                      <td>{item.providerName}</td>
                      <td>{item.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="lead text-warning text-end">pagination here</p>
            </div> */}

            {/* {allDataSimCard.length > 0 ? (

            ) : (
              <p className="text-center">Table is Empty!!</p>
            )} */}
            <AgGridDT
              columnDefs={columnsUnassigned}
              rowData={unassignedDevices}
              paginationNumberFormatter={function (params) {
                return params.value.toLocaleString();
              }}
              onFirstDataRendered={onFirstDataRendered}
              defaultColDef={defaultColDef}
              onGridReady={onGridReady}
              overlayNoRowsTemplate="Loading..."
            />
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SimManagement;
