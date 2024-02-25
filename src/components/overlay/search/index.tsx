import { FuseResult } from "fuse.js";
import React, { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";

interface SearchSongProps {
  open?: boolean;
  input?: string;
  rounded?: string;
  bgOverLay?: string;
  textColor?: string;
  borderColor?: string;
  blur?: string;
  result?: SearchNCN[];
  searchIndex: number;
  loading?: boolean;
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
  searchIndex,
  loading,
}) => {
  useEffect(() => {}, [searchIndex, loading]);

  if (open == false) {
    return <></>;
  }

  return (
    <div
      className={`w-full border ${rounded} ${bgOverLay} ${blur} ${textColor} ${borderColor}`}
    >
      <div className="flex h-16 md:h-24">
        <div className="w-full p-2 overflow-hidden text-2xl md:text-5xl flex items-center ">
          <div className="px-3 h-fit">
            <IoSearch className="text-2xl md:text-5xl"/>
          </div>
          <div>{input}</div>
        </div>
        {loading && <div>Loading...</div>}
        {/* <div className="w-full p-2"></div> */}
      </div>
      <hr className={borderColor} />
      {result && (
        <>
          {result.length > 0 && (
            <div className="w-full flex gap-1 justify-center">
              <div className="w-full p-2 py-4 text-2xl md:text-5xl flex items-center ">
                {result[searchIndex]?.name} - {result[searchIndex]?.artist}
              </div>
              <div className="flex justify-center items-center pr-2">
                <div
                  className={`p-1.5 w-fit rounded-md  ${
                    result[searchIndex]?.type == "EMK"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                >
                  {result[searchIndex]?.type}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchSong;
