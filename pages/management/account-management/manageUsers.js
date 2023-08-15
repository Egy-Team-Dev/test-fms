import { Row, Col, Card, Form } from "react-bootstrap";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as lodash from "lodash";
import { useSession } from "next-auth/client";
import useToken from "../../../hooks/useToken";
import { signIn, signOut } from "next-auth/client";
import { encryptName } from "helpers/encryptions";
import { getSession } from "next-auth/client";
import Model from "components/UI/Model";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserEdit,
  faEdit,
  faTrash,
  faUserSlash,
  faCar,
  faUserPlus,
  faUser,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";

// translation
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import AgGridDT from "../../../components/AgGridDT";
import axios from "axios";
import { useRouter } from "next/router";
import { getNewToken } from "../../../lib/slices/auth";
import { fetchAllAssignUsers } from "../../../services/management/ManagneVehicles";
import EditUser from "./EditUser";
import DeleteModal from "components/Modals/DeleteModal";
import { toast } from "react-toastify";

const ManageUsers = () => {
  const { t } = useTranslation(["Management", "main"]);
  const userInfos = useSelector((state) => state?.userInfo);
  const session = useSession();
  const [allDataGrid, setAllDataGrid] = useState([]);
  const [unassignedDevices, setUnassignedDevices] = useState([]);
  let { tokenRef } = useToken();
  const Routerss = useRouter();
  const newToken = useSelector((state) => state?.auth?.user?.new_token);
  const userRole =
    session[0]?.user?.mongoRole?.toLowerCase() ||
    session[0]?.user?.user?.mongoRole?.toLowerCase();

  const hertzId = session[0].user?.user?.id || session[0].user?.id;

  const newRefToken = useRef();
  const dispatch = useDispatch();

  const [showModalDelete, setShowModalDelete] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [deleteID, setDeleteID] = useState("");

  const [editModalShow, setEditModalShow] = useState(false);
  const [editID, setEditID] = useState("");

  // all data of Completed Users
  const [userAssign, setUserAssign] = useState(null);
  // all data unCompleted Users
  const [userUnAssign, setUserUnAssign] = useState([]);
  // check Search unAssign
  const [searchUnAssign, setSearchUnAssign] = useState([]);
  // check Search Assign
  const [searchAssign, setSearchAssign] = useState([]);
  const [rolesOptions, setRolesOptions] = useState([]);
  const getRoles = async () => {
    try {
      const res = await axios.get("/dashboard/management/roles");
      if (res.status === 200) {
        setRolesOptions(
          res?.data.allRoles
            .slice(0, 3)
            .filter((ro) => ro.Id !== "2")
            .map((role) => {
              return { name: role.Name, label: role.Name, value: +role.Id };
            })
        );
      }
    } catch (error) {
      toast.error("error Fetching Roles, Try Again later!");
    }
  };
  const rowHeight = 65;

  const [gridApiAssignedUser, setGridApiAssignedUser] = useState(null);
  const [gridApiUnAssignedUser, setGridApiUnAssignedUser] = useState(null);
  const [DataTable, setDataTable] = useState(null);
  const [gridColumnApiAssignedUser, setGridColumnApiAssignedUser] =
    useState(null);
  const [gridColumnApiUnAssignedUser, setGridColumnApiUnAssignedUser] =
    useState(null);

  const GetAssignUsers = async () => {
    const response = await fetchAllAssignUsers();
    setUserAssign(response.users);
    setSearchAssign(response.users);
  };
  //get all unAssign Users
  const GetUnAssignUsers = async () => {
    const response = await axios({
      method: "get",
      url: `dashboard/management/users/incomplete`,
    });
    setUserUnAssign(response.data.users);
    setSearchUnAssign(response.data.users);
  };
  // useEffect  Assign and UnAssign
  useEffect(() => {
    getRoles();
    GetAssignUsers();
    GetUnAssignUsers();
  }, []);

  // handle unAssignsearch
  const HandleSearchUnAssign = (e) => {
    const filters = userUnAssign.filter(
      (item) =>
        item.FirstName.toLowerCase().includes(e.target.value.toLowerCase()) ||
        item.LastName.toLowerCase().includes(e.target.value.toLowerCase())
    );
    const data = e.target.value;
    !data ? setUserUnAssign(searchUnAssign) : setUserUnAssign(filters);

    // setUserUnAssign(filtered)
  };

  // handle Assignsearch
  const HandleSearchAssign = (e) => {
    const filters = userAssign.filter(
      (item) =>
        item.FirstName.toLowerCase().includes(e.target.value.toLowerCase()) ||
        item.LastName.toLowerCase().includes(e.target.value.toLowerCase())
    );
    const data = e.target.value;
    !data ? setUserAssign(searchAssign) : setUserAssign(filters);

    // setUserUnAssign(filtered)
  };

  const handelLoginAs = async (userData) => {
    const response = await axios({
      method: "post",
      url: `/support/actingLogin`,
      headers: {
        Authorization: `Bearer ${newToken}`, //'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImVhMjM3NWM3LWZkMjAtNDYyOC1hNDg0LTc1MWE2NTgyZTA1NiIsInVzZXJuYW1lIjoidGQiLCJleHAiOjE2ODI3NTk5MzUsImFjY291bnRJZCI6MzY2LCJQcm9maWxlSUQiOjI3NTQsIkFjY291bnRpbmdJRCI6bnVsbCwicm9sZSI6InVzZXIiLCJtb25nb1JvbGUiOiJzdXBwb3J0IiwiZW1haWwiOiJ0ZEBnbWFpbC5jb20iLCJpYXQiOjE2Nzc1NzU5MzV9.dYXVu9riWCBiTSnhopJCZ81dCP_CgBihewPBfw0Qk5k',
        "Content-Type": "application/json",
      },
      data: userData,
    })
      .then((data) => {
        // newRefToken.current = data.data.newToken;

        const lastConfig =
          window !== undefined &&
          JSON.parse(localStorage.getItem(encryptName("config")))
            ? localStorage.getItem(encryptName("config"))
            : false;

        localStorage.clear();
        signIn("credentials", {
          user: JSON.stringify(data.data),
        });
      })
      .catch(({ error }) => {
        toast.error("role user is unauthorized to perform this action");
      });
  };

  const handleForceLogout = async (id) => {
    const response = await axios({
      method: "post",
      url: `/dashboard/management/users/logout/${id}`,
      headers: {
        Authorization: `Bearer ${newToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((data) => {
        GetAssignUsers();
        GetUnAssignUsers();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleFullName = (params) => {
    return `${params.data.FirstName} ${params.data.LastName}`;
  };

  // handle updates
  const HandleRoutes = (params) => {
    Routerss.push(
      `/management/account-management/Users/${params.data.ProfileID}`
    );
  };

  const onDeactiveHandler = async (data) => {
    const submitData = {
      ...data,
      LockoutEnabled: data.LockoutEnabled ? false : true,
    };
    try {
      const respond = await axios.put(
        `dashboard/management/users/data/${data?.ASPNetUserID}`,
        submitData
      );
      toast.success(respond?.data?.message);
      GetAssignUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || "Something Went Wrong");
    }
  };

  const onDelete = async () => {
    setLoadingDelete(false);
    try {
      let res = await axios.delete(`dashboard/management/users/${deleteID}`);
      if (res.status === 200) {
        toast.success("User Deleted Successfully");
        const filteredUsers = userAssign.filter(
          (ele) => ele.ASPNetUserID !== deleteID
        );
        setSearchAssign(filteredUsers);
        setUserAssign(filteredUsers);
      }
    } catch (err) {
      console.log("Error: " + err.message);
    } finally {
      setLoadingDelete(false);
      setShowModalDelete(false);
    }
  };

  const columnsAssigned = useMemo(
    () => [
      {
        headerName: `${t("Full_Name")}`,
        field: "FirstName",
        valueGetter: handleFullName,
        // cellRenderer: (params) => (
        //   <Link href={`Driver`}>
        //     <a className="text-decoration-underline">{params.value}</a>
        //   </Link>
        // ),
        minWidth: 150,
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: `${t("User_Name")}`,
        field: "UserName",
        minWidth: 150,
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: `${t("E-mail")}`,
        field: "Email",
        minWidth: 150,
        unSortIcon: true,
      },
      {
        headerName: `${t("Status")}`,
        field: "LockoutEnabled",
        minWidth: 100,
        unSortIcon: true,
        valueFormatter: "value? 'Active' : 'Locked'",
      },
      // {
      //   headerName: `${t("Role")}`,
      //   field: "Role",
      //   minWidth: 150,
      //   cellRenderer: (params) => (
      //     <div>
      //       {!lodash.isEmpty(userInfos) && (
      //         <>
      //           <button
      //             onClick={() => {
      //               setEditID(params?.data?.ProfileID);
      //               setEditModalShow(true);
      //             }}
      //             className="btn btn-outline-primary m-1"
      //           >
      //             <FontAwesomeIcon className="pe-2" icon={faEdit} size="lg" />
      //             {t("edit")}
      //           </button>
      //         </>
      //       )}
      //     </div>
      //   ),
      //   unSortIcon: true,
      //   valueFormatter: "value? 'Active' : 'Locked'",
      // },
      {
        headerName: `${t("Actions")}`,
        field: "ID",
        minWidth: 600,
        cellRenderer: (params) => (
          <div>
            {!lodash.isEmpty(userInfos) && (
              <>
                {userRole == "support" && (
                  <>
                    <button
                      className="btn btn-outline-primary m-1"
                      onClick={() =>
                        handleForceLogout(params.data.ASPNetUserID)
                      }
                    >
                      <FontAwesomeIcon
                        className="pe-2"
                        icon={faSignOutAlt}
                        size="lg"
                      />
                      {t("Force_Logout")}
                    </button>

                    <button
                      className="btn btn-outline-primary m-1"
                      onClick={() =>
                        handelLoginAs({
                          UserId: params.data.ASPNetUserID,
                          UserName: params.data.UserName,
                          AccountID: params.data.AccountID,
                        })
                      }
                    >
                      <FontAwesomeIcon
                        className="pe-2"
                        icon={faUser}
                        size="lg"
                      />
                      {t("Login_as")}
                    </button>
                  </>
                )}

                {hertzId === "fcb7fa12-dae4-4c47-a449-f4a6a0f5b17c" && (
                  <button
                    className="btn btn-outline-primary m-1"
                    onClick={() =>
                      handelLoginAs({
                        UserId: params.data.ASPNetUserID,
                        UserName: params.data.UserName,
                        AccountID: params.data.AccountID,
                      })
                    }
                  >
                    <FontAwesomeIcon className="pe-2" icon={faUser} size="lg" />
                    {t("Login_as")}
                  </button>
                )}

                <button
                  onClick={() => {
                    setEditID(params?.data?.ProfileID);
                    setEditModalShow(true);
                  }}
                  className="btn btn-outline-primary m-1"
                >
                  <FontAwesomeIcon className="pe-2" icon={faEdit} size="lg" />
                  {t("edit")}
                </button>

                {userRole == "support" && (
                  <button
                    className="btn btn-outline-primary m-1"
                    onClick={() => {
                      setDeleteID(params?.data?.ASPNetUserID);
                      setShowModalDelete(true);
                    }}
                  >
                    <FontAwesomeIcon
                      className="pe-2"
                      icon={faTrash}
                      size="lg"
                    />
                    {t("delete")}
                  </button>
                )}

                {userRole == "support" && (
                  <>
                    <button
                      onClick={() =>
                        handleForceLogout(params.data.ASPNetUserID)
                      }
                      className="btn btn-outline-primary m-1"
                    >
                      {!params?.data?.LockoutEnabled ? (
                        <>
                          <FontAwesomeIcon
                            className="ps-2 pe-3 fs-5"
                            icon={faUser}
                            size="xl"
                          />
                          {t("Activate")}
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon
                            className="pe-2"
                            icon={faUserSlash}
                            size="lg"
                          />
                          {t("Deactivate")}
                        </>
                      )}
                    </button>
                  </>
                )}
                <button
                  onClick={() => HandleRoutes(params)}
                  className="btn btn-outline-primary m-1"
                >
                  <FontAwesomeIcon className="pe-2" icon={faCar} size="lg" />
                  {t("Show_Vehicles")}
                </button>
              </>
            )}
          </div>
        ),
      },
    ],
    [t, userInfos]
  );

  const columnsUnAssigned = useMemo(
    () => [
      {
        headerName: `${t("Full_Name")}`,
        field: "FirstName",
        valueGetter: handleFullName,
        cellRenderer: (params) => (
          <Link href={`Driver`}>
            <a className="text-decoration-underline">{params.value}</a>
          </Link>
        ),
        minWidth: 150,
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: `${t("User_Name")}`,
        field: "UserName",
        minWidth: 150,
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: `${t("E-mail")}`,
        field: "Email",
        minWidth: 150,
        unSortIcon: true,
      },
      {
        headerName: `${t("Status")}`,
        field: `LockoutEnabled`,
        minWidth: 150,
        unSortIcon: true,
      },
      {
        headerName: `${t("Actions")}`,
        field: "ID",
        minWidth: 100,
        cellRenderer: () => (
          <div>
            {!lodash.isEmpty(userInfos) && (
              <>
                <button className="btn btn-outline-primary m-1">
                  <FontAwesomeIcon
                    className="pe-2"
                    icon={faUserEdit}
                    size="lg"
                  />
                  {t("Complete_User_Creation")}
                </button>
              </>
            )}
          </div>
        ),
      },
    ],
    [t, userInfos]
  );

  const onFirstDataRendered = (params) => {
    params.api.paginationGoToPage(0);
  };

  const onGridReadyAssignedUsers = useCallback(async (params) => {
    try {
      setGridApiAssignedUser(params.api);
      setGridColumnApiAssignedUser(params.columnApi);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  }, []);
  const onGridReadyUnAssignedUsers = useCallback(async (params) => {
    try {
      setGridApiUnAssignedUser(params.api);
      setGridColumnApiAssignedUser(params.columnApi);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  }, []);

  const onExportClick = () => {
    gridApi.exportDataAsCsv();
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
      <Row>
        <Row className="g-3">
          <Col sm="12">
            <Card className="h-100">
              <Card.Header className="d-flex justify-content-between">
                <div className="d-flex flex-column w-100">
                  <div className="w-100 header-title d-flex justify-content-between align-items-center p-3">
                    <div>
                      <Link
                        href="/management/account-management/AddUser1"
                        passHref
                      >
                        <button
                          type="button"
                          className="btn btn-primary  px-3 py-2 me-3 "
                        >
                          <FontAwesomeIcon
                            className="me-2"
                            icon={faUserPlus}
                            size="sm"
                          />

                          {t("Add_User")}
                        </button>
                      </Link>
                    </div>
                    {/* <Form.Floating className=" custom-form-floating-sm form-group m-0">
                      <Form.Control
                        type="text"
                        onChange={HandleSearchAssign}
                        className=""
                        id="floatingInput6"
                        placeholder="Place Holder"
                      />
                      <label htmlFor="floatingInput">{t("main:search")}</label>
                    </Form.Floating> */}
                  </div>
                  <div className="ms-3">
                    <h3>{t("Manage_Users")}</h3>
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                <AgGridDT
                  rowHeight={rowHeight}
                  columnDefs={columnsAssigned}
                  rowData={userAssign}
                  paginationNumberFormatter={function (params) {
                    return params.value.toLocaleString();
                  }}
                  onGridReady={onGridReadyAssignedUsers}
                  gridApi={gridApiAssignedUser}
                  gridColumnApi={gridColumnApiAssignedUser}
                  onFirstDataRendered={onFirstDataRendered}
                  defaultColDef={defaultColDef}
                />
              </Card.Body>
            </Card>
          </Col>

          {/* ================== second table  ===================== */}
          <Col sm="12">
            <Card className="h-100">
              <Card.Header className="d-flex justify-content-between">
                <div className="w-100 header-title d-flex justify-content-between align-items-center p-3">
                  <div>
                    <h3>{t("Manage_Incompleted_Users")}</h3>
                  </div>
                  <Form.Floating className=" custom-form-floating-sm form-group m-0">
                    <Form.Control
                      type="text"
                      className=""
                      onChange={HandleSearchUnAssign}
                      id="floatingInput6"
                      placeholder="Place Holder"
                    />
                    <label htmlFor="floatingInput">{t("main:search")}</label>
                  </Form.Floating>
                </div>
              </Card.Header>
              <Card.Body>
                <AgGridDT
                  rowHeight={rowHeight}
                  columnDefs={columnsUnAssigned}
                  rowData={userUnAssign}
                  paginationNumberFormatter={function (params) {
                    return params.value.toLocaleString();
                  }}
                  onGridReady={onGridReadyUnAssignedUsers}
                  gridApi={gridApiUnAssignedUser}
                  gridColumnApi={gridColumnApiUnAssignedUser}
                  onFirstDataRendered={onFirstDataRendered}
                  defaultColDef={defaultColDef}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Row>

      {/* Edit Model */}
      <Model
        header={"Update User Information"}
        show={editModalShow}
        onHide={() => setEditModalShow(false)}
        updateButton={"Update"}
        footer={false}
        size={"xl"}
        className={"mt-5"}
      >
        <EditUser
          rolesOptions={rolesOptions}
          handleModel={() => {
            setEditModalShow(false);
          }}
          editModel={true}
          id={editID}
          className={`p-0 m-0`}
          GetAssignUsers={GetAssignUsers}
        />
      </Model>

      <DeleteModal
        show={showModalDelete}
        loading={loadingDelete}
        title={t("Are_you_sure")}
        description={t("Are_you_sure_you_want_to_delete_this_User")}
        confirmText={t("Yes_delete_user")}
        cancelText={t("No_cancel")}
        onConfirm={onDelete}
        onCancel={() => {
          setShowModalDelete(false);
          setLoadingDelete(false);
        }}
      />
    </div>
  );
};

export default ManageUsers;

// translation ##################################
export async function getServerSideProps(context) {
  const session = await getSession({ req: context.req });
  if (
    session?.user?.mongoRole?.toLowerCase() == "user" ||
    session?.user?.user?.role?.toLowerCase() == "user"
  ) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      ...(await serverSideTranslations(context.locale, ["Management", "main"])),
    },
  };
}

// translation ##################################
