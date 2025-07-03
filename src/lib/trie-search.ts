import { ITrackData } from "@/features/songs/types/songs.type";
import TrieSearch from "trie-search";

const trieOptions = {
  ignoreCase: true,
  splitOnRegEx: /\s+/,
  min: 0,
  keepAll: false,
  cache: false,
  fuzzy: true,
  expandRegexes: [
    {
      regex: /[่้๊๋]/g,
      alternate: "",
    },
  ],
};

export class TrieSearchService<T extends { [key: string]: any }> {
  private static instance: TrieSearchService<any>;

  private trie: TrieSearch<T>;

  private constructor() {
    this.trie = new TrieSearch<T>(
      ["CODE", "TITLE", "ARTIST", "LYR_TITLE"],
      trieOptions
    );
    console.log("TrieSearchService instance created.");
  }

  public static getInstance<
    U extends { [key: string]: any } = ITrackData
  >(): TrieSearchService<U> {
    if (!TrieSearchService.instance) {
      TrieSearchService.instance = new TrieSearchService<U>();
    }
    return TrieSearchService.instance;
  }

  public addAll(list: T[]): void {
    this.trie.addAll(list);
  }

  // ===== 👇 เพิ่มฟังก์ชันนี้เข้ามาใหม่ =====
  /**
   * Adds a single item to the trie index.
   * @param item The item to add.
   */
  public add(item: T): void {
    this.trie.add(item);
  }
  // ===== 👆 สิ้นสุดส่วนที่เพิ่มใหม่ =====

  public search(value: string, limit: number = 20): T[] {
    if (!this.trie || !value) {
      return [];
    }

    const results = this.trie.search(value, undefined, limit);
    return results || [];
  }

  public clear(): void {
    this.trie = new TrieSearch<T>(
      ["CODE", "TITLE", "ARTIST", "LYR_TITLE"],
      trieOptions
    );
  }
}
