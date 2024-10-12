"use client";
import { useSynth } from "@/hooks/spessasynth-hook";
import { createContext, FC, useCallback, useEffect, useState } from "react";
import { midiControllers } from "spessasynth_lib";

type MixerContextType = {
  isDragging: boolean;
};

type MixerProviderProps = {
  children: React.ReactNode;
};

export const MixerContext = createContext<MixerContextType>({
  isDragging: true,
});

export const MixerProvider: FC<MixerProviderProps> = ({ children }) => {
  const { synth } = useSynth();

  // Volume Control
  const VolChannel = Array(16).fill(100);
  const [volumeController, setVolumeController] =
    useState<number[]>(VolChannel);
  const [isVolumeHeld, setIsVolumeHeld] = useState<boolean>(false);
  const [hideVolume, setHideVolume] = useState<boolean>(false);

  const updateVolumeSysth = (channel: number, vol: number) => {
    synth?.controllerChange(channel, midiControllers.mainVolume, vol);
    setVolumeController((ch) => {
      ch[channel] = vol;
      return ch;
    });
  };

  const synthEventController = useCallback(
    (controllerNumber: number, controllerValue: number, channel: number) => {
      if (controllerNumber === 7 && isVolumeHeld === false) {
        updateVolumeSysth(channel, controllerValue);
      }
    },
    [isVolumeHeld]
  );

  useEffect(() => {
    synth?.eventHandler.addEvent("controllerchange", "", (e) => {
      const controllerNumber = e.controllerNumber;
      const controllerValue = e.controllerValue;
      const channel = e.channel;
      synthEventController(controllerNumber, controllerValue, channel);
    });
  }, [synth]);

  return (
    <MixerContext.Provider value={{ isDragging: false }}>
      {children}
    </MixerContext.Provider>
  );
};
