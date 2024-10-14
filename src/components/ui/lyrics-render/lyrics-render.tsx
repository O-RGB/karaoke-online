import useLyricsStore from "@/stores/lyrics-store";
import useTickStore from "@/stores/tick-store";
import { groupThaiCharacters } from "@/lib/app-control";
import React, { useEffect, useMemo, useRef } from "react";

interface LyricsRenderProps {
  lyrics: string[];
  cursorTicks: number[];
  cursorIndices?: Map<number, number[]>;
}

const LyricsRender: React.FC<LyricsRenderProps> = ({
  cursorTicks,
  lyrics,
  cursorIndices,
}) => {
  const tick = useTickStore((state) => state.tick);
  const setCharIndex = useLyricsStore((state) => state.setCharIndex);
  const setDisplay = useLyricsStore((state) => state.setDisplay);
  const setDisplayBottom = useLyricsStore((state) => state.setDisplayBottom);
  const setPosition = useLyricsStore((state) => state.setPosition);

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
  const lyricLines = useMemo(() => lyrics.slice(3), [lyrics]);

  const renderLyricsDisplay = () => {
    try {
      const targetTick = cursorTicks[curIdIndex.current];
      if (targetTick <= tick) {
        curIdIndex.current++;

        const charIndices = cursorIndices?.get(targetTick);

        if (charIndices) {
          charIndices.forEach((index) => {
            let lineIndex = 0;
            let adjustedCharIndex = index;

            while (adjustedCharIndex >= lyricLines[lineIndex].length) {
              adjustedCharIndex -= lyricLines[lineIndex].length + 1;
              lineIndex++;
            }

            if (lineIndex > lyricsIndex.current) {
              if (position.current) {
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

              setDisplay(display.current);
              setDisplayBottom(displayBottom.current);
              setPosition(position.current);
            }
            charIndex.current = adjustedCharIndex + 1;
            setCharIndex(charIndex.current);
          });
        }
      }
    } catch (error) {}
  };

  useEffect(() => {
    renderLyricsDisplay();
  }, [tick, cursorTicks, cursorIndices]);

  useEffect(() => {
    if (lyrics) {
      reset();
    }
  }, [lyrics]);
  return null;
};

export default LyricsRender;
