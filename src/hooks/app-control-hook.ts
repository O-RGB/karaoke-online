import { AppControlContext } from "@/context/app-control-context";
import { useContext } from "react";


export const useAppControl = () => useContext(AppControlContext);
