import { Dropdown, MenuProps } from "antd";
import React, { useEffect } from "react";

interface WallpaperProps {
  children?: React.ReactNode;
}

const Wallpaper: React.FC<WallpaperProps> = ({ children }) => {
  return (
    <>
      <div className="relative h-screen w-screen overflow-hidden flex justify-center items-center">
        <div className="absolute z-50 ">{children}</div>
        <div className="absolute h-full w-full">
          <div className="bg-black absolute opacity-10 h-full w-full"></div>
          <img
            src="/wallpaper.jpeg"
            alt=""
            className="object-cover  h-full w-full "
          />
        </div>
      </div>
    </>
  );
};

export default Wallpaper;
