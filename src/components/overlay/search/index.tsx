import React, { useEffect, useState } from "react";

interface SearchSongProps {
  open?: boolean;
  input?: string;
  rounded?: string;
  bgOverLay?: string;
  textColor?: string;
  borderColor?: string;
  blur?: string;
  result?: SearchNCN;
}

const SearchSong: React.FC<SearchSongProps> = ({
  open,
  input,
  rounded,
  bgOverLay,
  textColor,
  borderColor,
  blur,
  result,
}) => {
  if (open == false) {
    return <></>;
  }

  return (
    <>
      <div
        className={`w-full border ${rounded} ${bgOverLay} ${blur} ${textColor} ${borderColor}`}
      >
        <div className="flex h-24">
          <div className="w-[300px] p-2 overflow-hidden text-5xl flex items-center ">
            {input}
          </div>
          <div className="w-full p-2"></div>
        </div>
        <div className="w-full h-32 p-2 text-5xl flex items-center">
          {result?.name} - {result?.artist}
        </div>
      </div>
    </>
  );
};

export default SearchSong;
