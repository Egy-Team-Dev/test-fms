// translation
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button, Card, Col, Row, Form } from "react-bootstrap";
import { Formik } from "formik";
import Input from "components/formik/Input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faSpinner, faTimes } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useSession } from "next-auth/client";
import ReactSelect from "components/Select";

const EditUser = ({
  id,
  handleModel,
  editModel,
  GetAssignUsers,
  rolesOptions,
}) => {
  const { t } = useTranslation("Management");
  const [data, setData] = useState({});
  const [aspID, setAspId] = useState("");
  const [loadingPage, setLoadingPage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [defaultRole, setDefaultRole] = useState("");

  const session = useSession();
  const userRole =
    session[0]?.user?.mongoRole?.toLowerCase() ||
    session[0]?.user?.user?.mongoRole?.toLowerCase() ||
    session[0]?.user?.user?.role;

  const fetchData = async () => {
    try {
      const respond = await axios.get(`dashboard/management/users/data/${id}`);
      setData(respond.data?.user);
      setAspId(respond?.data?.user?.ASPNetUserID);
      setDefaultRole(respond.data?.user?.Role);
      if (respond.status == 200) {
      }
      setLoadingPage(false);
    } catch (error) {
      toast.error(error.response?.data?.message);
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (defaultRole) {
      const roleID = rolesOptions.find(
        (role) => role.name == defaultRole
      )?.value;
      setSelectedRole(roleID || "");
    }
  }, [defaultRole]);
  const initialValues = {
    FirstName: data?.FirstName || "",
    LastName: data?.LastName || "",
    UserName: data?.UserName || "",
    Email: data?.Email || "",
    PhoneNumber: data?.PhoneNumber || "",
    Password: "",
  };

  const handleChange = (value) => {
    setSelectedRole(value);
  };

  const onSubmit = async (data) => {
    let submitData;
    submitData = {
      ...data,
      RoleID: selectedRole,
    };
    if (!data.Password) delete submitData.Password;
    if (
      submitData.FirstName &&
      submitData.LastName &&
      submitData.Email &&
      submitData.UserName &&
      submitData.PhoneNumber
    ) {
      setLoading(true);
      try {
        const respond = await axios.put(
          `dashboard/management/users/data/${aspID}`,
          submitData
        );
        toast.success(respond?.data?.message);
        GetAssignUsers();
        setLoading(false);
        if (editModel) {
          handleModel();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Something Went Wrong");
        setLoading(false);
      }
    } else {
      toast.error("please fill all fields");
    }
  };

  return (
    <div className="container-fluid">
      {loadingPage && <h3 className="text-center pt-5 pb-5">loading...</h3>}
      {!loadingPage && (
        <Card>
          {!editModel && (
            <Card.Header className="h3">
              {t("Update_User_Information")}
            </Card.Header>
          )}
          <Card.Body>
            <Formik initialValues={initialValues} onSubmit={onSubmit}>
              {(formik) => {
                return (
                  <Form onSubmit={formik.handleSubmit}>
                    <Row>
                      <Col md="12" lg="6">
                        <Input
                          placeholder={t("First_Name")}
                          label={t("First_Name")}
                          name="FirstName"
                          type="text"
                          className={"mb-3"}
                        />
                      </Col>
                      <Col md="12" lg="6">
                        <Input
                          placeholder={t("Last_Name")}
                          label={t("Last_Name")}
                          name="LastName"
                          type="text"
                          className={"mb-3"}
                        />
                      </Col>
                      <Col md="12" lg="6">
                        <Input
                          placeholder={t("User_Name")}
                          label={t("User_Name")}
                          name="UserName"
                          type="text"
                          className={"mb-3"}
                        />
                      </Col>
                      <Col md="12" lg="6">
                        <Input
                          placeholder={t("Email")}
                          label={t("Email")}
                          name="Email"
                          type="email"
                          className={" mb-3"}
                        />
                      </Col>
                      <Col md="12" lg="6">
                        <Input
                          placeholder={t("Phone_Number")}
                          label={t("Phone_Number")}
                          name="PhoneNumber"
                          type="text"
                          className={"mb-3"}
                        />
                      </Col>
                      <Col md="12" lg="6">
                        <Input
                          placeholder={t("Password")}
                          label={t("Password")}
                          name="Password"
                          type="password"
                          className={"mb-3"}
                        />
                      </Col>
                      {(userRole === "support" || userRole === "admin") && (
                        <Col md="12" lg="6">
                          <label>{t("User_Role")}</label>
                          <ReactSelect
                            defaultValue={selectedRole}
                            onSelectChange={handleChange}
                            options={rolesOptions}
                            placeholder={t("Select User Role")}
                            Style={{ marginLeft: "0.7rem" }}
                            className="mb-3  mt-1"
                            cuStyles={{
                              minHeight: "30px",
                            }}
                          />
                        </Col>
                      )}
                    </Row>

                    <div className="w-100 d-flex flex-wrap flex-md-nowrap">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="px-3 py-2 text-nowrap me-3 ms-0  mb-2 mb-md-0"
                      >
                        {!loading ? (
                          <FontAwesomeIcon
                            className="mx-2"
                            icon={faCheck}
                            size="sm"
                          />
                        ) : (
                          <FontAwesomeIcon
                            className="mx-2 fa-spin"
                            icon={faSpinner}
                            size="sm"
                          />
                        )}
                        {t("save")}
                      </Button>
                      <Button
                        type="button"
                        className="px-3 py-2 text-nowrap me-3 ms-0  mb-2 mb-md-0"
                        onClick={() => {
                          handleModel();
                        }}
                      >
                        <FontAwesomeIcon
                          className="mx-2"
                          icon={faTimes}
                          size="sm"
                        />
                        {t("cancel")}
                      </Button>
                    </div>
                  </Form>
                );
              }}
            </Formik>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};
export default EditUser;

// translation ##################################
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["Management", "main"])),
    },
  };
}
// translation ##################################
