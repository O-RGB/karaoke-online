import { useContext } from "react";
import { RemoteContext } from "../context/remote-context";

export const useRemote = () => useContext(RemoteContext);
