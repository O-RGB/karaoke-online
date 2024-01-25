import React, { useEffect, useState } from "react";

interface SearchSongProps {
  open?: boolean;
  input?: string;
}

const SearchSong: React.FC<SearchSongProps> = ({ open, input }) => {
  if (open == false) {
    return <></>;
  }

  return (
    <>
      <div className="w-full backdrop-blur-sm bg-white/25 ">
        <div className="flex h-24">
          <div className="w-[300px] border p-2 overflow-hidden text-5xl flex items-center">
            {input}
          </div>
          <div className="w-full  p-2"></div>
        </div>
        <div className="w-full  h-28 p-2">tet</div>
      </div>
    </>
  );
};

export default SearchSong;
