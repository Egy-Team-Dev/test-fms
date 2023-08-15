import { useMemo, useState, useCallback } from "react";
import { Row, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileDownload, faSimCard } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  fetchAllSims,
  fetchAllUnAssignedSims,
  postSimsBulk,
  deleteSim,
} from "services/management/SimManagement";
import HideActions from "hooks/HideActions";
import { toast } from "react-toastify";
import DeleteModal from "components/Modals/DeleteModal";
import AgGridDT from "components/AgGridDT";
import Model from "components/UI/Model";
import Bulk from "components/management/Bulk";
import Edit from "components/management/SimManagement/Edit";
import AddSimToDevice from "components/management/SimManagement/AddSimToDevice";

// when click in download template in bulk, excel data will downloaded
const excelData = [
  {
    PhoneNumber: "",
    SimProvider: "",
    SIMSerial: "",
  },
];

const SimManagement = () => {
  const { t } = useTranslation("Management");
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState();
  const [bulkModel, setBulkModel] = useState(false);

  const [assignedSims, setAssignedSims] = useState(null);
  const [assignedGridApi, setAssignedGridApi] = useState(null);
  const [assignedGridColumnApi, setAssignedGridColumnApi] = useState(null);

  const [unassignedSims, setUnassignedSims] = useState(null);
  const [unassignedGridApi, setUnassignedGridApi] = useState(null);
  const [unassignedGridColumnApi, setUnassignedGridColumnApi] = useState(null);

  const [bulkLoading, setBulkLoading] = useState(false);
  const [deleteObj, setDeleteObj] = useState({});
  const [editModalShow, setEditModalShow] = useState(false);
  const [editObj, setEditObj] = useState({});
  const [assignModalShow, setAssignModalShow] = useState(false);
  const [assignId, setAssignId] = useState("");

  // fetch Assigned vehicles data
  const onAssigndGridReady = useCallback(async (params) => {
    try {
      const respond = await fetchAllSims();
      setAssignedSims(respond.result);
      setAssignedGridApi(params.api);
      setAssignedGridColumnApi(params.columnApi);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  }, []);

  // fetch unassigned vehicles data
  const onUnassigndGridReady = useCallback(async (params) => {
    try {
      const respond = await fetchAllUnAssignedSims();
      setUnassignedSims(respond.result);
      setUnassignedGridApi(params.api);
      setUnassignedGridColumnApi(params.columnApi);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  }, []);

  // delete vehicle
  const onDelete = async () => {
    setLoadingDelete(true);
    try {
      const respond = await deleteSim(deleteObj.id);
      toast.success(respond.message);
      setLoadingDelete(false);
      setShowModalDelete(false);
      if (deleteObj.isAssignTable) {
        setAssignedSims((prev) =>
          prev.filter((ele) => ele.ID !== deleteObj.id)
        );
      } else {
        setUnassignedSims((prev) =>
          prev.filter((ele) => ele.ID !== deleteObj.id)
        );
      }
    } catch (error) {
      toast.error(error.response.data?.message);
      setLoadingDelete(false);
      setShowModalDelete(false);
    }
  };

  // bulk submitted function
  const bulkDataHandler = async (data) => {
    setBulkLoading(true);
    try {
      const respond = await postSimsBulk(data);
      setBulkLoading(false);
      setBulkModel(false);
      toast.success("Bulk added successfully");
    } catch (error) {
      toast.error(error.response.data?.message);
      setBulkLoading(false);
    }
  };

  // columns used in assigned ag grid
  const columnsAssigned = useMemo(
    () => [
      {
        headerName: `${t("SIMCard_Serial_Number")}`,
        field: "SimSerialNumber",
        sortable: true,
        unSortIcon: true,
        cellRenderer: (params) => (
          <>
            <div>{params.value}</div>
            <div className="d-flex justify-content-start gap-1 options flex-wrap">
              <span
                onClick={() => {
                  setEditObj(params.data);
                  setEditModalShow(true);
                }}
                className=""
              >
                {t("edit")}
              </span>
              <span
                onClick={() => {
                  setDeleteObj({
                    id: params.data.ID,
                    isAssignTable: true,
                  });
                  setShowModalDelete(true);
                }}
                className=""
              >
                | {t("delete")}
              </span>
            </div>
          </>
        ),
      },
      {
        headerName: `${t("Phone Number")}`,
        field: "PhoneNumber",
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: `${t("Provider_Name")}`,
        field: "ProviderName",
        unSortIcon: true,
      },
    ],
    [t]
  );

  // columns used in unassigned ag grid
  const columnsUnassigned = useMemo(
    () => [
      {
        headerName: `${t("SIMCard_Serial_Number")}`,
        field: "SimSerialNumber",
        minWidth: 150,
        sortable: true,
        unSortIcon: true,
        cellRenderer: (params) => (
          <>
            <div>{params.value}</div>
            <div className="d-flex justify-content-start gap-1 options flex-wrap">
              <span
                onClick={() => {
                  setAssignId(params.data.ID);
                  setAssignModalShow(true);
                }}
              >
                {t("Assign to Device")} |
              </span>
              <span
                onClick={() => {
                  setEditObj(params.data);
                  setEditModalShow(true);
                }}
                className=""
              >
                {t("edit")}
              </span>
              <span
                onClick={() => {
                  setDeleteObj({
                    id: params.data.ID,
                    isAssignTable: false,
                  });
                  setShowModalDelete(true);
                }}
                className=""
              >
                | {t("delete")}
              </span>
            </div>
          </>
        ),
      },
      {
        headerName: `${t("Phone Number")}`,
        field: "PhoneNumber",
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: `${t("Provider_Name")}`,
        field: "ProviderName",
        unSortIcon: true,
      },
    ],
    [t]
  );

  // default properties to ag grid
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
            <h3>Manage SIMCards</h3>
            <Card.Header className="ps-0 d-flex justify-content-between">
              <div className="w-100 header-title d-flex justify-content-between align-items-center p-3">
                <div>
                  <Link href="/management/sim-management/add" passHref>
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
                    onClick={() => {
                      setBulkModel(true);
                    }}
                  >
                    <FontAwesomeIcon
                      className="me-2"
                      icon={faSimCard}
                      size="sm"
                    />
                    Add SIMCard Bulk
                  </button>
                </div>
              </div>
            </Card.Header>

            <DeleteModal
              show={showModalDelete}
              loading={loadingDelete}
              title={"Are you sure?"}
              description={"Are you sure you want to delete this sim card?"}
              confirmText={"Yes, delete it!"}
              cancelText={"No, cancel"}
              onConfirm={onDelete}
              onCancel={() => {
                setShowModalDelete(false);
              }}
            />

            <AgGridDT
              columnDefs={columnsAssigned}
              rowData={assignedSims}
              paginationNumberFormatter={function (params) {
                return params.value.toLocaleString();
              }}
              defaultColDef={defaultColDef}
              onGridReady={onAssigndGridReady}
              gridApi={assignedGridApi}
              gridColumnApi={assignedGridColumnApi}
              onCellMouseOver={(e) =>
                (e?.event?.target?.dataset?.test = "showActions")
              }
              onCellMouseOut={HideActions}
            />

            <h3 className="mt-5 pt-2">{t("Unassigned_SIMCards")} </h3>
            <AgGridDT
              columnDefs={columnsUnassigned}
              rowData={unassignedSims}
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

            {/* Bulk Model */}
            <Model
              header={"Add Sim Cards Bulk"}
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
                fileName={"SimsPatch"}
                bulkRequest={bulkDataHandler}
                loading={bulkLoading}
              />
            </Model>

            {/* Edit Model */}
            <Model
              header={"Update Sim Card Information"}
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
                editObj={editObj}
                updateAssignedTable={onAssigndGridReady}
                updateUnassignedTable={onUnassigndGridReady}
              />
            </Model>

            {/* assign sim Model */}
            <Model
              header={"Assign Sim Card Number to the Device"}
              show={assignModalShow}
              onHide={() => setAssignModalShow(false)}
              updateButton={"Update"}
              footer={false}
              size={"lg"}
              className={"mt-5"}
            >
              <AddSimToDevice
                handleModel={() => {
                  setAssignModalShow(false);
                }}
                id={assignId}
              />
            </Model>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SimManagement;

// translation ##################################
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["main", "Management"])),
    },
  };
}
// translation ##################################
// data layers Google analytics 