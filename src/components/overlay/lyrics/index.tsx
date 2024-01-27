import React from "react";
import useSongPlaying from "../../../hooks/useSong";
import usePlayer from "../../../hooks/usePlayer";

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
  const player = usePlayer();

  if (!player.lyrics) {
    return <></>;
  }

  return (
    <>
      <div
        className={`${rounded} ${bgOverLay} ${blur} ${textColor} ${borderColor} w-full p-2 h-[200px] md:h-[300px] border duration-300`}
      >
        <div className="flex flex-col gap-10 md:gap-20 text-3xl sm:text-5xl lg:text-7xl font-bold items-center h-full overflow-auto">
          {player.lyrics?.map((data, index) => {
            return <div key={`lyrics-key-${index}`}>{data}</div>;
          })}
        </div>
      </div>
    </>
  );
};

export default LyricsBox;
