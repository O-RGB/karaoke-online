import useMixerStore from "@/stores/mixer-store";
import React, { useCallback, useEffect } from "react";
import { midiControllers, Synthetizer } from "spessasynth_lib";

interface VolumeEventProps {
  synth: Synthetizer;
}

const VolumeEvent: React.FC<VolumeEventProps> = ({ synth }) => {
  const setVolumes = useMixerStore((state) => state.setVolumes);
  const setPan = useMixerStore((state) => state.setPan);
  const setReverb = useMixerStore((state) => state.setReverb);
  const setChorusDepth = useMixerStore((state) => state.setChorusDepth);
  const heid = useMixerStore((state) => state.held);

  const synthEventController = useCallback(
    (controllerNumber: number, controllerValue: number, channel: number) => {
      if (heid === false) {
        switch (controllerNumber) {
          case midiControllers.mainVolume:
            if(channel === 3){
              console.log("on event", controllerValue)
            }
            setVolumes((prevVoluem) => {
              const newVolume = [...prevVoluem];
              newVolume[channel] = controllerValue;
              return newVolume;
            });
            break;

          case midiControllers.pan:
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
    [heid, setVolumes]
  );

  const eventProgramChange = () => {
    synth?.eventHandler.addEvent("controllerchange", "", (e) => {
      const { controllerNumber, controllerValue, channel } = e;

      // console.log({ controllerNumber, controllerValue, channel });
      synthEventController(controllerNumber, controllerValue, channel);
    });
  };

  useEffect(() => {
    setTimeout(() => {
      eventProgramChange();
    }, 10);
  }, [synth]);

  return null;
};

export default VolumeEvent;
