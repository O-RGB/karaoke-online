// File: (Updated) features/songs/readers/ApiSongsSystemReader.ts
import { MID_FILE_TYPE, CUR_FILE_TYPE, LYR_FILE_TYPE } from "@/config/value";
import { BaseSongsSystemReader } from "@/features/songs/base/index-search";
import {
  MasterIndex,
  PreviewChunk,
  ITrackData,
  KaraokeExtension,
  SearchOptions,
} from "@/features/songs/types/songs.type";
import { parseEMKFile } from "@/lib/karaoke/songs/emk";
import { extractFile } from "@/lib/zip";

// ไม่จำเป็นต้องใช้ baseUrl จาก config แล้ว เพราะเราจะเรียกไปยัง API ภายในของเราเอง
// const baseUrl = "/api"; // หรือจะกำหนดแบบนี้ก็ได้

export class ApiSongsSystemReader extends BaseSongsSystemReader {
  constructor() {
    super();
  }

  async initializeDataSource(): Promise<void> {}

  async loadMasterIndex(): Promise<MasterIndex | null> {
    return null;
  }

  async loadPreviewChunk(chunkId: number): Promise<PreviewChunk | null> {
    return null;
  }

  async getSong(trackData: ITrackData): Promise<KaraokeExtension | undefined> {
    if (
      trackData._superIndex === undefined ||
      trackData._originalIndex === undefined
    ) {
      console.error("Missing index information in trackData", trackData);
      return undefined;
    }

    try {
      // *** CHANGED HERE ***
      // เปลี่ยน URL ให้ชี้ไปยัง API route ของเรา
      const url = `/api/get_song?superIndex=${trackData._superIndex}&originalIndex=${trackData._originalIndex}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to get song: ${response.statusText}`);
      }

      const blob = await response.blob();
      const contentType = response.headers.get("Content-Type");
      let filename = `song_${trackData._originalIndex}`;
      let file: File;

      if (contentType === "application/zip") {
        filename = `${trackData._originalIndex}.zip`;
        file = new File([blob], filename, { type: "application/zip" });
        const innerFiles = await extractFile(file);
        let mid: File | undefined, cur: File | undefined, lyr: File | undefined;

        for (const innerFile of innerFiles) {
          if (innerFile.name.endsWith(MID_FILE_TYPE)) mid = innerFile;
          else if (innerFile.name.endsWith(CUR_FILE_TYPE)) cur = innerFile;
          else if (innerFile.name.endsWith(LYR_FILE_TYPE)) lyr = innerFile;
        }

        if (mid && cur && lyr) {
          return { cur, lyr, midi: mid };
        }
      } else {
        // Assume EMK
        filename = `${trackData._originalIndex}.emk`;
        file = new File([blob], filename, { type: "application/octet-stream" });
        const emkDecoded = await parseEMKFile(file);
        if (emkDecoded.mid && emkDecoded.cur && emkDecoded.lyr) {
          return {
            midi: emkDecoded.mid,
            cur: emkDecoded.cur,
            lyr: emkDecoded.lyr,
          };
        }
      }
    } catch (error) {
      console.error("Error getting song file:", error);
      return undefined;
    }
  }

  async search(query: string, options?: SearchOptions): Promise<ITrackData[]> {
    try {
      // *** CHANGED HERE ***
      // เปลี่ยน URL ให้ชี้ไปยัง API route ของเรา
      const url = `/api/search?q=${encodeURIComponent(query)}`;
      const response = await fetch(url);

      if (!response.ok) {
        // ลองอ่าน body ของ error เพื่อ debug ได้ง่ายขึ้น
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to parse error response" }));
        throw new Error(
          `Failed to search: ${response.statusText} - ${JSON.stringify(
            errorData
          )}`
        );
      }

      const tracklist: ITrackData[] = await response.json();

      const finalRecords: ITrackData[] = tracklist.map(
        (item) =>
          ({
            TITLE: item.TITLE,
            ARTIST: item.ARTIST,
            _originalIndex: item._originalIndex,
            _superIndex: item._superIndex,
            _priority: item._priority,
            _system: "PYTHON_API_SYSTEM",
          } as ITrackData)
      );

      return finalRecords;
    } catch (error) {
      console.error("Error searching songs:", error);
      return [];
    }
  }

  async getTotalRecords(): Promise<number> {
    return 0;
  }

  async getRecordByOriginalIndex(index: number): Promise<ITrackData | null> {
    console.warn("getRecordByOriginalIndex is not implemented in the API.");
    return null;
  }

  async getRecordsBatch(
    startIndex: number,
    endIndex: number
  ): Promise<ITrackData[]> {
    console.error("getRecordsBatch is not supported by ApiSongsSystemReader.");
    throw new Error(
      "Operation not supported: Cannot get raw records batch from API."
    );
  }

  async saveMasterIndex(masterIndex: MasterIndex): Promise<void> {
    console.error("saveMasterIndex is not supported by ApiSongsSystemReader.");
    throw new Error(
      "Operation not supported: Client cannot save master index."
    );
  }

  async savePreviewChunk(
    chunkId: number,
    chunkData: PreviewChunk
  ): Promise<void> {
    console.error("savePreviewChunk is not supported by ApiSongsSystemReader.");
    throw new Error(
      "Operation not supported: Client cannot save preview chunks."
    );
  }
}
