import useConfigStore from "@/components/stores/config-store";
import useGainStore from "@/components/stores/gain.store";
import useTickStore from "@/components/stores/tick-store";
import { CHANNEL_DEFAULT } from "@/config/value";
import React, { useEffect, useRef } from "react";
import { Sequencer } from "spessasynth_lib";

interface GainRenderProps {
  analysers?: AnalyserNode[];
  player: Sequencer | undefined;
  hideVolume: boolean;
}

const GainRender: React.FC<GainRenderProps> = ({
  analysers,
  player,
  hideVolume,
}) => {
  const gainMain = useRef<number>(0);
  const gain = useRef<number[]>(CHANNEL_DEFAULT);
  const { tick } = useTickStore();
  const { setCurrntGain, setCurrntGainMain } = useGainStore();
  const { config } = useConfigStore();
  const mixIsShot = config.widgets?.mix?.show;

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

      if (hideVolume) {
        const totalGain =
          newVolumeLevels?.reduce((acc, volume) => acc + volume, 0) || 0;
        const mainGain = (totalGain / (newVolumeLevels.length * 20)) * 100;
        gainMain.current = Math.round(mainGain); // กำหนดค่า mainGain
        setCurrntGainMain(gainMain.current);
      } else {
        gain.current = newVolumeLevels;
        setCurrntGain(gain.current);
      }

      //   if (superUserConnections.length > 0) {
      //     sendSuperUserMessage({
      //       message: newVolumeLevels,
      //       type: "GIND_NODE",
      //       user: "SUPER",
      //     });
      //   }
    }
  };

  useEffect(() => {
    if (analysers && !player?.paused) {
      gindRender();
    }
  }, [mixIsShot ? tick : undefined, player?.paused, analysers, hideVolume]);

  return null;
};

export default GainRender;
