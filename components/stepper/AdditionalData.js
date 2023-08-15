import { useState, useMemo, useCallback, useEffect } from "react";
import { Row, Col, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

import AgGridDT from "components/AgGridDT";
import { fetchAllUsers } from "services/scheduledReports";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import { darkMode } from "lib/slices/config";
import { useTranslation } from "next-i18next";

const AdditionalData = ({
  emailsValues,
  additionalNumbers,
  setDescription,
  setAdditionalEmails,
  currentUserData,
  reportData,
  setUsersID,
  setEmailsValues,
}) => {
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [rowsSelected, setrowsSelected] = useState([]);
  const [DataTable, setDataTable] = useState(null);

  const [emails, setEmails] = useState([]);
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [showPhoneInput, setShowPhoneInput] = useState(false);

  const [showError, setShowError] = useState(false);

  const { t } = useTranslation(["scheduledReports", "common", "main"]);

  // fetch All scheduled Reports
  const onGridReady = useCallback(async (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    const response = await fetchAllUsers();
    setDataTable(response.users);

    if (currentUserData.email) {
      params?.api.forEachNode((node) => {
        if (currentUserData.email == node.data.Email) {
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

  useEffect(() => {
    if (reportData) {
      if (reportData.data?.to.length > 0) {
        setEmails(reportData?.data?.to);
        setEmailsValues(reportData?.data?.to);
      }

      if (reportData?.AdditionalNumbers?.length > 0) {
        setPhoneNumbers(reportData.AdditionalNumbers);
      }
    }
  }, [reportData]);

  const getRowClass = (params) => {
    if (params.data.Email === currentUserData.email) return "rowDisabled";
  };

  const handleEmailsSelection = (e) => {
    const selectedRows = gridApi.getSelectedRows();
    const selectedRowsEmail = selectedRows.map((row) => row.Email);
    const selectedRowsId = selectedRows.map((row) => row.ProfileID);
    setrowsSelected(selectedRowsEmail);
    setAdditionalEmails(selectedRowsEmail);
    setUsersID(selectedRowsId);
  };

  const addEmails = (e) => {
    if (e.target.value !== "" && /.+@.+\.[A-Za-z]+$/.test(e.target.value)) {
      emailsValues.push(e.target.value);
      setShowError(false);
      setEmails([...emails, e.target.value]);
      e.target.value = "";
    } else {
      setShowError(true);
    }
  };

  const addPhoneNumbers = (e) => {
    if (e.target.value !== "") {
      additionalNumbers.push(e.target.value);
      setPhoneNumbers([...phoneNumbers, e.target.value]);
      e.target.value = "";
    }
  };

  const handleDeleteEmail = (indexToRemove) => {
    setEmails([...emails.filter((_, index) => index !== indexToRemove)]);
    setEmailsValues([...emails.filter((_, index) => index !== indexToRemove)]);
  };

  const handleDeletePhone = (indexToRemove) => {
    setPhoneNumbers([
      ...phoneNumbers.filter((_, index) => index !== indexToRemove),
    ]);
    additionalNumbers.pop([
      ...phoneNumbers.filter((_, index) => index !== indexToRemove),
    ]);
  };

  // columns
  const columns = useMemo(
    () => [
      {
        headerName: "",
        field: "Select",
        maxWidth: 100,
        sortable: false,
        unSortIcon: false,
        checkboxSelection: true,
        headerCheckboxSelection: true,
      },
      {
        headerName: t("Full_Name"),
        field: "FullName",
        minWidth: 300,
        maxWidth: 300,
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: t("User_Name"),
        field: "UserName",
        minWidth: 300,
        maxWidth: 300,
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: t("Email"),
        field: "Email",
        minWidth: 300,
        maxWidth: 300,
        sortable: true,
        unSortIcon: true,
      },
      {
        headerName: t("Number_of_Assigned_Vehicles"),
        field: "vehicle_count",
        minWidth: 400,
        maxWidth: 500,
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
                onSelectionChanged={handleEmailsSelection}
                defaultColDef={defaultColDef}
                onGridReady={onGridReady}
                gridApi={gridApi}
                gridColumnApi={gridColumnApi}
                rowData={DataTable}
                getRowClass={getRowClass}
                type="users"
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="d-flex align-items-center w-100 gap-2  mb-3 py-4">
        <div className="w-50">
          <p className="mb-2">{t("Additional_Emails")}</p>

          {showError && (
            <small className="text-danger">
              {t("Please_Enter_A_Valid_Email")}
            </small>
          )}

          <div
            className="d-flex align-items-center bg-soft-primary p-2 gap-2 rounded-1 "
            style={{ flexWrap: "wrap" }}
          >
            {emails.map((email, index) => (
              <ul key={index} className=" list-unstyled m-0">
                <li className="bg-primary text-white p-1 rounded-1">
                  {email}

                  <FontAwesomeIcon
                    className="ms-1 "
                    style={{ cursor: "pointer" }}
                    icon={faTrash}
                    size="sm"
                    onClick={() => handleDeleteEmail(index)}
                  />
                </li>
              </ul>
            ))}

            <input
              type="email"
              name="emails"
              className="bg-transparent border-0"
              onKeyUp={(e) => (e.key === "Enter" ? addEmails(e) : null)}
              onBlur={(e) => addEmails(e)}
              placeholder={t("Enter_Your_Email")}
            />
          </div>
        </div>

        <FormControlLabel
          style={{
            alignSelf: "flex-end",
          }}
          label={
            <Typography
              style={{
                color: darkMode ? "#c8c8c8" : "rgba(0, 0, 0, 0.38)",
              }}
            >
              {t("Notify_By_SMS")}
            </Typography>
          }
          control={
            <Checkbox
              style={{
                color: darkMode ? "#c8c8c8" : "rgba(0, 0, 0, 0.38)",
              }}
              disabled
              onChange={() => setShowPhoneInput(!showPhoneInput)}
            />
          }
        />

        <div className="w-25">
          {showPhoneInput && (
            <>
              <p className="mb-2 ">Additional Phones</p>
              <div className="d-flex align-items-center bg-soft-primary p-2 gap-2 rounded-1 ">
                {phoneNumbers.map((number, index) => (
                  <ul key={index} className=" list-unstyled m-0">
                    <li className="bg-primary text-white p-1 rounded-1">
                      {number}

                      <FontAwesomeIcon
                        className="ms-1 "
                        style={{ cursor: "pointer" }}
                        icon={faTrash}
                        size="sm"
                        onClick={() => handleDeletePhone(index)}
                      />
                    </li>
                  </ul>
                ))}
                <input
                  type="number"
                  className="bg-transparent border-0"
                  onKeyUp={(e) =>
                    e.key === "Enter" ? addPhoneNumbers(e) : null
                  }
                  onBlur={(e) => addPhoneNumbers(e)}
                  placeholder="Enter Your Phone Number.."
                />
              </div>
            </>
          )}
        </div>
      </div>

      <p className="mb-2">{t("Schedule_Description")}</p>
      <textarea
        type="number"
        className="w-100 mb-5 border-0 bg-soft-primary p-2 rounded-1"
        onChange={(e) => setDescription(e.target.value)}
        defaultValue={reportData?.data?.Description ?? ""}
      />
    </div>
  );
};

export default AdditionalData;
