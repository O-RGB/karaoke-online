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

  function LyrTextRender({
    lyrList,
    keyValue,
  }: {
    lyrList: string[];
    keyValue: string;
  }) {
    return lyrList.map((x, i) => (
      <React.Fragment key={`${keyValue}-${i}`}>
        {x === " " ? <span className="px-0.5 lg:px-1.5"></span> : x}
      </React.Fragment>
    ));
  }
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
              <LyrTextRender keyValue="top-lyr" lyrList={data}></LyrTextRender>
            </div>
            <div
              className={`relative flex flex-col text-center transition-all`}
              style={{
                color: lyrInx <= charIndex ? "blue" : "yellow",
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
