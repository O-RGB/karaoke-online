// Base interfaces และ types
import {
  ChunkData,
  ITrackData,
  KaraokeExtension,
  MasterIndex,
  SearchOptions,
  SearchResult,
} from "@/features/songs/types/songs.type";

// Abstract Base Class
export abstract class BaseSongsSystemReader {
  protected masterIndex: MasterIndex | undefined = undefined;

  // CRUD state
  protected newRecords: ITrackData[] = [];
  protected modifiedRecords: Map<number, ITrackData> = new Map();
  protected deletedRecordIndexes: Set<number> = new Set();

  protected readonly SEARCHABLE_FIELDS = [
    "TITLE",
    "ARTIST",
    "ALBUM",
    "AUTHOR",
    "LYR_TITLE",
  ];
  protected readonly FIELD_PRIORITY = { TITLE: 1, ARTIST: 2, LYR_TITLE: 3 };
  protected readonly DEFAULT_MAX_RESULTS = 50;

  // Abstract methods ที่ subclass ต้อง implement
  abstract initializeDataSource(): Promise<void>;
  abstract getTotalRecords(): Promise<number>;
  abstract getRecordsBatch(
    startIndex: number,
    endIndex: number
  ): Promise<ITrackData[]>;
  abstract saveChunkData(chunkData: ChunkData): Promise<void>;
  abstract loadChunkData(chunkId: number): Promise<ChunkData | null>;
  abstract saveMasterIndex(masterIndex: MasterIndex): Promise<void>;
  abstract loadMasterIndex(): Promise<MasterIndex | null>;
  abstract getSong(
    trackData: ITrackData
  ): Promise<KaraokeExtension | undefined>;

  // Common text processing methods
  protected extractWords(text: string): string[] {
    if (!text) return [];
    const words = text.toLowerCase().match(/[a-zA-Zก-๙]+/g) || [];
    return words.filter((word) => word.length > 1);
  }

  protected getSearchableText(
    record: ITrackData,
    searchAllFields: boolean = true
  ): string {
    const fieldsToSearch = searchAllFields
      ? Object.keys(record)
      : this.SEARCHABLE_FIELDS;
    return fieldsToSearch
      .map((field) => String((record as any)[field] || ""))
      .join(" ");
  }

  protected calculatePriority(
    record: ITrackData,
    searchTerms: string[]
  ): number {
    for (const [field, priority] of Object.entries(this.FIELD_PRIORITY)) {
      const fieldText = String((record as any)[field] || "").toLowerCase();
      if (searchTerms.some((term) => fieldText.includes(term))) {
        return priority;
      }
    }
    return 99;
  }

  // CRUD Operations
  protected isRecordDeleted(originalIndex: number): boolean {
    return this.deletedRecordIndexes.has(originalIndex);
  }

  protected applyModifications(record: ITrackData): ITrackData {
    const originalIndex = record._originalIndex;
    const modifiedRecord = this.modifiedRecords.get(originalIndex);

    if (modifiedRecord) {
      return {
        ...modifiedRecord,
        _originalIndex: originalIndex,
        _isModified: true,
      };
    }

    return { ...record };
  }

  // Main build index method
  public async buildIndex(
    chunkSize: number = 500,
    setProgress?: (value: IProgressBar) => void
  ): Promise<boolean> {
    const startTime = Date.now();

    await this.initializeDataSource();
    const totalRecords = await this.getTotalRecords();
    const totalChunks = Math.ceil(totalRecords / chunkSize);
    const wordToChunksMap: Record<string, number[]> = {};

    setProgress?.({
      loading: true,
      show: true,
      title: "Building search index",
      discription: `Processing ${totalRecords.toLocaleString()} records in ${totalChunks} chunks`,
      progress: 0,
    });

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const startRecordIndex = chunkIndex * chunkSize;
      const endRecordIndex = Math.min(
        startRecordIndex + chunkSize,
        totalRecords
      );

      // คำนวณ % ความคืบหน้าสำหรับ chunk นี้ (สูงสุด 80%)
      const percent = Math.floor(((chunkIndex + 1) / totalChunks) * 80);

      setProgress?.({
        loading: true,
        show: true,
        title: "Building search index",
        discription: `Processing chunk ${
          chunkIndex + 1
        }/${totalChunks} (records ${startRecordIndex}-${endRecordIndex - 1})`,
        progress: percent,
      });

      console.log("load", percent);
      const records = await this.getRecordsBatch(
        startRecordIndex,
        endRecordIndex
      );
      const localWordIndex: Record<string, number[]> = {};

      records.forEach((record, localRecordIndex) => {
        const searchableText = this.getSearchableText(record, false);
        const words = this.extractWords(searchableText);

        words.forEach((word) => {
          // Local index
          if (!localWordIndex[word]) localWordIndex[word] = [];
          if (!localWordIndex[word].includes(localRecordIndex)) {
            localWordIndex[word].push(localRecordIndex);
          }

          // Global index
          if (!wordToChunksMap[word]) wordToChunksMap[word] = [];
          if (!wordToChunksMap[word].includes(chunkIndex)) {
            wordToChunksMap[word].push(chunkIndex);
          }
        });
      });

      // Save chunk data
      const chunkData: ChunkData = {
        chunkId: chunkIndex,
        records,
        localWordIndex,
      };
      await this.saveChunkData(chunkData);
    }

    this.masterIndex = {
      totalRecords,
      totalChunks,
      chunkSize,
      wordToChunks: wordToChunksMap,
      fields: [], // Will be populated by subclass
      buildTime: Date.now() - startTime,
      lastBuilt: new Date().toISOString(),
    };
    // ขั้นตอน saveMasterIndex = 80%
    setProgress?.({
      loading: true,
      show: true,
      title: "Building search index",
      progress: 80,
    });

    await this.saveMasterIndex(this.masterIndex);

    setProgress?.({
      loading: true,
      show: true,
      title: "Building search index",
      discription: `Index built successfully (${this.masterIndex.buildTime}ms)`,
      progress: 100,
    });

    // console.log(
    //   `Total words indexed: ${Object.keys(
    //     this.masterIndex.wordToChunks
    //   ).length.toLocaleString()}`
    // );

    return true;
  }

  public async loadIndex(): Promise<boolean> {
    try {
      const masterIndex = await this.loadMasterIndex();
      if (!masterIndex) {
        console.error("Failed to load master index");
        return false;
      }
      this.masterIndex = masterIndex;
      console.log("Search index loaded successfully");
      return true;
    } catch (error) {
      console.error("Failed to load search index:", error);
      return false;
    }
  }

  // Main search method
  public async search(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult> {
    const {
      exactMatch = false,
      searchAllFields = true,
      maxResults = this.DEFAULT_MAX_RESULTS,
    } = options;

    if (!this.masterIndex)
      throw new Error("Search index not found. Please build index first.");

    const startTime = Date.now();
    const searchTerms = this.extractWords(query);

    if (searchTerms.length === 0) {
      return { records: [], searchTime: 0, totalFound: 0 };
    }

    console.log(
      `Executing search for terms: ${searchTerms} (max results: ${maxResults})`
    );

    // Find relevant chunks
    const chunkRelevanceScores: Record<number, number> = {};
    searchTerms.forEach((term) => {
      Object.entries(this.masterIndex!.wordToChunks).forEach(
        ([indexedWord, chunkIds]) => {
          const isWordMatch = exactMatch
            ? indexedWord === term
            : indexedWord.includes(term);
          if (isWordMatch) {
            chunkIds.forEach((chunkId) => {
              chunkRelevanceScores[chunkId] =
                (chunkRelevanceScores[chunkId] || 0) + 1;
            });
          }
        }
      );
    });

    const relevantChunks = Object.entries(chunkRelevanceScores)
      .map(([chunkId, score]) => ({
        chunkId: parseInt(chunkId),
        relevanceScore: score,
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 50); // Limit chunks to process

    // Search in chunks
    const results: ITrackData[] = [];
    for (const { chunkId } of relevantChunks) {
      if (results.length >= maxResults) break;

      const chunkData = await this.loadChunkData(chunkId);
      if (!chunkData) continue;

      const remainingSlots = maxResults - results.length;

      for (const record of chunkData.records) {
        if (results.length >= remainingSlots) break;
        if (this.isRecordDeleted(record._originalIndex)) continue;

        const processedRecord = this.applyModifications(record);
        const searchableText = this.getSearchableText(
          processedRecord,
          searchAllFields
        ).toLowerCase();

        const matchedTerms = searchTerms.filter((term) => {
          return exactMatch
            ? searchableText.split(" ").includes(term)
            : searchableText.includes(term);
        });

        if (matchedTerms.length > 0) {
          processedRecord._matchedTerms = matchedTerms;
          processedRecord._priority = this.calculatePriority(
            processedRecord,
            searchTerms
          );
          results.push(processedRecord);
        }
      }
    }

    // Search in new records
    if (results.length < maxResults) {
      for (const record of this.newRecords) {
        if (results.length >= maxResults) break;

        const searchableText = this.getSearchableText(
          record,
          searchAllFields
        ).toLowerCase();
        const matchedTerms = searchTerms.filter((term) => {
          return exactMatch
            ? searchableText.split(" ").includes(term)
            : searchableText.includes(term);
        });

        if (matchedTerms.length > 0) {
          const resultRecord = { ...record };
          resultRecord._matchedTerms = matchedTerms;
          resultRecord._priority = this.calculatePriority(
            resultRecord,
            searchTerms
          );
          resultRecord._isNew = true;
          results.push(resultRecord);
        }
      }
    }

    // Sort results
    const sortedResults = results.sort((a, b) => {
      if (a._priority !== b._priority) {
        return (a._priority || 99) - (b._priority || 99);
      }
      return (b._matchedTerms?.length || 0) - (a._matchedTerms?.length || 0);
    });

    const finalResults = sortedResults.slice(0, maxResults);
    const searchTime = Date.now() - startTime;

    console.log(`Found ${finalResults.length} results in ${searchTime}ms`);

    return {
      records: finalResults,
      searchTime,
      totalFound: finalResults.length,
      terminatedEarly: results.length >= maxResults,
    };
  }

  // Public methods for CRUD operations
  public addRecord(record: ITrackData): void {
    record._originalIndex = -1; // Mark as new
    this.newRecords.push(record);
  }

  public updateRecord(originalIndex: number, updatedRecord: ITrackData): void {
    this.modifiedRecords.set(originalIndex, updatedRecord);
  }

  public deleteRecord(originalIndex: number): void {
    this.deletedRecordIndexes.add(originalIndex);
  }

  public getStats(): {
    totalIndexed: number;
    newRecords: number;
    modifiedRecords: number;
    deletedRecords: number;
  } {
    return {
      totalIndexed: this.masterIndex?.totalRecords || 0,
      newRecords: this.newRecords.length,
      modifiedRecords: this.modifiedRecords.size,
      deletedRecords: this.deletedRecordIndexes.size,
    };
  }
}
