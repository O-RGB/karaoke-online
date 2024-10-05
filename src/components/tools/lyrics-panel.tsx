import React, { useEffect, useMemo, useCallback } from "react";
import { groupThaiCharacters } from "@/lib/app-control";
import { useLyrics } from "@/hooks/lyrics-hook";
import { useAppControl } from "@/hooks/app-control-hook";
import { useOrientation } from "@/hooks/orientation-hook";
import LyricsAnimation from "../common/lyrics/cut-lyrics/cut-animation";
import RandomLyrics from "../lyrics/random-lyrics";

interface LyricsPanelProps {
  lyrics: string[];
  tick: number;
  cursorTicks: number[];
  cursorIndices?: Map<number, number[]>;
}

const LyricsPanel: React.FC<LyricsPanelProps> = React.memo(({
  lyrics,
  tick,
  cursorTicks,
  cursorIndices,
}) => {
  const { orientation } = useOrientation();
  const { lyricsDisplay } = useLyrics();
  const { hideVolume } = useAppControl();

  const lyricLines = useMemo(() => lyrics.slice(3), [lyrics]);

  const findCurrentIndex = useCallback((currentTick: number) => {
    return cursorTicks.findIndex(t => t > currentTick) - 1;
  }, [cursorTicks]);

  const getLyricsState = useCallback((index: number) => {
    const targetTick = cursorTicks[index];
    const charIndices = cursorIndices?.get(targetTick);

    if (!charIndices) return null;

    let newLyricsIndex = 0;
    let newCharIndex = 0;

    for (const charIndex of charIndices) {
      let lineIndex = 0;
      let adjustedCharIndex = charIndex;

      while (adjustedCharIndex >= lyricLines[lineIndex].length) {
        adjustedCharIndex -= lyricLines[lineIndex].length + 1;
        lineIndex++;
      }

      newLyricsIndex = Math.max(newLyricsIndex, lineIndex);
      newCharIndex = Math.max(newCharIndex, adjustedCharIndex + 1);
    }

    const newPosition = newLyricsIndex % 2 === 0;

    return {
      lyricsIndex: newLyricsIndex,
      charIndex: newCharIndex,
      position: newPosition,
      display: groupThaiCharacters(lyricLines[newLyricsIndex]),
      displayBottom: groupThaiCharacters(lyricLines[newLyricsIndex + 1] || ""),
    };
  }, [lyricLines, cursorIndices, cursorTicks]);

  const currentState = useMemo(() => {
    const index = findCurrentIndex(tick);
    return getLyricsState(Math.max(0, index));
  }, [tick, findCurrentIndex, getLyricsState]);

  const height = useMemo(() => {
    if (hideVolume) {
      return orientation === "landscape" ? "h-[55dvh]" : "h-[75dvh]";
    }
    return orientation === "landscape" ? "h-[55dvh]" : "h-[30dvh]";
  }, [hideVolume, orientation]);

  const className = `${height} lg:h-[400px] flex items-center justify-center relative w-full rounded-lg text-center overflow-auto [&::-webkit-scrollbar]:hidden duration-300`;

  if (!currentState) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-16 left-0 w-full px-5 -z-40">
      <div className={className}>
        <div className="flex flex-col py-7 lg:gap-3 items-center justify-center text-white drop-shadow-lg">
          {lyricsDisplay === "default" ? (
            <>
              <span className="min-h-10 md:min-h-16 lg:min-h-20 flex items-center">
                <LyricsAnimation
                  charIndex={currentState.position ? currentState.charIndex : -1}
                  display={currentState.display}
                />
              </span>
              <br />
              <LyricsAnimation
                charIndex={!currentState.position ? currentState.charIndex : -1}
                display={currentState.displayBottom}
              />
            </>
          ) : (
            <RandomLyrics
              display={currentState.display}
              displayBottom={currentState.displayBottom}
              position={currentState.position}
            />
          )}
        </div>
      </div>
    </div>
  );
});

export default LyricsPanel;