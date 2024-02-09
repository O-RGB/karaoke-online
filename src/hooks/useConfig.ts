import { useContext } from "react";
import { ConfigContext } from "../context/config";

const useConfig = () => useContext(ConfigContext);

export default useConfig;
