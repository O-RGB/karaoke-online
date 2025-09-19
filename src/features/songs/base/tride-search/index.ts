import { extractFile, zipFiles } from "@/lib/zip";
import { TrieSearchService } from "@/lib/trie-search";
import {
  ITrackData,
  KaraokeExtension,
  MusicLoadAllData,
} from "../../types/songs.type";
import {
  FilesUserSongsManager,
  TracklistUserSongsManager,
} from "@/utils/indexedDB/db/user-songs/table";
import { SoundSystemMode } from "@/features/config/types/config.type";
import { groupFilesByBaseName } from "@/lib/karaoke/read";

export interface DuplicateMatch {
  track: ITrackData;
  similarity: number;
  matchType: "CODE" | "TITLE_ARTIST" | "TITLE" | "LYRICS";
}

export class BaseUserSongsSystemReader {
  protected system: SoundSystemMode = "DATABASE_FILE_SYSTEM";
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

  async addSong(add: MusicLoadAllData[]) {
    const zipeds: File[] = [];

    for (let index = 0; index < add.length; index++) {
      const data = add[index];
      let zipped = undefined;

      const fileType = data.fileType;
      const emk = data.files.emk;
      const midi = data.files.midi;
      const lyr = data.files.lyr;
      const cur = data.files.cur;
      const mp3 = data.files.mp3;

      if (fileType === "emk" && emk) {
        zipped = await zipFiles([emk], `zip-${index}`);
      } else if (fileType === "midi") {
        if (midi && lyr && cur) {
          zipped = await zipFiles([midi, lyr, cur], `zip-${index}`);
        } else if (midi && !lyr && !cur) {
          zipped = await zipFiles([midi], `zip-${index}`);
        }
      } else if (fileType === "mp3" && mp3) {
        zipped = await zipFiles([mp3], `zip-${index}`);
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
      data.trackData._superIndex = Number(id);
      data.trackData._originalIndex = index;
      await this.tracklistUserSongsManager.add({ data: data.trackData });
      this.trieSearchService.add(data.trackData);
    }
  }

  async getSong(trackData: ITrackData): Promise<KaraokeExtension | undefined> {
    const { _originalIndex, _superIndex } = trackData;

    if (_superIndex === undefined) {
      console.warn("⚠️ _superIndex is undefined");
      return;
    }

    // console.log(trackData, _superIndex);
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

    const preprocess = groupFilesByBaseName(files);

    if (preprocess.length === 1) {
      return preprocess[0];
    }
    return;
  }

  public checkDuplicate(trackData: MusicLoadAllData): boolean {
    const duplicates = this.checkDuplicateWithDetails(trackData);
    return duplicates.length > 0;
  }
  public checkDuplicateWithDetails(
    trackData: MusicLoadAllData
  ): DuplicateMatch[] {
    const { CODE, TITLE, ARTIST, LYRIC_TITLE } = trackData.trackData;

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

    if (LYRIC_TITLE && LYRIC_TITLE.trim().length > 10) {
      const lyrResults = this.search(LYRIC_TITLE.substring(0, 50));
      for (const result of lyrResults) {
        if (!result.LYRIC_TITLE) continue;
        const similarity = this.calculateSimilarity(
          LYRIC_TITLE.toLowerCase().trim().substring(0, 100),
          result.LYRIC_TITLE.toLowerCase().trim().substring(0, 100)
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
    return this.trieSearchService
      .search(query)
      .map((x) => ({ ...x, _isUser: true }));
  }
}
