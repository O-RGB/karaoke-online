import Tags from "@/components/common/display/tags";
import { ITrackData } from "@/features/songs/types/songs.type";
import React from "react";
import { FaUser } from "react-icons/fa";
import { SourceTag } from "./source-tag";

// ไม่มีการแก้ไข Type ที่นี่
interface SearchDropdownProps {
  value: ITrackData;
  className?: string;
  size?: "lg" | "sm";
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  value,
  className,
  size, // รับ 'size' prop มา
}) => {
  return (
    <>
      <div className={`${className} flex justify-between w-full gap-4`}>
        <span className="flex flex-col md:flex-row gap-2 md:items-center justify-between ">
          <span className={`${size === "lg" ? "font-bold" : "font-normal"}`}>
            {value.TITLE}
          </span>
          <span className="flex gap-1 items-center text-sm p-1 px-1.5 bg-white/20 rounded-md w-fit">
            <span>
              <FaUser className="text-xs"></FaUser>
            </span>
            <span>{value.ARTIST}</span>
          </span>
        </span>
        <span className="rounded-md flex items-center gap-2">
          {/* {value.SUB_TYPE === "EMK" && <Tags color="red">EMK</Tags>}
          {value.SUB_TYPE === "NCN" && <Tags color="green">NCN</Tags>} */}

          <SourceTag
            from={value._superIndex !== undefined ? "CUSTOM" : "EXTHEME"}
            size={size}
          ></SourceTag>
        </span>
      </div>
    </>
  );
};

export default SearchDropdown;
