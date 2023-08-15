import React from "react";
import { Button, Modal } from "react-bootstrap";
import { useSelector } from "react-redux";
export default function DeactivateModal({
  show,
  loading,
  title = "Are you sure?",
  description = "Are you sure you want to deactivate this table?",
  confirmText = "Yes, deactivate it!",
  cancelText = "No, cancel",
  onConfirm,
  onCancel,
}) {
  const {
    config: { darkMode },
  } = useSelector((state) => state);
  const Dark = darkMode ? "bg-dark" : "";

  return (
    <Modal
      show={show}
      size="md"
      onHide={onCancel}
      className="border-0"
      centered
    >
      <Modal.Header closeButton className={`${Dark} text-secondary`}>
        <Modal.Title className="" as="h4">
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body
        className={`${Dark}  border-0 d-flex justify-content-center
			align-items-center flex-column gap-3 `}
        style={{ minHeight: "200px" }}
      >
        <svg
          width={80}
          id="Layer_1"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          viewBox="0 0 512 512"
          fill={darkMode ? "rgb(255 72 59)" : "rgb(20,10,20,.5)"}
          style={{
            opacity: darkMode ? "1" : "0.5",
          }}
          xmlSpace="preserve"
        >
          <g>
            <g>
              <path d="M416.681,43.574H40.851C18.325,43.574,0,61.9,0,84.426v223.319c0,22.526,18.325,40.851,40.851,40.851h63.392 l35.763,61.308c1.464,2.51,4.152,4.054,7.058,4.054s5.593-1.544,7.058-4.054l35.763-61.308h63.807c4.512,0,8.17-3.658,8.17-8.17 s-3.658-8.17-8.17-8.17h-68.5c-2.905,0-5.593,1.544-7.058,4.054l-31.07,53.263l-31.07-53.263c-1.465-2.51-4.153-4.054-7.058-4.054 H40.851c-13.516,0-24.511-10.995-24.511-24.511V84.426c0-13.516,10.995-24.511,24.511-24.511h375.83 c13.516,0,24.511,10.995,24.511,24.511v136.177c0,4.512,3.658,8.17,8.17,8.17s8.17-3.658,8.17-8.17V84.426 C457.532,61.9,439.207,43.574,416.681,43.574z" />
            </g>
          </g>
          <g>
            <g>
              <path d="M348.596,144.34h-239.66c-4.512,0-8.17,3.658-8.17,8.17c0,4.512,3.658,8.17,8.17,8.17h239.66 c4.512,0,8.17-3.658,8.17-8.17C356.766,147.999,353.108,144.34,348.596,144.34z" />
            </g>
          </g>
          <g>
            <g>
              <path d="M348.596,187.915h-239.66c-4.512,0-8.17,3.658-8.17,8.17c0,4.512,3.658,8.17,8.17,8.17h239.66 c4.512,0,8.17-3.658,8.17-8.17C356.766,191.573,353.108,187.915,348.596,187.915z" />
            </g>
          </g>
          <g>
            <g>
              <path d="M239.66,231.489H108.936c-4.512,0-8.17,3.658-8.17,8.17c0,4.512,3.658,8.17,8.17,8.17H239.66 c4.512,0,8.17-3.658,8.17-8.17C247.83,235.147,244.172,231.489,239.66,231.489z" />
            </g>
          </g>
          <g>
            <g>
              <path d="M394.894,234.213c-64.573,0-117.106,52.533-117.106,117.106s52.533,117.106,117.106,117.106S512,415.892,512,351.319 S459.467,234.213,394.894,234.213z M394.894,452.085c-55.563,0-100.766-45.203-100.766-100.766s45.203-100.766,100.766-100.766 c55.563,0,100.766,45.203,100.766,100.766S450.457,452.085,394.894,452.085z" />
            </g>
          </g>
          <g>
            <g>
              <path d="M450.74,372.502l-21.183-21.183l21.183-21.183c9.557-9.557,9.557-25.107,0-34.664c-4.63-4.63-10.785-7.179-17.332-7.179 s-12.702,2.549-17.332,7.179l-21.183,21.183l-21.184-21.183c-4.63-4.63-10.785-7.179-17.332-7.179s-12.703,2.55-17.332,7.179 c-9.557,9.557-9.557,25.107,0,34.664l21.184,21.183l-21.183,21.183c-9.557,9.557-9.557,25.107,0,34.664 c4.63,4.63,10.785,7.179,17.332,7.179c6.547,0,12.702-2.549,17.332-7.179l21.183-21.183l21.183,21.183 c4.63,4.63,10.785,7.179,17.332,7.179s12.703-2.549,17.332-7.179C460.297,397.608,460.297,382.059,450.74,372.502z  M439.186,395.612c-1.544,1.544-3.595,2.393-5.778,2.393c-2.182,0-4.234-0.85-5.777-2.393l-26.961-26.961 c-1.595-1.596-3.686-2.393-5.777-2.393s-4.182,0.797-5.777,2.393l-26.961,26.961c-1.544,1.544-3.595,2.393-5.777,2.393 c-2.182,0-4.234-0.85-5.777-2.393c-3.185-3.185-3.185-8.37,0-11.555l26.961-26.961c3.191-3.191,3.191-8.364,0-11.554 l-26.961-26.961c-3.185-3.185-3.185-8.37,0-11.555c1.542-1.544,3.594-2.393,5.777-2.393c2.182,0,4.234,0.85,5.777,2.393 l26.961,26.961c3.191,3.191,8.364,3.191,11.554,0l26.961-26.961c1.544-1.544,3.595-2.393,5.777-2.393s4.234,0.85,5.778,2.393 c3.185,3.186,3.185,8.37,0,11.555l-26.961,26.961c-1.533,1.532-2.393,3.61-2.393,5.777s0.861,4.245,2.393,5.777l26.961,26.961 C442.371,387.242,442.371,392.426,439.186,395.612z" />
            </g>
          </g>
          <g />
          <g />
          <g />
          <g />
          <g />
          <g />
          <g />
          <g />
          <g />
          <g />
          <g />
          <g />
          <g />
          <g />
          <g />
        </svg>
        <p className="lead text-secondary">{description}</p>
      </Modal.Body>
      <Modal.Footer className={`d-flex justify-content-center ${Dark}`}>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="danger"
          className={`px-4 py-2 ms-3 ${darkMode ? "text-white" : ""} `}
        >
          {confirmText}
        </Button>
        <Button
          variant="primary"
          className={`px-4 py-2 ms-3 ${darkMode ? "text-white" : ""}`}
          onClick={onCancel}
        >
          {/* <FontAwesomeIcon
                        className="mx-2"
                        icon={faTimes}
                        size="sm"
                    /> */}
          {cancelText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
