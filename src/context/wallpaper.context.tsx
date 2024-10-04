"use client";
import { WALLPAPER } from "@/config/value";
import { getLocalWallpaper, setLocalWallpaper } from "@/lib/local-storage";
import { saveWallpaperStorage, getWallpaperStorage, deleteWallpaperStorage, getAllWallpaperStorage } from "@/lib/storage/wallpaper";
 
import React from "react";
import {
  createContext,
  FC,
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
} from "react";

type WallpaperContextType = {
  wallpaper: string | undefined;
  wallpaperName: string | undefined;
  isVideo: boolean;
  addWallpaper: (file: File) => Promise<void>;
  loadWallpaper: () => Promise<void>;
  getAllWallpaper: () => Promise<File[] | undefined>;
  changeWallpaper: (filename: string) => Promise<void>;
  deleteWallaper: (filename: string) => Promise<void>;
};

type WallpaperProviderProps = {
  children: React.ReactNode;
};

export const WallpaperContext = createContext<WallpaperContextType>({
  wallpaper: undefined,
  wallpaperName: undefined,
  isVideo: false,
  addWallpaper: async () => undefined,
  loadWallpaper: async () => undefined,
  getAllWallpaper: async () => undefined,
  changeWallpaper: async () => undefined,
  deleteWallaper: async () => undefined,
});

export const WallpaperProvider: FC<WallpaperProviderProps> = ({ children }) => {
  const [wallpaper, setWallpaper] = useState<string>(WALLPAPER);
  const [wallpaperName, setWallpaperName] = useState<string>("");
  const [isVideo, setIsVideo] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const renderLogo = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // ตั้งค่าสีฟอนต์
        ctx.fillStyle = "blue";
        // ตั้งค่าฟอนต์และขนาด
        ctx.font = "30px Arial";
        // วาดตัวอักษรลงบน Canvas
        ctx.fillText("Hello Canvas in Next.js!", 50, 100);
      }
    }
  };

  const addWallpaper = async (file: File) => {
    const res = await saveWallpaperStorage(file);
    const mediaUrl = URL.createObjectURL(file);
    if (res) {
      setLocalWallpaper(file.name);
      setWallpaper(mediaUrl);
      setIsVideo(file.type.startsWith("video/"));
      setWallpaperName(file.name);
    }
  };

  const changeWallpaper = async (filename: string) => {
    setLocalWallpaper(filename);
    const localfile = await getWallpaperStorage(filename);
    if (localfile) {
      setIsVideo(localfile.type.startsWith("video/"));
      const mediaUrl = URL.createObjectURL(localfile);
      setWallpaper(mediaUrl);
      setWallpaperName(localfile.name);
    }
  };

  const deleteWallaper = async (filename: string) => {
    const res = await deleteWallpaperStorage(filename);
    if (res) {
      setWallpaper(WALLPAPER);
      setWallpaperName("");
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
        setWallpaperName(wallpaper.name);
      }
    }
  };

  const getAllWallpaper = async () => {
    return await getAllWallpaperStorage();
  };

  useEffect(() => {
    renderLogo();
    loadWallpaper();
  }, []);

  useLayoutEffect(() => {
    if (videoRef.current && isVideo) {
      videoRef.current
        .play()
        .catch((error) => console.error("Video autoplay failed:", error));
    }
  }, [wallpaper, isVideo]);

  return (
    <WallpaperContext.Provider
      value={{
        wallpaperName,
        wallpaper,
        isVideo,
        addWallpaper,
        loadWallpaper,
        changeWallpaper,
        getAllWallpaper,
        deleteWallaper,
      }}
    >
      <div
        style={{
          position: "fixed",
          bottom: 60,
          right: 17,
          zIndex: -10,
          opacity: 0.7,
        }}
        className="hidden lg:block w-fit h-fit text-white font-bold text-2xl drop-shadow-md"
      >
        {/* NEXT KARAOKE */}
      </div>
      <div
        style={{
          position: "fixed",
          bottom: 75,
          right: 17,
          zIndex: -10,
          opacity: 0.7,
        }}
        className="block lg:hidden w-fit h-fit text-white font-bold text-lg drop-shadow-md"
      >
        {/* NEXT KARAOKE */}
      </div>
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
