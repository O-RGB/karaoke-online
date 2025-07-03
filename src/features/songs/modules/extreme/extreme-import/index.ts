import {
  EMK_FILE_TYPE,
  MID_FILE_TYPE,
  CUR_FILE_TYPE,
  LYR_FILE_TYPE,
} from "@/config/value";
import { BaseSongsSystemReader } from "@/features/songs/base/index-search";
import {
  ITrackData,
  PreviewChunk,
  MasterIndex,
  KaraokeExtension,
} from "@/features/songs/types/songs.type";

import { parseEMKFile } from "@/lib/karaoke/emk";
import { extractFile } from "@/lib/zip";
import {
  MasterIndexLocalSongsManager,
  ChunkDataLocalSongsManager,
  FilesLocalSongsManager,
} from "@/utils/indexedDB/db/local-songs/table";

export class PythonIndexReader extends BaseSongsSystemReader {
  getTotalRecords(): Promise<number> {
    throw new Error("Method not implemented.");
  }
  getRecordsBatch(startIndex: number, endIndex: number): Promise<ITrackData[]> {
    throw new Error("Method not implemented.");
  }
  getRecordByOriginalIndex(index: number): Promise<ITrackData | null> {
    throw new Error("Method not implemented.");
  }
  private chunkDataDb: ChunkDataLocalSongsManager;
  private masterIndexDb: MasterIndexLocalSongsManager;
  private filesDb: FilesLocalSongsManager;

  constructor() {
    super();
    this.chunkDataDb = new ChunkDataLocalSongsManager();
    this.masterIndexDb = new MasterIndexLocalSongsManager();
    this.filesDb = new FilesLocalSongsManager();
  }

  public async importIndexFromZip(
    zipFile: File,
    setProgress?: (progress: { loaded: number; total: number }) => void
  ): Promise<void> {
    console.log("Starting index import from ZIP file...");

    const files = await extractFile(zipFile);
    const totalFiles = files.length;
    console.log(`Found ${totalFiles} files in the index archive.`);

    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      const filePath = file.name;

      if (filePath.startsWith("Data/master_index_v6.json")) {
        try {
          const masterIndexText = await file.text();
          const masterIndex: MasterIndex = JSON.parse(masterIndexText);
          await this.saveMasterIndex(masterIndex);
          console.log("Successfully imported and saved master index.");
        } catch (error) {
          console.error(
            `Error parsing or saving master index file ${filePath}:`,
            error
          );
        }
      } else if (filePath.startsWith("Data/preview_chunk_v6/")) {
        const chunkIdMatch = filePath.match(/(\d+)\.json$/);
        if (chunkIdMatch) {
          const chunkId = parseInt(chunkIdMatch[1], 10);
          try {
            const chunkText = await file.text();
            const chunkData: PreviewChunk = JSON.parse(chunkText);
            await this.savePreviewChunk(chunkId, chunkData);
          } catch (error) {
            console.error(
              `Error parsing or saving preview chunk file ${filePath}:`,
              error
            );
          }
        }
      }
      setProgress?.({ loaded: i + 1, total: totalFiles });
    }

    await this.loadIndex();
    console.log("Index import complete and loaded into memory.");
  }

  public override async initializeDataSource(): Promise<void> {
    console.log("Python Index Reader (Optimized, IndexedDB) is initialized.");
  }

  public override async loadIndex(): Promise<boolean> {
    const masterIndex = await this.loadMasterIndex();
    if (!masterIndex || !masterIndex.words || !masterIndex.wordToChunkMap) {
      console.error("Failed to load V6 master index or index is corrupted.");
      return false;
    }
    await this.initializeDataSource();

    this.sortedWords = masterIndex.words;
    this.wordToChunkMap = masterIndex.wordToChunkMap;

    return true;
  }

  public override async loadMasterIndex(): Promise<MasterIndex | null> {
    const record = await this.masterIndexDb.get(1);
    return record ? record.data : null;
  }

  public override async saveMasterIndex(
    masterIndex: MasterIndex
  ): Promise<void> {
    await this.masterIndexDb.add({
      id: 1,
      data: masterIndex,
      createdAt: new Date(),
    });
  }

  public override async loadPreviewChunk(
    chunkId: number
  ): Promise<PreviewChunk | null> {
    const record = await this.chunkDataDb.get(chunkId);
    return record ? (record.data as PreviewChunk) : null;
  }

  public override async savePreviewChunk(
    chunkId: number,
    chunkData: PreviewChunk
  ): Promise<void> {
    await this.chunkDataDb.add({
      id: chunkId,
      data: chunkData,
      createdAt: new Date(),
    });
  }

  public override async getSong(
    trackData: ITrackData
  ): Promise<KaraokeExtension<File> | undefined> {
    if (
      trackData._superIndex === undefined ||
      trackData._originalIndex === undefined
    ) {
      console.error(
        "Cannot get song: _superIndex or _originalIndex is missing.",
        trackData
      );
      return;
    }

    const superFileEntry = await this.filesDb.get(trackData._superIndex);

    if (!superFileEntry || !superFileEntry.file) {
      console.error(
        `Super-archive file not found in DB for index ${trackData._superIndex}`
      );
      return;
    }

    const filesInSuperZip = await extractFile(superFileEntry.file);

    const targetFileNamePrefix = `${trackData._originalIndex}.`;
    let fileFound: File | undefined;

    for (const file of filesInSuperZip) {
      if (file.name.startsWith(targetFileNamePrefix)) {
        fileFound = file;
        break;
      }
    }

    if (!fileFound) {
      console.error(
        `Song file with originalIndex ${trackData._originalIndex} not found inside super-archive ${trackData._superIndex}. Available files:`,
        filesInSuperZip.map((f) => f.name)
      );
      return;
    }

    if (fileFound.name.endsWith(EMK_FILE_TYPE)) {
      const { mid, cur, lyr } = await parseEMKFile(fileFound);
      if (mid && cur && lyr) {
        return { cur, lyr, midi: mid };
      }
    } else if (fileFound.name.endsWith(".zip")) {
      const innerFiles = await extractFile(fileFound);
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
    }
    return undefined;
  }

  public async getAllPreviewChunkIds(): Promise<IDBValidKey[]> {
    return this.chunkDataDb.getAllIds();
  }

  public async getMasterIndexFileId(): Promise<IDBValidKey[]> {
    return this.masterIndexDb.getAllIds();
  }

  protected override findFirstWordWithPrefix(prefix: string): number {
    let low = 0;
    let high = this.sortedWords.length - 1;
    let result = -1;

    while (low <= high) {
      const mid = Math.floor(low + (high - low) / 2);
      const currentWord = this.sortedWords[mid];

      if (currentWord.startsWith(prefix)) {
        result = mid;
        high = mid - 1;
      } else if (currentWord < prefix) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return result;
  }
}
