import useConfigStore from "@/stores/config-store";
import useTempoStore from "@/stores/tempo-store";
import useTickStore from "@/stores/tick-store";
import { REFRESH_RATE } from "@/config/value";
import React, { useEffect, useRef } from "react";
import { MIDI, Sequencer, Synthetizer } from "spessasynth_lib";

interface TicksRenderProps {
  player: Sequencer | undefined;
  synth: Synthetizer | undefined;
  midiPlaying: MIDI | undefined;
}

const TicksRender: React.FC<TicksRenderProps> = ({ player, midiPlaying }) => {
  const config = useConfigStore((state) => state.config);
  const refreshRate = config?.refreshRate?.render ?? REFRESH_RATE["MIDDLE"];
  const setCurrentTick = useTickStore((state) => state.setCurrntTick);
  const setCurrentTempo = useTempoStore((state) => state.setCurrntTempo);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("/tick-worker.js", window.location.origin)
    );

    workerRef.current.onmessage = (e) => {
      const { type, data } = e.data;
      if (type === "tick") {
        setCurrentTick(data.tick);
        setCurrentTempo(data.tempo);
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    if (midiPlaying && workerRef.current) {
      const timeDivision = midiPlaying.timeDivision ?? 0;
      let tempos = midiPlaying.tempoChanges ?? [];
      tempos = tempos.slice(0, -1).reverse();
      tempos = sortTempoChanges(tempos);

      workerRef.current.postMessage({
        type: "init",
        data: { timeDivision, tempoChanges: tempos },
      });
    }
  }, [midiPlaying]);

  useEffect(() => {
    if (workerRef.current && player) {
      const updateInterval = setInterval(() => {
        workerRef.current?.postMessage({
          type: "updateTime",
          data: { currentTime: player.currentTime },
        });
      }, refreshRate);

      return () => clearInterval(updateInterval);
    }
  }, [player, refreshRate]);

  useEffect(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: "start",
        data: { refreshRate },
      });
    }

    return () => {
      workerRef.current?.postMessage({ type: "stop" });
    };
  }, [refreshRate]);

  return null;
};

export default TicksRender;

// Helper function (you might want to move this to a separate utility file)
function sortTempoChanges(tempoChanges: ITempoChange[]): ITempoChange[] {
  return [...tempoChanges].sort((a, b) => a.ticks - b.ticks);
}

// Type definitions (you might want to move these to a separate types file)
interface ITempoChange {
  ticks: number;
  tempo: number;
}
