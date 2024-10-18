import {
  STORAGE_DRIVE,
  STORAGE_DRIVE_TRACKLIST,
  STORAGE_KARAOKE_EXTREME,
  STORAGE_TRACKLIST,
  STORAGE_USER_SONG,
  STORAGE_WALLPAPER,
} from "@/config/value";
import { getDB } from "./db";

export const SongDriveModel = async () => {
  try {
    const db = await getDB(STORAGE_DRIVE, true);
    const tx = db.transaction(STORAGE_DRIVE, "readwrite");
    const store = tx.objectStore(STORAGE_DRIVE);
    return { store, tx, db, loaded: true };
  } catch (error) {
    return { store: null, tx: null, db: null, loaded: false };
  }
};

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
    console.log("tracklist error", error);
    return { store: null, tx: null, db: null, loaded: false };
  }
};

export const TracklistDriveModel = async () => {
  try {
    const db = await getDB(STORAGE_DRIVE_TRACKLIST, true);
    const tx = db.transaction(STORAGE_DRIVE_TRACKLIST, "readwrite");
    const store = tx.objectStore(STORAGE_DRIVE_TRACKLIST);
    return { store, tx, db, loaded: true };
  } catch (error) {
    console.log("tracklist drive error", error);
    return { store: null, tx: null, db: null, loaded: false };
  }
};

export const karaokeExtremeModel = async () => {
  try {
    const db = await getDB(STORAGE_KARAOKE_EXTREME, true);
    const tx = db.transaction(STORAGE_KARAOKE_EXTREME, "readwrite");
    const store = tx.objectStore(STORAGE_KARAOKE_EXTREME);
    return { store, tx, db, loaded: true };
  } catch (error) {
    console.log("tracklist error", error);
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

export const LoadDatabase = () => {
  SongUserModel();
  TracklistModel();
  WallpaperModel();
  SongDriveModel();
  karaokeExtremeModel();
};
