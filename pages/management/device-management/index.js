import React, { useMemo, useState, useCallback } from "react";
import { Col, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faFileCsv,
  faRandom,
  faFileDownload,
} from "@fortawesome/free-solid-svg-icons";
// translation
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import {
  fetchAllAssignedDevices,
  fetchAllUnAssignedDevices,
  PostDevicesBulk,
  deleteDevice,
  updateDevice,
  fitchUnassignedVehicles,
} from "services/management/DeviceManagement.js";
import Model from "components/UI/Model";
import DeleteModal from "components/Modals/DeleteModal";

import AgGridDT from "components/AgGridDT";
import HideActions from "hooks/HideActions";
import { toast } from "react-toastify";
import Edit from "components/management/DeviceManagement/Edit";
import Bulk from "components/management/Bulk";
import AddDeviceToSim from "components/management/DeviceManagement/AddDeviceToSim";
import { getDriverAssignedVehicles } from "services/driversManagement";

// when click in download template in bulk, excel data will downloaded
const excelData = [
  {
    DeviceType: "",
    Status: "",
    SerialNumber: ""
  },
];

const ManageDevices = () => {
  // assigned devices
  const [assignedDevices, setAssignedDevices] = useState(null);
  const [assignedGridApi, setAssignedGridApi] = useState(null);
  const [assignedGridColumnApi, setAssignedGridColumnApi] = useState(null);

  // unassigned devices
  const [unassignedDevices, setUnassignedDevices] = useState(null);
  const [unassignedGridApi, setUnassignedGridApi] = useState(null);
  const [unassignedGridColumnApi, setUnassignedGridColumnApi] = useState(null);

  // bulk
  const [bulkModel, setBulkModel] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkFile,setBulkFile] =useState(null)
  // assign device to vehicle
  const [assignDeviceModel, setAssignDeviceModel] = useState(false);
  const [assignDeviceObj, setAssignDeviceObj] = useState({});
  const [assignDeviceModelLoading, setAssignDeviceModelLoading] =
    useState(false);
  const [vehiclesData, setVehiclesData] = useState(null);
  const [rowSelected, setRowSelected] = useState("");
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [selectedPage, setSelectedPage] = useState("");

  // unassign Device from vehicle
  const [unassignDeviceModel, setUnassignDeviceModel] = useState(false);
  const [unassignDeviceObj, setUnassignDeviceObj] = useState({});
  const [unassignDeviceModelLoading, setUnassignDeviceModelLoading] =
    useState(false);

  // assign SIM to device
  const [assignSIMModel, setAssignSIMModel] = useState(false);
  const [assignSIMToDeviceObj, setAssignSIMToDeviceObj] = useState({});

  // unassign SIM from device
  const [unassignSIMModel, setUnassignSIMModel] = useState(false);
  const [unassignSIMObj, setUnassignSIMObj] = useState({});
  const [unassignSIMModelLoading, setUnassignSIMModelLoading] = useState(false);

  // edit
  const [editModalShow, setEditModalShow] = useState(false);
  const [editId, setEditId] = useState("");

  // delete
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [loadingDelete, setLoadingDelete] = useState();

  const { t } = useTranslation("Management");

  // fetch Assigned vehicles data
  const onAssigndGridReady = useCallback(async (params) => {
    try {
      const respond = await fetchAllAssignedDevices();
      setAssignedDevices(respond.result);
      setAssignedGridApi(params.api);
      setAssignedGridColumnApi(params.columnApi);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  }, []);

  // fetch unassigned vehicles data
  const onUnassigndGridReady = useCallback(async (params) => {
    try {
      const respond = await fetchAllUnAssignedDevices();
      setUnassignedDevices(respond.unAssignedDevices);
      setUnassignedGridApi(params.api);
      setUnassignedGridColumnApi(params.columnApi);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  }, []);

  //fetch vehicle Data
  const onGridReady = useCallback(async (params) => {
    try {
      const respond = await fitchUnassignedVehicles();
      setVehiclesData(respond.unAssingedVehs);
      setGridApi(params?.api);
      setGridColumnApi(params?.columnApi);
    } catch (error) {
      toast.error(error.response.data?.message);
    }
  }, []);

  // bulk submitted function
  const bulkDataHandler = async (data) => {
    setBulkLoading(true);
    try {
      const respond = await PostDevicesBulk(data);
      onUnassigndGridReady();
      setBulkLoading(false);
      setBulkModel(false);
      toast.success("Bulk added successfully");
    } catch (error) {
      toast.error(error.response.data?.message);
      setBulkLoading(false);
    }
  };

  // delete model
  const onDelete = async () => {
    setLoadingDelete(true);
    try {
      const respond = await deleteDevice(deleteId);
      setUnassignedDevices((prev) =>
        prev.filter((ele) => ele.DeviceID !== deleteId)
      );
      onAssigndGridReady();
      onUnassigndGridReady();
      toast.success(respond.message);
      setLoadingDelete(false);
      setShowModalDelete(false);
    } catch (error) {
      toast.error(error.response.data?.message);
      setLoadingDelete(false);
      setShowModalDelete(false);
    }
  };

  // assign device to vehicle
  const assignDeviceToVehicle = async () => {
    const submitData = {
      ...assignDeviceObj,
      VehicleID: rowSelected.VehicleID,
    };
    setAssignDeviceModelLoading(true);
    try {
      const respond = await updateDevice(assignDeviceObj.DeviceID, submitData);
      onAssigndGridReady();
      onUnassigndGridReady();
      setAssignDeviceModel(false);
      setAssignDeviceModelLoading(false);
      toast.success(respond.message);
    } catch (error) {
      toast.error(error?.response?.data?.message);
      setAssignDeviceModelLoading(false);
    }
  };

  // unassign device from vehicle
  const unassignDeviceToVehicle = async () => {
    const submitData = {
      ...unassignDeviceObj,
      VehicleID: null,
    };
    setUnassignDeviceModelLoading(true);
    try {
      const respond = await updateDevice(
        unassignDeviceObj.DeviceID,
        submitData
      );
      setUnassignDeviceModel(false);
      setUnassignDeviceModelLoading(false);
      toast.success(respond.message);
      onUnassigndGridReady();
      onAssigndGridReady();
      unassignDeviceModel(false);
    } catch (error) {
      toast.error(error?.response?.data?.message);
      setUnassignDeviceModelLoading(false);
      setUnassignDeviceModel(false);
    }
  };
  // unassign Sim from device
  const unassignSIMToDevice = async () => {
    const submitData = {
      ...unassignSIMObj,
      simID: null,
    };
    setUnassignSIMModelLoading(true);
    try {
      const respond = await updateDevice(unassignSIMObj.DeviceID, submitData);
      onAssigndGridReady();
      onUnassigndGridReady();
      setUnassignSIMModelLoading(false);
      toast.success(respond.message);
      setUnassignSIMModel(false)
    } catch (error) {
      toast.error(error?.response?.data?.message);
      setUnassignSIMModelLoading(false);
    }
  };

  // column for assigned devices
  const columnsAssigned = useMemo(
    () => [
      {
        headerName: `${t("SerialNumber")}`,
        field: "SerialNumber",
        minWidth: 150,
        sortable: true,
        unSortIcon: true,
        cellRenderer: (params) => {
          return (
            <>
              <div>{params.value}</div>
              <div className="d-flex justify-content-start gap-1 options flex-wrap">
                <span
                  onClick={() => {
                    setEditId(params.data.DeviceID);
                    setEditModalShow(true);
                  }}
                  className="visible"
                >
                  {t("edit")}
                </span>
                {params.data.simID ? (
                  <span
                    onClick={() => {
                      setUnassignSIMModel(true);
                      setUnassignSIMObj(params.data);
                    }}
                    className="visible"
                  >
                    | {t("Unassign SimCards")}
                  </span>
                ) : (
                  <span
                    onClick={() => {
                      setAssignSIMModel(true);
                      setAssignSIMToDeviceObj(params.data);
                    }}
                    className="visible"
                  >
                    | {t("Assign SimCards")}
                  </span>
                )}
                <span
                  onClick={() => {
                    setUnassignDeviceModel(true);
                    setUnassignDeviceObj(params.data);
                  }}
                  className="visible"
                >
                  | {t("Unassign Device")}
                </span>
              </div>
            </>
          );
        },
      },
      {
        headerName: `${t("Device_Type")}`,
        field: "DeviceType",
        minWidth: 150,
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: `${t("Vehicle_plate_number")}`,
        field: "PlateNumber",
        minWidth: 150,
        sortable: true,
        unSortIcon: true,
      },
    ],
    [t]
  );

  // column for unassigned devices
  const columnsUnassigned = useMemo(
    () => [
      {
        headerName: `${t("Device_Serial_Number")}`,
        field: "SerialNumber",
        minWidth: 150,
        sortable: true,
        unSortIcon: true,
        cellRenderer: (params) => {
          return (
            <>
              <div>{params.value}</div>
              <div className="d-flex justify-content-start gap-1 options flex-wrap">
                <span
                  onClick={() => {
                    setEditId(params.data.DeviceID);
                    setEditModalShow(true);
                  }}
                  className="visible"
                >
                  {t("edit")}
                </span>
                <span
                  onClick={() => {
                    setShowModalDelete(true);
                    setDeleteId(params.data.DeviceID);
                  }}
                  className="visible"
                >
                  | {t("delete")}
                </span>
                {params.data.simID ? (
                  <span
                    onClick={() => {
                      setUnassignSIMModel(true);
                      setUnassignSIMObj(params.data);
                    }}
                    className="visible"
                  >
                    | {t("Unassign SimCards")}
                  </span>
                ) : (
                  <span
                    onClick={() => {
                      setAssignSIMModel(true);
                      setAssignSIMToDeviceObj(params.data);
                    }}
                    className="visible"
                  >
                    | {t("Assign SimCards")}
                  </span>
                )}
                <span
                  onClick={() => {
                    setAssignDeviceModel(true);
                    setAssignDeviceObj(params.data);
                  }}
                  className="visible"
                >
                  | {t("Assign Device")}
                </span>
              </div>
            </>
          );
        },
      },
      {
        headerName: `${t("Device_Type")}`,
        field: "DeviceType",
        minWidth: 120,
        unSortIcon: true,
      },
    ],
    [t]
  );

  // func pass selected vehicle to ag grid when open vehciles list
  const onFirstDataRendered = useCallback(
    (e) => {
      e.api.paginationGoToPage(selectedPage);
    },
    [selectedPage]
  );

  // columns for ag grid
  const vehiclesColumns = useMemo(
    () => [
      {
        headerName: `${t("select_key")}`,
        field: "Select",
        maxWidth: 70,
        sortable: false,
        unSortIcon: false,
        checkboxSelection: true,
        filter: false,
      },
      {
        headerName: `${t("vehicle_name_key")}`,
        field: "DisplayName",
      },
      {
        headerName: `${t("plate_name_key")}`,
        field: "PlateNumber",
      },
      {
        headerName: `${t("manufacturing_year_key")}`,
        field: "MakeYear",
      },
      {
        headerName: `${t("group_name_key")}`,
        field: "GroupName",
      },
    ],
    [t]
  );

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
      <Col sm="12">
        <Card className="h-100">
          <Card.Header className="d-flex justify-content-between">
            <div className="w-100 header-title d-flex justify-content-between align-items-center p-3 flex-column flex-md-row">
              <div>
                <Link
                  href="/management/device-management/add/add-device"
                  passHref
                >
                  <button
                    type="button"
                    className="btn btn-primary  px-3 py-2 me-3 mb-2"
                  >
                    <FontAwesomeIcon className="me-2" icon={faPlus} size="sm" />
                    {t("Add_Device")}
                  </button>
                </Link>
                <button
                  type="button"
                  className="btn btn-primary  px-3 py-2 me-3 mb-2"
                  onClick={() => {
                    setBulkModel(true);
                  }}
                >
                  <FontAwesomeIcon
                    className="me-2"
                    icon={faFileCsv}
                    size="sm"
                  />
                  {t("Add_Bulk_of_Devices")}
                </button>
                {/* <button
                  type="button"
                  className="btn btn-primary  px-3 py-2 me-3 mb-2"
                  disabled={true}
                >
                  <FontAwesomeIcon className="me-2" icon={faRandom} size="sm" />
                  {t("Transfer_Device_to_Account")}
                </button> */}
              </div>
            </div>
          </Card.Header>
          {/* ================== first table  ===================== */}
          {/* ================== assigned Devices. ================*/}
          <Card.Body>
            <AgGridDT
              columnDefs={columnsAssigned}
              rowData={assignedDevices}
              paginationNumberFormatter={function (params) {
                return params.value.toLocaleString();
              }}
              defaultColDef={defaultColDef}
              onGridReady={onAssigndGridReady}
              gridApi={assignedGridApi}
              gridColumnApi={assignedGridColumnApi}
              onCellMouseOver={
                (e) =>  (e.event?.target?.dataset?.test = "showActions")
              }
              onCellMouseOut={HideActions}
            />
          </Card.Body>
        </Card>
      </Col>

      {/* ================== second table  ===================== */}
      {/* ================== unassigned Devices. ================*/}
      <Col sm="12">
        <Card className="h-100">
          <nav className="navbar navbar-dark navbar-lg shadow rounded p-3">
            <h3>{t("Unassigned_Devices")}</h3>
          </nav>
          <Card.Body>
            <AgGridDT
              columnDefs={columnsUnassigned}
              rowData={unassignedDevices}
              paginationNumberFormatter={function (params) {
                return params.value.toLocaleString();
              }}
              defaultColDef={defaultColDef}
              onGridReady={onUnassigndGridReady}
              gridApi={unassignedGridApi}
              gridColumnApi={unassignedGridColumnApi}
              onCellMouseOver={(e) =>
                (e?.event?.target?.dataset?.test = "showActions")
              }
              onCellMouseOut={HideActions}
            />

            <DeleteModal
              show={showModalDelete}
              loading={loadingDelete}
              title={"Are you sure?"}
              description={"Are you sure you want to delete this Device?"}
              confirmText={"Yes, delete it!"}
              cancelText={"No, cancel"}
              onConfirm={onDelete}
              onCancel={() => {
                setShowModalDelete(false);
              }}
            />

            {/* Edit Model */}
            <Model
              header={"Update Device Information"}
              show={editModalShow}
              onHide={() => setEditModalShow(false)}
              updateButton={"Update"}
              footer={false}
              size={"lg"}
              className={"mt-5"}
            >
              <Edit
                handleModel={() => {
                  setEditModalShow(false);
                }}
                editId={editId}
                updateAssignedTable={onAssigndGridReady}
                updateUnassignedTable={onUnassigndGridReady}
              />
            </Model>

            {/* Bulk Model */}
            <Model
              header={"Add Devices Bulk"}
              show={bulkModel}
              onHide={() => setBulkModel(false)}
              updateButton={"Update"}
              footer={false}
              size={"xl"}
              className={"mt-5"}
            >
              <Bulk
                excelData={excelData}
                handleModel={() => {
                  setBulkModel(false);
                }}
                modelButtonMsg={"Download Template"}
                icon={faFileDownload}
                fileName={"DevicesPatch"}
                bulkRequest={bulkDataHandler}
                loading={bulkLoading}
              />
            </Model>

            {/* assign device to vehicle Model */}
            <Model
              header={"Assign device to vehicle"}
              show={assignDeviceModel}
              onHide={() => setAssignDeviceModel(false)}
              updateButton={"Assign"}
              size={"xl"}
              className={"mt-5"}
              onUpdate={assignDeviceToVehicle}
              disabled={rowSelected ? assignDeviceModelLoading : true}
            >
              <AgGridDT
                rowHeight={"auto"}
                columnDefs={vehiclesColumns}
                rowData={vehiclesData}
                rowSelection={"single"}
                paginationPageSize={10}
                defaultColDef={defaultColDef}
                onGridReady={onGridReady}
                onSelectionChanged={(e) => {
                  setSelectedPage(e.api.paginationProxy.currentPage);
                  setRowSelected([...e.api.getSelectedRows()][0]);
                }}
                onFirstDataRendered={onFirstDataRendered}
                gridApi={gridApi}
                gridColumnApi={gridColumnApi}
                footer={false}
              />
            </Model>

            {/* unassign device from vehicle Model */}
            <Model
              header={"Unassign Device"}
              show={unassignDeviceModel}
              onHide={() => setUnassignDeviceModel(false)}
              updateButton={"Unassign"}
              size={"xl"}
              className={"mt-5"}
              onUpdate={unassignDeviceToVehicle}
              disabled={unassignDeviceModelLoading}
            >
              <h4 className="text-center">
                Are You Sure You Want to Unassign This Device?
              </h4>
            </Model>

            {/* assign SIM to device */}
            <Model
              header={"Assign SIM card to device"}
              show={assignSIMModel}
              onHide={() => setAssignSIMModel(false)}
              updateButton={"Assign"}
              size={"xl"}
              className={"mt-5"}
              footer={false}
              >
              <AddDeviceToSim
                handleModel={() => {
                  setAssignSIMModel(false);
                }}
                deviceData={assignSIMToDeviceObj}
                updateAssignedTable={onAssigndGridReady}
                updateUnassignedTable={onUnassigndGridReady}
              />
            </Model>

            {/* unassign SIM from device */}
            <Model
              header={"Unassign SIM card"}
              show={unassignSIMModel}
              onHide={() => setUnassignSIMModel(false)}
              updateButton={"Unassign"}
              size={"xl"}
              className={"mt-5"}
              onUpdate={unassignSIMToDevice}
              disabled={unassignSIMModelLoading}
            >
              <h4 className="text-center">
                Are You Sure You Want to Unassign This SIM Card?
              </h4>
            </Model>
          </Card.Body>
        </Card>
      </Col>
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
