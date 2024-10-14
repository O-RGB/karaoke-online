import useVolumeStore from "@/stores/volume-store";
import { useAppControl } from "@/hooks/app-control-hook";
import React, { useCallback, useEffect, useRef } from "react";
import { Synthetizer } from "spessasynth_lib";

interface VolumeEventProps {
  synth: Synthetizer;
  isVolumeHeld: boolean;
}

const VolumeEvent: React.FC<VolumeEventProps> = ({ synth, isVolumeHeld }) => {
  const { updateVolumeSysth } = useAppControl();
  const { setVolume } = useVolumeStore();

  const synthEventController = useCallback(
    (controllerNumber: number, controllerValue: number, channel: number) => {
      if (controllerNumber === 7 && isVolumeHeld === false) {
        setVolume((prevVoluem) => {
          const newVolume = [...prevVoluem];
          newVolume[channel] = controllerValue;
          return newVolume;
        });
      }
    },
    [isVolumeHeld, setVolume]
  );

  const eventProgramChange = () => {
    synth?.eventHandler.addEvent("controllerchange", "", (e) => {
      const { controllerNumber, controllerValue, channel } = e;
      synthEventController(controllerNumber, controllerValue, channel);
    });
  };

  useEffect(() => {
    updateVolumeSysth(0, 100);
    setTimeout(() => {
      eventProgramChange();
    }, 10);
  }, [synth]);

  // useEffect(() => {volumeLib()}, [isMute]);

  return null;
};

export default VolumeEvent;
