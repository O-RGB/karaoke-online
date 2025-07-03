import { extractFile, zipFiles } from "@/lib/zip";
import { TrieSearchService } from "@/lib/trie-search";
import { parseEMKFile } from "@/lib/karaoke/emk";
import {
  ITrackData,
  KaraokeDecoded,
  KaraokeExtension,
  SoundType,
  TrackDataAndFile,
} from "../../types/songs.type";
import {
  CUR_FILE_TYPE,
  EMK_FILE_TYPE,
  LYR_FILE_TYPE,
  MID_FILE_TYPE,
} from "@/config/value";
import {
  FilesUserSongsManager,
  TracklistUserSongsManager,
} from "@/utils/indexedDB/db/user-songs/table";

export interface DuplicateMatch {
  track: ITrackData;
  similarity: number;
  matchType: "CODE" | "TITLE_ARTIST" | "TITLE" | "LYRICS";
}

export class BaseUserSongsSystemReader {
  private tracklistUserSongsManager = new TracklistUserSongsManager();
  private filesUserSongsManager = new FilesUserSongsManager();
  private trieSearchService = TrieSearchService.getInstance();

  constructor() {
    this.initializeDataSource();
  }

  async initializeDataSource(): Promise<void> {
    const tracklists = await this.tracklistUserSongsManager.getAll();
    const tracklist = tracklists.map((tracklis) => tracklis.data);

    this.trieSearchService.addAll(tracklist);
  }

  convertToTrackData(decoded: KaraokeDecoded, type: SoundType): ITrackData {
    const [
      title,
      artist,
      key,
      space,
      lyr1,
      lyr2,
      lyr3,
      lyr4,
      lyr5,
      lyr6,
      lyr7,
    ] = decoded.lyr ?? [];

    return {
      CODE: decoded.fileName ?? "",
      TITLE: title,
      TYPE: type,
      ARTIST: artist,
      _originalIndex: 0,
      KEY: key,
      LYR_TITLE: `${lyr1} ${lyr2} ${lyr3} ${lyr4} ${lyr5} ${lyr6} ${lyr7}
      `,
    };
  }

  async addSong(add: TrackDataAndFile[]) {
    const zipeds: File[] = [];

    for (let index = 0; index < add.length; index++) {
      const data = add[index];
      let zipped = undefined;
      const isEmk = data.raw.emk;
      if (isEmk) {
        zipped = await zipFiles([isEmk], `zip-${index}`);
      } else {
        const raw = data.raw as KaraokeExtension<File>;
        zipped = await zipFiles([raw.cur, raw.lyr, raw.midi], `zip-${index}`);
      }

      if (zipped) {
        zipeds.push(zipped);
      }
    }

    const superZip = await zipFiles(zipeds, `super`);
    const onCreate = await this.filesUserSongsManager.add({ file: superZip });
    const id = onCreate.toString();

    for (let index = 0; index < add.length; index++) {
      const data = add[index];
      data.records._superIndex = Number(id);
      data.records._originalIndex = index;

      await this.tracklistUserSongsManager.add({ data: data.records });

      this.trieSearchService.add(data.records);
    }
  }

  async getSong(
    trackData: ITrackData
  ): Promise<KaraokeExtension<File> | undefined> {
    const { _originalIndex, _superIndex } = trackData;

    if (_superIndex === undefined) {
      console.warn("⚠️ _superIndex is undefined");
      return;
    }

    const fileStoreList = await this.filesUserSongsManager.get(_superIndex);
    if (!fileStoreList) {
      console.warn(`⚠️ No fileStoreList found for _superIndex: ${_superIndex}`);
      return;
    }

    const zipeds = await extractFile(fileStoreList.file);

    const zipped = zipeds[_originalIndex];
    if (!zipped) {
      console.warn(
        `⚠️ No zipped file found at _originalIndex: ${_originalIndex}`
      );
      return;
    }

    const files = await extractFile(zipped);

    if (files.length > 0) {
      const [file] = files;

      if (file.name.endsWith(EMK_FILE_TYPE)) {
        const { mid, cur, lyr } = await parseEMKFile(file);

        if (mid && cur && lyr) {
          return {
            cur,
            lyr,
            midi: mid,
          } as KaraokeExtension;
        } else {
          console.warn("❌ EMK file missing one or more required parts");
        }
      } else if (files.length === 3) {
        let mid = undefined;
        let cur = undefined;
        let lyr = undefined;

        for (let index = 0; index < files.length; index++) {
          const file = files[index];
          if (file.name.endsWith(MID_FILE_TYPE)) {
            mid = file;
          } else if (file.name.endsWith(CUR_FILE_TYPE)) {
            cur = file;
          } else if (file.name.endsWith(LYR_FILE_TYPE)) {
            lyr = file;
          }
        }

        if (mid && cur && lyr) {
          return { cur, lyr, midi: mid };
        } else {
          console.warn(
            "❌ One or more required files (MID, CUR, LYR) are missing"
          );
        }
      } else {
        console.warn("⚠️ Unknown file structure or unsupported file count");
      }
    } else {
      console.warn("❌ No files found after extracting zipped file");
    }
  }

  public checkDuplicate(trackData: KaraokeDecoded): boolean {
    const duplicates = this.checkDuplicateWithDetails(trackData);
    return duplicates.length > 0;
  }
  public checkDuplicateWithDetails(
    trackData: KaraokeDecoded
  ): DuplicateMatch[] {
    const convertedData = this.convertToTrackData(trackData, "MIDI");
    const { CODE, TITLE, ARTIST, LYR_TITLE } = convertedData;

    const allPotentialMatches: DuplicateMatch[] = [];

    if (CODE) {
      const codeResults = this.search(CODE);
      for (const result of codeResults) {
        if (result.CODE === CODE) {
          allPotentialMatches.push({
            track: result,
            similarity: 1.0,
            matchType: "CODE",
          });
        }
      }
    }

    if (TITLE && ARTIST) {
      const titleArtistResults = this.search(`${TITLE} ${ARTIST}`);
      for (const result of titleArtistResults) {
        if (
          result.TITLE?.toLowerCase().trim() === TITLE.toLowerCase().trim() &&
          result.ARTIST?.toLowerCase().trim() === ARTIST.toLowerCase().trim()
        ) {
          allPotentialMatches.push({
            track: result,
            similarity: 1.0,
            matchType: "TITLE_ARTIST",
          });
        }
      }
    }

    if (TITLE && TITLE.trim().length > 3) {
      const titleResults = this.search(TITLE);
      for (const result of titleResults) {
        if (!result.TITLE) continue;
        const similarity = this.calculateSimilarity(
          TITLE.toLowerCase().trim(),
          result.TITLE.toLowerCase().trim()
        );
        if (similarity >= 0.85) {
          allPotentialMatches.push({
            track: result,
            similarity,
            matchType: "TITLE",
          });
        }
      }
    }

    if (LYR_TITLE && LYR_TITLE.trim().length > 10) {
      const lyrResults = this.search(LYR_TITLE.substring(0, 50));
      for (const result of lyrResults) {
        if (!result.LYR_TITLE) continue;
        const similarity = this.calculateSimilarity(
          LYR_TITLE.toLowerCase().trim().substring(0, 100),
          result.LYR_TITLE.toLowerCase().trim().substring(0, 100)
        );
        if (similarity >= 0.8) {
          allPotentialMatches.push({
            track: result,
            similarity,
            matchType: "LYRICS",
          });
        }
      }
    }

    const bestMatches = new Map<string, DuplicateMatch>();
    const matchTypePriority = {
      CODE: 1,
      TITLE_ARTIST: 2,
      TITLE: 3,
      LYRICS: 4,
    };

    for (const currentMatch of allPotentialMatches) {
      const superIndex = currentMatch.track._superIndex;
      const originalIndex = currentMatch.track._originalIndex;

      if (superIndex === undefined || originalIndex === undefined) {
        continue;
      }

      const uniqueId = `${superIndex}-${originalIndex}`;

      const existingMatch = bestMatches.get(uniqueId);

      if (!existingMatch) {
        bestMatches.set(uniqueId, currentMatch);
      } else {
        const currentPriority = matchTypePriority[currentMatch.matchType];
        const existingPriority = matchTypePriority[existingMatch.matchType];

        if (currentPriority < existingPriority) {
          bestMatches.set(uniqueId, currentMatch);
        } else if (
          currentPriority === existingPriority &&
          currentMatch.similarity > existingMatch.similarity
        ) {
          bestMatches.set(uniqueId, currentMatch);
        }
      }
    }

    const uniqueResults = Array.from(bestMatches.values());

    return uniqueResults
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
  }

  private calculateSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1;
    if (str1.length === 0 || str2.length === 0) return 0;

    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + cost
        );
      }
    }

    const distance = matrix[str2.length][str1.length];
    const maxLength = Math.max(str1.length, str2.length);
    return 1 - distance / maxLength;
  }

  public search(query: string): ITrackData[] {
    return this.trieSearchService.search(query);
  }
}
