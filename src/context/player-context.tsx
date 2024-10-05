"use client";
import { useAppControl } from "@/hooks/app-control-hook";
import { useSynth } from "@/hooks/spessasynth-hook";
import { convertTicksToTime, sortTempoChanges } from "@/lib/app-control";
import React, {
  createContext,
  FC,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { Sequencer } from "spessasynth_lib";

type PlayerContextType = {
  tick: number;
  tempo: number;
  displayLyrics?: DisplayLyrics;
};

type PlayerProviderProps = {
  children: React.ReactNode;
};

function getTicks(
  timeDivision: number,
  currentTime: number,
  tempo: number
): number {
  const secondsPerBeat = 60.0 / tempo;
  const ticksPerSecond = timeDivision / secondsPerBeat;
  return currentTime * ticksPerSecond;
}

function calculateTicks(
  timeDivision: number,
  currentTime: number,
  tempoChanges: ITempoTimeChange[]
) {
  let ticks = 0;
  let lastTime = 0;
  let lastTempo = tempoChanges[0].tempo;

  for (const change of tempoChanges) {
    if (currentTime > change.time) {
      ticks += getTicks(timeDivision, change.time - lastTime, lastTempo);
      lastTime = change.time;
      lastTempo = change.tempo;
    } else {
      break;
    }
  }

  ticks += getTicks(timeDivision, currentTime - lastTime, lastTempo);
  return { tick: Math.round(ticks), tempo: lastTempo };
}

export const PlayerContext = createContext<PlayerContextType>({
  displayLyrics: undefined,
  tick: 0,
  tempo: 0,
});

export const PlayerProvider: FC<PlayerProviderProps> = ({ children }) => {
  const { lyrics, midiPlaying } = useAppControl();
  const { player } = useSynth();

  const [tick, setTick] = useState<number>(0);
  const [tempo, setTempo] = useState<number>(0);

  const tempoChanges = useRef<ITempoChange[]>([]);
  const timeList = useRef<ITempoTimeChange[]>([]);
  const timeDivision = useRef<number>(0);
  const animationFrameRef = useRef<number>();

  const updateTick = useCallback(
    (player: Sequencer) => {
      if (tempoChanges.current.length > 0) {
        const currentTime = player.currentTime;
        const { tick, tempo } = calculateTicks(
          timeDivision.current,
          currentTime,
          timeList.current
        );
        setTick(tick);
        setTempo(tempo);
      }
    },
    [player?.currentTime]
  );

  const animationLoop = useCallback(() => {
    if (player) {
      updateTick(player);
    }
    animationFrameRef.current = requestAnimationFrame(animationLoop);
  }, [player, updateTick]);

  useMemo(() => {
    timeDivision.current = midiPlaying?.timeDivision ?? 0;
    let tempos = midiPlaying?.tempoChanges ?? [];
    tempos = tempos.slice(0, -1).reverse();
    tempos = sortTempoChanges(tempos);
    tempoChanges.current = tempos;
    timeList.current = convertTicksToTime(timeDivision.current, tempos);

    // Start the animation loop
    animationFrameRef.current = requestAnimationFrame(animationLoop);

    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [lyrics, midiPlaying, animationLoop]);

  return (
    <PlayerContext.Provider
      value={{
        tempo,
        tick,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
