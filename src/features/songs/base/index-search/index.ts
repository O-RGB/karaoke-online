import { SoundSystemMode } from "@/features/config/types/config.type";
import {
  ITrackData,
  MasterIndex,
  PreviewChunk,
  KaraokeExtension,
  ISearchRecordPreview,
  SearchOptions,
} from "../../types/songs.type";
import { ProcessingDialogProps } from "@/components/common/alert/processing";

export abstract class BaseSongsSystemReader {
  protected system: SoundSystemMode | undefined;
  protected sortedWords: string[] = [];
  protected wordToChunkMap: Record<string, number> = {};

  protected newRecords: ITrackData[] = [];
  protected modifiedRecords: Map<number, ITrackData> = new Map();
  protected deletedRecordIndexes: Set<number> = new Set();

  protected readonly SEARCHABLE_FIELDS = [
    "TITLE",
    "ARTIST",
    "AUTHOR",
    "LYR_TITLE",
  ];
  protected readonly FIELD_PRIORITY = { TITLE: 1, ARTIST: 2, LYR_TITLE: 3 };
  protected readonly DEFAULT_MAX_RESULTS = 50;

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
  ): Promise<KaraokeExtension<File> | undefined>;

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

  public async buildIndex(
    setProgress?: (value: ProcessingDialogProps) => void
  ): Promise<boolean> {
    const startTime = Date.now();

    setProgress?.({
      status: {
        progress: 0,
        text: "Building Optimized Index (V6)",
        working: "Initializing",
      },
    });

    await this.initializeDataSource();
    const totalRecords = await this.getTotalRecords();

    setProgress?.({
      status: {
        text: "Building Optimized Index (V6)",
        working: `Loading ${totalRecords.toLocaleString()} records into memory...`,
        progress: 5,
      },
    });
    const allRecords = await this.getRecordsBatch(0, totalRecords);
    const wordToPreviewsMap = new Map<string, ISearchRecordPreview[]>();

    setProgress?.({
      status: {
        working: `Analyzing records...`,
        text: "Building Optimized Index (V6)",
        progress: 20,
      },
    });

    allRecords.forEach((record) => {
      const preview: ISearchRecordPreview = {
        t: record.TITLE,
        a: record.ARTIST,
        i: record._originalIndex,
        s: record._superIndex ? record._superIndex : 0,
      };
      const words = this.extractWords(this.getSearchableText(record));
      words.forEach((word) => {
        if (!wordToPreviewsMap.has(word)) wordToPreviewsMap.set(word, []);
        wordToPreviewsMap.get(word)!.push(preview);
      });
    });

    setProgress?.({
      status: {
        text: "Building Optimized Index (V6)",
        working: `Sorting words and creating chunks...`,
        progress: 70,
      },
    });

    const sortedWords = Array.from(wordToPreviewsMap.keys()).sort((a, b) =>
      a.localeCompare(b, "th-TH-u-co-trad")
    );
    const wordToChunkMap: Record<string, number> = {};
    let currentChunk: PreviewChunk = {};
    let currentChunkSize = 0;
    let chunkId = 0;
    const MAX_CHUNK_SIZE_BYTES = 5 * 1024 * 1024;

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
      status: {
        text: "Building Optimized Index (V6)",
        working: `Saving master index...`,
        progress: 95,
      },
    });

    const masterIndexToSave: MasterIndex = {
      totalRecords,
      words: sortedWords,
      wordToChunkMap,
      buildTime: Date.now() - startTime,
      lastBuilt: new Date().toISOString(),
      initialToChunkMap: {},
    };
    await this.saveMasterIndex(masterIndexToSave);

    this.sortedWords = sortedWords;
    this.wordToChunkMap = wordToChunkMap;

    setProgress?.({
      variant: "success",
      status: {
        text: "Building Optimized Index (V6)",
        working: `Optimized Index (V6) built in ${masterIndexToSave.buildTime}ms.`,
        progress: 100,
      },
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

  protected calculateV6Score(
    preview: ISearchRecordPreview,
    originalQuery: string,
    searchTerms: string[]
  ): number {
    const title = preview.t.toLowerCase();
    const artist = preview.a.toLowerCase();
    const query = originalQuery.toLowerCase().trim();

    if (title === query) return 1;
    if (title.startsWith(query)) return 2;
    if (searchTerms.every((term) => title.includes(term))) return 3;
    if (searchTerms.every((term) => artist.includes(term))) return 4;

    const fullText = `${title} ${artist}`;
    if (searchTerms.every((term) => fullText.includes(term))) return 5;

    return 99;
  }

  public async search(
    query: string,
    options: SearchOptions = {}
  ): Promise<ITrackData[]> {
    if (!this.system) return [];

    const { maxResults = this.DEFAULT_MAX_RESULTS } = options;
    const startTime = Date.now();

    if (this.sortedWords.length === 0) {
      return [];
    }

    const searchTerms = this.extractWords(query);
    if (searchTerms.length === 0) {
      return [];
    }

    const prefix = searchTerms[0];

    const startIndex = this.findFirstWordWithPrefix(prefix);
    if (startIndex === -1) {
      return [];
    }

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

    const chunkPromises = Array.from(chunksToLoad).map((id) =>
      this.loadPreviewChunk(id)
    );
    const loadedChunks = (await Promise.all(chunkPromises)).filter(
      (c) => c !== null
    ) as PreviewChunk[];
    const allPreviewsMap: PreviewChunk = Object.assign({}, ...loadedChunks);

    let resultsPreview: ISearchRecordPreview[] = [];
    matchedWords.forEach((word) => {
      if (allPreviewsMap[word]) {
        resultsPreview.push(...allPreviewsMap[word]);
      }
    });

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

    const sortedResults = Array.from(uniqueScoredResults.values()).sort(
      (a, b) => a.score - b.score
    );

    const finalRecords: ITrackData[] = sortedResults.slice(0, maxResults).map(
      (item) =>
        ({
          TITLE: item.preview.t,
          ARTIST: item.preview.a,
          _originalIndex: item.preview.i,
          _superIndex: item.preview.s,
          _priority: item.score,
          _system: this.system,
        } as ITrackData)
    );

    const searchTime = Date.now() - startTime;

    return finalRecords;
  }

  protected findFirstWordWithPrefix(prefix: string): number {
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
