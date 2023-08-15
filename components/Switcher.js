import { Switch } from "@mui/material";

const Switcher = ({ setData, Style, name = "", value = "", checked, text }) => (
  <div className="d-flex  align-items-center mb-2">
    <Switch
      onClick={() => setData((prev) => !prev)}
      style={Style}
      name={name}
      value={value}
      checked={checked}
    />
    <div className="lead">{text}</div>
  </div>
);

export default Switcher;
