import React from "react";
import LyricsAnimation from "../common/lyrics/cut-lyrics/cut-animation";
import LyricsUpdate from "../common/lyrics/cut-lyrics/cut-update";

interface CutLyricsProps {
  position: boolean;
  charIndex: number;
  display: string[][];
  displayBottom: string[][];
}

const CutLyrics: React.FC<CutLyricsProps> = ({
  position,
  charIndex,
  display,
  displayBottom,
}) => {
  return (
    <>
      <div className="flex flex-col py-7 lg:gap-3 items-center justify-center text-white drop-shadow-lg">
        <span className="min-h-10 md:min-h-16 lg:min-h-20 flex items-center">
          <LyricsUpdate
            charIndex={position === true ? charIndex : -1}
            display={display}
          ></LyricsUpdate>
          {/* <LyricsAnimation
            charIndex={position === true ? charIndex : -1}
            display={display}
          ></LyricsAnimation> */}
        </span>
        <br />
        {/* <LyricsAnimation
          charIndex={position === false ? charIndex : -1}
          display={displayBottom}
        ></LyricsAnimation> */}
      </div>
    </>
  );
};

export default CutLyrics;
