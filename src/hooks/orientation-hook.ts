import { OrientationContext } from "@/context/orientation-context";
import { useContext } from "react";

export const useOrientation = () => useContext(OrientationContext);
