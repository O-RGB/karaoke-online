"use client";
import { useAppControl } from "@/hooks/app-control-hook";
import { useSynth } from "@/hooks/spessasynth-hook";
import {
  calculateTickAtTime,
  groupThaiCharacters,
  sortTempoChanges,
} from "@/lib/app-control";
import { createContext, FC, useEffect, useRef, useState } from "react";
import { MIDI, Sequencer } from "spessasynth_lib";

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
  const { cursorTicks, lyrics, cursorIndices, midiPlaying } = useAppControl();
  const { player } = useSynth();

  const [tick, setTick] = useState<number>(0);
  const [tempo, setTempo] = useState<number>(0);

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const curIdIndex = useRef<number>(0);
  const charIndex = useRef<number>(0);
  const lyricsIndex = useRef<number>(0);
  const position = useRef<boolean>(true);
  const display = useRef<string[][]>([]);
  const displayBottom = useRef<string[][]>([]);
  const interval = 80;

  const updateTick = (player: Sequencer, midi: MIDI) => {
    const tempoList = midi.tempoChanges.slice(0, -1).reverse();
    if (tempoList.length > 0) {
      const timeDivision = midi.timeDivision;
      const currentTime = player.currentTime;
      const tempoChanges = sortTempoChanges(tempoList);
      const { tick, tempo } = calculateTickAtTime(
        currentTime,
        tempoChanges,
        timeDivision
      );
      setTick(tick);
      setTempo(tempo);
      const targetTick = cursorTicks[curIdIndex.current];
      if (targetTick <= tick) {
        curIdIndex.current = curIdIndex.current + 1;

        const charIndices = cursorIndices?.get(targetTick);

        if (charIndices) {
          charIndices.forEach((__charIndex) => {
            let lineIndex = 0;
            let adjustedCharIndex = __charIndex;
            const lyricLines = lyrics.slice(3);

            while (adjustedCharIndex >= lyricLines[lineIndex].length) {
              adjustedCharIndex -= lyricLines[lineIndex].length + 1;
              lineIndex++;
            }
            if (lineIndex > lyricsIndex.current) {
              if (position.current === true) {
                display.current = groupThaiCharacters(
                  lyricLines[lineIndex + 1]
                );
                displayBottom.current = groupThaiCharacters(
                  lyricLines[lineIndex]
                );
              } else {
                display.current = groupThaiCharacters(lyricLines[lineIndex]);
                displayBottom.current = groupThaiCharacters(
                  lyricLines[lineIndex + 1]
                );
              }
              lyricsIndex.current = lineIndex;
              position.current = !position.current;
            }
            charIndex.current = adjustedCharIndex + 1;
          });
        }
      }
    }
  };

  const loop = (currentTime: number) => {
    if (currentTime - lastTimeRef.current > interval) {
      if (player && midiPlaying) {
        updateTick(player, midiPlaying);
      }
      lastTimeRef.current = currentTime;
    }
    rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    loop(0);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [player?.paused === false]);

  useEffect(() => {
    if (lyrics.length > 0) {
      // setLyrDisplay([[lyrics[0]]]);
      display.current = [[lyrics[0]]];
    }
    // setCurIdIndex(0);
    curIdIndex.current = 0;
    position.current = false;
    lyricsIndex.current = 0;
    charIndex.current = 0;
    // setCharIndex(0);
    // setPosition(false);
    // setLyricsIndex(0);
  }, [lyrics]);

  return (
    <PlayerContext.Provider
      value={{
        tempo,
        tick,
        displayLyrics: {
          charIndex: charIndex.current,
          display: display.current,
          displayBottom: displayBottom.current,
          position: position.current,
        },
      }}
    >
      <>{children}</>
    </PlayerContext.Provider>
  );
};
