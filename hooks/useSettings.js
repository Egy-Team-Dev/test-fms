import axios from "axios";
const useSettings = () => {
  const fetchSettings = async () => {
    axios
      .get("vehicles/settings?withloc=1")
      .then((res) => {
        localStorage.setItem("settings", JSON.stringify(res.data));
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message);
      });
  };

  return { fetchSettings };
};

export default useSettings;
