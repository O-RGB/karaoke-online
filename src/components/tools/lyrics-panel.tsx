"use client";
import { convertCursorToTicks, mapCursorToIndices } from "@/lib/karaoke/cur";
import { getTicks } from "@/lib/mixer";
import React, { useEffect, useState } from "react";
import { Sequencer } from "spessasynth_lib";

interface LyricsPanelProps {
  lyrics?: string[];
  player: Sequencer;
  cursorIndices?: Map<number, number[]>;
  cursorTicks?: number[];
}

const LyricsPanel: React.FC<LyricsPanelProps> = ({
  lyrics,
  player,
  cursorIndices,
  cursorTicks = [],
}) => {
  const [lyricsDisplay, setLyricsDisplay] = useState<string>("");
  const [currentLyricIndex, setCurrentLyricIndex] = useState<number>(0);

  const updateTick = () => {
    const tick = getTicks(player) ?? 0;

    const targetTick = cursorTicks[currentLyricIndex];
    if (targetTick <= tick) {
      setCurrentLyricIndex((prevIndex) => prevIndex + 1);

      const charIndices = cursorIndices?.get(targetTick);
      if (lyrics) {
        charIndices?.forEach((charIndex) => {
          let lineIndex = 0;
          let adjustedCharIndex = charIndex;
          const lyricLines = lyrics.slice(4);

          while (adjustedCharIndex >= lyricLines[lineIndex].length) {
            adjustedCharIndex -= lyricLines[lineIndex].length + 1;
            lineIndex++;
          }

          setLyricsDisplay(lyricLines[lineIndex]);
        });
      }
    }
  };
  useEffect(() => {
    if (cursorTicks && cursorIndices) {
      const intervalId = setInterval(updateTick, 100);

      if (player.paused) {
        clearInterval(intervalId);
        return;
      }
      return () => clearInterval(intervalId);
    }
  }, [player.paused, currentLyricIndex, cursorTicks, cursorIndices]);

  useEffect(() => {
    if (lyrics) {
      if (lyrics.length > 0) {
        setLyricsDisplay(lyrics[0]);
      }
    }
  }, [lyrics]);

  return (
    <div className="fixed  bottom-20 lg:bottom-16 left-0 w-full px-5 ">
      <div className="text-[8px] w-64"></div>
      <div className="relative w-full h-56 lg:h-72 blur-overlay border blur-border rounded-lg p-2  text-xl md:text-3xl lg:text-6xl text-center overflow-auto [&::-webkit-scrollbar]:hidden">
        <div className="flex flex-col py-7 items-center justify-center text-white drop-shadow-lg">
          <span className="min-h-10 md:min-h-16 lg:min-h-20 flex items-center">
            {lyricsDisplay}
          </span>{" "}
        </div>
      </div>
    </div>
  );
};

export default LyricsPanel;
