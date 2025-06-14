// src/features/songs/core/base-songs-system-reader.ts

import {
  ITrackData,
  MasterIndex,
  PreviewChunk,
  KaraokeExtension,
  ISearchRecordPreview,
  SearchOptions,
  SearchResult,
} from "../types/songs.type";

export abstract class BaseSongsSystemReader {
  // --- In-memory index data for searching ---
  protected sortedWords: string[] = [];
  protected wordToChunkMap: Record<string, number> = {};

  // --- CRUD state ---
  protected newRecords: ITrackData[] = [];
  protected modifiedRecords: Map<number, ITrackData> = new Map();
  protected deletedRecordIndexes: Set<number> = new Set();

  // --- Constants ---
  protected readonly SEARCHABLE_FIELDS = [
    "TITLE",
    "ARTIST",
    "AUTHOR",
    "LYR_TITLE",
  ];
  protected readonly FIELD_PRIORITY = { TITLE: 1, ARTIST: 2, LYR_TITLE: 3 };
  protected readonly DEFAULT_MAX_RESULTS = 50;

  // --- Abstract Methods (to be implemented by concrete class) ---
  abstract initializeDataSource(): Promise<void>;
  abstract getTotalRecords(): Promise<number>;
  abstract getRecordsBatch(
    startIndex: number,
    endIndex: number
  ): Promise<ITrackData[]>;
  abstract saveMasterIndex(masterIndex: MasterIndex): Promise<void>;
  abstract loadMasterIndex(): Promise<MasterIndex | null>;
  abstract savePreviewChunk(
    chunkId: number,
    chunkData: PreviewChunk
  ): Promise<void>;
  abstract loadPreviewChunk(chunkId: number): Promise<PreviewChunk | null>;
  abstract getRecordByOriginalIndex(index: number): Promise<ITrackData | null>;
  abstract getSong(
    trackData: ITrackData
  ): Promise<KaraokeExtension | undefined>;

  // --- Helper Methods ---
  protected extractWords(text: string): string[] {
    if (!text) return [];
    const words = text.toLowerCase().match(/[a-zA-Zก-๙0-9]+/g) || [];
    return words.filter((word) => word.length > 1);
  }

  protected getSearchableText(record: ITrackData): string {
    return this.SEARCHABLE_FIELDS.map((field) =>
      String((record as any)[field] || "")
    ).join(" ");
  }

  // --- V6 Indexing and Searching Logic ---

  public async buildIndex(
    setProgress?: (value: IProgressBar) => void
  ): Promise<boolean> {
    const startTime = Date.now();
    setProgress?.({
      loading: true,
      show: true,
      title: "Building Optimized Index (V6)",
      discription: "Initializing...",
      progress: 0,
    });

    await this.initializeDataSource();
    const totalRecords = await this.getTotalRecords();

    // Step 1: รวบรวมข้อมูลทั้งหมดใน Memory ก่อน (One Pass)
    // ใช้ RAM เยอะขึ้นชั่วคราว แต่ลดภาระ CPU ได้มหาศาล
    setProgress?.({
      loading: true,
      show: true,
      title: "Building Optimized Index (V6)",
      discription: `Loading ${totalRecords.toLocaleString()} records into memory...`,
      progress: 5,
    });
    const allRecords = await this.getRecordsBatch(0, totalRecords);
    const wordToPreviewsMap = new Map<string, ISearchRecordPreview[]>();

    setProgress?.({
      loading: true,
      show: true,
      title: "Building Optimized Index (V6)",
      discription: "Analyzing records...",
      progress: 20,
    });
    allRecords.forEach((record) => {
      const preview: ISearchRecordPreview = {
        t: record.TITLE,
        a: record.ARTIST,
        i: record._originalIndex,
      };
      const words = this.extractWords(this.getSearchableText(record));
      words.forEach((word) => {
        if (!wordToPreviewsMap.has(word)) wordToPreviewsMap.set(word, []);
        wordToPreviewsMap.get(word)!.push(preview);
      });
    });

    // Step 2: สร้าง Sorted Word List และ แบ่งข้อมูลลง Preview Chunks
    setProgress?.({
      loading: true,
      show: true,
      title: "Building Optimized Index (V6)",
      discription: "Sorting words and creating chunks...",
      progress: 70,
    });
    const sortedWords = Array.from(wordToPreviewsMap.keys()).sort((a, b) =>
      a.localeCompare(b, "th-TH-u-co-trad")
    );
    const wordToChunkMap: Record<string, number> = {};
    let currentChunk: PreviewChunk = {};
    let currentChunkSize = 0;
    let chunkId = 0;
    const MAX_CHUNK_SIZE_BYTES = 5 * 1024 * 1024; // กำหนดขนาด Chunk ที่ 5MB

    for (const word of sortedWords) {
      const previews = wordToPreviewsMap.get(word)!;
      currentChunk[word] = previews;
      wordToChunkMap[word] = chunkId;

      currentChunkSize += JSON.stringify(previews).length + word.length * 2; // Rough size estimation

      if (currentChunkSize > MAX_CHUNK_SIZE_BYTES) {
        await this.savePreviewChunk(chunkId, currentChunk);
        chunkId++;
        currentChunk = {};
        currentChunkSize = 0;
      }
    }
    if (Object.keys(currentChunk).length > 0) {
      await this.savePreviewChunk(chunkId, currentChunk);
    }

    // Step 3: บันทึก Master Index
    setProgress?.({
      loading: true,
      show: true,
      title: "Building Optimized Index (V6)",
      discription: "Saving master index...",
      progress: 95,
    });
    const masterIndexToSave: MasterIndex = {
      totalRecords,
      words: sortedWords,
      wordToChunkMap,
      buildTime: Date.now() - startTime,
      lastBuilt: new Date().toISOString(),
    };
    await this.saveMasterIndex(masterIndexToSave);

    this.sortedWords = sortedWords;
    this.wordToChunkMap = wordToChunkMap;

    setProgress?.({
      loading: false,
      show: true,
      title: "Complete",
      discription: `Optimized Index (V6) built in ${masterIndexToSave.buildTime}ms.`,
      progress: 100,
    });
    return true;
  }

  public async loadIndex(): Promise<boolean> {
    const masterIndex = await this.loadMasterIndex();
    if (!masterIndex || !masterIndex.words || !masterIndex.wordToChunkMap) {
      console.error("Failed to load V6 master index or index is corrupted.");
      return false;
    }
    this.sortedWords = masterIndex.words;
    this.wordToChunkMap = masterIndex.wordToChunkMap;
    console.log("Optimized Index (V6) loaded successfully.");
    return true;
  }

  public async search(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult> {
    const { maxResults = this.DEFAULT_MAX_RESULTS } = options;
    const startTime = Date.now();
    const searchTerms = this.extractWords(query);
    if (searchTerms.length === 0 || this.sortedWords.length === 0) {
      return { records: [], searchTime: 0, totalFound: 0 };
    }

    const prefix = searchTerms[0];

    // Step 1: ใช้ Binary Search เพื่อหาตำแหน่งเริ่มต้นของคำ
    const startIndex = this.findFirstWordWithPrefix(prefix);
    if (startIndex === -1) {
      return { records: [], searchTime: 0, totalFound: 0 };
    }

    // Step 2: รวบรวมคำทั้งหมดที่ตรงกับ Prefix และ Chunk ID ที่ไม่ซ้ำกัน
    const matchedWords: string[] = [];
    const chunksToLoad = new Set<number>();
    for (let i = startIndex; i < this.sortedWords.length; i++) {
      const word = this.sortedWords[i];
      if (word.startsWith(prefix)) {
        matchedWords.push(word);
        const chunkId = this.wordToChunkMap[word];
        if (chunkId !== undefined) {
          chunksToLoad.add(chunkId);
        }
      } else {
        break;
      }
    }

    // Step 3: โหลด Preview Chunks ที่จำเป็น
    const chunkPromises = Array.from(chunksToLoad).map((id) =>
      this.loadPreviewChunk(id)
    );
    const loadedChunks = (await Promise.all(chunkPromises)).filter(
      (c) => c !== null
    ) as PreviewChunk[];
    const allPreviewsMap: PreviewChunk = Object.assign({}, ...loadedChunks);

    // Step 4: ดึงข้อมูล Preview, กรอง, และประมวลผล
    let resultsPreview: ISearchRecordPreview[] = [];
    matchedWords.forEach((word) => {
      if (allPreviewsMap[word]) {
        resultsPreview.push(...allPreviewsMap[word]);
      }
    });

    if (searchTerms.length > 1) {
      const subsequentTerms = searchTerms.slice(1);
      resultsPreview = resultsPreview.filter((p) => {
        const fullText = `${p.t} ${p.a}`.toLowerCase();
        return subsequentTerms.every((term) => fullText.includes(term));
      });
    }

    const uniqueResults = new Map<number, ISearchRecordPreview>();
    for (const preview of resultsPreview) {
      if (!uniqueResults.has(preview.i)) {
        uniqueResults.set(preview.i, preview);
      }
    }

    const finalRecords: ITrackData[] = Array.from(uniqueResults.values())
      .slice(0, maxResults)
      .map(
        (preview) =>
          ({
            TITLE: preview.t,
            ARTIST: preview.a,
            _originalIndex: preview.i,
            CODE: "",
            TYPE: "MIDI",
          } as ITrackData)
      );

    const searchTime = Date.now() - startTime;
    return {
      records: finalRecords,
      searchTime,
      totalFound: uniqueResults.size,
      terminatedEarly: uniqueResults.size > maxResults,
    };
  }

  private findFirstWordWithPrefix(prefix: string): number {
    let low = 0;
    let high = this.sortedWords.length - 1;
    let result = -1;

    while (low <= high) {
      const mid = Math.floor(low + (high - low) / 2);
      if (this.sortedWords[mid].startsWith(prefix)) {
        result = mid;
        high = mid - 1;
      } else if (
        this.sortedWords[mid].localeCompare(prefix, "th-TH-u-co-trad") < 0
      ) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return result;
  }
}
