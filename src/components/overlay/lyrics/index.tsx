import React from "react";
import useSong from "../../../hooks/useSong";

interface LyricsBoxProps {
  rounded?: string;
  bgOverLay?: string;
  blur?: string;
  textColor?: string;
  borderColor?: string;
}

const LyricsBox: React.FC<LyricsBoxProps> = ({
  rounded,
  bgOverLay,
  blur,
  textColor,
  borderColor,
}) => {
  const song = useSong();

  if (song.Lyrics.length == 0) {
    return <></>;
  }

  return (
    <>
      <div
        className={`${rounded} ${bgOverLay} ${blur} ${textColor} ${borderColor} w-full p-2 h-[200px] md:h-[300px] border duration-300`}
      >
        <div className="flex flex-col gap-10 md:gap-20 text-3xl md:text-6xl justify-center items-center h-full overflow-auto">
          {song.Lyrics.map((data, index) => {
            return <div key={`lyrics-key-${index}`}>{data}</div>;
          })}
        </div>
      </div>
    </>
  );
};

export default LyricsBox;
