"use client";

import React, { useEffect, useRef, useState } from "react";
import { groupThaiCharacters } from "@/lib/app-control";
import SelectLyrics from "../lyrics";
import { useLyrics } from "@/hooks/lyrics-hook";
import { useAppControl } from "@/hooks/app-control-hook";
import { useOrientation } from "@/hooks/orientation-hook";
import LyricsAnimation from "../common/lyrics/cut-animation";
import RandomLyrics from "../lyrics/random-lyrics";

interface LyricsPanelProps {
  lyrics: string[];
  tick: number;
  cursorTicks: number[];
  cursorIndices?: Map<number, number[]>;
}

const LyricsPanel: React.FC<LyricsPanelProps> = ({
  lyrics,
  tick,
  cursorTicks,
  cursorIndices,
}) => {
  const { orientation } = useOrientation();
  const { lyricsDisplay } = useLyrics();
  const { hideVolume } = useAppControl();

  const charIndex = useRef<number>(0);
  const display = useRef<string[][]>([]);
  const displayBottom = useRef<string[][]>([]);
  const position = useRef<boolean>(true);

  const curIdIndex = useRef<number>(0);
  const lyricsIndex = useRef<number>(0);

  const reset = () => {
    if (lyrics.length > 0) {
      display.current = [[lyrics[0]]];
    }
    curIdIndex.current = 0;
    position.current = false;
    lyricsIndex.current = 0;
    charIndex.current = 0;
  };

  const renderLyricsDisplay = () => {
    const targetTick = cursorTicks[curIdIndex.current];
    let tickUpdated = lyricsDisplay === "random" ? tick + 200 : tick;
    if (targetTick <= tickUpdated) {
      curIdIndex.current = curIdIndex.current + 1;

      const charIndices = cursorIndices?.get(targetTick);

      try {
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
      } catch (error) {}
    }
  };

  useEffect(() => {
    renderLyricsDisplay();
  }, [tick, cursorTicks, cursorIndices, lyrics]);

  useEffect(() => {
    if (lyrics) {
      reset();
    }
  }, [lyrics]);

  useEffect(() => {}, [lyricsDisplay]);

  const height = hideVolume
    ? orientation === "landscape"
      ? "h-[55dvh]"
      : "h-[75dvh]"
    : orientation === "landscape"
    ? "h-[55dvh]"
    : "h-[30dvh]";

  const className = `${height} lg:h-[400px] flex items-center justify-center relative w-full rounded-lg text-center overflow-auto [&::-webkit-scrollbar]:hidden duration-300`;

  return (
    <div className="fixed bottom-20 lg:bottom-16 left-0 w-full px-5 -z-40">
      <div className={className}>
        <div className="text-sm gap-2 absolute text-white text-start top-2 left-2"></div>

        {/* <SelectLyrics
          display={display.current}
          displayBottom={displayBottom.current}
          options={lyricsDisplay}
          position={position.current}
          charIndex={charIndex.current}
        ></SelectLyrics> */}

        <div className="flex flex-col py-7 lg:gap-3 items-center justify-center text-white drop-shadow-lg">
          {lyricsDisplay === "default" ? (
            <>
              <span className="min-h-10 md:min-h-16 lg:min-h-20 flex items-center">
                <LyricsAnimation
                  charIndex={position.current === true ? charIndex.current : -1}
                  display={display.current}
                ></LyricsAnimation>
              </span>
              <br />
              <LyricsAnimation
                charIndex={position.current === false ? charIndex.current : -1}
                display={displayBottom.current}
              ></LyricsAnimation>
            </>
          ) : (
            <>
              <RandomLyrics
                display={display.current}
                displayBottom={displayBottom.current}
                position={position.current}
              ></RandomLyrics>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LyricsPanel;
