import React from "react";
import { FaUser } from "react-icons/fa";

interface SearchDropdownProps {
  value: SearchResult;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({ value }) => {
  return (
    <>
      <div className="flex justify-between w-full gap-4">
        <span className="flex flex-col md:flex-row gap-2 md:items-center justify-between ">
          <span className="text-lg">{value.name}</span>
          <span className="flex gap-1 items-center text-sm p-1 px-1.5 bg-white/20 rounded-md w-fit">
            <span>
              <FaUser className="text-xs"></FaUser>
            </span>
            <span>{value.artist}</span>
          </span>
        </span>
        <span className="rounded-md">
          {value.type === 0 && (
            <span className="text-sm font-bold p-1  rounded-md bg-red-500/80">
              EMK
            </span>
          )}
          {value.type === 1 && (
            <span className="text-sm font-bold p-1  rounded-md bg-green-500/80">
              NCN
            </span>
          )}
        </span>
      </div>
    </>
  );
};

export default SearchDropdown;
