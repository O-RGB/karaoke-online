import { BaseSongsSystemReader } from "@/features/songs/base";
import {
  ITrackData,
  MasterIndex,
  PreviewChunk,
  KaraokeExtension,
} from "@/features/songs/types/songs.type";
import { DBFParser } from "@/lib/karaoke/dbf";
import { DBFHeader } from "@/lib/karaoke/dbf/types/dbf-type";
import { parseEMKFile } from "@/lib/karaoke/emk";
import FileSystemManager from "@/utils/file/file-system";

export class DBFSongsSystemReader extends BaseSongsSystemReader {
  private dbfParser: DBFParser | null = null;
  private fileSystemManager: FileSystemManager;
  private fileBuffer: ArrayBuffer | undefined = undefined;
  private dbfFilePath: string;
  private header: DBFHeader | null = null;

  constructor(fileSystemManager: FileSystemManager, dbfFilePath: string) {
    super();
    this.fileSystemManager = fileSystemManager;
    this.dbfFilePath = dbfFilePath;
  }

  // --- Data Source Methods (Unchanged) ---
  async initializeDataSource(): Promise<void> {
    try {
      const fileData = await this.fileSystemManager.getFileByPath(
        this.dbfFilePath
      );
      if (!fileData) {
        throw new Error(`DBF file not found at path: ${this.dbfFilePath}`);
      }
      this.fileBuffer = await fileData.arrayBuffer();
      this.dbfParser = new DBFParser();
      this.header = await this.dbfParser.parseHeader(this.fileBuffer);
      console.log("DBF data source initialized successfully.");
    } catch (error) {
      console.error("Failed to initialize DBF data source:", error);
      throw error;
    }
  }

  async getTotalRecords(): Promise<number> {
    if (!this.header) {
      throw new Error(
        "DBF header not initialized. Call initializeDataSource first."
      );
    }
    return this.header.recordCount;
  }

  async getRecordsBatch(
    startIndex: number,
    endIndex: number
  ): Promise<ITrackData[]> {
    if (!this.dbfParser || !this.fileBuffer || !this.header) {
      throw new Error("DBF parser or data not initialized.");
    }
    const records = await this.dbfParser.parseRecords(
      this.fileBuffer,
      this.header,
      startIndex,
      endIndex
    );
    return records.map((record, index) => ({
      ...record,
      _originalIndex: startIndex + index,
    }));
  }

  // --- V6 Persistence Methods ---
  async saveMasterIndex(masterIndex: MasterIndex): Promise<void> {
    const filePath = "Data/master_index_v6.json";
    await this.fileSystemManager.createFile(
      filePath,
      JSON.stringify(masterIndex)
    );
  }

  async loadMasterIndex(): Promise<MasterIndex | null> {
    const filePath = "Data/master_index_v6.json";
    try {
      const indexFile = await this.fileSystemManager.getFileByPath(filePath);
      const indexContent = await indexFile?.text();
      return indexContent ? (JSON.parse(indexContent) as MasterIndex) : null;
    } catch (error) {
      return null;
    }
  }

  async savePreviewChunk(
    chunkId: number,
    chunkData: PreviewChunk
  ): Promise<void> {
    const filePath = `Data/preview_chunk_v6/${chunkId}.json`;
    await this.fileSystemManager.createFile(
      filePath,
      JSON.stringify(chunkData)
    );
  }

  async loadPreviewChunk(chunkId: number): Promise<PreviewChunk | null> {
    const filePath = `Data/preview_chunk_v6/${chunkId}.json`;
    try {
      const chunkFile = await this.fileSystemManager.getFileByPath(filePath);
      const chunkContent = await chunkFile?.text();
      return chunkContent ? (JSON.parse(chunkContent) as PreviewChunk) : null;
    } catch (error) {
      return null;
    }
  }

  // --- Full Data Fetching Methods (Unchanged) ---
  async getRecordByOriginalIndex(index: number): Promise<ITrackData | null> {
    if (index < 0) return null;
    const records = await this.getRecordsBatch(index, index + 1);
    return records && records.length > 0 ? records[0] : null;
  }

  public async getSong(
    trackData: ITrackData
  ): Promise<KaraokeExtension | undefined> {
    const { CODE, TYPE, SUB_TYPE } = trackData;
    if (!CODE || !TYPE || !SUB_TYPE) {
      console.warn(
        "TrackData is missing required fields for getSong",
        trackData
      );
      return undefined;
    }

    const foldername = CODE.length > 0 ? CODE[0] : undefined;
    if (!foldername) return undefined;

    const primaryPath = `Songs/${TYPE}/${SUB_TYPE}`;

    if (SUB_TYPE === "EMK") {
      const emk = await this.getFile(
        `${primaryPath}/${foldername}/${CODE}.emk`,
        `${primaryPath}/${CODE}.emk`
      );
      if (emk) {
        const emkDecoded = await parseEMKFile(emk);
        if (emkDecoded.mid && emkDecoded.cur && emkDecoded.lyr) {
          return {
            midi: emkDecoded.mid,
            cur: emkDecoded.cur,
            lyr: emkDecoded.lyr,
          };
        }
      }
    } else if (SUB_TYPE === "NCN") {
      const midi = await this.getFile(
        `${primaryPath}/Song/${foldername}/${CODE}.mid`,
        `${primaryPath}/Song/${CODE}.mid`
      );
      const lyr = await this.getFile(
        `${primaryPath}/Lyrics/${foldername}/${CODE}.lyr`,
        `${primaryPath}/Lyrics/${CODE}.lyr`
      );
      const cur = await this.getFile(
        `${primaryPath}/Cursor/${foldername}/${CODE}.cur`,
        `${primaryPath}/Cursor/${CODE}.cur`
      );
      if (midi && lyr && cur) {
        return { midi, lyr, cur };
      }
    }
    return undefined;
  }

  // --- Helper Methods (Unchanged) ---
  private async getFile(
    path: string,
    secondaryPath: string
  ): Promise<File | undefined> {
    const primaryFile = await this.fileSystemManager.getFileByPath(path);
    if (primaryFile) {
      return primaryFile;
    }
    return this.fileSystemManager.getFileByPath(secondaryPath);
  }

  public getDBFHeader(): DBFHeader | null {
    return this.header;
  }
}
