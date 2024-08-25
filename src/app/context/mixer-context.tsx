"use client";

import { createContext, FC, useRef, useState } from "react";
import { useSynth } from "../hooks/spessasynth-hooks";
import { volumeChange } from "@/lib/mixer";

type MixerContextType = {
  updateVolume: (index: number, value: number) => void;
  volumeController: number[];
};

type MixerProviderProps = {
  children: React.ReactNode;
};

export const MixerContext = createContext<MixerContextType>({
  updateVolume: () => {},
  volumeController: [],
});

export const MixerProvider: FC<MixerProviderProps> = ({ children }) => {
  const VolChannel = Array(16).fill(100);
  const [volumeController, setVolumeController] =
    useState<number[]>(VolChannel);

  const updateVolume = (index: number, value: number) => {
    console.log("Update vlaue state", volumeController);
    setVolumeController((ch) => {
      ch[index] = value;
      return ch;
    });
  };
  return (
    <MixerContext.Provider
      value={{
        updateVolume: updateVolume,
        volumeController: volumeController,
      }}
    >
      <>{children}</>
    </MixerContext.Provider>
  );
};
