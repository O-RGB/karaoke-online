import {
  STORAGE_KARAOKE_EXTREME,
  STORAGE_NAME_DIC,
  STORAGE_TRACKLIST,
  TRACKLIST_FILENAME,
} from "@/config/value";
import { getDB } from "@/utils/database/db";
import {
  storageAddAll,
  storageAdd,
  storageGet,
} from "../../utils/database/storage";
import { TracklistModel } from "@/utils/database/model";

export const createTrackList = (
  song: SongFiltsEncodeAndDecode,
  fileIndex: string,
  superFile: string
) => {
  let songId: string[] | string = song.mid.name.split(".");
  if (songId.length >= 2) {
    songId = songId[0];
  }
  return {
    id: songId,
    name: song.lyr[0],
    artist: song.lyr[1],
    type: song.emk ? 0 : 1,
    fileId: `${superFile}/${fileIndex}`,
  } as SearchResult;
};

export const jsonTracklistToDatabase = async (
  file: File
): Promise<SearchResult[] | undefined> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      const jsonData = event.target?.result;

      if (typeof jsonData === "string") {
        try {
          const data: SearchResult[] = JSON.parse(jsonData);
          const { store, tx, loaded } = await TracklistModel();

          if (!loaded) {
            return false;
          }

          if (Array.isArray(data)) {
            for (let item of data) {
              item.id = item.id.toUpperCase();
              await store?.put(item);
            }
          } else {
            await store?.put(data);
          }

          await tx?.done;
          console.log("Data saved successfully");
          resolve(data);
        } catch (error) {
          console.error("Error parsing JSON or saving to database:", error);
          resolve(undefined);
        }
      } else {
        resolve(undefined);
      }
    };

    reader.onerror = () => {
      console.error("Error reading file");
      resolve(undefined);
    };

    reader.readAsText(file);
  });
};

export const addTracklistToDatabase = async (obj: SearchResult) => {
  try {
    const { store, tx, loaded } = await TracklistModel();
    if (!loaded) {
      return false;
    }

    if (obj.id) {
      obj.id = obj.id.toUpperCase();
    }

    await store?.put(obj);
    await tx?.done;

    console.log("Object saved successfully");
  } catch (error) {
    console.error("Error saving object to database:", error);
  }
};

export const addTracklistsToDatabase = async (objs: SearchResult[]) => {
  try {
    const { store, tx, loaded } = await TracklistModel();
    if (!loaded) {
      return false;
    }

    for (const obj of objs) {
      console.log("obj",obj)
      if (obj.id) {
        obj.id = obj.id.toUpperCase();
      }
      await store?.put(obj);
    }

    await tx?.done;
    console.log("เพิ่มข้อมูลเพลง");
    return true;
    console.log("addTracklistsToDatabase Objects saved successfully");
  } catch (error) {
    console.error(
      "addTracklistsToDatabase Error saving objects to database:",
      error
    );
    return false;
  }
};

export const getTracklistToJson = async (): Promise<SearchResult[]> => {
  try {
    const { store, tx, loaded } = await TracklistModel();

    if (!loaded) {
      return [];
    }

    const lists = await store?.getAll();

    const allData: SearchResult[] = lists ?? [];
    await tx?.done;

    return allData;
  } catch (error) {
    console.error("Error retrieving data from database:", error);
    return [];
  }
};

export const saveTracklistToStorage = async (
  files: Map<string, File>,
  onProgress?: (progress?: IProgressBar) => void
) => {
  const countSuperZip = Array.from(files.entries()).map(([key, value]) => ({
    key: value.name,
    value,
  }));
  await storageAddAll(countSuperZip, STORAGE_KARAOKE_EXTREME, onProgress);
  return { result: true };
};

export const saveTrackList = async (file: File) => {
  return await storageAdd(TRACKLIST_FILENAME, file, STORAGE_NAME_DIC);
};

export const getTrackList = async () => {
  return await storageGet<File>(TRACKLIST_FILENAME, STORAGE_NAME_DIC);
};
