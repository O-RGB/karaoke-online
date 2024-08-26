import { useContext } from "react";
import { PeerContext } from "../context/Peer-context";

export const usePeer = () => useContext(PeerContext);
