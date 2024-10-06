import React, { useMemo, useCallback } from "react";
import { useLyrics } from "@/hooks/lyrics-hook";
import CharLyrics from "./char-lyrics";

interface LyricsUpdateProps {
  display: string[][];
  charIndex: number;
  fontSize?: string;
}

const LyricsUpdate: React.FC<LyricsUpdateProps> = ({
  display,
  charIndex,
  fontSize = "text-2xl md:text-3xl lg:text-6xl",
}) => {
  const { Color, ColorBorder, ActiveColor, ActiveBorderColor, Font } =
    useLyrics();

  // Precompute the character indices only when display changes
  const charIndices = useMemo(() => {
    const indices: number[] = [];
    let cumulativeIndex = 0;

    display.forEach((group) => {
      cumulativeIndex += group.length;
      indices.push(cumulativeIndex);
    });

    return indices;
  }, [display]);

  return (
    <div style={{ ...Font?.style }} className={`flex ${fontSize}`}>
      {display.map((data, index) => {
        const lyrInx = charIndices[index] || 0; // Use the precomputed index
        const isActive = charIndex >= lyrInx;

        return (
          <div className="relative" key={`char-${index}`}>
            <div
              className="absolute top-0 left-0 font-outline-2 sm:font-outline-4 transition-all"
              style={{
                color: isActive ? ActiveBorderColor : ActiveColor,
              }}
            >
              <CharLyrics str={data} />
            </div>
            <div
              className="relative flex flex-col text-center transition-all"
              style={{
                color: isActive ? ColorBorder : Color,
              }}
            >
              <CharLyrics str={data} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(LyricsUpdate);
