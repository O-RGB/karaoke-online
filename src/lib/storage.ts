import { STORAGE_NAME } from "@/config/value";
import { getDB } from "@/utils/database/db";
import { directoryOpen } from "browser-fs-access";
import { ExtractFile } from "./zip";
import TrieSearch from "trie-search";

// ON RAM

const filterFileUse = (fileList: File[]) => {
  console.log(fileList);
  let tracklist: File | undefined = undefined;
  const musicLibrary = new Map<string, File>();
  fileList.map((item) => {
    console.log(item.name);
    if (item.name.endsWith(".json")) {
      tracklist = item;
    }
    if (item.name.endsWith(".zip")) {
      let filename = item.name.replace(".zip", "");
      musicLibrary.set(filename, item);
    }
  });
  console.log("tracklist ", tracklist);
  if (tracklist) {
    return { musicLibrary, tracklist: tracklist as File };
  } else {
    return undefined;
  }
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

    if (data) {
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
  try {
    const db = await getDB(STORAGE_NAME);
    const tx = db.transaction(STORAGE_NAME, "readonly");
    const store = tx.objectStore(STORAGE_NAME);
    const data = await store.get(key);

    await tx.done;
    if (data) {
      return data;
    } else {
      return undefined;
    }
  } catch (error) {
    return undefined;
  }
};

export const saveSongToStorage = async (
  files: Map<string, File>,
  tracklist: File,
  onProgress?: (progress?: IProgressBar) => void
) => {
  const countSuperZip = Array.from(files.values());
  console.log("get file in map");
  const db = await getDB(STORAGE_NAME);

  const tx = db.transaction(STORAGE_NAME, "readwrite");
  const objectStore = tx.objectStore(STORAGE_NAME);

  countSuperZip.map(async (data, i) => {
    let error: string | undefined = undefined;
    try {
      console.log("add to store");
      await objectStore.add(data, data.name);
    } catch (e) {
      error = JSON.stringify(e);
    }
    onProgress?.({
      progress: Math.round(((i + 1) / countSuperZip.length) * 100),
      processing: data?.name,
      error: error,
    });
  });
  await objectStore.add(tracklist, tracklist.name);
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
  console.log("save song to storage");
  return true;
};

export const storageIsEmpty = async () => {
  const db = await getDB(STORAGE_NAME);
  const transaction = db.transaction(STORAGE_NAME, "readonly");
  const store = transaction.objectStore(STORAGE_NAME);
  const count = await store.count();
  return count <= 0;
};
