import { useContext } from "react";
import { WallpaperContext } from "@/context/wallpaper.context";

export const useWallpaper = () => useContext(WallpaperContext);
