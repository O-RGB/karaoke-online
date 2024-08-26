"use client";

import { createContext, FC, useEffect, useRef, useState } from "react";
import { useSynth } from "../hooks/spessasynth-hooks";
import { useRemote } from "../hooks/peer-hooks";
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
  const { synth } = useSynth();
  const { messages } = useRemote();
  const VolChannel = Array(16).fill(100);
  const [volumeController, setVolumeController] =
    useState<number[]>(VolChannel);

  const updateVolume = (index: number, value: number) => {
    setVolumeController((ch) => {
      ch[index] = value;
      return ch;
    });
  };

  const eventRemote = (content?: RemoteEncode) => {
    const type = content?.type;
    const data = content?.data;

    if (!type) {
      return;
    }
    switch (type) {
      case "GIND_NODE":
        return data as number[];

      case "SET_CHANNEL":
        if (!synth) {
          return;
        }
        const vol = data as ISetChannelGain;
        updateVolume(vol.channel, vol.value);
        volumeChange(vol.channel, vol.value, synth);
        return data as ISetChannelGain;

      default:
        return data;
    }
  };

  useEffect(() => {
    eventRemote(messages?.content);
  }, [messages?.content]);

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
