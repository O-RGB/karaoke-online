import React, { useMemo } from "react";
import { useLyrics } from "@/hooks/lyrics-hook";
import CharLyrics from "./char-lyrics";
import useConfigStore from "@/components/stores/config-store";

interface LyricsAnimationProps {
  display: string[][];
  charIndex: number;
  fontSize?: string;
}

const LyricsAnimation: React.FC<LyricsAnimationProps> = ({
  display,
  charIndex,
  fontSize = "text-2xl md:text-3xl lg:text-6xl",
}) => {
  const config = useConfigStore((state) => state.config);
  const performance = config.refreshRate?.type ?? "MIDDLE";
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
            {performance !== "LOW" && (
              <div
                className="absolute top-0 left-0 font-outline-2 sm:font-outline-4 transition-all"
                style={{
                  color: isActive ? ActiveBorderColor : ActiveColor,
                }}
              >
                <CharLyrics str={data} />
              </div>
            )}
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

export default React.memo(LyricsAnimation);
