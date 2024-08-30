import { useContext } from "react";
import { MixerContext } from "../context/mixer-context";

export const useMixer = () => useContext(MixerContext);
