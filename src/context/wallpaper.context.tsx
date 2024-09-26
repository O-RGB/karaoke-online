"use client";
import { WALLPAPER } from "@/config/value";
import { base64ToImage, imageToBase64 } from "@/lib/image";
import { getLocalWallpaper, setLocalWallpaper } from "@/lib/local-storage";
import { createContext, FC, useEffect, useState } from "react";
type WallpaperContextType = {
  wallpaper: string | undefined;
  changeWallpaper: (file: File) => Promise<void>;
  loadWallpaper: () => Promise<void>;
};

type WallpaperProviderProps = {
  children: React.ReactNode;
};

export const WallpaperContext = createContext<WallpaperContextType>({
  wallpaper: undefined,
  changeWallpaper: async () => undefined,
  loadWallpaper: async () => undefined,
});

export const WallpaperProvider: FC<WallpaperProviderProps> = ({ children }) => {
  const [wallpaper, setWallpaper] = useState<string>(WALLPAPER);

  const changeWallpaper = async (file: File) => {
    const base64 = await imageToBase64(file);
    const imgUrl = URL.createObjectURL(file);
    if (base64.length > 0) {
      setLocalWallpaper(base64);
      setWallpaper(imgUrl);
    }
  };

  const loadWallpaper = async () => {
    const wallpaper = getLocalWallpaper(); // base64
    if (wallpaper) {
      const file = await base64ToImage(wallpaper);
      const imgUrl = URL.createObjectURL(file);
      setWallpaper(imgUrl);
    }
  };

  useEffect(() => {
    loadWallpaper();
  }, []);

  return (
    <WallpaperContext.Provider
      value={{
        wallpaper,
        changeWallpaper,
        loadWallpaper,
      }}
    >
      <div
        style={{ backgroundImage: "url(" + wallpaper + ")" }}
        className="fixed w-screen h-screen top-0 left-0 -z-20 bg-cover bg-center"
      ></div>
      <>{children}</>
    </WallpaperContext.Provider>
  );
};
