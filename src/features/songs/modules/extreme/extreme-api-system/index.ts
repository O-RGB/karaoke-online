import { API_BASE_URL } from "@/components/modal/append-song/tabs/add-api/karaoke-api-system/config/value";
import { decodeImageFromUrl } from "@/components/modal/append-song/tabs/add-api/karaoke-api-system/lib/decodeImageFromUrl";
import { fetchAPI } from "@/components/modal/append-song/tabs/add-api/karaoke-api-system/lib/fetch";
import { MusicSearch } from "@/components/modal/append-song/tabs/add-api/karaoke-api-system/types";
import { BaseSongsSystemReader } from "@/features/songs/base/index-search";
import {
  MasterIndex,
  PreviewChunk,
  ITrackData,
  KaraokeExtension,
  SearchOptions,
} from "@/features/songs/types/songs.type";
import { groupFilesByBaseName } from "@/lib/karaoke/read";
import { extractFile } from "@/lib/zip";

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
    // if (trackData._musicId === undefined) {
    //   console.error("Missing index information in trackData", trackData);
    //   return undefined;
    // }

    try {
      const blob = await fetchAPI<null, Blob>(
        `${API_BASE_URL}/get_song?superIndex=${trackData._superIndex}&originalIndex=${trackData._originalIndex}`,
        {
          method: "GET",
          responseType: "blob",
        }
      );

      let song: File[] = [];
      if (blob.type === "application/zip") {
        let unzip = new File([blob], `song_${trackData._originalIndex}.zip`, {
          type: blob.type,
        });
        song = await extractFile(unzip);
      } else if (blob.type === "application/octet-stream") {
        song = [
          new File([blob], `song_${trackData._originalIndex}.emk`, {
            type: blob.type,
          }),
        ];
      }

      const res: KaraokeExtension[] = groupFilesByBaseName(song);
      console.log(res);

      if (res.length === 1) {
        return res[0];
      }

      return undefined;

      //get_song?superIndex=4284&originalIndex=85687

      // const response = await fetchAPI<{}, MusicSearch>(
      //   `${API_BASE_URL}/music/${trackData._musicId}`,
      //   {
      //     method: "GET",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //   }
      // );

      // fetch(`${API_BASE_URL}/music/${trackData._musicId}/play`, {
      //   method: "POST",
      // }).catch((err) => console.error("Failed to update play count:", err));

      // const direct_link = response.direct_link;

      // const match = direct_link.match(/\/d\/([a-zA-Z0-9_-]+)/);
      // const fileId = match ? match[1] : null;

      // const newUrl = fileId
      //   ? `https://lh3.googleusercontent.com/d/${fileId}`
      //   : null;

      // if (!newUrl) throw "Url Invalid";
      // const zip = await decodeImageFromUrl(newUrl);
      // const files = await extractFile(zip);
      // const extensions = groupFilesByBaseName(files);
      // console.log("extensions", extensions);
      // if (extensions.length === 1) {
      //   return extensions[0];
      // }
    } catch (error) {
      console.error(error);
      alert(error);
      // fetch(`${API_BASE_URL}/music/${trackData._musicId}/report-broken-link`, {
      //   method: "POST",
      // }).catch((err) =>
      //   alert(`Failed to update play count: ${JSON.stringify(err)}`)
      // );

      return undefined;
    }
  }

  async search(query: string, options?: SearchOptions): Promise<ITrackData[]> {
    try {
      const response = await fetchAPI<{}, any[]>(
        `${API_BASE_URL}/search?q=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // const response = await fetchAPI<{}, MusicSearch[]>(
      //   `${API_BASE_URL}/search?q=${encodeURIComponent(query)}`,
      //   {
      //     method: "GET",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //   }
      // );

      const finalRecords: ITrackData[] = response.map((item) => {
        return {
          TITLE: item.TITLE,
          ARTIST: item.ARTIST,
          ALBUM: item.album,
          CODE: item.music_code,
          _musicPlayCount: item.play_count,
          _musicLike: item.like_count,
          _musicUploader: item.uploader_name,
          _musicId: item.id,
          _originalIndex: item._originalIndex,
          _superIndex: item._superIndex,
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
