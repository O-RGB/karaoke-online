import {
  STORAGE_DRIVE_EXTREME_SONG,
  STORAGE_DRIVE_SONG,
  STORAGE_DRIVE_EXTREME_TRACKLIST,
  STORAGE_EXTREME_SONG,
  STORAGE_EXTREME_TRACKLIST,
  STORAGE_USER_SONG,
  STORAGE_USER_TRACKLIST,
  STORAGE_WALLPAPER,
  STORAGE_DRIVE_TRACKLIST_SONG,
} from "@/config/value";
import { getDB } from "./db";

// export const STORAGE_USER_SONG = "user_song";
// export const STORAGE_USER_TRACKLIST = "user_tracklist";
export const UserSongModel = async () => {
  try {
    const db = await getDB(STORAGE_USER_SONG);
    const tx = db.transaction(STORAGE_USER_SONG, "readwrite");
    const store = tx.objectStore(STORAGE_USER_SONG);
    return { store, tx, db, loaded: true };
  } catch (error) {
    return { store: null, tx: null, db: null, loaded: false };
  }
};
export const UserTracklistModel = async () => {
  try {
    const db = await getDB(STORAGE_USER_TRACKLIST);
    const tx = db.transaction(STORAGE_USER_TRACKLIST, "readwrite");
    const store = tx.objectStore(STORAGE_USER_TRACKLIST);
    return { store, tx, db, loaded: true };
  } catch (error) {
    console.log("tracklist user error", error);
    return { store: null, tx: null, db: null, loaded: false };
  }
};

// export const STORAGE_EXTREME_TRACKLIST = "extreme_tracklist";
// export const STORAGE_EXTREME_SONG = "extreme_song";
export const ExtremeTracklistModel = async () => {
  try {
    const db = await getDB(STORAGE_EXTREME_TRACKLIST);
    const tx = db.transaction(STORAGE_EXTREME_TRACKLIST, "readwrite");
    const store = tx.objectStore(STORAGE_EXTREME_TRACKLIST);
    return { store, tx, db, loaded: true };
  } catch (error) {
    return { store: null, tx: null, db: null, loaded: false };
  }
};
export const ExtremeSongModel = async () => {
  try {
    const db = await getDB(STORAGE_EXTREME_SONG);
    const tx = db.transaction(STORAGE_EXTREME_SONG, "readwrite");
    const store = tx.objectStore(STORAGE_EXTREME_SONG);
    return { store, tx, db, loaded: true };
  } catch (error) {
    return { store: null, tx: null, db: null, loaded: false };
  }
};

// export const STORAGE_DRIVE_SONG = "drive_user_song";
// export const STORAGE_DRIVE_TRACKLIST_SONG = "drive_user_tracklist";

export const DriveSongModel = async () => {
  try {
    const db = await getDB(STORAGE_DRIVE_SONG);
    const tx = db.transaction(STORAGE_DRIVE_SONG, "readwrite");
    const store = tx.objectStore(STORAGE_DRIVE_SONG);
    return { store, tx, db, loaded: true };
  } catch (error) {
    return { store: null, tx: null, db: null, loaded: false };
  }
};
export const DriveTracklistSongModel = async () => {
  try {
    const db = await getDB(STORAGE_DRIVE_TRACKLIST_SONG);
    const tx = db.transaction(STORAGE_DRIVE_TRACKLIST_SONG, "readwrite");
    const store = tx.objectStore(STORAGE_DRIVE_TRACKLIST_SONG);
    return { store, tx, db, loaded: true };
  } catch (error) {
    return { store: null, tx: null, db: null, loaded: false };
  }
};

// export const STORAGE_DRIVE_EXTREME_SONG = "drive_extreme_song";
// export const STORAGE_DRIVE_EXTREME_TRACKLIST = "drive_extreme_tracklist";
export const DriveExtremeModel = async () => {
  try {
    const db = await getDB(STORAGE_DRIVE_EXTREME_SONG);
    const tx = db.transaction(STORAGE_DRIVE_EXTREME_SONG, "readwrite");
    const store = tx.objectStore(STORAGE_DRIVE_EXTREME_SONG);
    return { store, tx, db, loaded: true };
  } catch (error) {
    return { store: null, tx: null, db: null, loaded: false };
  }
};
export const DriveExtremeTracklistModel = async () => {
  try {
    const db = await getDB(STORAGE_DRIVE_EXTREME_TRACKLIST);
    const tx = db.transaction(STORAGE_DRIVE_EXTREME_TRACKLIST, "readwrite");
    const store = tx.objectStore(STORAGE_DRIVE_EXTREME_TRACKLIST);
    return { store, tx, db, loaded: true };
  } catch (error) {
    console.log("tracklist drive error", error);
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
