import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Row } from "react-bootstrap";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { toast } from "react-toastify";
import AgGridDT from "components/AgGridDT";
import {
  getDriverAssignedVehicles,
  fitchUnassignedVehicles,
  addVehicleToDriver,
  UnAssignVehicle,
} from "services/driversManagement";
import { useTranslation } from "next-i18next";

export default function ShowVehicles() {
  const router = useRouter();
  const { id } = router.query;
  const [AssignedVehicles, setAssignedVehicles] = useState(null);
  const [UnAssignedVehicles, setUnAssignedVehicles] = useState(null);
  const [gridApiUnassigned, setGridApiUnassigned] = useState(null);
  const [gridColumnApiUnassigned, setGridColumnApiUnassigned] = useState(null);
  const [loadingAssignRq, setloadingAssignRq] = useState(false);
  const [loadingUnAssignRq, setloadingUnAssignRq] = useState(false);
  const { t } = useTranslation("driversManagement");

  // fetch assigned vehicles to driver
  useEffect(() => {
    if (!id) {
      router.back();
    } else {
      const fetchVehicles = async () => {
        try {
          const respond = await getDriverAssignedVehicles(id);
          setAssignedVehicles([...respond?.vehicles]);
        } catch (error) {
          toast.error(error.response.data?.message);
        }
      };
      fetchVehicles();
    }
  }, [id]);

  // fitch Unassigned Vehicles data
  const onGridUnassignReady = useCallback(async (params) => {
    try {
      const respond = await fitchUnassignedVehicles();
      setUnAssignedVehicles([...respond?.unAssingedVehs]);
      setGridApiUnassigned(params.api);
      setGridColumnApiUnassigned(params.columnApi);
    } catch (error) {
      toast.error(error.response.data?.message);
    }
  }, []);

  // unassign vehicle from driver
  const UnAssignVehicleRq = async (ele) => {
    setloadingUnAssignRq(true);
    try {
      const respond = await UnAssignVehicle(id, ele.VehicleID);
      if (respond?.result[1] === 1) {
        toast.success("Vehicle UnAssigned Successfully");
        setAssignedVehicles((prev) => [
          ...prev.filter((vehicle) => vehicle.VehicleID != ele.VehicleID),
        ]);
        setUnAssignedVehicles((prev) => [...prev, ele]);
      }
      setloadingUnAssignRq(false);
    } catch (error) {
      toast.error(error.response.data?.message);
      setloadingUnAssignRq(false);
    }
  };

  // assign vehicles to driver
  const AssignVehicleRq = async (ele) => {
    setloadingAssignRq(true);
    try {
      const respond = await addVehicleToDriver(id, ele.VehicleID);
      if (respond?.result[1] === 1) {
        toast.success("Vehicle Assigned Successfully");
        setUnAssignedVehicles((prev) => [
          ...prev.filter((vehicle) => vehicle.VehicleID != ele.VehicleID),
        ]);
        setAssignedVehicles((prev) => [ele, ...prev]);
      }
      setloadingAssignRq(false);
    } catch (error) {
      setloadingAssignRq(false);
      toast.error(error.response.data?.message);
    }
  };

  // columns used in ag grid
  const AssignedVecColumns = useMemo(
    () => [
      { headerName: t("group_name_key"), field: "AccountID", sortable: true },
      {
        headerName: t("plate_number_key"),
        field: "PlateNumber",
        sortable: true,
      },
      {
        headerName: t("display_name_key"),
        field: "DisplayName",
        sortable: true,
      },
      {
        headerName: t("color_key"),
        field: "Color",
        sortable: true,
        valueGetter: (params) =>
          params?.data?.Color?.length === 0 ||
          params?.data?.Color === null ||
          params?.data?.Color === "null"
            ? "N/A"
            : params?.data?.Color,
      },
      { headerName: t("makeYear_key"), field: "MakeYear", sortable: true },
      { headerName: t("typeID_key"), field: "TypeID", sortable: true },
      { headerName: t("modelID_key"), field: "ModelID", sortable: true },
      {
        headerName: t("actions_key"),
        cellRenderer: (params) => (
          <Button
            disabled={loadingUnAssignRq}
            onClick={() => UnAssignVehicleRq(params.data)}
          >
            {t("unassign_vehicle_key")}
          </Button>
        ),
        sortable: true,
        unSortIcon: true,
      },
    ],
    [loadingUnAssignRq, t]
  );
  const UnAssignedVecColumns = useMemo(
    () => [
      { headerName: t("group_name_key"), field: "GroupName", sortable: true },
      {
        headerName: t("plate_number_key"),
        field: "PlateNumber",
        sortable: true,
      },
      {
        headerName: t("display_name_key"),
        field: "DisplayName",
        sortable: true,
      },
      {
        headerName: t("color_key"),
        field: "Color",
        sortable: true,
        valueGetter: (params) =>
          params?.data?.Color?.length === 0 || params?.data?.Color === null
            ? "N/A"
            : params?.data?.Color,
      },
      { headerName: t("makeYear_key"), field: "MakeYear", sortable: true },
      { headerName: t("typeID_key"), field: "TypeID", sortable: true },
      { headerName: t("modelID_key"), field: "ModelID", sortable: true },
      {
        headerName: t("actions_key"),
        cellRenderer: (params) => {
          return (
            <Button
              disabled={loadingAssignRq}
              onClick={() => {
                AssignVehicleRq(params.data);
              }}
            >
              {t("assign_vehicle_key")}
            </Button>
          );
        },
      },
    ],
    [loadingAssignRq]
  );

  return (
    <>
      <Card>
        <Card.Header className="h3">{t("assigned_vehicles_key")}</Card.Header>
        <Card.Body>
          <Row>
            <AgGridDT
              rowHeight={65}
              columnDefs={AssignedVecColumns}
              rowData={AssignedVehicles}
              suppressSizeToFit={true}
              paginationNumberFormatter={function (params) {
                return params.value.toLocaleString();
              }}
              onFirstDataRendered={(params) => {
                params.api.sizeColumnsToFit();
              }}
            />
            <AgGridDT
              rowHeight={65}
              columnDefs={UnAssignedVecColumns}
              rowData={UnAssignedVehicles}
              paginationNumberFormatter={function (params) {
                return params.value.toLocaleString();
              }}
              onFirstDataRendered={(params) => {
                params.api.sizeColumnsToFit();
              }}
              onGridReady={onGridUnassignReady}
              gridApi={gridApiUnassigned}
              gridColumnApi={gridColumnApiUnassigned}
            />
          </Row>
          <div className="w-25 d-flex justify-content-start">
            <Button
              className="px-3 py-2 mt-5 text-nowrap me-3 ms-0"
              onClick={(e) => {
                e.preventDefault();
                router.push("/driversManagement");
              }}
            >
              <FontAwesomeIcon className="mx-2" icon={faTimes} size="sm" />
              {t("cancel_key")}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </>
  );
}

// translation ##################################
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["main", "driversManagement"])),
    },
  };
}
// translation ##################################
