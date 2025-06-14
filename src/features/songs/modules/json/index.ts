import {
  ITrackData,
  KaraokeExtension,
  MasterIndex,
  PreviewChunk,
} from "@/features/songs/types/songs.type";
import {
  MasterIndexLocalSongsManager,
  ChunkDataLocalSongsManager,
} from "@/utils/indexedDB/db/local-songs/table";
import { BaseSongsSystemReader } from "../../base";

export class JSONDBSongsSystemReader extends BaseSongsSystemReader {
  private chunkDataDb: ChunkDataLocalSongsManager;
  private masterIndexDb: MasterIndexLocalSongsManager;
  private jsonData: ITrackData[] = [];
  private predefinedFields: string[] = [];

  constructor(jsonData?: ITrackData[], predefinedFields?: string[]) {
    super();
    this.chunkDataDb = new ChunkDataLocalSongsManager();
    this.masterIndexDb = new MasterIndexLocalSongsManager();
    if (jsonData) {
      this.setJSONData(jsonData); // Use setter to ensure _originalIndex is set
    }
    this.predefinedFields = predefinedFields || [];
    // No need to call initializeDataSource here, setJSONData handles it.
  }

  // --- Data Source Methods ---

  async initializeDataSource(): Promise<void> {
    // This method is part of the abstract class contract.
    // The main logic is handled by setJSONData in this implementation.
    console.log("JSON data source is ready.");
    return Promise.resolve();
  }

  setJSONData(data: ITrackData[]): void {
    this.jsonData = data.map((record, index) => ({
      ...record,
      _originalIndex:
        record._originalIndex !== undefined ? record._originalIndex : index,
    }));
    console.log("JSON data source updated.", {
      totalRecords: this.jsonData.length,
    });
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

  // --- V6 Persistence Methods (CHANGED) ---

  /**
   * CHANGED: Renamed from saveChunkData to savePreviewChunk to match V6 Base Class.
   */
  async savePreviewChunk(
    chunkId: number,
    chunkData: PreviewChunk
  ): Promise<void> {
    try {
      // IndexedDB manager expects a specific format.
      await this.chunkDataDb.add({
        id: chunkId,
        createdAt: new Date(),
        data: chunkData,
      });
    } catch (error) {
      console.error(`Error saving preview chunk ${chunkId}:`, error);
      throw error;
    }
  }

  /**
   * CHANGED: Renamed from loadChunkData to loadPreviewChunk to match V6 Base Class.
   */
  async loadPreviewChunk(chunkId: number): Promise<PreviewChunk | null> {
    try {
      const chunkRecord = await this.chunkDataDb.get(chunkId);
      // The data stored is already in the PreviewChunk format.
      return chunkRecord ? (chunkRecord.data as PreviewChunk) : null;
    } catch (error) {
      console.error(`Error loading preview chunk ${chunkId}:`, error);
      return null;
    }
  }

  async saveMasterIndex(masterIndex: MasterIndex): Promise<void> {
    try {
      // The logic for adding fields can be kept.
      const finalMasterIndex: any = { ...masterIndex };
      if (this.predefinedFields.length > 0) {
        finalMasterIndex.fields = this.predefinedFields;
      } else if (this.jsonData.length > 0) {
        finalMasterIndex.fields = Object.keys(this.jsonData[0]).filter(
          (key) => !key.startsWith("_")
        );
      }

      // Use a fixed ID for the single master index record.
      await this.masterIndexDb.add({
        id: 1,
        data: finalMasterIndex,
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
      return indexRecord ? (indexRecord.data as MasterIndex) : null;
    } catch (error) {
      console.error("Failed to load master index:", error);
      return null;
    }
  }

  // --- V6 Full Data Fetching (ADDED) ---

  /**
   * ADDED: Required by V6 Base Class to fetch full track details after a search.
   */
  async getRecordByOriginalIndex(index: number): Promise<ITrackData | null> {
    if (index >= 0 && index < this.jsonData.length) {
      return this.jsonData[index];
    }
    return null;
  }

  // --- Class-Specific Helper Methods ---

  public getJSONData(): ITrackData[] {
    return this.jsonData;
  }

  public setPredefinedFields(fields: string[]): void {
    this.predefinedFields = fields;
  }

  /**
   * REMOVED: buildIndex override is no longer needed as the base class handles it.
   * To build the index, simply call `await instance.buildIndex(setProgress)`.
   */

  public async updateJSONDataAndRebuildIndex(
    newData: ITrackData[],
    setProgress?: (value: IProgressBar) => void
  ): Promise<boolean> {
    this.setJSONData(newData);
    // CHANGED: Removed chunkSize parameter.
    return await this.buildIndex(setProgress);
  }

  public async addRecordsAndRebuild(
    newRecords: ITrackData[],
    setProgress?: (value: IProgressBar) => void
  ): Promise<boolean> {
    const currentLength = this.jsonData.length;
    const recordsWithIndex = newRecords.map((record, index) => ({
      ...record,
      _originalIndex: currentLength + index,
    }));

    this.jsonData.push(...recordsWithIndex);
    console.log(`${newRecords.length} records added. Rebuilding index...`);
    return await this.buildIndex(setProgress);
  }

  // This method is not applicable for a pure JSON data source.
  public getSong(trackData: ITrackData): Promise<KaraokeExtension | undefined> {
    console.warn("getSong is not implemented for JSONDBSongsSystemReader.");
    return Promise.resolve(undefined);
  }
}
