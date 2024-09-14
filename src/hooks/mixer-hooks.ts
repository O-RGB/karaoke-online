import { AppControlContext } from "@/context/app-control-context";
import { useContext } from "react";


export const useMixer = () => useContext(AppControlContext);
