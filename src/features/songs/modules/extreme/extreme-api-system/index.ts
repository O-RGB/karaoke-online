import { MID_FILE_TYPE, CUR_FILE_TYPE, LYR_FILE_TYPE } from "@/config/value";
import { BaseSongsSystemReader } from "@/features/songs/base/index-search";
import {
  MasterIndex,
  PreviewChunk,
  ITrackData,
  KaraokeExtension,
  SearchOptions,
} from "@/features/songs/types/songs.type";
import { parseEMKFile } from "@/lib/karaoke/emk";
import { extractFile } from "@/lib/zip";

export class ApiSongsSystemReader extends BaseSongsSystemReader {
  private baseUrl: string = "http://127.0.0.1:5005";

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

  async getSong(
    trackData: ITrackData
  ): Promise<KaraokeExtension<File> | undefined> {
    if (
      trackData._superIndex === undefined ||
      trackData._originalIndex === undefined
    ) {
      console.error("Missing index information in trackData", trackData);
      return undefined;
    }

    try {
      const url = `${this.baseUrl}/get_song?superIndex=${trackData._superIndex}&originalIndex=${trackData._originalIndex}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to get song: ${response.statusText}`);
      }

      const blob = await response.blob();

      const contentType = response.headers.get("Content-Type");
      let extension: "zip" | "emk" = "emk";
      let filename = `song_${trackData._originalIndex}.emk`;
      const file = new File([blob], filename, { type: blob.type });

      if (contentType === "application/zip") {
        extension = "zip";
        filename = `${trackData._originalIndex}.zip`;

        const innerFiles = await extractFile(file);
        let mid: File | undefined;
        let cur: File | undefined;
        let lyr: File | undefined;

        for (const innerFile of innerFiles) {
          if (innerFile.name.endsWith(MID_FILE_TYPE)) mid = innerFile;
          else if (innerFile.name.endsWith(CUR_FILE_TYPE)) cur = innerFile;
          else if (innerFile.name.endsWith(LYR_FILE_TYPE)) lyr = innerFile;
        }

        if (mid && cur && lyr) {
          return { cur, lyr, midi: mid };
        }
      } else {
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
      const url = `${this.baseUrl}/search?q=${query}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to get song: ${response.statusText}`);
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
      console.error("Error getting song file:", error);
      return [];
    }
    return [];
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
