import { create } from "zustand";
import { WALLPAPER } from "@/config/value";
import { WallpaperDisplayManager } from "@/utils/indexedDB/db/display/table";
import useConfigStore from "./config/config-store";
import { IWallpaperDisplay } from "@/utils/indexedDB/db/display/types";

interface WallpaperState {
  wallpaper: string;
  wallpaperId: number;
  isVideo: boolean;
  addWallpaper: (file: File) => Promise<void>;
  loadWallpaper: () => Promise<void>;
  getAllWallpaper: () => Promise<IWallpaperDisplay[]>;
  changeWallpaper: (wallpaperId: number) => Promise<void>;
  deleteWallpaper: (wallpaperId: number) => Promise<void>;
}

export const useWallpaperStore = create<WallpaperState>((set, get) => ({
  wallpaper: WALLPAPER,
  wallpaperId: -1,
  isVideo: false,

  addWallpaper: async (file: File) => {
    const manager = new WallpaperDisplayManager();
    const onCreated = await manager.add({ file: file, createdAt: new Date() });
    const mediaUrl = URL.createObjectURL(file);
    if (onCreated) {
      set({
        wallpaper: mediaUrl,
        isVideo: file.type.startsWith("video/"),
        wallpaperId: onCreated as number,
      });
    }
  },

  loadWallpaper: async () => {
    const wallpaperId = useConfigStore.getState().config.themes?.wallpaperId;
    const manager = new WallpaperDisplayManager();
    if (!wallpaperId) return;
    const wallpaper = await manager.get(wallpaperId);
    if (wallpaper?.file) {
      const mediaUrl = URL.createObjectURL(wallpaper?.file);
      set({
        wallpaper: mediaUrl,
        isVideo: wallpaper.file.type.startsWith("video/"),
        wallpaperId: wallpaper.id,
      });
    }
  },

  getAllWallpaper: async () => {
    const manager = new WallpaperDisplayManager();
    return await manager.getAll();
  },

  changeWallpaper: async (wallpaperId: number) => {
    const setConfig = useConfigStore.getState().setConfig;
    const manager = new WallpaperDisplayManager();
    const wallpaper = await manager.get(wallpaperId);
    if (wallpaper) {
      const mediaUrl = URL.createObjectURL(wallpaper.file);
      set({
        wallpaper: mediaUrl,
        isVideo: wallpaper.file.type.startsWith("video/"),
        wallpaperId: wallpaper.id,
      });
      setConfig({ themes: { wallpaperId } });
    }
  },

  deleteWallpaper: async (wallpaperId: number) => {
    const setConfig = useConfigStore.getState().setConfig;
    const configWallpaperId =
      useConfigStore.getState().config.themes?.wallpaperId;
    const manager = new WallpaperDisplayManager();
    await manager.delete(wallpaperId);

    if (configWallpaperId === wallpaperId) {
      setConfig({ themes: { wallpaperId: undefined } });
    }
  },
}));
