const GeneralSystemPermissions = ({
  title,
  textEmails,
  textAlerts,
  textMessages,
}) => {
  return (
    <div className="w-100 mt-5">
      <h2 className="fs-2 bg-primary w-100 p-2 text-center text-white fst-italic">
        {title}
      </h2>
      <div>
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="flexCheckDefault"
          />
          <label className="form-check-label" htmlFor="flexCheckDefault">
            {textEmails}
          </label>
        </div>
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="flexCheckChecked"
          />
          <label className="form-check-label" htmlFor="flexCheckChecked">
            {textAlerts}
          </label>
        </div>
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="flexCheckChecked"
          />
          <label className="form-check-label" htmlFor="flexCheckChecked">
            {textMessages}
          </label>
        </div>
      </div>
    </div>
  );
};

export default GeneralSystemPermissions;
