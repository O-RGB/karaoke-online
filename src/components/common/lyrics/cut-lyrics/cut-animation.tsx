import React, { useMemo } from "react";
import { useLyrics } from "@/hooks/lyrics-hook";
import CharLyrics from "./char-lyrics";
import useConfigStore from "@/components/stores/config-store";
import useLyricsStore from "@/components/stores/lyrics-store";

interface LyricsAnimationProps {
  display: string[][];
  fixedCharIndex?: number;
  fontSize?: string;
}

const LyricsAnimation: React.FC<LyricsAnimationProps> = ({
  display,
  fixedCharIndex,
  fontSize = "text-2xl md:text-3xl lg:text-6xl",
}) => {
  const { config } = useConfigStore();
  const { Color, ColorBorder, ActiveColor, ActiveBorderColor, Font } =
    useLyrics();

  const performance = config.refreshRate?.type ?? "MIDDLE";

  const charIndices = useMemo(() => {
    const indices: number[] = [];
    let cumulativeIndex = 0;

    display.forEach((group) => {
      cumulativeIndex += group.length;
      indices.push(cumulativeIndex);
    });

    return indices;
  }, [display]);

  const groupText = (str: string[]) =>
    str.map((char) => (char === " " ? "\u00A0" : char)).join("");

  return (
    <div style={{ ...Font?.style }} className={`flex ${fontSize}`}>
      {display.map((data, index) => {
        const lyrInx = charIndices[index] || 0;
        const text = groupText(data);

        return (
          <div className="relative" key={`char-${index}`}>
            {performance !== "LOW" && (
              <CharLyrics
                textColor={{
                  color: ActiveColor,
                  colorBorder: ActiveBorderColor,
                }}
                lyrInx={lyrInx}
                fixedCharIndex={fixedCharIndex}
                className="absolute top-0 left-0 font-outline-2 sm:font-outline-4 transition-all"
                text={text}
              />
            )}

             <CharLyrics
              textColor={{
                color: Color,
                colorBorder: ColorBorder,
              }}
              lyrInx={lyrInx}
              fixedCharIndex={fixedCharIndex}
              className="relative flex flex-col text-center transition-all"
              text={text}
            />  
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(LyricsAnimation);
