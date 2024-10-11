import useTempoStore from "@/components/stores/tempo-store";
import useTickStore from "@/components/stores/tick-store";
import {
  calculateTicks,
  convertTicksToTime,
  sortTempoChanges,
} from "@/lib/app-control";
import React, { useCallback, useEffect, useRef } from "react";
import { MIDI, Sequencer, Synthetizer } from "spessasynth_lib";

interface TicksRenderProps {
  player: Sequencer | undefined;
  synth: Synthetizer | undefined;
  midiPlaying: MIDI | undefined;
}

const TicksRender: React.FC<TicksRenderProps> = ({
  player,
  midiPlaying,
  synth,
}) => {
  const setCurrntTime = useTickStore((state) => state.setCurrntTick);
  const setCurrntTempo = useTempoStore((state) => state.setCurrntTempo);
  const tempoChanges = useRef<ITempoChange[]>([]);
  const timeList = useRef<ITempoTimeChange[]>([]);
  const timeDivision = useRef<number>(0);

  const updateTick = useCallback(() => {
    if (player && tempoChanges.current.length > 0) {
      const currentTime = player.currentTime;
      const { tick, tempo } = calculateTicks(
        timeDivision.current,
        currentTime,
        timeList.current
      );

      setCurrntTime(tick);
      setCurrntTempo(tempo);
    }
  }, [player]);

  useEffect(() => {
    timeDivision.current = midiPlaying?.timeDivision ?? 0;
    let tempos = midiPlaying?.tempoChanges ?? [];
    tempos = tempos.slice(0, -1).reverse();
    tempos = sortTempoChanges(tempos);
    tempoChanges.current = tempos;
    timeList.current = convertTicksToTime(timeDivision.current, tempos);
  }, [midiPlaying]);

  useEffect(() => {
    const intervalId = setInterval(updateTick, 16);
    return () => {
      clearInterval(intervalId);
    };
  }, [updateTick]);

  return null;
};

export default TicksRender;
