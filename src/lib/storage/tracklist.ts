import {
  STORAGE_EXTREME_SONG,
  STORAGE_EXTREME_TRACKLIST,
} from "@/config/value";
import { storageAddAll, storageGetAllKeys } from "../../utils/database/storage";
import {
  DriveExtremeTracklistModel,
  DriveTracklistSongModel,
  ExtremeTracklistModel,
  UserTracklistModel,
} from "@/utils/database/model";

export const createTrackList = (
  song: SongFiltsEncodeAndDecode,
  fileIndex: string,
  superFile: string,
  from: TracklistFrom
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
    from: from,
  } as SearchResult;
};

export const jsonTracklistToDatabase = async (
  file: File,
  tracklistStore: TracklistFrom,
  onProgress?: (progress?: IProgressBar) => void
): Promise<SearchResult[] | undefined> => {
  return new Promise(async (resolve) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      const jsonData = event.target?.result;

      if (typeof jsonData === "string") {
        try {
          const data: SearchResult[] = JSON.parse(jsonData);

          console.log("JSON parse length", data.length);

          await addTracklistsToDatabase(data, tracklistStore, onProgress);

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
    const { store, tx, loaded } = await ExtremeTracklistModel();
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

export const addTracklistsToDatabase = async (
  objs: SearchResult[],
  tracklistStore: TracklistFrom,
  onProgress?: (progress?: IProgressBar) => void
) => {
  try {
    let store: any = undefined;
    let tx: any = undefined;
    let loaded: any = undefined;

    if (tracklistStore === "DRIVE") {
      ({ store, tx, loaded } = await DriveTracklistSongModel());
    } else if (tracklistStore === "DRIVE_EXTHEME") {
      ({ store, tx, loaded } = await DriveExtremeTracklistModel());
    } else if (tracklistStore === "EXTHEME") {
      ({ store, tx, loaded } = await ExtremeTracklistModel());
    } else if (tracklistStore === "CUSTOM") {
      ({ store, tx, loaded } = await UserTracklistModel());
    }

    if (!loaded) {
      return false;
    }

    for (let i = 0; i < objs.length; i++) {
      let obj = objs[i];
      if (obj.id) {
        obj.id = `${obj.id}-${obj.fileId}`
        // obj.id = `${i + 1}`;
        obj.from = tracklistStore;
      }
      try {
        await store?.put(obj);
      } catch (error) {
        onProgress?.({
          progress: Math.round(((i + 1) / objs.length) * 100),
          title: "เกิดข้อผิดพลาด...",
          show: true,
          error: JSON.stringify(error),
        });
        break;
      } finally {
        onProgress?.({
          progress: Math.round(((i + 1) / objs.length) * 100),
          title: "กำลังประมวลผล...",
          show: true,
        });
      }
    }

    await tx?.done;
    return true;
  } catch (error) {
    console.error(
      "addTracklistsToDatabase Error saving objects to database:",
      error
    );
    return false;
  }
};

export const getTracklist = async (
  tracklistStores: TracklistFrom[] = [],
  limit?: number,
  offset?: number
): Promise<SearchResult[]> => {
  try {
    let allData: SearchResult[] = [];

    for (const storeName of tracklistStores) {
      let store: any;
      let tx: any;
      let loaded: any;
      if (storeName === "DRIVE") {
        ({ store, tx, loaded } = await DriveTracklistSongModel());
      } else if (storeName === "DRIVE_EXTHEME") {
        ({ store, tx, loaded } = await DriveExtremeTracklistModel());
      } else if (storeName === "EXTHEME") {
        ({ store, tx, loaded } = await ExtremeTracklistModel());
      } else if (storeName === "CUSTOM") {
        ({ store, tx, loaded } = await UserTracklistModel());
      }

      if (!loaded) {
        continue;
      }
      const lists = await store?.getAll();

      allData = allData.concat(lists ?? []);

      await tx?.done;
    }

    return allData;
  } catch (error) {
    console.error("Error retrieving data from database:", error);
    return [];
  }
};

export const getTracklistTest = async (
  tracklistStores: TracklistFrom[] = [],
  limit?: number,
  offset?: number
): Promise<{
  results: SearchResult[];
  totalCount: number;
  hasMore: boolean;
}> => {
  try {
    let allData: SearchResult[] = [];

    for (const storeName of tracklistStores) {
      let store: any;
      let tx: any;
      let loaded: any;

      if (storeName === "DRIVE") {
        ({ store, tx, loaded } = await DriveTracklistSongModel());
      } else if (storeName === "DRIVE_EXTHEME") {
        ({ store, tx, loaded } = await DriveExtremeTracklistModel());
      } else if (storeName === "EXTHEME") {
        ({ store, tx, loaded } = await ExtremeTracklistModel());
      } else if (storeName === "CUSTOM") {
        ({ store, tx, loaded } = await UserTracklistModel());
      }

      if (!loaded) {
        continue;
      }

      // Always get all data from each store
      const lists = await store?.getAll();
      allData = allData.concat(lists ?? []);

      await tx?.done;
    }

    const totalCount = allData.length;
    let results = allData;
    let hasMore = false;

    // Apply pagination if both limit and offset are provided
    if (limit !== undefined && offset !== undefined) {
      results = allData.slice(offset, offset + limit);
      hasMore = offset + limit < totalCount;
    }

    return { results, totalCount, hasMore };
  } catch (error) {
    console.error("Error retrieving data from database:", error);
    return { results: [], totalCount: 0, hasMore: false };
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
  await storageAddAll(countSuperZip, STORAGE_EXTREME_SONG, onProgress);
  return { result: true };
};

export const getAllKeyTracklist = async () => {
  return await storageGetAllKeys(STORAGE_EXTREME_TRACKLIST);
};
