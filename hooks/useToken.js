import { useRef } from "react";
import { useSelector } from "react-redux";

const useToken = () => {
  const newToken = useSelector((state) => state?.auth?.user?.new_token);
  const newRefToken = useRef();
  newRefToken.current = newToken;

  return { tokenRef: newRefToken.current };
};

export default useToken;
