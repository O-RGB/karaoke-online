"use client";
import { useAppControl } from "@/hooks/app-control-hook";
import { useSynth } from "@/hooks/spessasynth-hook";
import {
  calculateTicks,
  convertTicksToTime,
  sortTempoChanges,
} from "@/lib/app-control";
import React from "react";
import { createContext, FC, useEffect, useRef, useState } from "react";
import { Sequencer } from "spessasynth_lib";

type PlayerContextType = {
  tick: number;
  tempo: number;
  displayLyrics?: DisplayLyrics;
};

type PlayerProviderProps = {
  children: React.ReactNode;
};

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

  const updateTick = (player: Sequencer) => {
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
  };
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (player) {
      const updateTickWithDelay = () => {
        updateTick(player);
        interval = setTimeout(updateTickWithDelay, 50);
      };

      updateTickWithDelay();
    }
  }, [player]);

  useEffect(() => {
    timeDivision.current = midiPlaying?.timeDivision ?? 0;
    let tempos = midiPlaying?.tempoChanges ?? [];
    tempos = tempos.slice(0, -1).reverse();
    tempos = sortTempoChanges(tempos);
    tempoChanges.current = tempos;
    timeList.current = convertTicksToTime(timeDivision.current, tempos);
  }, [lyrics, midiPlaying]);

  return (
    <PlayerContext.Provider
      value={{
        tempo,
        tick,
      }}
    >
      <>{children}</>
    </PlayerContext.Provider>
  );
};
