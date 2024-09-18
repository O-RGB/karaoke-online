import { useContext } from "react";
import { PeerContext } from "../context/remote-context";

export const useRemote = () => useContext(PeerContext);
