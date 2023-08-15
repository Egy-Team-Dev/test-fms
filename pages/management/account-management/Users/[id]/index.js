import axios from "axios";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { fetchAllAssignUsers } from "../../../../../services/management/ManagneVehicles";
import "rc-tree/assets/index.css";
import Tree, { TreeNode } from "rc-tree";
import { toast } from "react-toastify";

import { assignVehicles } from "../../../../../services/management/VehicleManagement";

const userManages = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [AssignedVehicles, setAssignedVehicles] = useState([]);
  const [UnAsssignedVehicles, setUnAssignedVehicles] = useState([]);
  const [checkedAssignedVehicles, setCheckedAssignedVehicles] = useState([]);
  const [checkedUnAsssignedVehicles, setCheckedUnAssignedVehicles] = useState(
    []
  );

  const [disableAssignBtn, setDisableAssignBtn] = useState(false);
  const [disableUnAssignBtn, setDisableUnAssignBtn] = useState(false);

  const { id } = router.query;

  // function to group
  var groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
      if (x.GroupName == null) {
        x.GroupName = " ungrouped";
      }
      (rv[x[key === "null" ? "Ungrouped" : key]] =
        rv[x[key === "null" ? "Ungrouped" : key]] || []).push(x);
      return rv;
    }, {});
  };

  const GetUser = async () => {
    setLoading(true);
    const response = await fetchAllAssignUsers();
    const filtered = response.users.find((items) => items.ProfileID == id);
    const { data } =
      filtered &&
      (await axios.get(
        `dashboard/management/users/vehicles/${filtered?.ASPNetUserID}`
      ));
    // group by assign vehicles
    const dataassignvehicles = Object.entries(
      groupBy(data.assignedVehicles, "GroupName")
    );
    const Undataassignvehicles = Object.entries(
      groupBy(data.unAssignedVehicles, "GroupName")
    );
    setAssignedVehicles(dataassignvehicles);
    setUnAssignedVehicles(Undataassignvehicles);
    setUser(filtered);
    setLoading(false);
  };

  useEffect(() => {
    GetUser();
  }, []);

  const loop = (data) =>
    data?.map((item, index) => {
      if (item[1]?.length > 0) {
        return (
          <TreeNode
            key={`${item[0]}`}
            data={item}
            defaultExpandAll={true}
            autoExpandParent={true}
            title={
              <span
                className="d-flex align-items-center"
                style={{
                  fontSize: "12px",
                }}
              >
                {item[0]}
                {/* <span className="badge bg-secondary px-1 mx-2">
                        {item?.title === "All" ? badgeCount : item.children?.length}
                        </span> */}
              </span>
            }
            icon={<i className="fa fa-car" />}
          >
            {loop(item[1])}
          </TreeNode>
        );
      }

      return (
        <TreeNode
          className="foo"
          key={item?.VehicleID}
          icon={<i className="fa fa-car" />}
          data={item}
          isLeaf={true}
          title={
            <div className="d-flex align-items-center">
              <div className="me-1" style={{ fontSize: "10px" }}>
                {item?.PlateNumber}
              </div>
            </div>
          }
        />
      );
    });

  const onCheckAssigned = (selectedKeys, info) => {
    let x = info.checkedNodes
      ?.filter((key) => key.hasOwnProperty("isLeaf"))
      .map((el) => el.data);
    setCheckedAssignedVehicles(x);
  };

  async function unAssign() {
    if (!checkedAssignedVehicles.length)
      return toast.error("Please select a vehicle");

    let unAssignObj = {
      Type: "unassign",
      VehicleIDs: [],
    };

    checkedAssignedVehicles.map((el) => {
      unAssignObj.VehicleIDs.push({
        vehilceId: el.VehicleID,
        groupId: el.GroupID,
      });
    });
    setDisableUnAssignBtn(true);

    try {
      const response = await assignVehicles(unAssignObj, user?.ASPNetUserID);
      toast.success(response?.message);
      checkedAssignedVehicles.forEach((veh) => {
        let index = AssignedVehicles.findIndex((x) => x[0] == veh.GroupName);
        let groupName = AssignedVehicles[index][0];

        // delete from assigned vehicles
        if (index > -1) {
          let index2 = AssignedVehicles[index][1].findIndex(
            (x) => x.VehicleID == veh.VehicleID
          );
          AssignedVehicles[index][1].splice(index2, 1);

          if (AssignedVehicles[index][1].length == 0) {
            AssignedVehicles.splice(index, 1);
          }
        }

        // add to unassigned vehicles
        let index3 = UnAsssignedVehicles.findIndex((x) => x[0] == groupName);
        if (index3 > -1) {
          UnAsssignedVehicles[index3][1].push(veh);
        }

        if (index3 == -1) {
          UnAsssignedVehicles.push([groupName, [veh]]);
        }
      });

      setDisableUnAssignBtn(false);
      setCheckedAssignedVehicles([]);
    } catch (error) {
      toast.error(error?.response?.data?.message);
      setDisableUnAssignBtn(false);
    }
  }

  ////////////////////////////////////////////////////////////

  const onCheckUnassigned = (selectedKeys, info) => {
    let x = info.checkedNodes
      ?.filter((key) => key.hasOwnProperty("isLeaf"))
      .map((el) => el.data);
    setCheckedUnAssignedVehicles(x);
  };

  async function assign() {
    if (!checkedUnAsssignedVehicles.length)
      return toast.error("Please select a vehicle");

    let assignObj = {
      Type: "assign",
      VehicleIDs: [],
    };

    checkedUnAsssignedVehicles.map((el) => {
      assignObj.VehicleIDs.push({
        vehilceId: el.VehicleID,
        groupId: el.GroupID,
      });
    });

    setDisableAssignBtn(true);

    try {
      const response = await assignVehicles(assignObj, user?.ASPNetUserID);
      toast.success(response?.message);

      checkedUnAsssignedVehicles.forEach((veh) => {
        let index = UnAsssignedVehicles.findIndex((x) => x[0] == veh.GroupName);
        let groupName = UnAsssignedVehicles[index][0];

        // delete from unassigned vehicles
        if (index > -1) {
          UnAsssignedVehicles[index][1].splice(
            UnAsssignedVehicles[index][1].findIndex(
              (x) => x.VehicleID == veh.VehicleID
            ),
            1
          );

          if (UnAsssignedVehicles[index][1].length == 0) {
            UnAsssignedVehicles.splice(index, 1);
          }
        }

        // add to assigned vehicles
        let assignedIndex = AssignedVehicles.findIndex(
          (x) => x[0] == veh.GroupName
        );

        if (assignedIndex > -1) {
          AssignedVehicles[assignedIndex][1].push(veh);
        }

        if (assignedIndex == -1) {
          AssignedVehicles.push([veh.GroupName, [veh]]);
        }

        // if (UnAsssignedVehicles[index][1].length == 0) {
        //   UnAsssignedVehicles.splice(index, 1);
        // }
      });

      setDisableAssignBtn(false);
      setCheckedUnAssignedVehicles([]);
    } catch (error) {
      toast.error(error?.response?.data?.message);
      setDisableAssignBtn(false);
    }
  }

  return (
    <>
      <Card>
        <Card.Body>
          <div className="d-flex align-items-center">
            <h3>User : </h3>
            <h4 className="mb-0 ms-3 mt-2 " style={{ color: "#075F68" }}>
              {user ? user?.FirstName + " " + user?.LastName : "Loading..."}
            </h4>
          </div>
          <Row className="my-3">
            {/* Assign Vehicles */}
            <Col md="5">
              <div
                style={{
                  minHeight: "100vh",
                  maxWidth: "auto",
                  overflowY: "auto",
                }}
                className="items"
              >
                <div
                  className="rounded-1"
                  style={{ backgroundColor: "#397A74" }}
                >
                  <h3 className="text-white px-3 py-2 ">Assign Vehicles </h3>

                  <div
                    className=" border border-top-0 border-2 border-solid border-muted rounded-bottom-2  bg-white shadow-sm"
                    style={{
                      height: "calc(100vh - 240px)",
                      overflow: "hidden  scroll",
                    }}
                  >
                    {AssignedVehicles.length > 0 ? (
                      <>
                        <Tree
                          checkable
                          selectable={false}
                          showLine={true}
                          defaultExpandAll
                          autoExpandParent={true}
                          onCheck={onCheckAssigned}
                          showIcon
                        >
                          {loop(AssignedVehicles)}
                        </Tree>
                      </>
                    ) : loading ? (
                      <div
                        style={{ height: "245px" }}
                        className="d-flex align-items-center justify-content-center fs-4 text-black-50"
                      >
                        <span
                          className="spinner-border spinner-border-lg"
                          role="status"
                        />
                      </div>
                    ) : (
                      <div
                        style={{ height: "245px" }}
                        className="d-flex align-items-center justify-content-center fs-4 text-black-50"
                      >
                        <h2>There is NO Vehicles</h2>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Col>
            {/* two buttons */}
            <Col md="2">
              <div
                className="d-flex flex-column justify-content-center"
                style={{ minHeight: "70vh", maxWidth: "auto" }}
              >
                <button
                  className="btn btn-info mb-3 py-2  fw-bolder"
                  onClick={assign}
                  disabled={disableAssignBtn}
                >
                  {disableAssignBtn ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                      />
                      <span className="visually-hidden">Loading...</span>
                    </>
                  ) : (
                    "Assign"
                  )}
                </button>
                <button
                  className="btn btn-success py-2  fw-bolder"
                  onClick={unAssign}
                  disabled={disableUnAssignBtn}
                >
                  {disableUnAssignBtn ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                      />
                      <span className="visually-hidden">Loading...</span>
                    </>
                  ) : (
                    "UnAssign"
                  )}
                </button>
              </div>
            </Col>

            {/* un Assign Vehicles */}
            <Col md="5">
              <div
                style={{
                  minHeight: "100vh",
                  maxWidth: "auto",
                  overflowY: "auto",
                }}
                className="items"
              >
                <div
                  className="rounded-1"
                  style={{ backgroundColor: "#397A74" }}
                >
                  <h3 className="text-white px-3 py-2 ">UnAssign Vehicles </h3>

                  <div
                    className=" border border-top-0 border-2 border-solid border-muted rounded-bottom-2  bg-white shadow-sm"
                    style={{
                      height: "calc(100vh - 240px)",
                      overflow: "hidden  scroll",
                    }}
                  >
                    {UnAsssignedVehicles.length > 0 ? (
                      <>
                        <Tree
                          checkable
                          selectable={false}
                          showLine={true}
                          defaultExpandAll
                          autoExpandParent={true}
                          onCheck={onCheckUnassigned}
                          showIcon
                        >
                          {loop(UnAsssignedVehicles)}
                        </Tree>
                      </>
                    ) : loading ? (
                      <div
                        style={{ height: "245px" }}
                        className="d-flex align-items-center justify-content-center fs-4 text-black-50"
                      >
                        <span
                          className="spinner-border spinner-border-lg"
                          role="status"
                        />
                      </div>
                    ) : (
                      <div
                        style={{ height: "245px" }}
                        className="d-flex align-items-center justify-content-center fs-4 text-black-50"
                      >
                        <h2>There is NO Vehicles</h2>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
};

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["Management", "main"])),
    },
  };
}
export default userManages;
