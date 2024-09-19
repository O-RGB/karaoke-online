"use client";
import { useAppControl } from "@/hooks/app-control-hook";
import { useSynth } from "@/hooks/spessasynth-hook";
import {
  calculateTicks,
  convertTicksToTime,
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
  const interval = 50;

  const tempoChanges = useRef<ITempoChange[]>([]);
  const timeList = useRef<ITempoTimeChange[]>([]);
  const timeDivision = useRef<number>(0);

  const updateTick = (player: Sequencer, midi: MIDI) => {
    if (tempoChanges.current.length > 0) {
      const currentTime = player.currentTime;

      const { tick, tempo } = calculateTicks(
        timeDivision.current,
        currentTime,
        timeList.current
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

  // useEffect(() => {
  //   loop(0);
  //   return () => {
  //     if (rafRef.current) {
  //       cancelAnimationFrame(rafRef.current);
  //     }
  //   };
  // }, [player?.paused === false]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (player && midiPlaying && player?.paused === false) {
      const updateTickWithDelay = () => {
        updateTick(player, midiPlaying); // ฟังก์ชันที่คุณต้องการเรียกใช้งาน
        interval = setTimeout(updateTickWithDelay, 50); // รอ 1 วินาทีก่อนอัปเดตครั้งถัดไป
      };

      updateTickWithDelay(); // เริ่มต้นการอัปเดตครั้งแรก
    }

    return () => clearTimeout(interval); // เคลียร์ timeout เมื่อ useEffect ถูกทำลายหรือตัวแปรที่สังเกตการณ์เปลี่ยนแปลง
  }, [player?.paused === false]);

  useEffect(() => {
    if (lyrics.length > 0) {
      display.current = [[lyrics[0]]];
    }
    curIdIndex.current = 0;
    position.current = false;
    lyricsIndex.current = 0;
    charIndex.current = 0;
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
