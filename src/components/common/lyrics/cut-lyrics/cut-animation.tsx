import React, { useEffect, useMemo } from "react";
import CharLyrics from "./char-lyrics";
import useConfigStore from "@/stores/config-store";
import { NextFont } from "next/dist/compiled/@next/font";

interface LyricsAnimationProps {
  display: string[][];
  fixedCharIndex?: number;
  fontSize?: string | number;
  color: LyricsColorConfig;
  activeColor: LyricsColorConfig;
  font?: NextFont;
}

const LyricsAnimation: React.FC<LyricsAnimationProps> = ({
  display,
  fixedCharIndex,
  fontSize = 40,
  color,
  activeColor,
  font,
}) => {
  const refreshRate = useConfigStore((state) => state.config.refreshRate);
  const performance = refreshRate?.type ?? "MIDDLE";

  const charIndices = useMemo(() => {
    const indices: number[] = [];
    let cumulativeIndex = 0;

    display.forEach((group) => {
      cumulativeIndex += group.length;
      indices.push(cumulativeIndex);
    });

    return indices;
  }, [display]);

  useEffect(() => {}, [fontSize]);

  const groupText = (str: string[]) =>
    str.map((char) => (char === " " ? "\u00A0" : char)).join("");

  return (
    <div
      style={{
        ...font?.style,
        fontSize: typeof fontSize === "number" ? fontSize : "",
      }}
      className={`flex ${typeof fontSize === "string" ? fontSize : ""}`}
    >
      {display.map((data, index) => {
        const lyrInx = charIndices[index] || 0;
        const text = groupText(data);

        return (
          <div className="relative" key={`char-${index}`}>
            {performance !== "LOW" && (
              <CharLyrics
                textColor={activeColor}
                lyrInx={lyrInx}
                fixedCharIndex={fixedCharIndex}
                className="absolute top-0 left-0 font-outline-2 sm:font-outline-4 transition-all"
                text={text}
              />
            )}

            <CharLyrics
              textColor={color}
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
