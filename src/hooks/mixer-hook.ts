import { MixerContext } from "@/context/mixer-context";
import { useContext } from "react";

export const useMixer = () => useContext(MixerContext);
