import { KeyUpContext } from "@/context/keyup-context";
import { useContext } from "react";

export const useKeyUp = () => useContext(KeyUpContext);
