import { STORAGE_SOUNDFONT_DIC, STORAGE_SOUNDFONT } from "@/config/value";
import { getDB } from "@/utils/database/db";
import { storageGet, storageGetAll, storageGetAllKeys } from "../../utils/database/storage";

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
  return await storageGet<File>(key, STORAGE_SOUNDFONT);
};

export const getAllSoundFontStorage = async () => {
  return await storageGetAll<File[]>(STORAGE_SOUNDFONT);
};
export const getAllSoundFontDicStorage = async () => {
  return await storageGetAll<{ filename: string; size: number }[]>(
    STORAGE_SOUNDFONT_DIC
  );
};

export const getAllKeySoundfont = async () => {
  return await storageGetAllKeys(STORAGE_SOUNDFONT);
};
