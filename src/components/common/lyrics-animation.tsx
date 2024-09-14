import React, { useEffect } from "react";

interface LyricsAnimationProps {
  display: string[][];
  charIndex: number;
}

const LyricsAnimation: React.FC<LyricsAnimationProps> = ({
  display,
  charIndex,
}) => {
  useEffect(() => {}, [display, charIndex]);
  return (
    <div className="flex gap-[1px] text-lg md:text-3xl lg:text-6xl">
      {display.map((data, index) => {
        const lyrInx =
          display.slice(0, index).reduce((a, b) => a + b.length, 0) + 1;
        return (
          <div className="relative" key={`char-${index}`}>
            <div
              className={`absolute top-0 left-0 font-outline-2 sm:font-outline-4 transition-all ${
                lyrInx <= charIndex ? "text-white" : "text-black"
              }`}
            >
              {data.join("")}
            </div>
            <div
              className={`relative flex flex-col text-center transition-all`}
              style={{
                color: lyrInx <= charIndex ? "blue" : "yellow",
              }}
            >
              <span>{data.join("")}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LyricsAnimation;
