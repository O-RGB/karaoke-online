import useMixerStore from "@/stores/mixer-store";
import { usePeerStore } from "@/stores/peer-store";
import { useSpessasynthStore } from "@/stores/spessasynth-store";
import React, { useCallback, useEffect } from "react";
import { midiControllers, Synthetizer } from "spessasynth_lib";

interface VolumeEventProps {}

const VolumeEvent: React.FC<VolumeEventProps> = ({}) => {
  const setVolumes = useMixerStore((state) => state.setVolumes);
  const setPan = useMixerStore((state) => state.setPan);
  const setReverb = useMixerStore((state) => state.setReverb);
  const setChorusDepth = useMixerStore((state) => state.setChorusDepth);
  const heid = useMixerStore((state) => state.held);
  const synth = useSpessasynthStore.getState().synth;
  const superUserConnections = usePeerStore(
    (state) => state.superUserConnections
  );
  const sendSuperUserMessage = usePeerStore(
    (state) => state.sendSuperUserMessage
  );

  const synthEventController = useCallback(
    (controllerNumber: number, controllerValue: number, channel: number) => {
      if (heid === false) {
        switch (controllerNumber) {
          case midiControllers.mainVolume:
            console.log("on event", controllerValue);
            if (channel === 3) {
            }
            let vol: number[] = [];
            setVolumes((prevVoluem) => {
              const newVolume = [...prevVoluem];
              newVolume[channel] = controllerValue;
              vol = newVolume;
              return newVolume;
            });
            if (superUserConnections.length > 0) {
              sendSuperUserMessage({
                message: vol,
                type: "VOLUMES",
                user: "SUPER",
              });
            }
            break;

          case midiControllers.pan:
            let pan: number[] = [];
            setPan((prevPan) => {
              const newPan = [...prevPan];
              newPan[channel] = controllerValue;
              pan = newPan;
              return newPan;
            });
            if (superUserConnections.length > 0) {
              sendSuperUserMessage({
                message: pan,
                type: "PAN",
                user: "SUPER",
              });
            }
            break;
          case 91:
            setReverb((prevReverb) => {
              const newReverb = [...prevReverb];
              newReverb[channel] = controllerValue;
              if (superUserConnections.length > 0) {
                sendSuperUserMessage({
                  message: newReverb,
                  type: "PAN",
                  user: "SUPER",
                });
              }
              return newReverb;
            });
            break;
          case 93:
            setChorusDepth((prevChorusDepth) => {
              const newChorusDepth = [...prevChorusDepth];
              newChorusDepth[channel] = controllerValue;
              if (superUserConnections.length > 0) {
                sendSuperUserMessage({
                  message: newChorusDepth,
                  type: "PAN",
                  user: "SUPER",
                });
              }
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
