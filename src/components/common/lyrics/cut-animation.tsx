import { useLyrics } from "@/hooks/lyrics-hook";
import React, { useEffect } from "react";

interface LyricsAnimationProps {
  display: string[][];
  charIndex: number;
}

const LyricsAnimation: React.FC<LyricsAnimationProps> = ({
  display,
  charIndex,
}) => {
  const { Color, ColorBorder, ActiveColor, ActiveBorderColor, Font } =
    useLyrics();
  useEffect(() => {}, [display, charIndex]);

  function LyrTextRender({
    lyrList,
    keyValue,
  }: {
    lyrList: string[];
    keyValue: string;
  }) {
    const group = lyrList.map((data) => (data === " " ? "&nbsp;" : data));
    return <div dangerouslySetInnerHTML={{ __html: group.join("") }}></div>;
  }
  return (
    <div
      style={{ ...Font?.style }}
      className={`flex text-2xl md:text-3xl lg:text-6xl`}
    >
      {display.map((data, index) => {
        const lyrInx =
          display.slice(0, index).reduce((a, b) => a + b.length, 0) + 1;
        return (
          <div className="relative" key={`char-${index}`}>
            <div
              className={`absolute top-0 left-0 font-outline-2 sm:font-outline-4 transition-all `}
              style={{
                color: lyrInx <= charIndex ? ActiveBorderColor : ActiveColor,
              }}
            >
              <LyrTextRender keyValue="top-lyr" lyrList={data}></LyrTextRender>
            </div>
            <div
              className={`relative flex flex-col text-center transition-all`}
              style={{
                color: lyrInx <= charIndex ? ColorBorder : Color,
              }}
            >
              <LyrTextRender
                keyValue="bottom-lyr"
                lyrList={data}
              ></LyrTextRender>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LyricsAnimation;
