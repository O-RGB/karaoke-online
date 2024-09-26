"use client";
import { WALLPAPER } from "@/config/value";
import { getLocalWallpaper, setLocalWallpaper } from "@/lib/local-storage";
import { getWallpaperStorage, saveWallpaperStorage } from "@/lib/storage";
import { createContext, FC, useEffect, useState, useRef } from "react";

type WallpaperContextType = {
  wallpaper: string | undefined;
  isVideo: boolean;
  changeWallpaper: (file: File) => Promise<void>;
  loadWallpaper: () => Promise<void>;
};

type WallpaperProviderProps = {
  children: React.ReactNode;
};

export const WallpaperContext = createContext<WallpaperContextType>({
  wallpaper: undefined,
  isVideo: false,
  changeWallpaper: async () => undefined,
  loadWallpaper: async () => undefined,
});

export const WallpaperProvider: FC<WallpaperProviderProps> = ({ children }) => {
  const [wallpaper, setWallpaper] = useState<string>(WALLPAPER);
  const [isVideo, setIsVideo] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const changeWallpaper = async (file: File) => {
    const res = await saveWallpaperStorage(file);
    const mediaUrl = URL.createObjectURL(file);
    if (res) {
      setLocalWallpaper(file.name);
      setWallpaper(mediaUrl);
      setIsVideo(file.type.startsWith("video/"));
    }
  };

  const loadWallpaper = async () => {
    const key = getLocalWallpaper();
    if (key) {
      const wallpaper = await getWallpaperStorage(key);
      if (wallpaper) {
        const mediaUrl = URL.createObjectURL(wallpaper);
        setWallpaper(mediaUrl);
        setIsVideo(wallpaper.type.startsWith("video/"));
      }
    }
  };

  useEffect(() => {
    loadWallpaper();
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current
        .play()
        .catch((error) => console.error("Video autoplay failed:", error));
    }
  }, [wallpaper, isVideo]);

  return (
    <WallpaperContext.Provider
      value={{
        wallpaper,
        isVideo,
        changeWallpaper,
        loadWallpaper,
      }}
    >
      {isVideo ? (
        <>
          <video
            ref={videoRef}
            src={wallpaper}
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: "fixed",
              width: "100%",
              height: "100%",
              top: 0,
              left: 0,
              objectFit: "cover",
              zIndex: -20,
              opacity: 0.7,
            }}
          />
          <div
            style={{
              position: "fixed",
              width: "100%",
              height: "100%",
              top: 0,
              left: 0,
              zIndex: -30,
              backgroundColor: "black",
            }}
          ></div>
        </>
      ) : (
        <div
          style={{
            backgroundImage: `url(${wallpaper})`,
            position: "fixed",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            backgroundSize: "cover",
            backgroundPosition: "center",
            zIndex: -20,
          }}
        />
      )}
      {children}
    </WallpaperContext.Provider>
  );
};
