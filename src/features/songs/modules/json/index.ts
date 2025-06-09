import {
  ITrackData,
  KaraokeExtension,
} from "@/features/songs/types/songs.type";
import {
  MasterIndexLocalSongsManager,
  TracklistLocalSongsManager,
} from "@/utils/indexedDB/db/local-songs/table";
import { BaseSongsSystemReader } from "../../base";
import { ChunkData, MasterIndex } from "../../types/songs.type";
import { ITracklistLocalSongs } from "@/utils/indexedDB/db/local-songs/types";

export class JSONDBSongsSystemReader extends BaseSongsSystemReader {
  private tracklistDb: TracklistLocalSongsManager;
  private masterIndexDb: MasterIndexLocalSongsManager;
  private jsonData: ITrackData[] = [];
  private predefinedFields: string[] = [];

  constructor(jsonData?: ITrackData[], predefinedFields?: string[]) {
    super();
    this.tracklistDb = new TracklistLocalSongsManager();
    this.masterIndexDb = new MasterIndexLocalSongsManager();
    this.jsonData = jsonData ?? [];
    this.predefinedFields = predefinedFields || [];
    this.initializeDataSource();
  }

  async initializeDataSource(): Promise<void> {
    try {
      this.jsonData = this.jsonData.map((record, index) => ({
        ...record,
        _originalIndex:
          record._originalIndex !== undefined ? record._originalIndex : index,
      }));

      console.log("JSON data source initialized successfully", {
        totalRecords: this.jsonData.length,
      });
    } catch (error) {
      console.error("Failed to initialize JSON data source:", error);
      throw error;
    }
  }

  setJsonData(data: ITrackData[]): void {
    this.jsonData = data;
  }

  async getTotalRecords(): Promise<number> {
    return this.jsonData.length;
  }

  async getRecordsBatch(
    startIndex: number,
    endIndex: number
  ): Promise<ITrackData[]> {
    const actualEndIndex = Math.min(endIndex, this.jsonData.length);
    return this.jsonData.slice(startIndex, actualEndIndex);
  }

  async saveChunkData(chunkData: ChunkData): Promise<void> {
    try {
      await this.tracklistDb.add({
        id: chunkData.chunkId,
        createdAt: new Date(),
        data: chunkData,
      });
    } catch (error) {
      console.error(`Error saving chunk ${chunkData.chunkId}:`, error);
      throw error;
    }
  }

  async loadChunkData(chunkId: number): Promise<ChunkData | null> {
    try {
      const chunkRecord = await this.tracklistDb.get(chunkId);
      return chunkRecord ? chunkRecord.data : null;
    } catch (error) {
      console.error(`Error loading chunk ${chunkId}:`, error);
      return null;
    }
  }

  async saveMasterIndex(masterIndex: MasterIndex): Promise<void> {
    try {
      if (this.predefinedFields.length > 0) {
        masterIndex.fields = this.predefinedFields;
      } else if (this.jsonData.length > 0) {
        masterIndex.fields = Object.keys(this.jsonData[0]).filter(
          (key) => !key.startsWith("_")
        );
      }

      await this.masterIndexDb.add({
        id: 1,
        data: masterIndex,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Error saving master index:", error);
      throw error;
    }
  }

  async loadMasterIndex(): Promise<MasterIndex | null> {
    try {
      const indexRecord = await this.masterIndexDb.get(1);
      return indexRecord ? indexRecord.data : null;
    } catch (error) {
      console.error("Failed to load master index:", error);
      return null;
    }
  }

  public setJSONData(data: ITrackData[]): void {
    this.jsonData = data.map((record, index) => ({
      ...record,
      _originalIndex:
        record._originalIndex !== undefined ? record._originalIndex : index,
    }));
  }

  public getJSONData(): ITrackData[] {
    return this.jsonData;
  }

  public setPredefinedFields(fields: string[]): void {
    this.predefinedFields = fields;
  }

  public async getAllChunkIds(): Promise<ITracklistLocalSongs[]> {
    try {
      return await this.tracklistDb.getAll();
    } catch (error) {
      console.error("Error getting chunk IDs:", error);
      return [];
    }
  }

  public async buildIndex(chunkSize: number = 500): Promise<boolean> {
    return await super.buildIndex(chunkSize);
  }

  public async updateJSONDataAndRebuildIndex(
    newData: ITrackData[],
    chunkSize: number = 500
  ): Promise<boolean> {
    this.setJSONData(newData);
    return await this.buildIndex(chunkSize);
  }

  public async addRecordsToIndex(newRecords: ITrackData[]): Promise<void> {
    const currentLength = this.jsonData.length;
    const recordsWithIndex = newRecords.map((record, index) => ({
      ...record,
      _originalIndex: currentLength + index,
    }));

    this.jsonData.push(...recordsWithIndex);

    recordsWithIndex.forEach((record) => this.addRecord(record));
  }

  public getSong(trackData: ITrackData): Promise<KaraokeExtension | undefined> {
    throw new Error("Method not implemented.");
  }
}
