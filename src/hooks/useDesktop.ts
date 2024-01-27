import { useContext } from "react";
import { DesktopContext } from "../context/desktop";

const useDesktop = () => useContext(DesktopContext);

export default useDesktop;
