import FileSystemManager from "@/utils/file/file-system";
import { DBFParser } from "./lib/dbf-decoder";
import { DBFRecord, SearchResult } from "./types/dbf.type";
import { CRUDManager } from "./lib/crud-manager";
import { IndexManager } from "./lib/index-manager";
import { SearchProcessor } from "./lib/searh-processor";

// Main Search Engine Class
export class SearchEngine {
  private fileSystemManager: FileSystemManager | null = null;
  private dbfParser: DBFParser;
  private indexManager: IndexManager;
  private crudManager: CRUDManager;
  private searchProcessor: SearchProcessor;
  private fileBuffer: ArrayBuffer | null = null;

  constructor(fileSystemManager: FileSystemManager, dbfFilePath: string) {
    this.fileSystemManager = fileSystemManager;
    this.dbfParser = new DBFParser();
    this.indexManager = new IndexManager(fileSystemManager);
    this.crudManager = new CRUDManager();
    this.searchProcessor = new SearchProcessor(
      this.indexManager,
      this.crudManager
    );

    this.initializeFileBuffer(dbfFilePath);
  }

  private async initializeFileBuffer(dbfFilePath: string): Promise<void> {
    if (!this.fileSystemManager) return;

    try {
      const fileData = await this.fileSystemManager.getFileByPath(dbfFilePath);
      this.fileBuffer = await fileData.arrayBuffer();
    } catch (error) {
      console.error("Failed to initialize file buffer:", error);
    }
  }

  async buildIndex(chunkSize: number = 500): Promise<boolean> {
    if (!this.fileSystemManager) {
      throw new Error("FileSystemManager not found.");
    }

    if (!this.fileBuffer) {
      throw new Error("File buffer not initialized.");
    }

    return await this.indexManager.buildIndex(
      this.fileBuffer,
      this.dbfParser,
      chunkSize
    );
  }

  async loadIndex(): Promise<boolean> {
    if (!this.fileSystemManager) {
      throw new Error("FileSystemManager not found.");
    }

    return await this.indexManager.loadIndex();
  }

  async search(
    query: string,
    exactMatch: boolean = false,
    searchAllFields: boolean = true
  ): Promise<SearchResult> {
    if (!this.fileSystemManager) {
      throw new Error("FileSystemManager not found.");
    }

    return await this.searchProcessor.executeSearch(query, {
      exactMatch,
      searchAllFields,
    });
  }

  // CRUD Operations
  addRecord(recordData: Partial<DBFRecord>): DBFRecord {
    return this.crudManager.addRecord(recordData);
  }

  updateRecord(
    originalIndex: number,
    recordData: Partial<DBFRecord>
  ): DBFRecord {
    return this.crudManager.updateRecord(originalIndex, recordData);
  }

  deleteRecord(originalIndex: number): void {
    this.crudManager.deleteRecord(originalIndex);
  }

  // Statistics and Information
  getStats() {
    return {
      masterIndex: this.indexManager.getMasterIndex(),
      crud: this.crudManager.getStats(),
    };
  }
}
