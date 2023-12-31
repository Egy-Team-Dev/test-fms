import React, { useState, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faCog, faHistory } from "@fortawesome/free-solid-svg-icons";
// translation
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Row, Col, Button, Card } from "react-bootstrap";
import {
  fetchAllPreventiveMaintenance,
  deletePreventive,
} from "services/preventiveMaintenance";
import Link from "next/link";
import DeleteModal from "components/Modals/DeleteModal";
import { toast } from "react-toastify";
import HideActions from "hooks/HideActions";
import AgGridDT from "components/AgGridDT";
import { useRouter } from "next/router";
import Model from "components/UI/Model";
import { toggle as tourToggle, disableTour } from "lib/slices/tour";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import Edit from "components/preventiveMaintenance/Edit";
import Reset from "components/preventiveMaintenance/Reset";
import { useSelector, useDispatch } from "react-redux";
import style from "styles/scss/custom/components/tour-step/tourStep.module.scss"
import Joyride, {
  ACTIONS,
  CallBackProps,
  EVENTS,
  STATUS,
  Step,
} from "react-joyride";
import moment from 'moment';
import useStepDashboard from "hooks/useStepDashboard";
function PreventiveMaintenance() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation(["preventiveMaintenance", "common", "main",'Tour']);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [rowsSelected, setrowsSelected] = useState([]);
  const [DataTable, setDataTable] = useState(null);
  const [showModalDelete, setshowModalDelete] = useState(false);
  const [loadingDelete, setloadingDelete] = useState();
  const [editModalShow, setEditModalShow] = useState(false);
  const [resetModalShow, setResetModalShow] = useState(false);
  const [editID, setEditID] = useState("");
  const [resetPreventive, setResetPreventive] = useState({});
  const { auth } = useSelector((state) => state);
  const tourState = useSelector((state) => state.tour.run);
  const [deleteSelected, setDeleteSelected] = useState([]);
  const allSteps = useStepDashboard() 

  const handleJoyrideCallback = (data) => {
    const { action, index, status, type } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      // Need to set our running state to false, so we can restart if we click start again.
      setState({ stepIndex: 0, steps: steps });
      dispatch(tourToggle())
    } else if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);

      if (index === 11 && action === ACTIONS.PREV) {
        setToggleMinuTrack((prev) => !prev);
        setState({
          stepIndex: nextStepIndex,
          steps: steps,
        });
      } else if (data.action === "close" || data.action === "reset") {
        dispatch(disableTour());
      } else {
        setState({
          stepIndex: nextStepIndex,
          steps: steps,
        });
      }
    }
  };
  const [{ stepIndex, steps }, setState] = useState({
    stepIndex: 0,
    steps: allSteps['preventiveSteps'],
  });

  // fecth all preventive maintenance and set the Api of the AG grid table for export pdf
  const onGridReady = useCallback(async (params) => {
    try {
      const respond = await fetchAllPreventiveMaintenance();
      setDataTable(respond.result);
      setGridApi(params.api);
      setGridColumnApi(params.columnApi);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  }, []);

  // delete selected data
  const deleteSelectedDate = rowsSelected?.map((row) => row.ID);
  const deleteSelectedDateString = deleteSelectedDate.toString();
  const deleteSelectedNameseString = rowsSelected
    ?.map((row) => row.DisplayName)
    .toString();

  const onDeleteSelected = async () => {

      setshowModalDelete(true);
  };


  const onDelete = async () => {
  setloadingDelete(true);
    try {
      const respond = await deletePreventive(deleteSelectedDateString || deleteSelected.toString());
      toast.success(deleteSelectedNameseString + " deleted successfully");
      // setDataTable(
      //   DataTable?.filter((driver) => !deleteSelectedDate.includes(driver.ID)) ||
      //     DataTable?.filter((driver) => !deleteSelected.includes(driver.ID))
      // );
      onGridReady();
      setrowsSelected([]);
      setloadingDelete(false);
      setshowModalDelete(false);
      setDeleteSelected([])

    } catch (error) {
      toast.error(error.response.data?.message);
      setloadingDelete(false);
      setshowModalDelete(false);
    }
  };

  // change the value of MaintenanceType that came from http reqeust to its name
  const handleMaintenanceType = (params) => {
    const allData = {
      1: "Engine Oil Change",
      2: "Change Vehicle Brakes",
      3: "Vehicle License Renew",
      4: "Vehicle Wash",
      5: "Tires Change",
      6: "Transmission Oil Change",
      7: "Filter Change",
      8: "Others",
    };
    return allData[params?.data?.MaintenanceType];
  };

  // change the value of PeriodType that came from http reqeust to its name
  const handlePeriodType = (params) => {
    const allData = {
      1: t("by_mileage_key"),
      2: t("by_fixed_date_key"),
      4: t("by_working_hours_key"),
    };
    return allData[params.data.PeriodType];
  };

  // change the value of Recurring that came from http reqeust to true/false
  const handleRecurring = (params) => {
    return params.data.Recurring ? "true" : "false";
  };

  // the default setting of the AG grid table .. sort , filter , etc...
  const defaultColDef = useMemo(() => {
    return {
      sortable: true,
      flex: 1,
      resizable: true,
      filter: true,
    };
  }, []);

  // columns used in ag grid
  const columns = useMemo(
    () => [
      {
        headerName: "",
        field: "Select",
        maxWidth: 70,
        sortable: false,
        unSortIcon: false,
        checkboxSelection: true,
        headerCheckboxSelection: true,
      },
      {
        headerName: `${t("Display_Name")}`,
        field: "DisplayName",
        minWidth: 170,
        maxWidth: 180,
        sortable: true,
        unSortIcon: true,
        cellRenderer: (params) => {
          const resetData = {
            plateNumber: params.data.PlateNumber,
            maintenanceType: params.data.MaintenanceType,
            periodType: t(params.data.PeriodType),
            startValue: params.data.StartValue,
            nextValue: params.data.NextValue,
          };
          return (
            <>
              <div
                style={{
                  height: '25px'
                }}
              >{params.value}</div>
              <div className="d-flex justify-content-start gap-1  flex-wrap"
                style={{
                  color: '#1675e0'
                }}
              >
                <span
                  onClick={() => {
                    setResetModalShow(true);
                    setResetPreventive(resetData);
                  }}
                  style={{
                    cursor: "pointer",
                  }}
                >
                  {t("reset")} |
                </span>
                <span
                  style={{
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setEditModalShow(true);
                    setEditID(params.data.ID);
                  }}
                >
                  {t("edit")}
                </span>
                <span
                  style={{
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setshowModalDelete(true);
                    setDeleteSelected(params.data.ID)
                  }}
                >
                  | {t("delete")}
                </span>
              </div>
            </>
          );
        },
      },
      {
        headerName: `${t("Plate_Number")}`,
        field: "PlateNumber",
        minWidth: 150,
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: `${t("Maintenance")}`,
        field: "MaintenanceType",
        valueGetter: handleMaintenanceType,
        minWidth: 150,
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: `${t("Period_Type")}`,
        field: "PeriodType",
        valueGetter: handlePeriodType,
        minWidth: 120,
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: `${t("Start_Value")}`,
        field: "StartValue",
        valueGetter : params => {
          
          if(params?.data?.PeriodType === 2 && moment(params?.data?.StartValue ,  ['MM/DD/YYYY' , 'YYYY-MM-DD']).isValid() && params?.data?.StartValue.includes('-') || params?.data?.StartValue.includes('/')) {
            return moment(params?.data?.StartValue ,  ['MM/DD/YYYY' , 'YYYY-MM-DD']).format('YYYY-MM-DD')
          } 
          else if (params?.data?.StartValue < 0) {
            return 0
          } 
          else {
           return params?.data?.StartValue
          }

        },
        minWidth: 140,
        unSortIcon: true,
      },
      {
        headerName: `${t("Next_Value")}`,
        field: "NextValue",
        valueGetter : params => {
          if(params?.data?.PeriodType === 2 && moment(params?.data?.NextValue ,  ['MM/DD/YYYY' , 'YYYY-MM-DD']).isValid() && params?.data?.NextValue.includes('-') || params?.data?.NextValue.includes('/') ) {
            return moment(params?.data?.NextValue ,  ['MM/DD/YYYY' , 'YYYY-MM-DD']).format('YYYY-MM-DD')
          } else if (params?.data?.NextValue < 0) {
            return 0
          } else {
           return params?.data?.NextValue
          }

        },
        minWidth: 140,
        unSortIcon: true,
      },
      {
        headerName: `${t("Recurring")}`,
        field: "Recurring",
        valueGetter: handleRecurring,
        minWidth: 120,
        unSortIcon: true,
      },
    ],
    [t]
  );

  return (
    <div className="container-fluid">
      
        <>
          <Joyride
            steps={steps}
            run={tourState}
            continuous
            stepIndex={stepIndex}
            callback={handleJoyrideCallback}
            showSkipButton
            locale={
              {
                skip: <span className={style["skip-tour"]}>{t("skip_tour")}</span>,
                back: <span className={style["skip-tour"]}>{t("back")}</span>,
                next: <span >{t("next")}</span>,
                last: <span >{t("last")}</span>,

              }
            }
            styles={{
              options: {
                primaryColor: "#1e8178",
                overlayColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 10901,
                width: "379px",
                // padding: "16px",
                backgroundColor: '#E0EAE9',

              }
            }}
          />
          <Row>
            <Col sm="12">
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-center justify-content-md-between flex-wrap">
                    <div className="d-flex justify-content-center flex-wrap mb-4">
                      <Link href="/preventiveMaintenance/add/formikAdd">
                        <a>
                          <Button
                            variant="primary px-2 py-1 d-flex align-items-center"
                            className="m-1"
                            style={{ fontSize: "13px" }}
                            id="add-maintenance-plan"
                          >
                            <FontAwesomeIcon
                              className="me-2"
                              icon={faCog}
                              size="sm"
                            />
                            {t("Add_Maintenance_Plan")}
                          </Button>
                        </a>
                      </Link>

                      <Button
                        disabled={!rowsSelected.length}
                        variant="primary px-2 py-1 d-flex align-items-center"
                        className="m-1"
                        style={{ fontSize: "13px" }}
                        onClick={onDeleteSelected}
                        id="delete-selected"
                      >
                        <FontAwesomeIcon
                          className="me-2"
                          icon={faTrash}
                          size="sm"
                        />
                        {t("Delete Selected")}
                      </Button>
                      <Button
                        variant="primary px-2 py-1 d-flex align-items-center"
                        className="m-1"
                        style={{ fontSize: "13px" }}
                        onClick={() =>
                          router.push("/preventiveMaintenance/viewHistory")
                        }
                        id="view-history"
                      >
                        <FontAwesomeIcon
                          className="me-2"
                          icon={faHistory}
                          size="sm"
                        />
                        {t("View_History")}
                      </Button>
                    </div>
                  </div>

                  <AgGridDT
                    rowHeight={65}
                    columnDefs={columns}
                    rowData={DataTable}
                    rowSelection={"multiple"}
                    rowMultiSelectWithClick={'true'}
                    onSelectionChanged={(e) => {
                      setrowsSelected([...e.api.getSelectedRows()])
                    }
                    }
                    onCellMouseOver={(e) =>
                      (e?.event?.target?.dataset?.test = "showActions")
                    }
                    onCellMouseOut={HideActions}
                    paginationNumberFormatter={function (params) {
                      return params.value.toLocaleString();
                    }}
                    defaultColDef={defaultColDef}
                    onGridReady={onGridReady}
                    gridApi={gridApi}
                    gridColumnApi={gridColumnApi}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <DeleteModal
            show={showModalDelete}
            loading={loadingDelete}
            title={t("delete_maintenance_plan_key")}
            description={
              deleteSelectedDate.length === 1
                ? t("are_you_sure_you_want_to_delete_this_maintenance_plan?")
                : t("are_you_sure_you_want_to_delete_the_maintenance_plans?")
            }
            confirmText={t("Yes,delete!")}
            cancelText={t("No,cancel")}
            onConfirm={onDelete}
            onCancel={() => {
              setshowModalDelete(false);
              setDeleteSelected([])
            }}
          />
          {/* Edit Model */}
          <Model
            header={t("update_maintenance_plan_key")}
            show={editModalShow}
            onHide={() => setEditModalShow(false)}
            updateButton={"Update"}
            footer={false}
          >
            <Edit
              handleModel={() => {
                setEditModalShow(false);
              }}
              icon={faExternalLinkAlt}
              model={true}
              id={editID}
              modelButtonMsg={t("open_in_new_tab_key")}
              className={`p-0 m-0`}
              onModelButtonClicked={() => {
                router.push(`/preventiveMaintenance/edit/formikEdit?id=${editID}`);
              }}
              updateTable={onGridReady}
            />
          </Model>
          {/* Reset Model */}
          <Model
            header={t("reset_notification's_value_key")}
            show={resetModalShow}
            onHide={() => setResetModalShow(false)}
            updateButton={t("submit_key")}
            footer={false}
          >
            <Reset
              data={resetPreventive}
              handleModel={() => {
                setResetModalShow(false);
              }}
            />
          </Model>
        </>


    </div>
  );
}

export default PreventiveMaintenance;

// translation ##################################
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "preventiveMaintenance",
        "common",
        "main",
        "Table",
        'Tour'
      ])),
    },
  };
}
// translation ##################################
