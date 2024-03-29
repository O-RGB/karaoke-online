import { Dropdown, MenuProps } from "antd";
import React, { useEffect } from "react";

interface WallpaperProps {
  children?: React.ReactNode;
  blur?: boolean;
}

const Wallpaper: React.FC<WallpaperProps> = ({ children, blur }) => {
  return (
    <>
      <div
        className={`fixed h-screen w-screen overflow-hidden flex justify-center items-center `}
      >
        <div className="absolute z-50 ">{children}</div>
        <div
          className={`absolute h-full w-full ${
            blur ? "blur-lg scale-110 opacity-80" : ""
          }`}
        >
          <div className="bg-black absolute opacity-10 h-full w-full"></div>
          <img
            src="/wallpaper-r.jpeg"
            alt=""
            className="object-cover  h-full w-full "
          />
        </div>
      </div>
    </>
  );
};

export default Wallpaper;
