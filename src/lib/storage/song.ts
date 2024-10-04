import {
  CUR_FILE_TYPE,
  CUSTOM_SONG_ZIP,
  LYR_FILE_TYPE,
  MID_FILE_TYPE,
  STORAGE_KARAOKE_EXTREME,
  STORAGE_USER_SONG,
} from "@/config/value";
import {
  sortageDeleteAll,
  storageGetAllKeys,
  storageGet,
} from "../../utils/database/storage";
import { extractFile, zipFiles } from "../zip";
import { getDB } from "@/utils/database/db";
import { parseEMKFile } from "../karaoke/emk";
import { readCursorFile, readLyricsFile } from "../karaoke/ncn";
import { getLocalSongCount, setLocalSongCount } from "../local-storage";
import { createTrackList } from "./tracklist";
import { SongUserModel } from "@/utils/database/model";

export const getSongByKey = async (
  key: string | number,
  formUser: boolean = false
): Promise<File | undefined> => {
  return await storageGet(
    key,
    formUser ? STORAGE_USER_SONG : STORAGE_KARAOKE_EXTREME
  );
};

export const songIsEmpty = async () => {
  const db = await getDB(STORAGE_KARAOKE_EXTREME);
  const transaction = db.transaction(STORAGE_KARAOKE_EXTREME, "readonly");
  const store = transaction.objectStore(STORAGE_KARAOKE_EXTREME);
  const count = await store.count();
  return count <= 0;
};

export const genSongPath = (selected?: SearchResult) => {
  let superId = undefined;
  let fileId = undefined;
  if (selected?.fileId) {
    const path = selected.fileId.split("/");
    if (path.length === 2) {
      superId = path[0];
      fileId = path[1];
    }
  }
  return { superId, fileId };
};

export const getSong = async (
  songStore: Map<string, File>,
  selected?: SearchResult
) => {
  const { superId, fileId } = genSongPath(selected);
  if (superId && fileId) {
    var superFile: File | undefined = undefined;
    if (songStore.size === 0) {
      const checkUserSong: boolean = superId.startsWith(CUSTOM_SONG_ZIP);
      if (checkUserSong) {
        superFile = await getSongByKey(
          +superId.replace(CUSTOM_SONG_ZIP + "-", ""),
          true
        );
      } else {
        superFile = await getSongByKey(`${superId}.zip`, false);
      }

      console.log(superFile?.name);
    } else {
      superFile = songStore.get(superId);
    }
    if (superFile) {
      const superUnzip = await extractFile(superFile);
      const index = parseInt(fileId);
      const convertIndex: number = Number(index);
      const zip = superUnzip[convertIndex];

      let songUnzip: File[] = [];
      if (zip.name.toLowerCase().endsWith("emk")) {
        const decodeed = await parseEMKFile(zip);
        if (decodeed.mid && decodeed.cur && decodeed.lyr) {
          songUnzip = [decodeed.mid, decodeed.cur, decodeed.lyr];
        }
      } else {
        songUnzip = await extractFile(zip);
      }

      var song: Partial<SongFilesDecode> = {};
      songUnzip.map(async (file) => {
        if (file.name.endsWith(MID_FILE_TYPE)) {
          song.mid = file;
        } else if (file.name.endsWith(CUR_FILE_TYPE)) {
          song.cur = await readCursorFile(file);
        } else if (file.name.endsWith(LYR_FILE_TYPE)) {
          song.lyr = await readLyricsFile(file);
        }
      });

      return song as SongFilesDecode;
    }
  }
};

export const createSongZip = async (bufferFile: SongFiltsEncodeAndDecode[]) => {
  if (bufferFile) {
    let tracklist: SearchResult[] = [];
    const userSongCount: number = (await getLastIndexSongUser()) + 1;
    const superName: string = `${CUSTOM_SONG_ZIP}-${userSongCount}`;
    let zip: File[] = [];
    try {
      for (let i = 0; i < bufferFile.length; i++) {
        const file = bufferFile[i];
        if (file.encode) {
          const groupNcn = await zipFiles(
            [file.encode.cur, file.encode.lyr, file.encode.mid],
            `${i}`
          );
          if (groupNcn) {
            zip.push(groupNcn);
          }
        } else if (file.emk) {
          const newFileName = `${i}.emk`;
          const newFile = new File([file.emk], newFileName, {
            type: file.emk.type,
          });
          zip.push(newFile);
        }
        const tl = createTrackList(file, `${i}`, superName);
        tracklist.push(tl);
      }

      const superZip = await zipFiles(zip, superName);

      if (superZip) {
        const onOk = await addUserSong(superZip, superName + ".zip");
        if (onOk) {
          setLocalSongCount(userSongCount);
        }
      }

      return tracklist;
    } catch (error) {
      console.error("Error creating zip files:", error);
    }
  }
};
export const addSongKaraokeExtremeToStorage = async (
  fileList: FileList,
  onProgress?: (progress?: IProgressBar) => void
) => {
  const allMusicFiles: File[] = [];
  for (let i = 0; i < fileList.length; i++) {
    let error: string | undefined = undefined;
    const data = fileList.item(i);

    if (data?.name.endsWith("zip")) {
      await extractFile(data)
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

const filterFileUse = (fileList: File[]) => {
  const musicLibrary = new Map<string, File>();
  fileList.map((item) => {
    let filename = item.name.replace(".zip", "");
    musicLibrary.set(filename, item);
  });
  return musicLibrary;
};

const getAllUserSong = () => {
  const count = getLocalSongCount();
  if (count) {
    return +count;
  } else {
    return 0;
  }
};

// DATABASE
export const addUserSong = async (userSong: File, id: string) => {
  try {
    const { tx, store, loaded } = await SongUserModel();
    if (!loaded) {
      return false;
    }

    await store?.put(userSong);
    console.log("เพิ่มไฟล์เพลง");
    return await tx?.done;
  } catch (error) {
    console.log("addUserSong error", error);
    return false;
  }
};

export const getLastIndexSongUser = async () => {
  return (await storageGetAllKeys(STORAGE_USER_SONG)).length;
};

// MODEL
export const getAllKeysSong = async () => {
  return await storageGetAllKeys(STORAGE_KARAOKE_EXTREME);
};

export const deleteAllSong = async () => {
  return await sortageDeleteAll(STORAGE_KARAOKE_EXTREME);
};
