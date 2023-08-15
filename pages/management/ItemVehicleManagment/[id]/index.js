import { useCallback, useEffect, useMemo, useState } from "react";
import { Row, Col, Card, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlug,
  faUsersCog,
  // faPen,
  faCar,
  faUserSlash,
  faEdit,
  faSimCard,
  faFileExport,
  faTrash,
  faUserEdit,
  // faFileCsv,
} from "@fortawesome/free-solid-svg-icons";
import HideActions from "hooks/HideActions";
// translation
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import CardCountStart from "../../../../components/CardCountStart";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import useToken from "../../../../hooks/useToken";
import { fetchVehicles } from "../../../../lib/slices/vehicleInfo";
import { useRouter } from "next/router";
import AgGridDT from "../../../../components/AgGridDT";
import { fetchAllUnAssignedVehicles, fetchVehilceStatistics } from "services/management/VehicleManagement";

const ItemVehicleManagment = () => {
  const { t } = useTranslation("Management");
  const dispatch = useDispatch();
  const [unassignedVehicles, setUnassignedVehicles] = useState(null);
  const [unassignedGridApi, setUnassignedGridApi] = useState(null);
  const [unassignedGridColumnApi, setUnassignedGridColumnApi] = useState(null);
  const [vehiclesStatistics,setVehiclesStatistics] = useState({})
  const { AllData /* loading */ } = useSelector((state) => state.vehicleInfo);
  const Assigned = AllData?.filter((ele) => ele.VehicleID !== null);
  // const UnAssigned = AllData?.filter((ele) => ele.VehicleID === null);
  const { query } = useRouter();


  const onUnassigndGridReady = useCallback(async (params) => {
    try {
      const respond = await fetchAllUnAssignedVehicles(query.id);
      setUnassignedVehicles(respond.unAssingedVehicles);
      setUnassignedGridApi(params.api);
      setUnassignedGridColumnApi(params.columnApi);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  }, []);




  const [, /* gridColumnApi */ setGridColumnApi] = useState(null);
  const [, setGridApi] = useState(null);

  const { tokenRef } = useToken();
  useEffect(() => {
    const data = { tokenRef, id: query.id };

    if (tokenRef)
    dispatch(fetchVehicles(data));
  }, [dispatch, tokenRef]);

  const rowHeight = 65;


  // fetch vehicle Statistics(main page)
  useEffect(() => {
    const fetchVehiclesStatistics = async () => {
      try {
        const respond = await fetchVehilceStatistics(query.id);
        setVehiclesStatistics(respond);
      } catch (error) {
        toast.error(error.response.data?.message);
      }
    };
    fetchVehiclesStatistics();
  }, []);




  const columnsAssigned = useMemo(
    () => [
      {
        headerName: `${t("Display_Name")}`,
        field: "DisplayName",
        // valueGetter: handleFullName,
        cellRenderer: (params) => (
          <>
            <Link href={`Driver`}>
              <a className="text-decoration-underline">{params.value}</a>
            </Link>
            <div className="d-flex justify-content-start flex-wrap gap-1 options ">

              <span className=" px-2 mt-0">
                {/* <FontAwesomeIcon className="pe-2" icon={faEdit} size="lg" /> */}
                {/* {t("user_role")} */}
                {t("edit")}
              </span>
              <span className="px-2  mt-0">
                {/* <FontAwesomeIcon className="pe-2" icon={faTrash} size="lg" /> */}
                {/* {t("user_info")} */}

                {t("delete")}
              </span>
              <span className=" px-2 mt-0">
                {/* <FontAwesomeIcon
                    className="pe-2"
                    icon={faUserSlash}
                    size="lg"
                  /> */}
                {/* {t("manage_vehicles")} */}

                {t("Deactivate")}
              </span>
              <span className="px-2  mt-0">
                {/* <FontAwesomeIcon className="pe-2" icon={faCar} size="lg" /> */}
                {/* {t("reset_password")} */}

                {t("Show_Vehicles")}
              </span>

            </div>
          </>
        ),
        minWidth: 350,
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: `${t("Plate_Number")}`,
        field: "PlateNumber",
        minWidth: 150,
        sortable: true,
        unSortIcon: true,
      },

      {
        headerName: `${t("Manufacturing_Company")}`,
        field: "manufacturingCompany",
        minWidth: 150,
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: `${t("Vehicle_Type")}`,
        field: "VehicleStatus",
        minWidth: 150,
        // valueFormatter:
        //   'value?.slice(5).replace("T", " ").replace(".000Z", "")',
        unSortIcon: true,
      },
      {
        headerName: `${t("Chassis_Number")}`,
        field: "Chassis",
        minWidth: 120,
        //  valueFormatter: "value?.toFixed(2)",
        unSortIcon: true,
      },
      {
        headerName: `${t("Manufacturing_Year")}`,
        field: "MakeYear",
        minWidth: 120,
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: `${t("Device_Serial_Number")}`,
        field: "PlateNumber",
        minWidth: 120,
        //  valueFormatter: "value?.toFixed(2)",
        unSortIcon: true,
      },
      {
        headerName: `${t("Device_Type")}`,
        field: "PlateType",
        minWidth: 120,
        //  valueFormatter: "value?.toFixed(2)",
        unSortIcon: true,
      },
      {
        headerName: `${t("WASL_Integration")}`,
        field: "LeftLetter",
        minWidth: 120,
        //  valueFormatter: "value?.toFixed(2)",
        unSortIcon: true,
      },
      // {
      //   headerName: "Actions",
      //   field: "DriverID",
      //   minWidth: 420,
      //   cellRenderer: () => (
      //     <div>
      //       <>
      //         <button className="btn btn-outline-primary m-1">
      //           <FontAwesomeIcon className="pe-2" icon={faEdit} size="lg" />
      //           {/* {t("user_role")} */}
      //           edit
      //         </button>
      //         <button className="btn btn-outline-primary m-1">
      //           <FontAwesomeIcon className="pe-2" icon={faTrash} size="lg" />
      //           {/* {t("user_info")} */}
      //           delete
      //         </button>
      //         <button className="btn btn-outline-primary m-1">
      //           <FontAwesomeIcon
      //             className="pe-2"
      //             icon={faUserSlash}
      //             size="lg"
      //           />
      //           {/* {t("manage_vehicles")} */}
      //           Deactivate
      //         </button>
      //         <button className="btn btn-outline-primary m-1">
      //           <FontAwesomeIcon className="pe-2" icon={faCar} size="lg" />
      //           {/* {t("reset_password")} */}
      //           Show Vehicles
      //         </button>
      //       </>
      //     </div>
      //   ),
      // },
    ],
    [t]
  );

  // const columnsUnassigned = useMemo(
  //   () => [
  //     {
  //       headerName: `${t("Device_Serial_Number")}`,
  //       field: "PlateNumber",
  //       minWidth: 100,
  //       sortable: true,
  //       unSortIcon: true,
  //     },
  //     {
  //       headerName: `${t("Device_Type")}`,
  //       field: "TypeName",
  //       minWidth: 100,
  //       //  valueFormatter: "value?.toFixed(2)",
  //       unSortIcon: true,
  //     },
  //     {
  //       headerName: `${t("Actions")}`,
  //       field: "DriverID",
  //       minWidth: 190,
  //       cellRenderer: () => (
  //         <div>
  //           <>
  //             <button className="btn btn-outline-primary m-1">
  //               <FontAwesomeIcon className="pe-2" icon={faUserEdit} size="lg" />
  //               {t("Complete_User_Creation")}
  //             </button>
  //           </>
  //         </div>
  //       ),
  //     },
  //   ],
  //   [t]
  // );

    // columns used in unassigned ag grid
    const columnsUnAssigned = useMemo(
      () => [
        {
          headerName: `${t("Display_Name")}`,
          field: "DisplayName",
          cellRenderer: (params) => (
            <>
              <div>{params.value ?? "N/A" }</div>
              <div className="d-flex align-items-center  justify-content-start gap-2 optionsShow flex-wrap">
                <span
                  onClick={() => {
                    setAssignModalShow(true);
                    setAssignVehicleID(params.data.VehicleID);
                  }}
                >
                  {t("Assign Device")} |
                </span>
                <span
                  onClick={() => {
                    setEditID(params.data.VehicleID);
                    setEditModalShow(true);
                  }}
                  className=""
                >
                  {t("edit")}
                </span>
                <span
                onClick={() => {
                  setshowModalDelete(true);
                  setDeleteObj({
                    id: params.data.VehicleID,
                    isAssignTable: false,
                  });
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
          headerName: `${t("Plate_Number")}`,
          field: "PlateNumber",
          valueFormatter: (params) => params?.value ?? "N/A" ,
          minWidth: 150,
          sortable: true,
          unSortIcon: true,
        },
        {
          headerName: `${t("Manufacturing_Company")}`,
          field: "MakeYear",
          valueFormatter: (params) => params?.value ?? "N/A" ,
          minWidth: 150,
          sortable: true,
          unSortIcon: true,
        },
        {
          headerName: `${t("Vehicle_Type")}`,
          field: "TypeName",
          valueFormatter: (params) => params?.value ?? "N/A" ,

          minWidth: 150,
          unSortIcon: true,
        },
        {
          headerName: `${t("Chassis_Number")}`,
          field: "Chassis",
          valueFormatter: (params) => params?.value ?? "N/A" ,

          minWidth: 120,
          unSortIcon: true,
        },
        {
          headerName: `${t("Manufacturing_Year")}`,
          field: "MakeYear",
          valueFormatter: (params) => params?.value?.slice(0 , 4) ?? "N/A" ,

          minWidth: 120,
          sortable: true,
          unSortIcon: true,
         
        },
      ],
      [t]
    );

  const onFirstDataRendered = (params) => {
    params.api.paginationGoToPage(0);
  };
  // Make style for table
  const getRowStyle = (params) => {
    if (params.data.id % 2) {
      return {
        backgroundColor: "#FFE7D9",
        color: "#7A0C2E",
      };
    } else {
      return {
        backgroundColor: "#C8FACD",
        color: "#196759",
      };
    }
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };
  const defaultColDef = useMemo(() => {
    return {
      sortable: true,
      flex: 1,
      resizable: true,
      filter: true,
    };
  }, []);

  // =======================|Modal Number 2|==============================
  return (
    <div className="container-fluid">
      <Row>
        <Card>
          <Card.Body>
            <Row>
              <CardCountStart
                icon={faCar}
                iconColor="primary"
                title="Active_Vehicles"
                countEnd={vehiclesStatistics?.active_Vehicles || 0}
                desc={t("Vehicles that is currently live and send data.")}
              />
              <CardCountStart
                icon={faPlug}
                iconColor="success"
                title="Inactive_Vehicles"
                countEnd={vehiclesStatistics?.Inactive_Vehicles || 0}
                desc={t("Vehicles that didn't send any data for more than one minute.")}
              />
              <CardCountStart
                icon={faUsersCog}
                iconColor="warning"
                title="Unassigned_Devices"
                countEnd={vehiclesStatistics?.unassignedDevices || 0}
                desc={t("Devices that are Added to the system but not yet assigned to a vehicle.")}
              />
              <CardCountStart
                icon={faUserEdit}
                iconColor="info"
                title="Active_Accounts"
                countEnd={vehiclesStatistics?.activeAccounts || 0}
                desc={t("Accounts that are active on the system.")}
              />

              <Col sm="12">
                <Card>
                  <Card.Header className="d-flex justify-content-between">
                    <div className="d-flex flex-column w-100">
                      <div className="w-100 header-title d-flex justify-content-between align-items-center p-3">
                        <div>
                          <Link href="/management/AddVehicleInfo" passHref>
                            <button
                              type="button"
                              className="btn btn-primary  px-3 py-2 me-3 "
                            >
                              <FontAwesomeIcon
                                className="me-2"
                                icon={faSimCard}
                                size="sm"
                              />
                              {t("Add_Vehicle")}

                            </button>
                          </Link>

                          <button
                            type="button"
                            className="btn btn-primary  px-3 py-2 me-3 "
                          // onClick={() =>
                          //     setShowMyVerticallyCenteredModal(
                          //         true
                          //     )
                          // }
                          >
                            <FontAwesomeIcon
                              className="me-2"
                              icon={faSimCard}
                              size="sm"
                            />
                            {t("Add_Vehicle_Bulk")}

                          </button>

                          <button
                            type="button"
                            className="btn btn-primary  px-3 py-2 me-3 "
                          >
                            <FontAwesomeIcon
                              className="me-2"
                              icon={faFileExport}
                              size="sm"
                            />
                            {t("Export_Assigned_Vehicles")}

                          </button>
                        </div>
                      </div>
                      <div>
                        <h3>{t("Assigned_Vehicles")}</h3>
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <AgGridDT
                      rowHeight={rowHeight}
                      columnDefs={columnsAssigned}
                      rowData={Assigned}
                      paginationNumberFormatter={function (params) {
                        return params.value.toLocaleString();
                      }}
                      onFirstDataRendered={onFirstDataRendered}
                      defaultColDef={defaultColDef}
                      onCellMouseOver={(e) =>
                        (e?.event?.target?.dataset?.test = "showActions")
                      }
                      onCellMouseOut={HideActions}
                      onGridReady={onGridReady}
                    />
                  </Card.Body>
                </Card>
              </Col>
              <Col sm="12">
                <Card>
                  <Card.Body>
                    <div className="w-100 card-title mb-4 h3">
                      {t("Unassigned_Vehicles")}
                    </div>
                    <div className="d-flex flex-column justify-content-end flex-wrap w-100">
                      <Form.Floating className="custom-form-floating custom-form-floating-sm form-group">
                        <Form.Control
                          type="search"
                          className=""
                          id="floatingInput5"
                          placeholder="Search..."
                        />
                        <label htmlFor="floatingInput">
                          {t("main:search")}
                        </label>
                      </Form.Floating>
                      <AgGridDT
                        rowHeight={rowHeight}
                        columnDefs={columnsUnAssigned}
                        rowData={unassignedVehicles}
                        paginationNumberFormatter={function (params) {
                          return params.value.toLocaleString();
                        }}
                        onFirstDataRendered={onFirstDataRendered}
                        defaultColDef={defaultColDef}
                        getRowStyle={getRowStyle}
                        gridColumnApi={ unassignedGridColumnApi}
                         gridApi={unassignedGridApi}
                        onGridReady={onUnassigndGridReady}
                        showNoRowsOverlay={() => t("NO_Data_Available")}
                      />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Row>
    </div>
  );
};
export default ItemVehicleManagment;

// translation ##################################
export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["Management", "main"])),
    },
  };
}
// translation ##################################
