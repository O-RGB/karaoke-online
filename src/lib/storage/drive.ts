import {
  STORAGE_DRIVE_EXTREME_SONG,
  STORAGE_DRIVE_SONG,
  STORAGE_EXTREME_SONG,
} from "@/config/value";
import {
  storageGetAllKeys,
  sortageDeleteAll,
  storageGet,
  findKeyOffset,
} from "@/utils/database/storage";
import { Fetcher } from "@/utils/api/fetch";
import { bytesToFile } from "@/utils/file/file";
import { DriveExtremeModel } from "@/utils/database/model";

export const getSongDrive = async (
  key: string | number,
  url?: string,
  custom?: boolean
) => {
  let file = undefined;
  if (custom) {
    file = await getSongDriveByKey(+key);
  } else {
    file = await getSongDriveExtremeByKey(+key);
  }
  if (file !== undefined) {
    return file;
  } else if (url) {
    const res = await Fetcher(url, { index: key, custom: custom }, "LOAD");
    const file = bytesToFile(res.bytes, res.contentType, res.fileName);
    const getFileId = file.name.split(".");
    saveSongByKey(file, +getFileId[0]);
    return file;
  } else {
    return undefined;
  }
};

// MODEL
export const saveSongByKey = async (song: File, id: number) => {
  try {
    const { tx, store, loaded } = await DriveExtremeModel();
    if (!loaded) {
      return false;
    }
    await store?.put({ value: song, id });
    return await tx?.done;
  } catch (error) {
    return false;
  }
};

export const getSongDriveExtremeByKey = async (
  key: string | number
): Promise<any | undefined> => {
  return (await storageGet<File>(key, STORAGE_DRIVE_EXTREME_SONG))?.value;
};

export const getSongDriveByKey = async (
  key: string | number
): Promise<any | undefined> => {
  return (await storageGet<File>(key, STORAGE_DRIVE_SONG))?.value;
};

export const findLimitOffsetByKey = async (key: string, limit: number) => {
  return await findKeyOffset(STORAGE_EXTREME_SONG, key, limit);
};

export const getAllKeysDrive = async (limit: number, offset: number) => {
  return await storageGetAllKeys(STORAGE_DRIVE_EXTREME_SONG, limit, offset);
};

export const deleteAllSong = async () => {
  return await sortageDeleteAll(STORAGE_EXTREME_SONG);
};
