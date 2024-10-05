import React, { useMemo, useCallback } from "react";
import { useLyrics } from "@/hooks/lyrics-hook";

interface LyricsAnimationProps {
  display: string[][];
  charIndex: number;
  fontSize?: string;
}

const LyrTextRender: React.FC<{ lyrList: string[] }> = React.memo(
  ({ lyrList }) => {
    const text = useMemo(
      () => lyrList.map((char) => (char === " " ? "\u00A0" : char)).join(""),
      [lyrList]
    );
    return <div>{text}</div>;
  }
);

const LyricsAnimation: React.FC<LyricsAnimationProps> = ({
  display,
  charIndex,
  fontSize = "text-2xl md:text-3xl lg:text-6xl",
}) => {
  const { Color, ColorBorder, ActiveColor, ActiveBorderColor, Font } =
    useLyrics();

  const getCharIndexForGroup = useCallback(
    (index: number) => {
      return display.slice(0, index).reduce((a, b) => a + b.length, 0) + 1;
    },
    [display]
  );

  return (
    <div style={{ ...Font?.style }} className={`flex ${fontSize}`}>
      {display.map((data, index) => {
        const lyrInx = getCharIndexForGroup(index);
        const isActive = lyrInx <= charIndex;

        return (
          <div className="relative" key={`char-${index}`}>
            <div
              className="absolute top-0 left-0 font-outline-2 sm:font-outline-4 transition-all"
              style={{
                color: isActive ? ActiveBorderColor : ActiveColor,
              }}
            >
              <LyrTextRender lyrList={data} />
            </div>
            <div
              className="relative flex flex-col text-center transition-all"
              style={{
                color: isActive ? ColorBorder : Color,
              }}
            >
              <LyrTextRender lyrList={data} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(LyricsAnimation);
