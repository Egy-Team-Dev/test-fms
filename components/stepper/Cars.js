import { useState, useMemo, useCallback, useEffect } from "react";
import { Row, Col, Card } from "react-bootstrap";

import DeleteModal from "components/Modals/DeleteModal";
import AgGridDT from "components/AgGridDT";
import Model from "components/UI/Model";
import {
  fetchAllScheduledReports,
  fetchAllUserVehicles,
} from "services/scheduledReports";
import { addReport } from "../../lib/slices/addNewScheduledReport";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "next-i18next";

const Cars = ({ setCarsId, carsId, reportData }) => {
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [rowsSelected, setrowsSelected] = useState([]);
  const [DataTable, setDataTable] = useState(null);
  const dispatch = useDispatch();

  const { t } = useTranslation(["scheduledReports", "common", "main"]);

  const data = useSelector(
    (state) => state.addNewScheduledReport.scheduledReport
  );

  // fetch All user vehicles
  const onGridReady = useCallback(async (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    const response = await fetchAllUserVehicles();
    setDataTable(response.vehicles);

    if (reportData) {
      setrowsSelected(
        response.vehicles.filter((veh) =>
          reportData?.data?.vehID?.includes(veh.VehicleID)
        )
      );

      params.api.forEachNode((node, index) => {
        if (reportData?.data?.vehID?.includes(node.data.VehicleID)) {
          node.setSelected(true);
        }
      });
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

  const handleCarsSelection = (e) => {
    const selectedRows = gridApi.getSelectedRows();
    const selectedRowsId = selectedRows.map((row) => row.VehicleID);
    setrowsSelected(selectedRowsId);
    setCarsId(selectedRowsId);
  };

  // columns
  const columns = useMemo(
    () => [
      {
        headerName: "",
        field: "Select",
        maxWidth: 50,
        sortable: false,
        unSortIcon: false,
        checkboxSelection: true,
        headerCheckboxSelection: true,
      },
      {
        headerName: t("Plate_Number"),
        field: "PlateNumber",
        minWidth: 190,
        maxWidth: 190,
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: t("Vehicle_Name"),
        field: "DisplayName",
        minWidth: 200,
        maxWidth: 200,
      },
      {
        headerName: t("Manufacturing_Company"),
        field: "Make",
        minWidth: 200,
        maxWidth: 200,
      },
      {
        headerName: t("Vehicle_Type"),
        field: "TypeName",
        minWidth: 200,
        maxWidth: 200,
      },
      {
        headerName: t("Chassis_Number"),
        field: "Chassis",
        minWidth: 200,
        maxWidth: 200,
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: t("Device_Serial_Number"),
        field: "SerialNumber",
        minWidth: 200,
        maxWidth: 200,
        sortable: true,
        unSortIcon: true,
      },
    ],
    []
  );

  return (
    <div className="container-fluid">
      <Row>
        <Col sm="12">
          <Card>
            <Card.Body>
              <AgGridDT
                rowHeight={65}
                columnDefs={columns}
                rowSelection={"multiple"}
                rowMultiSelectWithClick={"true"}
                onSelectionChanged={
                  //   setrowsSelected([...e.api.getSelectedRows()])
                  handleCarsSelection
                }
                onCellMouseOver={(e) => (e.event.target.test = "showActions")}
                // onCellMouseOut={HideActions}
                defaultColDef={defaultColDef}
                onGridReady={onGridReady}
                gridApi={gridApi}
                gridColumnApi={gridColumnApi}
                rowData={DataTable}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Cars;
