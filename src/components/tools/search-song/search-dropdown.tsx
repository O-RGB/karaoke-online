import Tags from "@/components/common/tags";
import React from "react";
import { FaGoogleDrive, FaUser } from "react-icons/fa";

interface SearchDropdownProps {
  value: SearchResult;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({ value }) => {
  function GetFromType({ from }: { from?: TracklistFrom }) {
    if (from) {
      if (from === "EXTHEME")
        return (
          <Tags color="white" className="!border-none w-[25px] h-[25px]">
            <img src="/icon/ke.ico" alt="" className="w-full h-full" />
          </Tags>
        );
      else if (from === "DRIVE") {
        return (
          <Tags
            color="white"
            className="!border-none w-[25px] h-[25px] flex items-center justify-center"
          >
            <img src="/icon/gd.ico" alt="" className="w-full h-full" />
          </Tags>
        );
      } else if (from === "CUSTOM") {
        return (
          <Tags
            color="white"
            className="!border-none w-[25px] h-[25px] flex items-center justify-center"
          >
            <FaUser className="text-green-500 "></FaUser>
          </Tags>
        );
      }
    }
    return <></>;
  }
  return (
    <>
      <div className="flex justify-between w-full gap-4">
        <span className="flex flex-col md:flex-row gap-2 md:items-center justify-between ">
          <span className="">{value.name}</span>
          <span className="flex gap-1 items-center text-sm p-1 px-1.5 bg-white/20 rounded-md w-fit">
            <span>
              <FaUser className="text-xs"></FaUser>
            </span>
            <span>{value.artist}</span>
          </span>
        </span>
        <span className="rounded-md flex items-center gap-2">
          {value.type === 0 && <Tags color="red">EMK</Tags>}
          {value.type === 1 && <Tags color="green">NCN</Tags>}
          <GetFromType from={value.from}></GetFromType>
        </span>
      </div>
    </>
  );
};

export default SearchDropdown;
