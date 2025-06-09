import FileSystemManager from "@/utils/file/file-system";
import {
  ChunkData,
  ITrackData,
  KaraokeExtension,
} from "@/features/songs/types/songs.type";
import { DBFParser } from "@/lib/karaoke/dbf";
import { BaseSongsSystemReader } from "../../../base";
import { MasterIndex } from "../../../types/songs.type";
import { parseEMKFile } from "@/lib/karaoke/emk";

export class DBFSongsSystemReader extends BaseSongsSystemReader {
  private dbfParser: DBFParser | null = null;
  private fileSystemManager: FileSystemManager;
  private fileBuffer: ArrayBuffer | undefined = undefined;
  private dbfFilePath: string;
  private header: any = null;

  constructor(fileSystemManager: FileSystemManager, dbfFilePath: string) {
    super();
    this.fileSystemManager = fileSystemManager;
    this.dbfFilePath = dbfFilePath;
  }

  async initializeDataSource(): Promise<void> {
    try {
      const fileData = await this.fileSystemManager.getFileByPath(
        this.dbfFilePath
      );
      this.fileBuffer = await fileData?.arrayBuffer();

      this.dbfParser = new DBFParser();

      if (!this.fileBuffer) return;
      this.header = await this.dbfParser.parseHeader(this.fileBuffer);

      console.log("DBF data source initialized successfully", fileData);
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

  async saveChunkData(chunkData: ChunkData): Promise<void> {
    await this.fileSystemManager.createFile(
      `Data/chunk/${chunkData.chunkId}.json`,
      JSON.stringify(chunkData)
    );
  }

  async loadChunkData(chunkId: number): Promise<ChunkData | null> {
    try {
      const chunkFile = await this.fileSystemManager.getFileByPath(
        `Data/chunk/${chunkId}.json`
      );
      const chunkContent = await chunkFile?.text();
      if (!chunkContent) return null;
      return JSON.parse(chunkContent);
    } catch (error) {
      console.error(`Error loading chunk ${chunkId}:`, error);
      return null;
    }
  }

  async saveMasterIndex(masterIndex: MasterIndex): Promise<void> {
    if (this.header) {
      masterIndex.fields = this.header.fields.map((field: any) => field.name);
    }

    await this.fileSystemManager.createFile(
      "Data/master_index.json",
      JSON.stringify(masterIndex)
    );
  }

  async loadMasterIndex(): Promise<MasterIndex | null> {
    try {
      const indexFile = await this.fileSystemManager.getFileByPath(
        "Data/master_index.json"
      );
      const indexContent = await indexFile?.text();
      if (!indexContent) return null;
      return JSON.parse(indexContent);
    } catch (error) {
      console.error("Failed to load master index:", error);
      return null;
    }
  }

  public async initializeFileBuffer(dbfFilePath: string): Promise<void> {
    this.dbfFilePath = dbfFilePath;
    await this.initializeDataSource();
  }

  public getDBFHeader(): any {
    return this.header;
  }

  public getFileBuffer(): ArrayBuffer | undefined {
    return this.fileBuffer;
  }

  public async buildIndex(
    chunkSize: number = 500,
    setProgress?: (value: IProgressBar) => void
  ): Promise<boolean> {
    if (!this.dbfParser) {
      this.dbfParser = new DBFParser();
    }
    return await super.buildIndex(chunkSize, setProgress);
  }

  getFile = async (path: string, secondaryPath: string) => {
    console.log(path, secondaryPath);
    const primaryFile = await this.fileSystemManager.getFileByPath(path);
    if (!primaryFile) {
      const secondaryFile = await this.fileSystemManager.getFileByPath(
        secondaryPath
      );
      return secondaryFile;
    } else {
      return primaryFile;
    }
  };

  public async getSong(
    trackData: ITrackData
  ): Promise<KaraokeExtension | undefined> {
    const { CODE, TYPE, SUB_TYPE, FILE_NAME } = trackData;
    const foldername = CODE.length > 0 ? CODE[0] : undefined;
    let primaryPath = `Songs/${TYPE}/${SUB_TYPE}`;

    if (SUB_TYPE === "EMK") {
      const emk = await this.getFile(
        `${primaryPath}/${foldername}/${CODE}.emk`,
        `${primaryPath}/${CODE}.emk`
      );

      if (emk) {
        const emkDecodeed = await parseEMKFile(emk);
        if (emkDecodeed.mid && emkDecodeed.cur && emkDecodeed.lyr) {
          return {
            midi: emkDecodeed.mid,
            cur: emkDecodeed.cur,
            lyr: emkDecodeed.lyr,
          };
        }
        return;
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
      return;
    }
  }
}
