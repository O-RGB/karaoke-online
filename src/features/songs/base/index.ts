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
    const MAX_CHUNK_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

    for (const word of sortedWords) {
      const previews = wordToPreviewsMap.get(word)!;
      currentChunk[word] = previews;
      wordToChunkMap[word] = chunkId;

      currentChunkSize += JSON.stringify(previews).length + word.length * 2;

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
    await this.initializeDataSource(); 
    this.sortedWords = masterIndex.words;
    this.wordToChunkMap = masterIndex.wordToChunkMap;
    console.log("Optimized Index (V6) loaded successfully.");
    return true;
  }

  /**
   * ADDED: เมธอดใหม่สำหรับให้คะแนนผลลัพธ์
   */
  protected calculateV6Score(
    preview: ISearchRecordPreview,
    originalQuery: string,
    searchTerms: string[]
  ): number {
    const title = preview.t.toLowerCase();
    const artist = preview.a.toLowerCase();
    const query = originalQuery.toLowerCase().trim();

    // Priority 1: ตรงกับชื่อเพลงทั้งประโยคแบบเป๊ะๆ
    if (title === query) return 1;
    // Priority 2: ขึ้นต้นด้วยคำค้นหาในชื่อเพลง
    if (title.startsWith(query)) return 2;
    // Priority 3: คำค้นหาทุกคำอยู่ในชื่อเพลง
    if (searchTerms.every((term) => title.includes(term))) return 3;
    // Priority 4: คำค้นหาทุกคำอยู่ในชื่อศิลปิน
    if (searchTerms.every((term) => artist.includes(term))) return 4;
    // Priority 5: คำค้นหาทุกคำกระจายอยู่ในชื่อเพลงและศิลปิน
    const fullText = `${title} ${artist}`;
    if (searchTerms.every((term) => fullText.includes(term))) return 5;
    // ถ้าไม่เข้าเงื่อนไขไหนเลย ให้ความสำคัญต่ำสุด
    return 99;
  }

  /**
   * CHANGED: แก้ไขฟังก์ชัน search ทั้งหมดเพื่อเพิ่ม Scoring และ Sorting
   */
  public async search(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult> {
    const { maxResults = this.DEFAULT_MAX_RESULTS } = options;
    const startTime = Date.now();

    if (this.sortedWords.length === 0) {
      return { records: [], searchTime: 0, totalFound: 0 };
    }

    const searchTerms = this.extractWords(query);
    if (searchTerms.length === 0) {
      return { records: [], searchTime: 0, totalFound: 0 };
    }

    const prefix = searchTerms[0];

    // Step 1: ใช้ Binary Search เพื่อหาตำแหน่งเริ่มต้น (เหมือนเดิม)
    const startIndex = this.findFirstWordWithPrefix(prefix);
    if (startIndex === -1) {
      return { records: [], searchTime: 0, totalFound: 0 };
    }

    // Step 2: รวบรวมคำและ Chunk ID ที่เกี่ยวข้อง (เหมือนเดิม)
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

    // Step 3: โหลด Preview Chunks ที่จำเป็น (เหมือนเดิม)
    const chunkPromises = Array.from(chunksToLoad).map((id) =>
      this.loadPreviewChunk(id)
    );
    const loadedChunks = (await Promise.all(chunkPromises)).filter(
      (c) => c !== null
    ) as PreviewChunk[];
    const allPreviewsMap: PreviewChunk = Object.assign({}, ...loadedChunks);

    // Step 4: ดึงข้อมูล Preview (เหมือนเดิม)
    let resultsPreview: ISearchRecordPreview[] = [];
    matchedWords.forEach((word) => {
      if (allPreviewsMap[word]) {
        resultsPreview.push(...allPreviewsMap[word]);
      }
    });

    // --- NEW SCORING & SORTING LOGIC ---

    // Step 5: กรอง, ลดความซ้ำซ้อน, และ "ให้คะแนน" ผลลัพธ์
    const uniqueScoredResults = new Map<
      number,
      { preview: ISearchRecordPreview; score: number }
    >();

    for (const preview of resultsPreview) {
      const fullText = `${preview.t} ${preview.a}`.toLowerCase();
      if (searchTerms.every((term) => fullText.includes(term))) {
        const score = this.calculateV6Score(preview, query, searchTerms);
        if (
          !uniqueScoredResults.has(preview.i) ||
          score < uniqueScoredResults.get(preview.i)!.score
        ) {
          uniqueScoredResults.set(preview.i, { preview, score });
        }
      }
    }

    // Step 6: จัดเรียงผลลัพธ์ตามคะแนน (น้อยไปมาก)
    const sortedResults = Array.from(uniqueScoredResults.values()).sort(
      (a, b) => a.score - b.score
    );

    // Step 7: ตัดจำนวนผลลัพธ์ และแปลงเป็นรูปแบบที่ต้องการ
    const finalRecords: ITrackData[] = sortedResults.slice(0, maxResults).map(
      (item) =>
        ({
          TITLE: item.preview.t,
          ARTIST: item.preview.a,
          _originalIndex: item.preview.i,
          _priority: item.score,
        } as ITrackData)
    );

    const searchTime = Date.now() - startTime;
    return {
      records: finalRecords,
      searchTime,
      totalFound: uniqueScoredResults.size,
      terminatedEarly: uniqueScoredResults.size > maxResults,
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
