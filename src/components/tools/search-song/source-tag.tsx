import Tags from "@/components/common/display/tags";
import { SoundSystemMode } from "@/features/config/types/config.type";
import React from "react";
import { FaFile, FaUser } from "react-icons/fa";
import { RiServerFill, RiUserSettingsFill } from "react-icons/ri";

export interface SourceTagProps {
  from?: SoundSystemMode;
  size?: "lg" | "sm";
}

export function SourceTag({
  from = "DATABASE_FILE_SYSTEM",
  size,
}: SourceTagProps) {
  const sizeStyles = {
    sm: "w-[25px] h-[25px]",
    lg: "w-[35px] h-[35px]",
  };

  const defaultAutoSize = "w-[25px] lg:w-[35px] h-[25px] lg:h-[35px]";

  const containerSizeClass = size ? sizeStyles[size] : defaultAutoSize;

  let tagContent: React.ReactNode = null;

  if (from === "EXTREME_FILE_SYSTEM") {
    tagContent = (
      <img src="/icon/ke.ico" alt="EXTHEME" className="w-full h-full" />
    );
  } else if (from === "PYTHON_FILE_ENCODE") {
    tagContent = <RiUserSettingsFill className="text-sky-500 w-full h-full" />;
  } else if (from === "PYTHON_API_SYSTEM") {
    tagContent = <RiServerFill className="text-yellow-700 w-full h-full" />;
  } else if (from === "DATABASE_FILE_SYSTEM") {
    tagContent = <FaUser className="text-green-500 w-full h-full" />;
  }

  if (!tagContent) {
    return null;
  }

  return (
    <div className={`flex ${containerSizeClass}`}>
      <Tags
        color="white"
        className="!border-none flex items-center justify-center relative"
      >
        {tagContent}
      </Tags>
    </div>
  );
}
