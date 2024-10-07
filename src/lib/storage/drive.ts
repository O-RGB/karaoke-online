import {
  STORAGE_DRIVE,
  STORAGE_KARAOKE_EXTREME,
  STORAGE_USER_DRIVE,
} from "@/config/value";
import {
  storageGetAllKeys,
  sortageDeleteAll,
  storageGet,
} from "@/utils/database/storage";
import { getLocalDriveUrl } from "../local-storage";
import { Fetcher } from "@/utils/api/fetch";
import { base64ByteToFile } from "@/utils/file/file";
import { SongDriveModel } from "@/utils/database/model";

export const getSongDrive = async (
  key: string | number,
  formUser: boolean = false
) => {
  // check file in store
  const file = await getSongByKey(+key, formUser);
  const url = getLocalDriveUrl();
  if (file?.file) {
    return file.file;
  } else if (url) {
    const res = await Fetcher(url, { index: key }, "LOAD");
    const file = base64ByteToFile(res.base64Content, res.fileName);

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
    await store?.put({ file: song, id });
    return await tx?.done;
  } catch (error) {
    return false;
  }
};

export const getSongByKey = async (
  key: string | number,
  formUser: boolean = false
): Promise<any | undefined> => {
  return await storageGet(key, STORAGE_DRIVE);
};

export const getAllKeysSong = async () => {
  return await storageGetAllKeys(STORAGE_KARAOKE_EXTREME);
};

export const deleteAllSong = async () => {
  return await sortageDeleteAll(STORAGE_KARAOKE_EXTREME);
};

SongDriveModel;
