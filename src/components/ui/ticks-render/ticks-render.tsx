import useConfigStore from "@/stores/config-store";
import useTempoStore from "@/stores/tempo-store";
import useTickStore from "@/stores/tick-store";
import { REFRESH_RATE } from "@/config/value";
import React, { useEffect, useRef } from "react";
import { MIDI } from "spessasynth_lib";
import { useSpessasynthStore } from "@/stores/spessasynth-store";
import { useAppControlStore } from "@/stores/player-store";

interface TicksRenderProps {
  midiPlaying: MIDI | undefined;
}

const TicksRender: React.FC<TicksRenderProps> = ({ midiPlaying }) => {
  const config = useConfigStore((state) => state.config);
  const refreshRate = config?.refreshRate?.render ?? REFRESH_RATE["MIDDLE"];
  const setCurrentTick = useTickStore((state) => state.setCurrntTick);
  const setCurrentTempo = useTempoStore((state) => state.setCurrntTempo);

  // console.log("paused", player?.paused);
  const player = useSpessasynthStore((state) => state.player);

  const setIsFinished = useAppControlStore((state) => state.setIsFinished);
  const setPaused = useAppControlStore((state) => state.setPaused);
  const isFinished = useAppControlStore((state) => state.isFinished);
  const paused = useAppControlStore((state) => state.paused);
  const playingQueue = useAppControlStore((state) => state.playingQueue);
  const setPlayingQueue = useAppControlStore((state) => state.setPlayingQueue);
  const setSongPlaying = useAppControlStore((state) => state.setSongPlaying);
  const workerRef = useRef<Worker | null>(null);
  let updateInterval: NodeJS.Timeout | null = null;

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
      updateInterval = setInterval(
        () => {
          workerRef.current?.postMessage({
            type: "updateTime",
            data: { currentTime: player?.currentTime },
          });
          setIsFinished(player.isFinished);
          setPaused(player.paused);
          // console.log("check running");
        },
        isFinished || paused ? 1000 : refreshRate
      );
    }

    return () => {
      if (updateInterval) {
        clearInterval(updateInterval);
      }
    };
  }, [player, isFinished, paused]);

  useEffect(() => {
    if (isFinished === true) {
      if (playingQueue.length > 1) {
        let clone = [...playingQueue];
        clone = clone.splice(1, clone.length);
        setPlayingQueue(clone);

        setTimeout(() => {
          if (clone.length > 0) {
            const nextSong = clone[0];
            setSongPlaying(nextSong.file, nextSong.songInfo);
          }
        }, 1000);
      } else {
        setPlayingQueue([]);
      }
    }
  }, [isFinished]);

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

function sortTempoChanges(tempoChanges: ITempoChange[]): ITempoChange[] {
  return [...tempoChanges].sort((a, b) => a.ticks - b.ticks);
}

interface ITempoChange {
  ticks: number;
  tempo: number;
}
