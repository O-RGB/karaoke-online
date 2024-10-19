import { getDB } from "@/utils/database/db";
import { IDBPDatabase, IDBPObjectStore, IDBPTransaction } from "idb";

// MODEL

export async function storageGet<T = any>(
  key: string | number,
  storage_name: string,
  mode: "readonly" = "readonly"
): Promise<IndexedDbReslut<T | undefined>> {
  try {
    const db = await getDB(storage_name, true);
    const tx = db.transaction(storage_name, mode);
    const store = tx.objectStore(storage_name);
    const data = await store.get(key);
    await tx.done;
    if (data) {
      return data as IndexedDbReslut<T>;
    } else {
      return { value: undefined } as IndexedDbReslut<T>;
    }
  } catch (error) {
    return { value: undefined } as IndexedDbReslut<T>;
  }
}

export async function storageGetAll<T = any[]>(
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

// export async function storageGetAllKeys(storage_name: string) {
//   try {
//     const db = await getDB(storage_name);
//     const tx = db.transaction(storage_name, "readonly");
//     const store = tx.objectStore(storage_name);
//     const keys = await store.getAllKeys();

//     await tx.done;
//     return keys;
//   } catch (error) {
//     console.error("Error retrieving keys:", error);
//     return [];
//   }
// }

export async function storageGetAllKeys(
  storage_name: string,
  limit?: number,
  offset?: number
) {
  try {
    const db = await getDB(storage_name);
    const tx = db.transaction(storage_name, "readonly");
    const store = tx.objectStore(storage_name);

    let keys: IDBValidKey[];

    if (limit !== undefined || offset !== undefined) {
      // If limit or offset is provided, use cursor to get specific range
      const allKeys: IDBValidKey[] = [];
      let cursor = await store.openKeyCursor();
      let count = 0;

      while (cursor) {
        if (offset === undefined || count >= offset) {
          allKeys.push(cursor.key);
          if (limit !== undefined && allKeys.length >= limit) {
            break;
          }
        }
        count++;
        cursor = await cursor.continue();
      }
      keys = allKeys;
    } else {
      // If no limit or offset, get all keys
      keys = await store.getAllKeys();
    }

    await tx.done;
    return keys;
  } catch (error) {
    console.error("Error retrieving keys:", error);
    return [];
  }
}

export async function findKeyOffset(
  storage_name: string,
  targetKey: IDBValidKey,
  limit: number
): Promise<number> {
  try {
    const db = await getDB(storage_name);
    const tx = db.transaction(storage_name, "readonly");
    const store = tx.objectStore(storage_name);

    let totalCount = 0;
    let currentOffset = 0;
    let cursor = await store.openKeyCursor();

    while (cursor) {
      if (cursor.key === targetKey) {
        const offsetWithinCurrentPage = totalCount % limit;
        const pageOffset = Math.floor(totalCount / limit) * limit;
        await tx.done;
        return pageOffset + offsetWithinCurrentPage;
      }
      totalCount++;
      cursor = await cursor.continue();
    }

    await tx.done;
    return -1; // Key not found
  } catch (error) {
    console.error("Error finding key offset:", error);
    return -1;
  }
}

export async function storageAdd(
  key: string,
  value: any,
  storage_name: string,
  mode: "readwrite" = "readwrite"
) {
  try {
    const db = await getDB(storage_name);
    const tx = db.transaction(storage_name, mode);
    const store = tx.objectStore(storage_name);
    await store.add(value, key);

    await tx.done;
    return true;
  } catch (error) {
    console.error("Error saving data:", error);
    return false;
  }
}

export async function Add(
  model: () => Promise<{
    store?: IDBPObjectStore<any, any, any, "readwrite">;
    tx?: IDBPTransaction<any, any, any>;
    db?: IDBPDatabase<any>;
    loaded: boolean;
  }>,
  value: { id: string; obj: any }
) {
  try {
    const { tx, store, loaded } = await model();
    if (!loaded) {
      return false;
    }
    store?.add(value.obj, value.id);
    await tx?.done;
    return true;
  } catch (error) {
    return false;
  }
}

export async function storageAddAll(
  list: { key: string; value: any }[],
  storage_name: string,
  onProgress?: (progress?: IProgressBar) => void,
  mode: "readwrite" = "readwrite"
) {
  const db = await getDB(storage_name, true);
  const tx = db.transaction(storage_name, mode);
  const store = tx.objectStore(storage_name);
  let error = undefined;

  for (let i = 0; i < list.length; i++) {
    try {
      await store.put({ value: list[i].value, id: list[i].key });
    } catch (e) {
      error = JSON.stringify(e);
      if (error === "{}") {
        error = undefined;
      }
      onProgress?.({
        title: "เกิดข้อผิดพลาด",
        progress: Math.round(((i + 1) / list.length) * 100),
        processing: list[i]?.key,
        error: error,
        show: true,
      });
      // หยุดการทำงานทันทีเมื่อเกิด error
      throw new Error(`Failed to write to IndexedDB: ${error}`);
    }
    onProgress?.({
      title: "กำลังทำงาน...",
      progress: Math.round(((i + 1) / list.length) * 100),
      processing: list[i]?.key,
      error: error,
      show: true,
    });
  }

  if (!error) {
    onProgress?.({
      title: "เสร็จสิ้น",
      progress: 100,
      processing: undefined,
      error: undefined,
      show: true,
    });
  }

  await tx.done;
  return true;
}

export async function storageDelete(
  key: string,
  storage_name: string,
  mode: "readwrite" = "readwrite"
) {
  try {
    const db = await getDB(storage_name);
    const tx = db.transaction(storage_name, mode);
    const store = tx.objectStore(storage_name);
    await store.delete(key);

    await tx.done;
    return true;
  } catch (error) {
    return false;
  }
}

export async function sortageDeleteAll(
  storage_name: string,
  mode: "readwrite" = "readwrite"
) {
  try {
    const db = await getDB(storage_name);
    const tx = db.transaction(storage_name, mode);
    const store = tx.objectStore(storage_name);
    await store.clear();

    await tx.done;
    return true;
  } catch (error) {
    console.error("Error deleting all data:", error);
    return false;
  }
}
