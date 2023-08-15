import React, { useState, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory } from "@fortawesome/free-solid-svg-icons";
// translation
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Row, Col, Button, Card } from "react-bootstrap";
import Link from "next/link";
import AgGridDT from "components/AgGridDT";
import { viewHistory } from "services/preventiveMaintenance";
import { toast } from "react-toastify";

const ViewHistory = () => {
  const { t } = useTranslation(["preventiveMaintenance", "common", "main"]);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [DataTable, setDataTable] = useState(null);

  // fecth all history data and set the Api of the AG grid table for export pdf
  const onGridReady = useCallback(async (params) => {
    try {
      const respond = await viewHistory();
      setDataTable(respond.result);
      setGridApi(params.api);
      setGridColumnApi(params.columnApi);
    } catch (error) {
      toast.error(error.response.data?.message);
    }
  }, []);

  // the default setting of the AG grid table .. sort , filter , etc...
  const defaultColDef = useMemo(() => {
    return {
      sortable: true,
      flex: 1,
      resizable: true,
      filter: true,
    };
  }, []);

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
      1: "By Mileage",
      2: "By Fixed Date",
      3: "By Working Hours",
    };
    return allData[params?.data?.PeriodType];
  };

  // change the value of Recurring that came from http reqeust to true/false
  const handleRecurring = (params) => {
    return params?.data?.Recurring ? "true" : "false";
  };

  // change the value of NotifyPeriod that came from http reqeust to its name
  const handleNotifyPeriod = (params) => {
    const allData = {
      1: "Percentage",
      2: "Value",
    };
    return allData[params?.data?.WhenPeriod];
  };

  // columns used in ag grid
  const columns = useMemo(
    () => [
      {
        headerName: `${t("Display_Name")}`,
        field: "DisplayName",
        minWidth: 170,
        maxWidth: 180,
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
        headerName: `${t("Maintenance")}`,
        field: "MaintenanceType",
        minWidth: 150,
        sortable: true,
        unSortIcon: true,
        valueGetter: handleMaintenanceType,
      },
      {
        headerName: `${t("Period_Type")}`,
        field: "PeriodType",
        minWidth: 140,
        sortable: true,
        unSortIcon: true,
        valueGetter: handlePeriodType,
      },
      {
        headerName: `${t("Start_Value")}`,
        field: "StartValue",
        minWidth: 140,
        unSortIcon: true,
      },
      {
        headerName: `${t("maintenance_due_value_key")}`,
        field: "NextValue",
        minWidth: 200,
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: `${t("Recurring")}`,
        field: "Recurring",
        minWidth: 120,
        unSortIcon: true,
        valueGetter: handleRecurring,
      },
      {
        headerName: `${t("notify_period_key")}`,
        field: "NotifPeriod",
        minWidth: 150,
        unSortIcon: true,
        valueGetter: handleNotifyPeriod,
      },
      {
        headerName: `${t("notify_when_value_key")}`,
        field: "WhenValue",
        minWidth: 180,
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: `${t("current_value_key")}`,
        field: "CurrentValue",
        minWidth: 150,
        unSortIcon: true,
      },
      {
        headerName: `${t("original_value_key")}`,
        field: "OrginalValue",
        minWidth: 160,
        unSortIcon: true,
      },
    ],
    [t]
  );

  return (
    <div className="container-fluid">
      <Row>
        <Col sm="12">
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-center justify-content-md-between flex-wrap">
                <div className="d-flex justify-content-center flex-wrap mb-4">
                  <Link href="/preventiveMaintenance" passHref>
                    <Button
                      variant="primary p-1 d-flex align-items-center"
                      className="m-1"
                      style={{ fontSize: "13px" }}
                    >
                      <FontAwesomeIcon
                        className="me-2"
                        icon={faHistory}
                        size="sm"
                      />
                      {t("back_key")}
                    </Button>
                  </Link>
                </div>
              </div>

              <AgGridDT
                rowHeight={65}
                columnDefs={columns}
                rowData={DataTable}
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
    </div>
  );
};

export default ViewHistory;

// translation ##################################
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "preventiveMaintenance",
        "common",
        "main",
        "Table",
      ])),
    },
  };
}
// translation ##################################
