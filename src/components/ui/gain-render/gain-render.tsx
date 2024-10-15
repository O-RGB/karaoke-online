import useConfigStore from "@/stores/config-store";
import useTickStore from "@/stores/tick-store";
import { CHANNEL_DEFAULT } from "@/config/value";
import React, { useEffect, useRef } from "react";
import { Sequencer } from "spessasynth_lib";
import { usePeerStore } from "@/stores/peer-store";
import useMixerStore from "@/stores/mixer-store";

interface GainRenderProps {
  analysers?: AnalyserNode[];
  player: Sequencer | undefined;
}

const GainRender: React.FC<GainRenderProps> = ({ analysers, player }) => {
  const setCurrntGain = useMixerStore((state) => state.setCurrntGain);
  const setCurrntGainMain = useMixerStore((state) => state.setCurrntGainMain);
  const { sendSuperUserMessage, superUserConnections } = usePeerStore();
  const mixIsShot = useConfigStore((state) => state.config.widgets?.mix?.show);
  const hideMixer = useMixerStore((state) => state.hideMixer);

  const tick = useTickStore((state) => state.tick);

  const gainMain = useRef<number>(0);
  const gain = useRef<number[]>(CHANNEL_DEFAULT);

  const gindRender = () => {
    if (analysers) {
      const newVolumeLevels = analysers?.map((analyser) => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const value = Math.round(
          dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length
        );
        return value;
      });

      if (hideMixer) {
        const totalGain =
          newVolumeLevels?.reduce((acc, volume) => acc + volume, 0) || 0;
        const mainGain = (totalGain / (newVolumeLevels.length * 20)) * 100;
        gainMain.current = Math.round(mainGain); // กำหนดค่า mainGain
        setCurrntGainMain(gainMain.current);
      } else {
        gain.current = newVolumeLevels;
        setCurrntGain(gain.current);
      }

      if (superUserConnections.length > 0) {
        sendSuperUserMessage({
          message: newVolumeLevels,
          type: "GIND_NODE",
          user: "SUPER",
        });
      }
    }
  };

  useEffect(() => {
    if (analysers && !player?.paused) {
      gindRender();
    }
  }, [mixIsShot ? tick : undefined, player?.paused, analysers, hideMixer]);

  return null;
};

export default GainRender;
