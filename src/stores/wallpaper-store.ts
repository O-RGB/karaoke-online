import { create } from "zustand";
import { WALLPAPER } from "@/config/value";
import {
  getLocalWallpaper,
  setLocalWallpaper,
} from "@/lib/local-storege/local-storage";
import {
  saveWallpaperStorage,
  getWallpaperStorage,
  deleteWallpaperStorage,
  getAllWallpaperStorage,
} from "@/lib/storage/wallpaper";

interface WallpaperState {
  wallpaper: string;
  wallpaperName: string;
  isVideo: boolean;
  addWallpaper: (file: File) => Promise<void>;
  loadWallpaper: () => Promise<void>;
  getAllWallpaper: () => Promise<File[] | undefined>;
  changeWallpaper: (filename: string) => Promise<void>;
  deleteWallpaper: (filename: string) => Promise<void>;
}

export const useWallpaperStore = create<WallpaperState>((set, get) => ({
  wallpaper: WALLPAPER,
  wallpaperName: "",
  isVideo: false,

  addWallpaper: async (file: File) => {
    const res = await saveWallpaperStorage(file);
    const mediaUrl = URL.createObjectURL(file);
    if (res) {
      setLocalWallpaper(file.name);
      set({
        wallpaper: mediaUrl,
        isVideo: file.type.startsWith("video/"),
        wallpaperName: file.name,
      });
    }
  },

  loadWallpaper: async () => {
    const key = getLocalWallpaper();
    if (key) {
      const wallpaper = await getWallpaperStorage(key);
      if (wallpaper.value) {
        const mediaUrl = URL.createObjectURL(wallpaper.value);
        set({
          wallpaper: mediaUrl,
          isVideo: wallpaper.value.type.startsWith("video/"),
          wallpaperName: wallpaper.value.name,
        });
      }
    }
  },

  getAllWallpaper: async () => {
    return await getAllWallpaperStorage();
  },

  changeWallpaper: async (filename: string) => {
    setLocalWallpaper(filename);
    const localfile = await getWallpaperStorage(filename);
    if (localfile.value) {
      const mediaUrl = URL.createObjectURL(localfile.value);
      set({
        wallpaper: mediaUrl,
        isVideo: localfile.value.type.startsWith("video/"),
        wallpaperName: localfile.value.name,
      });
    }
  },

  deleteWallpaper: async (filename: string) => {
    const res = await deleteWallpaperStorage(filename);
    if (res) {
      set({
        wallpaper: WALLPAPER,
        wallpaperName: "",
        isVideo: false,
      });
    }
  },
}));
