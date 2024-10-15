import useMixerStore from "@/stores/mixer-store";
import { useAppControl } from "@/hooks/app-control-hook";
import React, { useCallback, useEffect, useRef } from "react";
import { midiControllers, Synthetizer } from "spessasynth_lib";
import volumeSynth from "@/features/volume/volume-features";

interface VolumeEventProps {
  synth: Synthetizer;
  // isVolumeHeld: boolean;
}

const VolumeEvent: React.FC<VolumeEventProps> = ({ synth }) => {
  const volumeLib = volumeSynth(synth);
  const { setVolume, setPan, setReverb, setChorusDepth } = useMixerStore();
  const heid = useMixerStore((state) => state.held);

  const synthEventController = useCallback(
    (controllerNumber: number, controllerValue: number, channel: number) => {
      if (heid === false) {
        switch (controllerNumber) {
          case midiControllers.mainVolume:
            setVolume((prevVoluem) => {
              const newVolume = [...prevVoluem];
              newVolume[channel] = controllerValue;
              return newVolume;
            });
            break;

          case midiControllers.pan:
            console.log("set pan in event");
            setPan((prevPan) => {
              const newPan = [...prevPan];
              newPan[channel] = controllerValue;
              return newPan;
            });
            break;
          case 91:
            setReverb((prevReverb) => {
              const newReverb = [...prevReverb];
              newReverb[channel] = controllerValue;
              return newReverb;
            });
            break;
          case 93:
            setChorusDepth((prevChorusDepth) => {
              const newChorusDepth = [...prevChorusDepth];
              newChorusDepth[channel] = controllerValue;
              return newChorusDepth;
            });
            break;

          default:
            break;
        }
      }
    },
    [heid, setVolume]
  );

  const eventProgramChange = () => {
    synth?.eventHandler.addEvent("controllerchange", "", (e) => {
      const { controllerNumber, controllerValue, channel } = e;

      console.log({ controllerNumber, controllerValue, channel });
      synthEventController(controllerNumber, controllerValue, channel);
    });
  };

  useEffect(() => {
    if (volumeLib) {
      volumeLib.updateMainVolume(0, 100);
    }
    setTimeout(() => {
      eventProgramChange();
    }, 10);
  }, [synth]);

  // useEffect(() => {volumeLib()}, [isMute]);

  return null;
};

export default VolumeEvent;
