import { DBFRecord } from "../types/dbf.type";

// Text Processing Utility
export class TextProcessor {
  private static readonly SEARCHABLE_FIELDS = [
    "TITLE",
    "ARTIST",
    "ALBUM",
    "AUTHOR",
    "LYR_TITLE",
  ];

  private static readonly FIELD_PRIORITY = {
    TITLE: 1,
    ARTIST: 2,
    LYR_TITLE: 3,
  } as const;

  static extractWords(text: string): string[] {
    if (!text) return [];
    const words = text.toLowerCase().match(/[a-zA-Zก-๙]+/g) || [];
    return words.filter((word) => word.length > 1);
  }

  static getSearchableText(
    record: DBFRecord,
    searchAllFields: boolean = true
  ): string {
    const fieldsToSearch = searchAllFields
      ? Object.keys(record)
      : this.SEARCHABLE_FIELDS;

    return fieldsToSearch.map((field) => String(record[field] || "")).join(" ");
  }

  static calculatePriority(record: DBFRecord, searchTerms: string[]): number {
    for (const [field, priority] of Object.entries(this.FIELD_PRIORITY)) {
      const fieldText = String(record[field] || "").toLowerCase();
      if (searchTerms.some((term) => fieldText.includes(term))) {
        return priority;
      }
    }
    return 99; // Default low priority
  }

  static getSearchableFields(): string[] {
    return [...this.SEARCHABLE_FIELDS];
  }
}
