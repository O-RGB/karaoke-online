import {
  STORAGE_TRACKLIST,
  STORAGE_USER_SONG,
  STORAGE_WALLPAPER,
} from "@/config/value";
import { getDB } from "./db";

export const SongUserModel = async () => {
  try {
    const db = await getDB(STORAGE_USER_SONG, true);
    const tx = db.transaction(STORAGE_USER_SONG, "readwrite");
    const store = tx.objectStore(STORAGE_USER_SONG);
    return { store, tx, db, loaded: true };
  } catch (error) {
    return { store: null, tx: null, db: null, loaded: false };
  }
};

export const TracklistModel = async () => {
  try {
    const db = await getDB(STORAGE_TRACKLIST, true);
    const tx = db.transaction(STORAGE_TRACKLIST, "readwrite");
    const store = tx.objectStore(STORAGE_TRACKLIST);
    return { store, tx, db, loaded: true };
  } catch (error) {
    return { store: null, tx: null, db: null, loaded: false };
  }
};

export const WallpaperModel = async () => {
  try {
    const db = await getDB(STORAGE_WALLPAPER);
    const tx = db.transaction(STORAGE_WALLPAPER, "readwrite");
    const store = tx.objectStore(STORAGE_WALLPAPER);
    return { store, tx, db, loaded: true };
  } catch (error) {
    return { store: null, tx: null, db: null, loaded: false };
  }
};

export const LoadDatabase = async () => {
  await SongUserModel();
  await TracklistModel();
  await WallpaperModel();
};
