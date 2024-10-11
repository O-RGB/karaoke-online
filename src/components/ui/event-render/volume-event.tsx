import useVolumeStore from "@/components/stores/volume-store";
import { useAppControl } from "@/hooks/app-control-hook";
import React, { useCallback, useEffect, useRef } from "react";
import { Synthetizer } from "spessasynth_lib";

interface VolumeEventProps {
  synth: Synthetizer;
  isVolumeHeld: boolean;
}

const VolumeEvent: React.FC<VolumeEventProps> = ({ synth, isVolumeHeld }) => {
  const { updateVolumeSysth } = useAppControl();
  const storeSetVolume = useVolumeStore((state) => state.setVolume);
  const synthEventController = useCallback(
    (controllerNumber: number, controllerValue: number, channel: number) => {
      if (controllerNumber === 7 && isVolumeHeld === false) {
        storeSetVolume((prevVoluem) => {
          const newVolume = [...prevVoluem];
          newVolume[channel] = controllerValue;
          return newVolume;
        });
      }
    },
    [isVolumeHeld, storeSetVolume]
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

  return null;
};

export default VolumeEvent;
