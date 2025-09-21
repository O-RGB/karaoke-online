// File: (Updated) features/songs/readers/ApiSongsSystemReader.ts
import { API_BASE_URL } from "@/components/modal/append-song/tabs/add-api/karaoke-api-system/config/value";
import { decodeImageFromUrl } from "@/components/modal/append-song/tabs/add-api/karaoke-api-system/lib/decodeImageFromUrl";
import { fetchAPI } from "@/components/modal/append-song/tabs/add-api/karaoke-api-system/lib/fetch";
import { MusicSearch } from "@/components/modal/append-song/tabs/add-api/karaoke-api-system/types";
import { MID_FILE_TYPE, CUR_FILE_TYPE, LYR_FILE_TYPE } from "@/config/value";
import { BaseSongsSystemReader } from "@/features/songs/base/index-search";
import {
  MasterIndex,
  PreviewChunk,
  ITrackData,
  KaraokeExtension,
  SearchOptions,
} from "@/features/songs/types/songs.type";
import { groupFilesByBaseName } from "@/lib/karaoke/read";
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
    if (trackData._musicId === undefined) {
      console.error("Missing index information in trackData", trackData);
      return undefined;
    }

    try {
      const response = await fetchAPI<{}, MusicSearch>(
        `${API_BASE_URL}/music/${trackData._musicId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const direct_link = response.direct_link;
      const zip = await decodeImageFromUrl(direct_link);
      const files = await extractFile(zip);
      const extensions = groupFilesByBaseName(files);
      if (extensions.length === 1) {
        return extensions[0];
      }
    } catch (error) {
      console.error("Error getting song file:", error);
      return undefined;
    }
  }

  async search(query: string, options?: SearchOptions): Promise<ITrackData[]> {
    try {
      const response = await fetchAPI<{}, MusicSearch[]>(
        `${API_BASE_URL}/search?q=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const finalRecords: ITrackData[] = response.map((item) => {
        return {
          TITLE: item.title,
          ARTIST: item.artist,
          ALBUM: item.album,
          CODE: item.music_code,
          _musicPlayCount: item.play_count,
          _musicLike: item.like_count,
          _musicUploader: item.uploader_name,
          _musicId: item.id,
          _originalIndex: 0,
          _superIndex: 0,
          _priority: 0,
          _system: "PYTHON_API_SYSTEM",
        } as ITrackData;
      });
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
