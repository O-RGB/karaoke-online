import React from "react";

interface WallpaperProps {
  children?: React.ReactNode;
}

const Wallpaper: React.FC<WallpaperProps> = ({ children }) => {
  return (
    <>
      <div className="relative w-full h-full overflow-hidden flex justify-center items-center">
        <div className="absolute z-50 ">{children}</div>
        <div className="">
          <div className="bg-black h-screen w-screen absolute opacity-30"></div>
          <img
            src="/wallpaper.jpeg"
            alt=""
            className="object-cover h-screen w-screen "
          />
        </div>
      </div>
    </>
  );
};

export default Wallpaper;
