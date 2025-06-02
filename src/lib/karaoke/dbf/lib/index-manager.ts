import FileSystemManager from "@/utils/file/file-system";
import { MasterIndex, ChunkData } from "../types/dbf.type";
import { DBFParser } from "./dbf-decoder";
import { TextProcessor } from "./text-processor";

// Index Management
export class IndexManager {
  private fileSystemManager: FileSystemManager;
  private masterIndex: MasterIndex | null = null;

  constructor(fileSystemManager: FileSystemManager) {
    this.fileSystemManager = fileSystemManager;
  }

  async buildIndex(
    fileBuffer: ArrayBuffer,
    parser: DBFParser,
    chunkSize: number = 500
  ): Promise<boolean> {
    console.log("Building search index...");
    const startTime = Date.now();

    const header = await parser.parseHeader(fileBuffer);
    const { recordCount: totalRecords } = header;
    const totalChunks = Math.ceil(totalRecords / chunkSize);

    console.log(
      `Processing ${totalRecords.toLocaleString()} records in ${totalChunks} chunks`
    );

    const wordToChunksMap: Record<string, number[]> = {};

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      await this.processChunk(
        fileBuffer,
        parser,
        chunkIndex,
        chunkSize,
        totalRecords,
        totalChunks,
        wordToChunksMap
      );
    }

    this.masterIndex = {
      totalRecords,
      totalChunks,
      chunkSize,
      wordToChunks: wordToChunksMap,
      fields: header.fields.map((field) => field.name),
      buildTime: Date.now() - startTime,
      lastBuilt: new Date().toISOString(),
    };

    await this.saveMasterIndex();
    this.logIndexStats();

    return true;
  }

  private async processChunk(
    fileBuffer: ArrayBuffer,
    parser: DBFParser,
    chunkIndex: number,
    chunkSize: number,
    totalRecords: number,
    totalChunks: number,
    wordToChunksMap: Record<string, number[]>
  ): Promise<void> {
    const startRecordIndex = chunkIndex * chunkSize;
    const endRecordIndex = Math.min(startRecordIndex + chunkSize, totalRecords);

    console.log(
      `Processing chunk ${
        chunkIndex + 1
      }/${totalChunks} (records ${startRecordIndex}-${endRecordIndex - 1})`
    );

    const records = await parser.parseRecords(
      fileBuffer,
      startRecordIndex,
      endRecordIndex
    );
    const localWordIndex: Record<string, number[]> = {};

    records.forEach((record, localRecordIndex) => {
      const searchableText = TextProcessor.getSearchableText(record, false);
      const words = TextProcessor.extractWords(searchableText);

      this.indexWordsForRecord(
        words,
        localRecordIndex,
        chunkIndex,
        localWordIndex,
        wordToChunksMap
      );
    });

    const chunkData: ChunkData = {
      chunkId: chunkIndex,
      records,
      localWordIndex,
    };

    await this.saveChunkData(chunkIndex, chunkData);
  }

  private indexWordsForRecord(
    words: string[],
    localRecordIndex: number,
    chunkIndex: number,
    localWordIndex: Record<string, number[]>,
    wordToChunksMap: Record<string, number[]>
  ): void {
    words.forEach((word) => {
      // Update local word index
      if (!localWordIndex[word]) {
        localWordIndex[word] = [];
      }
      if (!localWordIndex[word].includes(localRecordIndex)) {
        localWordIndex[word].push(localRecordIndex);
      }

      // Update global word-to-chunks mapping
      if (!wordToChunksMap[word]) {
        wordToChunksMap[word] = [];
      }
      if (!wordToChunksMap[word].includes(chunkIndex)) {
        wordToChunksMap[word].push(chunkIndex);
      }
    });
  }

  private async saveMasterIndex(): Promise<void> {
    await this.fileSystemManager.createFile(
      "Data/master_index.json",
      JSON.stringify(this.masterIndex)
    );
  }

  private async saveChunkData(
    chunkIndex: number,
    chunkData: ChunkData
  ): Promise<void> {
    await this.fileSystemManager.createFile(
      `Data/chunk/${chunkIndex}.json`,
      JSON.stringify(chunkData)
    );
  }

  private logIndexStats(): void {
    if (!this.masterIndex) return;

    console.log(`Index built successfully (${this.masterIndex.buildTime}ms)`);
    console.log(
      `Total words indexed: ${Object.keys(
        this.masterIndex.wordToChunks
      ).length.toLocaleString()}`
    );
  }

  async loadIndex(): Promise<boolean> {
    try {
      const indexFile = await this.fileSystemManager.getFileByPath(
        "Data/master_index.json"
      );
      const indexContent = await indexFile.text();
      this.masterIndex = JSON.parse(indexContent);
      console.log("Search index loaded successfully");
      return true;
    } catch (error) {
      console.error("Failed to load search index:", error);
      return false;
    }
  }

  getMasterIndex(): MasterIndex | null {
    return this.masterIndex;
  }

  async loadChunkData(chunkId: number): Promise<ChunkData | null> {
    try {
      const chunkFile = await this.fileSystemManager.getFileByPath(
        `Data/chunk/${chunkId}.json`
      );
      const chunkContent = await chunkFile.text();
      return JSON.parse(chunkContent);
    } catch (error) {
      console.error(`Error loading chunk ${chunkId}:`, error);
      return null;
    }
  }
}
