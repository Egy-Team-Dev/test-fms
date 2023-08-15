import { useState, useEffect } from "react";
//Ag grid
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import "ag-grid-community/dist/styles/ag-theme-alpine-dark.css";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel, faFilePdf } from "@fortawesome/free-solid-svg-icons";
// import PDFExportPanel from "./pdfExport/PDFExportPanel";
import { Button, Modal, Dropdown } from "react-bootstrap";
import dynamic from "next/dynamic";
import { useTranslation } from "next-i18next";
import axios from "axios";
import Spinner from "components/UI/Spinner";
import { convertJsonToExcel } from "helpers/helpers";
import moment from "moment";

const PDFExportPanel = dynamic(() => import("./pdfExport/PDFExportPanel"), {
  ssr: false,
});

const AgGridDT = ({
  columnDefs,
  rowData,
  onFirstDataRendered,
  rowHeight,
  onSelectionChanged,
  paginationPageSize,
  paginationNumberFormatter,
  defaultColDef,
  onGridReady,
  suppressMenuHide,
  onCellMouseOver,
  onCellMouseOut,
  overlayNoRowsTemplate,
  suppressExcelExport,
  getRowStyle,
  autoSize,
  suppressSizeToFit,
  gridApi,
  getWholeReportApi,
  gridColumnApi,
  Height,
  rowSelection,
  footer = true,
  onCellEditRequest,
  readOnlyEdit,
  animateRows,
  onCellValueChanged,
  onPaginationChanged,
  enableCellChangeFlash,
  loadingOverlayComponent,
  overlayLoadingTemplate,
  suppressPaginationPanel,
  rowMultiSelectWithClick,
  loading,
  getRowClass,
  suppressRowClickSelection,
  type,
}) => {
  const router = useRouter();
  const { darkMode } = useSelector((state) => state.config);
  const { t } = useTranslation("main");
  const [openBtnsExportsModel, setOpenBtnsExportsModel] = useState(false);
  const { locale } = router;

  const changeRowDataKeys = (data) => {
    if (router.pathname === "/scheduledReports/add") {
      let newArr = [];
      type !== "users"
        ? (newArr = data?.map((entry) => {
          return {
            DisplayName: entry.DisplayName || "N/A",
            PlateNumber: entry.PlateNumber || "N/A",
            Chassis: entry.Chassis || "N/A",
            MakeYear: entry.MakeYear || "N/A",
            SerialNumber: entry.SerialNumber || "N/A",
            VehicleID: entry.VehicleID,
          };
        }))
        : (newArr = data?.map((entry) => {
          return {
            FullName: entry.FullName || "N/A",
            UserName: entry.UserName || "N/A",
            Email: entry.Email || "N/A",
            vehicle_count: entry.vehicle_count || "N/A",
          };
        }));
      return newArr;
    } else if (router.pathname === "/scheduledReports") {
      const newArr = data.map((ele) => {
        const obj = { ...ele.data, ...ele };

        const newObj = {};
        Object.keys(obj).forEach((key) => {
          if (key === "_id") {
            newObj.Report_ID = obj._id;
          } else if (key === "reportName") {
            newObj.Report_Name = obj.reportName;
          } else if (key === "FrequencyTitle") {
            newObj.Frequency_Type = obj.FrequencyTitle;
          } else if (key === "vehID") {
            newObj.Number_of_Vehicles = obj.vehID.length;
          } else if (key === "ScheduleUserIds") {
            newObj.Number_of_Users = obj.ScheduleUserIds.length;
          } else if (key === "lastRunAt") {
            newObj.Last_Run = moment(obj.lastRunAt).format(
              "YYYY-MM-DD / h:mm a"
            );
          } else if (key === "nextRunAt") {
            newObj.Next_Run = moment(obj.nextRunAt).format(
              "YYYY-MM-DD / h:mm a"
            );
          } else if (key === "to") {
            newObj.Additional_Email = obj?.to[0]?.text || obj.to[0];
          } else if (key === "Description") {
            newObj.Description = obj.Description;
          } else {
            newObj[key] = obj[key];
          }
        });
        let keys = [];
        Object.keys(newObj).forEach((key) => {
          keys.push(key);
        });

        const order = [
          "Report_ID",
          "Report_Name",
          "Frequency_Type",
          "Number_of_Vehicles",
          "Number_of_Users",
          "Last_Run",
          "Next_Run",
          "Additional_Email",
          "Description",
        ];
        const newOrderdObj = order.reduce((obj, key) => {
          if (!newObj[key]) {
            obj[key] = "N/A";
          } else {
            obj[key] = newObj[key];
          }

          return obj;
        }, {});

        return newOrderdObj;
      });
      return newArr;
    } else if (router.pathname === "/preventiveMaintenance") {
      let newArr = [];
      newArr = data?.map((entry) => {
        return {
          ...entry,
          IsNotified:
            typeof entry.IsNotified !== "boolean" ? "N/A" : entry.IsNotified,
        };
      });
      return newArr;
    } else if (router.pathname === "/management/account-management/manageUsers") {

      let newArr = [];
      newArr = data?.map(({ ImageFileName, ...rest }) => {
        let newObj = {};
        for (const key in rest) {
          if (rest[key] !== null && rest[key] !== undefined) {
            newObj[key] = rest[key];
          } else {
            newObj[key] = "N/A";
          }
        }
        return newObj;
      });
      return newArr;
    } else {
      return [...data];
    }
  };

  const onBtnExport = () => {
    const visibleRows = [];
    const pageSize = gridApi.paginationGetPageSize();
    const startRow = gridApi.paginationGetCurrentPage() * pageSize;
    gridApi.forEachNodeAfterFilterAndSort((node) => {
      const displayedRow = gridApi.getRowNode(`${node.id}`);
      if (
        displayedRow.rowIndex >= startRow &&
        displayedRow.rowIndex < startRow + pageSize
      ) {
        visibleRows.push(displayedRow.data);
      }
    });
    convertJsonToExcel(
      changeRowDataKeys(visibleRows.length ? visibleRows : rowData),
      "AgGrid Data"
    );
  };
  const handleOpenBtnsExportsModel = () => setOpenBtnsExportsModel(true);

  useEffect(() => {
    if (gridApi) {
      const dataSource = {
        getRows: (params) => params.successCallback(rowData, rowData.length),
      };
      gridApi.setDatasource(dataSource);
    }
  }, [gridApi]);

  return (
    <div
      className={`ag-theme-alpine${darkMode ? "-dark" : ""} ag-grid-style`}
      style={{ height: Height || "" }}
    >
      <AgGridReact
        rowMultiSelectWithClick={rowMultiSelectWithClick || false}
        rowHeight={rowHeight || 65}
        enableRtl={locale == "ar" ? true : false}
        columnDefs={columnDefs}
        rowData={rowData}
        suppressRowClickSelection={suppressRowClickSelection}
        rowSelection={rowSelection || "multiple"}
        onSelectionChanged={onSelectionChanged || null}
        onCellMouseOver={onCellMouseOver || null}
        onCellMouseOut={onCellMouseOut || null}
        pagination={true}
        autoSize={autoSize || false}
        domLayout={"autoHeight"}
        suppressExcelExport={suppressExcelExport || true}
        cacheBlockSize={paginationPageSize || 10}
        paginationPageSize={paginationPageSize || 10}
        paginationNumberFormatter={paginationNumberFormatter || null}
        onFirstDataRendered={onFirstDataRendered || null}
        defaultColDef={defaultColDef || null}
        onGridReady={onGridReady || null}
        overlayNoRowsTemplate={
          overlayNoRowsTemplate || t("no_rows_to_show_key")
        }
        overlayLoadingTemplate={overlayLoadingTemplate || ""}
        suppressMenuHide={suppressMenuHide || true}
        getRowStyle={getRowStyle || null}
        readOnlyEdit={readOnlyEdit || null}
        onCellEditRequest={onCellEditRequest || null}
        onCellValueChanged={onCellValueChanged || null}
        onPaginationChanged={onPaginationChanged || null}
        animateRows={animateRows || null}
        enableCellChangeFlash={enableCellChangeFlash || null}
        suppressSizeToFit={suppressSizeToFit || false}
        loadingOverlayComponent={loadingOverlayComponent || Spinner}
        suppressPaginationPanel={suppressPaginationPanel || false}
        getRowClass={getRowClass || ""}
      />
      {!router.pathname.includes("/track") && footer && (
        <div className="d-flex mt-3 gap-2">
          {/* This Includes check makes because arabic lang in the url  */}
          {window.location.pathname.includes("/reports") ? (
            // <Dropdown>
            //   <Dropdown.Toggle
            //     variant="primary"
            //     id="dropdown-basic"
            //     className="p-2"
            //   >
            //     {loading ? (
            //       <span
            //         className="spinner-border spinner-border-sm mt-1"
            //         role="status"
            //       ></span>
            //     ) : (
            //       "Export"
            //     )}
            //   </Dropdown.Toggle>

            //   <Dropdown.Menu className="border border-primary">
            //     <Dropdown.Item onClick={onBtnExport}>
            //       Export Visible
            //     </Dropdown.Item>
            //     <Dropdown.Item
            //       onClick={() => {
            //         getWholeReportApi();
            //       }}
            //     >
            //       Export All
            //     </Dropdown.Item>
            //   </Dropdown.Menu>
            // </Dropdown>

            <Button
              variant="primary "
              className="p-2"
              onClick={() => {
                getWholeReportApi();
              }}
              style={{ color: darkMode ? "#fff" : "", width: "130px" }}
              id="export-excel"
              disabled={loading}
            >
              {loading ? (
                <span
                  className="spinner-border spinner-border-sm "
                  role="status"
                ></span>
              ) : (
                <>
                  <FontAwesomeIcon
                    className="me-2"
                    icon={faFileExcel}
                    size="sm"
                  />
                  {t("Export_To_Excel")}
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="primary "
              className="p-2"
              onClick={onBtnExport}
              style={{ color: darkMode ? "#fff" : "" }}
              id="export-excel"
            >
              <FontAwesomeIcon className="me-2" icon={faFileExcel} size="sm" />
              {t("Export_To_Excel")}
            </Button>
          )}

          <Button
            variant="primary"
            className="p-2"
            onClick={handleOpenBtnsExportsModel}
            style={{ color: darkMode ? "#fff" : "" }}
            id="export-pdf"
          >
            <FontAwesomeIcon className="me-2" icon={faFilePdf} size="sm" />
            {t("Export_as_PDF_File")}
          </Button>
        </div>
      )}
      <Modal
        show={openBtnsExportsModel}
        onHide={() => setOpenBtnsExportsModel(false)}
        centered
      >
        <Modal.Header
          closeButton
          style={{ background: darkMode ? "rgb(34,39,56)" : "" }}
        >
          <Modal.Title>PDF Export Options</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: darkMode ? "rgb(21,24,36)" : "" }}>
          <PDFExportPanel
            gridApi={gridApi}
            columnApi={gridColumnApi}
            setOpenBtnsExportsModel={setOpenBtnsExportsModel}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};
export default AgGridDT;
