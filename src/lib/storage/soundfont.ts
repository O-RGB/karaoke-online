// import { STORAGE_SOUNDFONT } from "@/config/value";
// import { getDB } from "@/utils/database/db";
// import {
//   storageGet,
//   storageGetAll,
//   storageGetAllKeys,
// } from "../../utils/database/storage";

// export const saveSoundFontStorage = async (file: File) => {
//   try {
//     const db = await getDB(STORAGE_SOUNDFONT);
//     const tx = db.transaction(STORAGE_SOUNDFONT, "readwrite");
//     await tx.objectStore(STORAGE_SOUNDFONT).put({ value: file, id: file.name });
//     await tx.done;
//   } catch (error) {
//     console.log(error)
//   }
// };

// export const deleteSoundFontStorage = async (filename: string) => {
//   try {
//     const db = await getDB(STORAGE_SOUNDFONT);
//     const tx = db.transaction(STORAGE_SOUNDFONT, "readwrite");
//     await tx.objectStore(STORAGE_SOUNDFONT).delete(filename);
//     await tx.done;

//     console.log(`Deleted ${filename} from both soundfont stores`);
//   } catch (error) {
//     console.error(`Error deleting ${filename}:`, error);
//   }
// };

// export const getSoundFontStorage = async (key: string) => {
//   return await storageGet<File>(key, STORAGE_SOUNDFONT);
// };

// export const getAllSoundFontStorage = async () => {
//   return await storageGetAll<File[]>(STORAGE_SOUNDFONT);
// };

// export const getAllKeySoundfont = async () => {
//   return await storageGetAllKeys(STORAGE_SOUNDFONT);
// };
