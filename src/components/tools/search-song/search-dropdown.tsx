import Tags from "@/components/common/display/tags";
import { ITrackData } from "@/features/songs/types/songs.type";
import React from "react";
import { FaGoogleDrive, FaUser } from "react-icons/fa";

interface SearchDropdownProps {
  value: ITrackData;
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
          <span className="relative">
            <Tags
              color="white"
              className="!border-none w-[25px] h-[25px] flex items-center justify-center relative"
            >
              <span className="absolute -bottom-1 -left-1 p-0.5 bg-white rounded-full flex items-center justify-center">
                <FaUser className="text-xs text-green-500"></FaUser>
              </span>
              <img src="/icon/gd.ico" alt="" className="w-full h-full" />
            </Tags>
          </span>
        );
      } else if (from === "DRIVE_EXTHEME") {
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
          <span className="">{value.TITLE}</span>
          <span className="flex gap-1 items-center text-sm p-1 px-1.5 bg-white/20 rounded-md w-fit">
            <span>
              <FaUser className="text-xs"></FaUser>
            </span>
            <span>{value.ARTIST}</span>
          </span>
        </span>
        <span className="rounded-md flex items-center gap-2">
          {value.SUB_TYPE === "EMK" && <Tags color="red">EMK</Tags>}
          {value.SUB_TYPE === "NCN" && <Tags color="green">NCN</Tags>}
          {/* <GetFromType from={value.from}></GetFromType> */}
        </span>
      </div>
    </>
  );
};

export default SearchDropdown;
