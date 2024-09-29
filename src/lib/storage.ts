import {
  STORAGE_NAME,
  STORAGE_NAME_DIC,
  STORAGE_SOUNDFONT,
  STORAGE_SOUNDFONT_DIC,
  STORAGE_WALLPAPER,
  TRACKLIST_FILENAME,
} from "@/config/value";
import { getDB } from "@/utils/database/db";
import { directoryOpen } from "browser-fs-access";
import { ExtractFile } from "./zip";

// MODEL

async function getByKey<T = any>(
  key: string,
  storage_name: string,
  mode: "readonly" = "readonly"
) {
  try {
    const db = await getDB(storage_name);
    const tx = db.transaction(storage_name, mode);
    const store = tx.objectStore(storage_name);
    const data = await store.get(key);

    await tx.done;
    if (data) {
      return data as T;
    } else {
      return undefined;
    }
  } catch (error) {
    return undefined;
  }
}

async function getAll<T = any[]>(
  storage_name: string,
  mode: "readonly" = "readonly"
) {
  try {
    const db = await getDB(storage_name);
    const tx = db.transaction(storage_name, mode);
    const store = tx.objectStore(storage_name);
    const data = await store.getAll(); // ใช้ getAll เพื่อดึงข้อมูลทั้งหมด

    await tx.done;
    if (data) {
      return data as T;
    } else {
      return [] as T;
    }
  } catch (error) {
    console.error(error);
    return [] as T;
  }
}

export async function getAllKeys(storage_name: string) {
  try {
    const db = await getDB(storage_name);
    const tx = db.transaction(storage_name, "readonly");
    const store = tx.objectStore(storage_name);
    const keys = await store.getAllKeys();

    await tx.done;
    return keys;
  } catch (error) {
    console.error("Error retrieving keys:", error);
    return [];
  }
}

async function deleteByKey(
  key: string,
  storage_name: string,
  mode: "readwrite" = "readwrite"
) {
  try {
    const db = await getDB(storage_name);
    const tx = db.transaction(storage_name, mode);
    const store = tx.objectStore(storage_name);
    await store.delete(key);

    await tx.done;
    return true;
  } catch (error) {
    return false;
  }
}

async function save(
  key: string,
  value: any,
  storage_name: string,
  mode: "readwrite" = "readwrite"
) {
  try {
    const db = await getDB(storage_name);
    const tx = db.transaction(storage_name, mode);
    const store = tx.objectStore(storage_name);
    await store.add(value, key);

    await tx.done;
    return true;
  } catch (error) {
    console.error("Error saving data:", error);
    return false;
  }
}

async function saveList(
  list: { key: string; value: any }[],
  storage_name: string,
  onProgress?: (progress?: IProgressBar) => void,
  mode: "readwrite" = "readwrite"
) {
  const db = await getDB(storage_name);
  const tx = db.transaction(storage_name, mode);
  const store = tx.objectStore(storage_name);
  let error = undefined;
  for (let i = 0; i < list.length; i++) {
    try {
      await store.add(list[i].value, list[i].key);
    } catch (e) {
      error = JSON.stringify(e);
      if (error === "{}") {
        error = undefined;
      }
    }
    onProgress?.({
      progress: Math.round(((i + 1) / list.length) * 100),
      processing: list[i]?.key,
      error: error,
    });
  }

  await tx.done;
  return true;
}

async function deleteAll(
  storage_name: string,
  mode: "readwrite" = "readwrite"
) {
  try {
    const db = await getDB(storage_name);
    const tx = db.transaction(storage_name, mode);
    const store = tx.objectStore(storage_name);
    await store.clear();

    await tx.done;
    return true;
  } catch (error) {
    console.error("Error deleting all data:", error);
    return false;
  }
}

// ON RAM
const filterFileUse = (fileList: File[]) => {
  const musicLibrary = new Map<string, File>();
  fileList.map((item) => {
    let filename = item.name.replace(".zip", "");
    musicLibrary.set(filename, item);
  });
  return musicLibrary;
};

export const loadFileSystem = async () => {
  try {
    const selectedFiles = await directoryOpen({
      recursive: true,
      id: "unique-folder-id",
    });

    if (Array.isArray(selectedFiles)) {
      let fileList = selectedFiles.filter(
        (item): item is File => "name" in item
      );
      return filterFileUse(fileList);
    }
  } catch (error) {
    console.error("Error reading folder:", error);
  }
  return undefined;
};

export const loadFileZip = async (
  fileList: FileList,
  onProgress?: (progress?: IProgressBar) => void
) => {
  const allMusicFiles: File[] = [];
  for (let i = 0; i < fileList.length; i++) {
    let error: string | undefined = undefined;
    const data = fileList.item(i);

    if (data?.name.endsWith("zip")) {
      await ExtractFile(data)
        .then((music) => {
          allMusicFiles.push(...music);
        })
        .catch((e) => {
          error = e;
          return undefined;
        });
    }
    onProgress?.({
      progress: Math.round(((i + 1) / fileList.length) * 100),
      processing: data?.name,
      error: error,
    });
  }

  return filterFileUse(allMusicFiles);
};

// ON STORAGE
export const getSongBySuperKey = async (
  key: string
): Promise<File | undefined> => {
  return await getByKey(key, STORAGE_NAME);
};

export const saveSongToStorage = async (
  files: Map<string, File>,
  onProgress?: (progress?: IProgressBar) => void
) => {
  const countSuperZip = Array.from(files.entries()).map(([key, value]) => ({
    key: value.name,
    value,
  }));
  await saveList(countSuperZip, STORAGE_NAME, onProgress);
  return { result: true };
};

// export const saveSongFromZipToStorage = async (files: File[]) => {
//   const db = await getDB(STORAGE_NAME);
//   const tx = db.transaction(STORAGE_NAME, "readwrite");

//   files.forEach(async (file) => {
//     await tx.objectStore(STORAGE_NAME).add(file, file.name);
//   });
//   await tx.done;
//   return true;
// };

export const storageIsEmpty = async () => {
  const db = await getDB(STORAGE_NAME);
  const transaction = db.transaction(STORAGE_NAME, "readonly");
  const store = transaction.objectStore(STORAGE_NAME);
  const count = await store.count();
  return count <= 0;
};

export const saveTrackList = async (file: File) => {
  return await save(TRACKLIST_FILENAME, file, STORAGE_NAME_DIC);
};

export const getTrackList = async () => {
  return await getByKey<File>(TRACKLIST_FILENAME, STORAGE_NAME_DIC);
};

// Soundfont
export const createSoundFontDic = async (filename: string, size: number) => {
  const db = await getDB(STORAGE_SOUNDFONT_DIC);
  const tx = db.transaction(STORAGE_SOUNDFONT_DIC, "readwrite");
  await tx.objectStore(STORAGE_SOUNDFONT_DIC).add({ filename, size }, filename);
  await tx.done;
};

export const saveSoundFontStorage = async (file: File) => {
  try {
    const db = await getDB(STORAGE_SOUNDFONT);
    const tx = db.transaction(STORAGE_SOUNDFONT, "readwrite");
    await tx.objectStore(STORAGE_SOUNDFONT).add(file, file.name);
    await tx.done;
  } catch (error) {}
};

export const deleteSoundFontStorage = async (filename: string) => {
  try {
    // ลบออกจาก STORAGE_SOUNDFONT_DIC
    const dbDic = await getDB(STORAGE_SOUNDFONT_DIC);
    const txDic = dbDic.transaction(STORAGE_SOUNDFONT_DIC, "readwrite");
    await txDic.objectStore(STORAGE_SOUNDFONT_DIC).delete(filename);
    await txDic.done;

    // ลบออกจาก STORAGE_SOUNDFONT
    const db = await getDB(STORAGE_SOUNDFONT);
    const tx = db.transaction(STORAGE_SOUNDFONT, "readwrite");
    await tx.objectStore(STORAGE_SOUNDFONT).delete(filename);
    await tx.done;

    console.log(`Deleted ${filename} from both soundfont stores`);
  } catch (error) {
    console.error(`Error deleting ${filename}:`, error);
  }
};

export const getSoundFontStorage = async (key: string) => {
  return await getByKey<File>(key, STORAGE_SOUNDFONT);
};

export const getAllSoundFontStorage = async () => {
  return await getAll<File[]>(STORAGE_SOUNDFONT);
};
export const getAllSoundFontDicStorage = async () => {
  return await getAll<{ filename: string; size: number }[]>(
    STORAGE_SOUNDFONT_DIC
  );
};

export const getAllKeySoundfont = async () => {
  return await getAllKeys(STORAGE_SOUNDFONT);
};

export const saveWallpaperStorage = async (file: File) => {
  try {
    const db = await getDB(STORAGE_WALLPAPER);
    const tx = db.transaction(STORAGE_WALLPAPER, "readwrite");
    await tx.objectStore(STORAGE_WALLPAPER).add(file, file.name);
    await tx.done;
    return true;
  } catch (error) {
    return false;
  }
};
export const getWallpaperStorage = async (key: string) => {
  return await getByKey<File>(key, STORAGE_WALLPAPER);
};
export const getAllWallpaperStorage = async () => {
  return await getAll<File[]>(STORAGE_WALLPAPER);
};
export const deleteWallpaperStorage = async (key: string) => {
  return await deleteByKey(key, STORAGE_WALLPAPER);
};

export const getAllKeysSong = async () => {
  return await getAllKeys(STORAGE_NAME);
};

export const deleteAllSong = async () => {
  return await deleteAll(STORAGE_NAME);
};
