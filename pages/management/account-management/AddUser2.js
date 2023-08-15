import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Row, Col, Form, Card, FormCheck } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { addRole, reset } from "../../../lib/slices/userInfo";
// translation
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { toast } from "react-toastify";
import axios from "axios";
import { useSelector } from "react-redux";

const AddUser2 = () => {
  const { t } = useTranslation("Management");
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state?.userInfo);

  const [selectedRole, setSelectedRole] = useState(null);
  const [roles, setRoles] = useState([]);

  const getRoles = async () => {
    try {
      const res = await axios.get("/dashboard/management/roles");
      if (res.status === 200)
        setRoles(res?.data.allRoles.slice(0, 3).filter((ro) => ro.Id !== "2"));
    } catch (error) {
      console.log(error);
      toast.error("error Fetching Roles, Try Again later!");
    }
  };

  useEffect(() => {
    getRoles();
    setSelectedRole(+user.RoleId);
  }, []);
  const handleRole = (e) => {
    setSelectedRole(+e.target.value);
  };
  const handleDeleteAllDataWithGoToMainPage = () => {
    dispatch(reset());
  };
  useEffect(() => {
    dispatch(addRole(selectedRole));
  }, [selectedRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedRole) {
      try {
        const res = await axios.post("dashboard/management/users", {
          UserName: user.UserName,
          Email: user.Email,
          EmailConfirmed: user.EmailConfirmed,
          PhoneNumber: user.PhoneNumber,
          PhoneNumberConfirmed: user.PhoneNumberConfirmed,
          TwoFactorEnabled: user.TwoFactorEnabled,
          LockoutEnabled: user.LockoutEnabled,
          AccessFailedCount: user.AccessFailedCount,
          FirstName: user.FirstName,
          LastName: user.LastName,
          Password: user.Password,
          RoleId: user.RoleId,
        });
        if (res?.status === 201) {
          toast.success(res.message || "User Added Successfully");
          dispatch(reset());
          router.push("/management/account-management/manageUsers");
        }
      } catch (err) {
        console.log(err);
        toast.error(err.response?.data?.message || "Something went Wrong");
      }
    } else {
      toast.error("Please select a user role");
    }
  };

  return (
    <div className="container-fluid">
      <Card>
        <Card.Body>
          <Row className=" d-flex justify-content-center my-5">
            <Col md="8">
              <Form onSubmit={handleSubmit}>
                <Form.Group as={Row}>
                  {roles.length > 0 &&
                    roles.map((role) => (
                      <Col md="6" className="mb-3">
                        <Card className="border-bottom border-4 border-0 border-primary">
                          <Card.Body className="d-flex justify-content-start align-items-center">
                            <div>
                              <Form.Check className="mb-3 form-check">
                                <FormCheck.Input
                                  type="radio"
                                  name="userRole"
                                  className="me-3 p-2"
                                  defaultChecked={user.RoleId == role.Id}
                                  id={role.Name}
                                  onChange={handleRole}
                                  value={+role.Id}
                                  style={{ cursor: "pointer" }}
                                />
                                <FormCheck.Label
                                  className="h4"
                                  htmlFor={role.Name}
                                  style={{ cursor: "pointer" }}
                                >
                                  {t(role.Name)}
                                </FormCheck.Label>
                              </Form.Check>
                              {/* <span>text description here...</span> */}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}

                  <div className="mt-5 d-flex justify-content-end">
                    <button
                      type="button"
                      onClick={() => {
                        dispatch(addRole(`${selectedRole}`));
                        router.push("/management/account-management/AddUser1");
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
                      type="submit"
                      className="btn btn-primary px-3 py-2 ms-3"
                    >
                      <FontAwesomeIcon
                        className="me-2"
                        icon={faArrowRight}
                        size="sm"
                      />
                      Finish
                    </button>
                    <Link
                      href="/management/account-management/manageUsers"
                      passHref
                    >
                      <button
                        type="button"
                        onClick={() => handleDeleteAllDataWithGoToMainPage()}
                        className="btn btn-primary px-3 py-2 ms-3"
                      >
                        <FontAwesomeIcon
                          className="me-2"
                          icon={faTimes}
                          size="sm"
                        />
                        Cancel
                      </button>
                    </Link>
                  </div>
                </Form.Group>
              </Form>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AddUser2;

// translation ##################################
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["Management", "main"])),
    },
  };
}

// translation ##################################
