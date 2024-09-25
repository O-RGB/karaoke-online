import {
  STORAGE_NAME,
  STORAGE_SOUNDFONT,
  STORAGE_SOUNDFONT_DIC,
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
  tracklist?: File,
  onProgress?: (progress?: IProgressBar) => void
) => {
  const countSuperZip = Array.from(files.values());
  const db = await getDB(STORAGE_NAME);

  const tx = db.transaction(STORAGE_NAME, "readwrite");
  const objectStore = tx.objectStore(STORAGE_NAME);

  countSuperZip.map(async (data, i) => {
    console.log(data.name, i);
    let error: string | undefined = undefined;
    try {
      await objectStore.add(data, data.name);
    } catch (e) {
      error = JSON.stringify(e);
      console.log(error);
    }
    onProgress?.({
      progress: Math.round(((i + 1) / countSuperZip.length) * 100),
      processing: data?.name,
      error: error,
    });
  });
  if (tracklist) {
    await objectStore.add(tracklist, tracklist.name);
  }
  await tx.done;
  return true;
};

export const saveSongFromZipToStorage = async (files: File[]) => {
  const db = await getDB(STORAGE_NAME);
  const tx = db.transaction(STORAGE_NAME, "readwrite");

  files.forEach(async (file) => {
    await tx.objectStore(STORAGE_NAME).add(file, file.name);
  });
  await tx.done;
  return true;
};

export const storageIsEmpty = async () => {
  const db = await getDB(STORAGE_NAME);
  const transaction = db.transaction(STORAGE_NAME, "readonly");
  const store = transaction.objectStore(STORAGE_NAME);
  const count = await store.count();
  return count <= 0;
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
    await createSoundFontDic(file.name, file.size);
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
