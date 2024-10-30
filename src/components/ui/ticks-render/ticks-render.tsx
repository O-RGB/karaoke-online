import useConfigStore from "@/stores/config-store";
import useTempoStore from "@/stores/tempo-store";
import useTickStore from "@/stores/tick-store";
import { REFRESH_RATE } from "@/config/value";
import React, { useEffect, useRef, useState } from "react";
import { useSpessasynthStore } from "@/stores/spessasynth-store";
import { usePlayer } from "@/stores/player-store";
import { usePeerStore } from "@/stores/peer-store";

interface TicksRenderProps {}

const TicksRender: React.FC<TicksRenderProps> = ({}) => {
  const superUserConnections = usePeerStore(
    (state) => state.superUserConnections
  );
  const sendSuperUserMessage = usePeerStore(
    (state) => state.sendSuperUserMessage
  );

  const config = useConfigStore((state) => state.config);
  const refreshRate = config?.refreshRate?.render ?? REFRESH_RATE["MIDDLE"];
  const setCurrentTick = useTickStore((state) => state.setCurrntTick);
  const setCurrentTempo = useTempoStore((state) => state.setCurrntTempo);

  const midiPlaying = usePlayer((state) => state.midiPlaying);

  const player = useSpessasynthStore((state) => state.player);

  const nextSong = usePlayer((state) => state.nextSong);
  const setIsFinished = usePlayer((state) => state.setIsFinished);
  const setPaused = usePlayer((state) => state.setPaused);
  const isFinished = usePlayer((state) => state.isFinished);
  const paused = usePlayer((state) => state.paused);
  const playingQueue = usePlayer((state) => state.playingQueue);
  const setPlayingQueue = usePlayer((state) => state.setPlayingQueue);
  const setSongPlaying = usePlayer((state) => state.setSongPlaying);
  const setCountDown = usePlayer((state) => state.setCountDown);
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
  // useEffect(() => {
  //   let animationFrameId: number;
  //   let lastTime = performance.now();
  //   let accumulatedTime = 0;

  //   const update = (currentTime: number) => {
  //     if (!player || !workerRef.current) return;

  //     // Calculate the time elapsed since the last frame
  //     const deltaTime = currentTime - lastTime;
  //     lastTime = currentTime;
  //     accumulatedTime += deltaTime;

  //     // Only update if enough time has passed, based on refreshRate
  //     if (accumulatedTime >= refreshRate) {
  //       accumulatedTime = 0; // Reset the accumulated time

  //       // Send the updateTime message
  //       workerRef.current?.postMessage({
  //         type: "updateTime",
  //         data: { currentTime: player.currentTime },
  //       });

  //       const lastTime = Math.floor(player?.duration ?? 0);
  //       const countDown = lastTime - Math.floor(player?.currentTime ?? 0);
  //       if (countDown < 10) {
  //         setCountDown(countDown);
  //       }
  //       if (countDown === 0) {
  //         setTimeout(() => {
  //           setCountDown(10);
  //         }, 1000);
  //       }
  //       setIsFinished(player.isFinished);
  //       setPaused(player.paused);

  //       if (superUserConnections.length > 0) {
  //         sendSuperUserMessage({
  //           message: player.currentTime,
  //           type: "TIME_CHANGE",
  //           user: "SUPER",
  //           clientId: superUserConnections[0].connectionId,
  //         });
  //       }
  //     }

  //     // Request the next frame if not paused or finished
  //     if (!isFinished && !paused) {
  //       animationFrameId = requestAnimationFrame(update);
  //     }
  //   };

  //   // Start the animation loop
  //   if (!isFinished && !paused) {
  //     animationFrameId = requestAnimationFrame(update);
  //   }

  //   // Cleanup function to cancel the animation frame
  //   return () => {
  //     cancelAnimationFrame(animationFrameId);
  //   };
  // }, [player, isFinished, paused, refreshRate]);

  useEffect(() => {
    if (workerRef.current && player) {
      updateInterval = setInterval(
        () => {
          workerRef.current?.postMessage({
            type: "updateTime",
            data: { currentTime: player?.currentTime },
          });
          const lastTime = Math.floor(player?.duration ?? 0);
          const countDown = lastTime - Math.floor(player?.currentTime ?? 0);
          if (countDown < 10) {
            setCountDown(countDown);
          }
          if (countDown === 0) {
            setTimeout(() => {
              setCountDown(10);
            }, 1000);
          }
          setIsFinished(player.isFinished);
          setPaused(player.paused);
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
      nextSong();
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
