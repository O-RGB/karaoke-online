import {
  SearchOptions,
  MasterIndex,
  DBFRecord,
  SearchResult,
} from "../types/dbf.type";
import { CRUDManager } from "./crud-manager";
import { IndexManager } from "./index-manager";
import { TextProcessor } from "./text-processor";

// Search Operations
export class SearchProcessor {
  private indexManager: IndexManager;
  private crudManager: CRUDManager;
  private DEFAULT_MAX_RESULTS = 50;

  constructor(indexManager: IndexManager, crudManager: CRUDManager) {
    this.indexManager = indexManager;
    this.crudManager = crudManager;
  }

  async executeSearch(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult> {
    const {
      exactMatch = false,
      searchAllFields = true,
      maxResults = this.DEFAULT_MAX_RESULTS,
    } = options;

    const masterIndex = this.indexManager.getMasterIndex();

    if (!masterIndex) {
      throw new Error("Search index not found. Please build index first.");
    }

    const startTime = Date.now();
    const searchTerms = TextProcessor.extractWords(query);

    if (searchTerms.length === 0) {
      return { records: [] as DBFRecord[], searchTime: 0, totalFound: 0 };
    }

    console.log(
      `Executing search for terms: ${searchTerms} (max results: ${maxResults})`
    );

    const relevantChunks = this.findRelevantChunks(
      searchTerms,
      masterIndex,
      exactMatch
    );

    // Early termination: ถ้า relevant chunks เยอะมาก ให้ลิมิตการประมวลผล
    const maxChunksToProcess = Math.min(relevantChunks.length, 50);
    const chunksToProcess = relevantChunks.slice(0, maxChunksToProcess);

    const searchResults = await this.searchInChunksWithLimit(
      chunksToProcess,
      searchTerms,
      exactMatch,
      searchAllFields,
      maxResults
    );

    // ถ้าได้ผลลัพธ์ครบ limit แล้ว ไม่ต้องค้นหา new records
    if (searchResults.length >= maxResults) {
      const searchTime = Date.now() - startTime;
      console.log(
        `Found ${searchResults.length} results in ${searchTime}ms (terminated early)`
      );

      return {
        records: searchResults.slice(0, maxResults),
        searchTime,
        totalFound: searchResults.length,
        terminatedEarly: true,
      };
    }

    const remainingSlots = maxResults - searchResults.length;
    const newRecordResults = this.searchInNewRecordsWithLimit(
      searchTerms,
      exactMatch,
      searchAllFields,
      remainingSlots
    );

    const allResults = [...searchResults, ...newRecordResults];
    const sortedResults = this.sortSearchResults(allResults);
    const finalResults = sortedResults.slice(0, maxResults);

    const searchTime = Date.now() - startTime;
    console.log(`Found ${finalResults.length} results in ${searchTime}ms`);

    return {
      records: finalResults,
      searchTime,
      totalFound: finalResults.length,
    };
  }

  private findRelevantChunks(
    searchTerms: string[],
    masterIndex: MasterIndex,
    exactMatch: boolean
  ): Array<{ chunkId: number; relevanceScore: number }> {
    const chunkRelevanceScores: Record<number, number> = {};

    searchTerms.forEach((term) => {
      Object.entries(masterIndex.wordToChunks).forEach(
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

    return Object.entries(chunkRelevanceScores)
      .map(([chunkId, score]) => ({
        chunkId: parseInt(chunkId),
        relevanceScore: score,
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  private async searchInChunksWithLimit(
    relevantChunks: Array<{ chunkId: number; relevanceScore: number }>,
    searchTerms: string[],
    exactMatch: boolean,
    searchAllFields: boolean,
    maxResults: number
  ): Promise<DBFRecord[]> {
    const results: DBFRecord[] = [];

    for (const { chunkId } of relevantChunks) {
      // หยุดการประมวลผลเมื่อได้ผลลัพธ์ครบแล้ว
      if (results.length >= maxResults) {
        console.log(`Stopping chunk processing at ${results.length} results`);
        break;
      }

      const chunkData = await this.indexManager.loadChunkData(chunkId);
      if (!chunkData) continue;

      const remainingSlots = maxResults - results.length;
      const chunkResults = this.searchInChunkRecordsWithLimit(
        chunkData.records,
        searchTerms,
        exactMatch,
        searchAllFields,
        remainingSlots
      );

      results.push(...chunkResults);
    }

    return results;
  }

  private searchInChunkRecordsWithLimit(
    records: DBFRecord[],
    searchTerms: string[],
    exactMatch: boolean,
    searchAllFields: boolean,
    maxResults: number
  ): DBFRecord[] {
    const results: DBFRecord[] = [];

    for (const record of records) {
      // หยุดการประมวลผลเมื่อได้ผลลัพธ์ครบแล้ว
      if (results.length >= maxResults) {
        break;
      }

      if (this.crudManager.isRecordDeleted(record._originalIndex)) {
        continue;
      }

      const processedRecord = this.crudManager.applyModifications(record);
      const matchResult = this.evaluateRecordMatch(
        processedRecord,
        searchTerms,
        exactMatch,
        searchAllFields
      );

      if (matchResult.isMatch) {
        processedRecord._matchedTerms = matchResult.matchedTerms;
        processedRecord._priority = matchResult.priority;
        results.push(processedRecord);
      }
    }

    return results;
  }

  private searchInNewRecordsWithLimit(
    searchTerms: string[],
    exactMatch: boolean,
    searchAllFields: boolean,
    maxResults: number
  ): DBFRecord[] {
    const newRecords = this.crudManager.getNewRecords();
    const results: DBFRecord[] = [];

    for (const record of newRecords) {
      // หยุดการประมวลผลเมื่อได้ผลลัพธ์ครบแล้ว
      if (results.length >= maxResults) {
        break;
      }

      const matchResult = this.evaluateRecordMatch(
        record,
        searchTerms,
        exactMatch,
        searchAllFields
      );

      if (matchResult.isMatch) {
        const resultRecord = { ...record };
        resultRecord._matchedTerms = matchResult.matchedTerms;
        resultRecord._priority = matchResult.priority;
        resultRecord._isNew = true;
        results.push(resultRecord);
      }
    }

    return results;
  }

  private evaluateRecordMatch(
    record: DBFRecord,
    searchTerms: string[],
    exactMatch: boolean,
    searchAllFields: boolean
  ): { isMatch: boolean; matchedTerms: string[]; priority: number } {
    const searchableText = TextProcessor.getSearchableText(
      record,
      searchAllFields
    ).toLowerCase();

    const matchedTerms = searchTerms.filter((term) => {
      return exactMatch
        ? searchableText.split(" ").includes(term)
        : searchableText.includes(term);
    });

    const isMatch = matchedTerms.length > 0;
    const priority = isMatch
      ? TextProcessor.calculatePriority(record, searchTerms)
      : 99;

    return { isMatch, matchedTerms, priority };
  }

  private sortSearchResults(results: DBFRecord[]): DBFRecord[] {
    return results.sort((a, b) => {
      // Primary sort: by priority (lower number = higher priority)
      if (a._priority !== b._priority) {
        return (a._priority || 99) - (b._priority || 99);
      }

      // Secondary sort: by number of matched terms (more matches = higher relevance)
      return (b._matchedTerms?.length || 0) - (a._matchedTerms?.length || 0);
    });
  }

  // Helper method สำหรับปรับ default limit
  setDefaultMaxResults(limit: number): void {
    this.DEFAULT_MAX_RESULTS = limit;
  }

  getDefaultMaxResults(): number {
    return this.DEFAULT_MAX_RESULTS;
  }
}
