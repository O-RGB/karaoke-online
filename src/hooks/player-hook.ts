import { useContext } from "react";
import { PlayerContext } from "@/context/player-context";

export const usePlayer = () => useContext(PlayerContext);
