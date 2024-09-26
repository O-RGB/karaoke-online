import React, { useEffect } from "react";
import CutLyrics from "./cut-lyrics";
import RandomLyrics from "./random-lyrics";

interface SelectLyricsProps {
  options?: LyricsOptions;
  position: boolean;
  charIndex: number;
  display: string[][];
  displayBottom: string[][];
}

const SelectLyrics: React.FC<SelectLyricsProps> = ({
  options = "default",
  position,
  charIndex,
  display,
  displayBottom,
}) => {
  useEffect(() => {}, [options]);

  if (options === "default") {
    return (
      <CutLyrics
        charIndex={charIndex}
        display={display}
        displayBottom={displayBottom}
        position={position}
      ></CutLyrics>
    );
  } else {
    return (
      <RandomLyrics
        display={display}
        displayBottom={displayBottom}
        position={position}
      ></RandomLyrics>
    );
  }
};

export default SelectLyrics;
