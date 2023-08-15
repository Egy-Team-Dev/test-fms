import { useMemo, useState, useEffect } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import axios from "axios";
import { useSelector } from "react-redux";

const AddModalWarnings = ({ showAddWarningModal, setShowAddWarningModal }) => {
  const dataFormRadio = useMemo(
    () => [
      {
        id: "1",
        name: "Geofence in",
        checked: false,
      },
      {
        id: "2",
        name: "Geofence out",
        checked: false,
      },
      {
        id: "3",
        name: "powerCutOff",
        checked: false,
      },
      {
        id: "4",
        name: "overSpeed",
        checked: false,
      },
      {
        id: "5",
        name: "lowPower",
        checked: false,
      },
      {
        id: "6",
        name: "harshBrake",
        checked: false,
      },
      {
        id: "7",
        name: "rapidAcceleration",
        checked: false,
      },
      {
        id: "8",
        name: "Preventive Maintenance",
        checked: false,
      },
    ],
    []
  );

  const { darkMode } = useSelector((state) => state.config);

  const [warningConfig, setWarningConfig] = useState([
    ...dataFormRadio,
    { email: "" },
  ]);

  const [selectedWarning, setSelectedWarning] = useState([]);
  const [loading, setLoading] = useState(true);
  const userLastWarningConfig =
    window != undefined && JSON.parse(localStorage.getItem("warningConfig"));

  useEffect(async () => {
    const response = await axios({
      method: "get",
      url: `/config`,
      headers: {
        "Content-Type": "application/json",
      },
    });

    warningConfig.map((el) => {
      if (userLastWarningConfig) {
        el.checked = userLastWarningConfig[el.name];
      }
    });

    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const handleChange = (e) => {
    const { id, checked } = e.target;
    let elementIndex = warningConfig?.find((el) => +el.id === +id);

    setSelectedWarning({
      ...userLastWarningConfig,
      ...selectedWarning,
      [id]: checked,
    });

    setWarningConfig(
      warningConfig.map((el) => {
        if (el.name === +id) {
          el.checked = !el.checked;
          return el;
        } else {
          return el;
        }
      })
    );
  };
  const handleClose = () => setShowAddWarningModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowAddWarningModal(false);

    const response = await axios({
      method: "post",
      url: `/config`,
      data: JSON.stringify({ warningsModal: selectedWarning }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.data.warningsModal) {
      localStorage.setItem(
        "warningConfig",
        JSON.stringify(response.data.warningsModal)
      );
    }
  };

  return (
    <Modal centered show={showAddWarningModal} onHide={handleClose}>
      <Modal.Header
        style={{ background: darkMode ? "#222738" : "#fff" }}
        closeButton
      >
        <Modal.Title>Add Modal Warnings</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ background: darkMode ? "#151824" : "#fff" }}>
        <Row>
          <Form onSubmit={handleSubmit}>
            <Col className=" d-flex flex-column gap-3 justify-content-center px-5">
              <Row>
                {loading && (
                  <div className="text-center my-5">
                    <span
                      className="spinner-border spinner-border-lg"
                      role="status"
                    />
                  </div>
                )}
                {!loading &&
                  warningConfig
                    .slice(0, 8)
                    ?.map(({ id, name, checked }, key) => (
                      <Form.Check
                        className=" d-flex justify-content-between"
                        type="switch"
                        id={name}
                        label={name}
                        // checked={checked}
                        defaultChecked={checked}
                        key={key}
                        onChange={(e) => handleChange(e)}
                      />
                    ))}
                <Form.Label className="mt-2">Email Address</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  className="border border-primary"
                  placeholder="name@example.com"
                  defaultValue={userLastWarningConfig?.email || ""}
                  onChange={(e) =>
                    setSelectedWarning({
                      ...selectedWarning,
                      email: e.target.value,
                    })
                  }
                />
              </Row>
              <Row className=" gap-4 d-flex justify-content-center">
                <Button
                  className="col-4"
                  size="lg"
                  variant="secondary"
                  onClick={handleClose}
                >
                  Close
                </Button>
                <Button
                  className="col-4"
                  size="lg"
                  variant="primary"
                  type="submit"
                >
                  Save
                </Button>
              </Row>
            </Col>
          </Form>
        </Row>
      </Modal.Body>
    </Modal>
  );
};
export default AddModalWarnings;
