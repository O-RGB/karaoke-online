import { ITrackData } from "@/features/songs/types/songs.type";
import React from "react";
import { FaPlayCircle, FaUser } from "react-icons/fa";
import { SourceTag } from "./source-tag";
import Tags from "@/components/common/display/tags";
import { AiFillLike } from "react-icons/ai";

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
        <div className="flex flex-col md:flex-row gap-2 justify-between w-full">
          <span className={`${size === "lg" ? "font-bold" : "font-normal"}`}>
            {value.TITLE}
          </span>
          <div className="flex gap-1 items-center text-sm p-1 px-1.5 bg-white/20 rounded-md w-fit">
            <span>
              <FaUser className="text-xs"></FaUser>
            </span>
            <span>{value.ARTIST}</span>
          </div>
          {(value._musicPlayCount !== undefined ||
            value._musicLike !== undefined ||
            value._musicUploader !== undefined) && (
            <div className="flex justify-between w-full">
              <div className="flex gap-2 mt-1">
                {value._musicPlayCount !== undefined && (
                  <div className="text-xs flex gap-1 items-center opacity-80">
                    <FaPlayCircle className="text-white text-[9px] mt-0.5"></FaPlayCircle>{" "}
                    <span>{value._musicPlayCount}</span>
                  </div>
                )}
                {value._musicLike !== undefined && (
                  <div className="text-xs flex gap-1 items-center  opacity-80">
                    <AiFillLike className="text-white text-[10px] mt-0.5"></AiFillLike>{" "}
                    <span>{value._musicLike}</span>
                  </div>
                )}
                {value._musicLike !== undefined && (
                  <div className="text-xs flex gap-1 items-center  opacity-80">
                    <FaUser className="text-white text-[10px] mt-0.5"></FaUser>{" "}
                    <span>
                      โดย{" "}
                      {value._musicUploader ? value._musicUploader : "Error"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="rounded-md flex flex-col items-center gap-2 justify-between">
          <SourceTag from={value._system} size={size}></SourceTag>
          {value._system === "PYTHON_API_SYSTEM" && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="hover:underline duration-300 text-xs opacity-80 text-nowrap"
            >
              แจ้งลบ
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchDropdown;
