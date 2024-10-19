import { STORAGE_DRIVE, STORAGE_KARAOKE_EXTREME } from "@/config/value";
import {
  storageGetAllKeys,
  sortageDeleteAll,
  storageGet,
  findKeyOffset,
} from "@/utils/database/storage";
import { getLocalDriveUrl } from "../local-storege/local-storage";
import { Fetcher } from "@/utils/api/fetch";
import { bytesToFile } from "@/utils/file/file";
import { SongDriveModel } from "@/utils/database/model";

export const getSongDrive = async (key: string | number) => {
  // check file in store
  const file = await getSongDriveByKey(+key);
  const url = getLocalDriveUrl();
  if (file) {
    return file;
  } else if (url) {
    const res = await Fetcher(url, { index: key }, "LOAD");
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
    const { tx, store, loaded } = await SongDriveModel();
    if (!loaded) {
      return false;
    }
    await store?.put({ value: song, id });
    return await tx?.done;
  } catch (error) {
    return false;
  }
};

export const getSongDriveByKey = async (
  key: string | number
): Promise<any | undefined> => {
  return (await storageGet<File>(key, STORAGE_DRIVE))?.value;
};

export const findLimitOffsetByKey = async (key: string, limit: number) => {
  return await findKeyOffset(STORAGE_KARAOKE_EXTREME, key, limit);
};

export const getAllKeysSong = async (limit: number, offset: number) => {
  return await storageGetAllKeys(STORAGE_KARAOKE_EXTREME, limit, offset);
};

export const deleteAllSong = async () => {
  return await sortageDeleteAll(STORAGE_KARAOKE_EXTREME);
};

SongDriveModel;
