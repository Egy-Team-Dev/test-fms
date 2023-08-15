import { Row, Col, Card, Form, ListGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
// translation
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import axios from "axios";
import { toast } from "react-toastify";
import { addPermissions, addSelectedFns, reset } from "lib/slices/userInfo";

const AddUser3 = () => {
  const { t } = useTranslation("Management");
  const [functionsList, setFunctionList] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [targetId, setTargetId] = useState(0);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [subscriptions, setSubscription] = useState({});
  const [generalPermissions, setGeneralPermissions] = useState([]);
  const [permissionsList, setPermissionsList] = useState([]);
  const [selectedData, setSelectedData] = useState({});
  const { user, selectedFns } = useSelector((state) => state?.userInfo);
  const router = useRouter();
  const dispatch = useDispatch();

  const fetchSubs = async () => {
    try {
      const res = await axios.get("dashboard/management/roles/allSubsFun");
      setSubscription(res.data);
      setPermissions(Object.keys(res.data));
    } catch (error) {
      toast.error("Error fetching Permissions");
    }
  };
  const fetchGeneralPermissions = async () => {
    try {
      const res = await axios.get(
        "dashboard/management/roles/allSystemPermissions"
      );
      setGeneralPermissions(res?.data.allSystemPermissions);
    } catch (error) {
      toast.error("Error fetching General Permissions");
    }
  };

  useEffect(() => {
    fetchSubs();
    fetchGeneralPermissions();
  }, []);

  useEffect(() => {
    setSelectedPermissions(subscriptions[targetId]);
  }, [targetId]);
  useEffect(() => {
    setPermissionsList([...user?.SystemGeneralPermissions] || []);

    setFunctionList([...user?.PermissionFunctions] || []);
    setSelectedData(selectedFns || {});
  }, []);

  const toggleGeneralPermissions = (e) => {
    e.target.checked
      ? setPermissionsList([...permissionsList, +e.target.value])
      : setPermissionsList([
          ...permissionsList.filter((item) => item != +e.target.value),
        ]);
  };
  useEffect(() => {
    dispatch(addSelectedFns(selectedData));
  }, [selectedData]);

  const toggleFunctions = (e) => {
    if (e.target.name === "All") {
      if (e.target.checked) {
        selectedPermissions.forEach((ele) => {
          setFunctionList([...functionsList, ele.ID]);
        });
        const newData = selectedPermissions.map((ele) => {
          return ele.FunctionName;
        });
        setSelectedData({
          ...selectedData,
          [targetId]: [...newData],
        });
      } else {
        setSelectedData({
          ...selectedData,
          [targetId]: [],
        });
      }
    } else {
      if (e.target.checked) {
        setFunctionList([...functionsList, +e.target.value]);
        if (selectedData[targetId]?.length) {
          const newFns = new Set([...selectedData[targetId], e.target.name]);
          setSelectedData({
            ...selectedData,
            [targetId]: Array.from(newFns),
          });
        } else {
          setSelectedData({ ...selectedData, [targetId]: [e.target.name] });
        }
      } else {
        setFunctionList(
          functionsList.filter((item) => item !== +e.target.value)
        );
        if (selectedData[targetId]?.length) {
          const filteredData = selectedData[targetId].filter(
            (item) => item !== e.target.name
          );
          const newFns = new Set([...filteredData]);
          setSelectedData({
            ...selectedData,
            [targetId]: Array.from(newFns),
          });
        } else {
          const newData = selectedData;
          delete newData[targetId];
          setSelectedData(newData);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    addPermissions({
      SystemGeneralPermissions: [...permissionsList],
      PermissionFunctions: [...functionsList],
    });
    if (
      user.UserName &&
      user.RoleId &&
      functionsList.length &&
      permissionsList.length
    ) {
      try {
        const res = await axios.post("dashboard/management/users", {
          ...user,
          SystemGeneralPermissions: [...permissionsList],
          PermissionFunctions: [...functionsList],
        });
        if (res?.status === 201) {
          toast.success(res.message || "User Added Successfully");
          setTimeout(() => {
            dispatch(reset());
            router.push("/management/account-management/manageUsers");
          }, 0);
        }
      } catch (err) {
        console.log(err);
        toast.error(err.response?.data?.message || "Something went Wrong");
      }
    } else {
      toast.error("please Fill all required data");
    }
  };
  return (
    <Card>
      <Card.Body>
        <Row>
          <Col lg="8">
            <Card className="shadow-none">
              <Card.Body>
                <div className="header-title">
                  <h4 className="card-title">{t("User_Information")}</h4>
                </div>
                <Form className="mt-5">
                  <Row className="border border-light rounded p-3 mb-3">
                    <Col lg="6">
                      <Form.Group className="form-group">
                        <Form.Label htmlFor="FullName">
                          {t("Full_Name")}
                        </Form.Label>
                        <Form.Control
                          type="text"
                          id="FullName"
                          value={`${user.FirstName} ${user.LastName}`}
                          disabled
                        />
                      </Form.Group>
                    </Col>
                    <Col lg="6">
                      <Form.Group className="form-group">
                        <Form.Label htmlFor="userRole">
                          {t("User_Name")}
                        </Form.Label>
                        <Form.Control
                          type="text"
                          id="userRole"
                          value={user.UserName}
                          disabled
                        />
                      </Form.Group>
                    </Col>

                    <Col lg="6">
                      <Form.Group className="form-group">
                        <Form.Label htmlFor="email">{t("E-mail")}</Form.Label>
                        <Form.Control
                          type="text"
                          id="email"
                          value={user.Email}
                          disabled
                        />
                      </Form.Group>
                    </Col>

                    <Col lg="6">
                      <Form.Group className="form-group">
                        <Form.Label htmlFor="status">{t("Status")}</Form.Label>
                        <Form.Control
                          type="text"
                          id="status"
                          value={user.PhoneNumber}
                          disabled
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="border border-light rounded p-3 mb-3">
                    <h4>{t("General_System_Permissions")}</h4>
                    <hr className="my-3 mx-auto" />
                    {generalPermissions.length &&
                      generalPermissions.map((per) => (
                        <Form.Check className="d-block form-group" key={per.ID}>
                          <Form.Check.Input
                            className="me-2"
                            type="checkbox"
                            value={+per.ID}
                            id={per.Name}
                            checked={permissionsList.includes(+per.ID)}
                            onChange={toggleGeneralPermissions}
                            style={{ cursor: "pointer" }}
                          />
                          <Form.Check.Label
                            htmlFor={per.Name}
                            style={{ cursor: "pointer" }}
                          >
                            {t(per.Name)}
                          </Form.Check.Label>
                        </Form.Check>
                      ))}
                  </Row>
                  <Row className="border border-light rounded p-3 mb-3">
                    <h4>{t("User_Permissions")}</h4>
                    <hr className="my-3 mx-auto" />
                    <Row>
                      <Col xm="6">
                        <h5 className="mb-3">{t("Subscriptions")}</h5>
                        <ul className="list-group list-group-flush">
                          <div
                            className="list-group"
                            id="list-tab"
                            role="tablist"
                          >
                            {permissions?.map((item, i) => {
                              return (
                                <a
                                  key={i}
                                  className="list-group-item list-group-item-action"
                                  id="list-home-list"
                                  data-bs-toggle="list"
                                  href="#list-home"
                                  role="tab"
                                  aria-controls="list-home"
                                  onClick={() => setTargetId(item)}
                                >
                                  {item}
                                </a>
                              );
                            })}
                          </div>
                        </ul>
                      </Col>
                      <Col xm="6">
                        <Card>
                          <h5 className="mb-3">{t("Functions")}</h5>
                          <Form>
                            <ListGroup as="ul">
                              <ListGroup.Item>
                                {/* {selectedPermissions && (
                                  <Form.Check className="form-group">
                                    <Form.Check.Input
                                      className="me-2"
                                      type="checkbox"
                                      id="All"
                                      name="All"
                                      onChange={toggleFunctions}
                                      style={{ cursor: "pointer" }}
                                    />
                                    <Form.Check.Label
                                      htmlFor="All"
                                      style={{ cursor: "pointer" }}
                                    >
                                      All
                                    </Form.Check.Label>
                                  </Form.Check>
                                )} */}
                                {selectedPermissions ? (
                                  selectedPermissions?.map((item) => {
                                    if (item.FunctionName !== "All")
                                      return (
                                        <div key={item.ID}>
                                          <Form.Check className="form-group">
                                            <Form.Check.Input
                                              className="me-2"
                                              type="checkbox"
                                              defaultValue={item.ID}
                                              id={item.ID}
                                              name={item.FunctionName}
                                              onChange={toggleFunctions}
                                              checked={selectedData[
                                                targetId
                                              ]?.includes(item.FunctionName)}
                                              style={{ cursor: "pointer" }}
                                            />
                                            <Form.Check.Label
                                              htmlFor={item.ID}
                                              style={{ cursor: "pointer" }}
                                            >
                                              {item.FunctionName}
                                            </Form.Check.Label>
                                          </Form.Check>
                                        </div>
                                      );
                                  })
                                ) : (
                                  <p className="text-center">
                                    Choose Subscription first
                                  </p>
                                )}
                              </ListGroup.Item>
                            </ListGroup>
                          </Form>
                        </Card>
                      </Col>
                    </Row>
                  </Row>
                </Form>

                <div className="mt-5 d-flex justify-content-end">
                  <button
                    onClick={() => {
                      dispatch(
                        addPermissions({
                          SystemGeneralPermissions: [...permissionsList],
                          PermissionFunctions: [...functionsList],
                        })
                      );
                      router.push("/management/account-management/AddUser2");
                    }}
                    className="btn btn-primary px-3 py-2 ms-3"
                  >
                    <FontAwesomeIcon
                      className="me-2"
                      icon={faArrowLeft}
                      size="sm"
                    />

                    {t("Back")}
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="btn btn-primary px-3 py-2 ms-3"
                  >
                    <FontAwesomeIcon
                      className="me-2"
                      icon={faCheck}
                      size="sm"
                    />
                    {t("Add User")}
                  </button>
                  <button
                    onClick={() => {
                      dispatch(reset());
                      router.push("/management/account-management/manageUsers");
                    }}
                    className="btn btn-primary px-3 py-2 ms-3"
                  >
                    <FontAwesomeIcon
                      className="me-2"
                      icon={faTimes}
                      size="sm"
                    />

                    {t("Cancel")}
                  </button>
                </div>
              </Card.Body>
            </Card>
          </Col>
          {/* aside features section */}
          <Col lg="4">
            <Card className="shadow-none">
              <Card.Body>
                <div className="card-title">
                  <h4 className="mb-4">{t("Selected_User_Permissions")}</h4>
                </div>
                <div>
                  {selectedData &&
                    Array.from(Object.keys(selectedData)).map((key) => (
                      <div key={key}>
                        {selectedData[key].length > 0 && (
                          <Card className="border rounded shadow-none">
                            <Card.Body>
                              <h5>{t(`${key}`)}</h5>
                              <hr className="my-3 mx-auto" />
                              <div>
                                {selectedData[key]?.map((itemSub, key) => {
                                  return (
                                    <div key={key} className="p-2">
                                      - {t(itemSub)}
                                    </div>
                                  );
                                })}
                              </div>
                            </Card.Body>
                          </Card>
                        )}
                      </div>
                    ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default AddUser3;

// translation ##################################
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["Management", "main"])),
    },
  };
}

// translation ##################################
