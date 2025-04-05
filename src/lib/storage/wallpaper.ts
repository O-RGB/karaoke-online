import { STORAGE_WALLPAPER } from "@/config/value";
import {
  storageGet,
  storageGetAll,
  storageDelete,
} from "../../utils/database/storage";
import { WallpaperModel } from "@/utils/database/model";

export const saveWallpaperStorage = async (file: File) => {
  try {
    const { tx, store, loaded } = await WallpaperModel();
    if (!loaded) {
      return false;
    }

    store?.put({ value: file, id: file.name });

    await tx?.done;
    return true;
  } catch (error) {
    return false;
  }
};
export const getWallpaperStorage = async (key: string) => {
  return await storageGet<File>(key, STORAGE_WALLPAPER);
};
export const getAllWallpaperStorage = async () => {
  return await storageGetAll<File[]>(STORAGE_WALLPAPER);
};
export const deleteWallpaperStorage = async (key: string) => {
  return await storageDelete(key, STORAGE_WALLPAPER);
};
