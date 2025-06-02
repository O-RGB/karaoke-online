import { DBFRecord } from "../types/dbf.type";

// CRUD Operations Manager
export class CRUDManager {
  private nextRecordId: number = 1;
  private newRecords: DBFRecord[] = [];
  private modifiedRecords: Map<number, DBFRecord> = new Map();
  private deletedRecordIndexes: Set<number> = new Set();

  addRecord(recordData: Partial<DBFRecord>): DBFRecord {
    const newRecord: DBFRecord = {
      id: this.nextRecordId,
      TITLE: recordData.TITLE || "",
      ARTIST: recordData.ARTIST || "",
      ALBUM: recordData.ALBUM || "",
      AUTHOR: recordData.AUTHOR || "",
      LYR_TITLE: recordData.LYR_TITLE || "",
      _isNew: true,
      _originalIndex: -1,
    };

    this.newRecords.push(newRecord);
    this.nextRecordId++;

    console.log(`Added record '${newRecord.TITLE}' successfully`);
    return newRecord;
  }

  updateRecord(
    originalIndex: number,
    recordData: Partial<DBFRecord>
  ): DBFRecord {
    const updatedRecord: DBFRecord = {
      TITLE: recordData.TITLE || "",
      ARTIST: recordData.ARTIST || "",
      ALBUM: recordData.ALBUM || "",
      AUTHOR: recordData.AUTHOR || "",
      LYR_TITLE: recordData.LYR_TITLE || "",
      _isModified: true,
      _originalIndex: originalIndex,
    };

    this.modifiedRecords.set(originalIndex, updatedRecord);
    console.log(`Updated record (index ${originalIndex}) successfully`);

    return updatedRecord;
  }

  deleteRecord(originalIndex: number): void {
    this.deletedRecordIndexes.add(originalIndex);
    this.modifiedRecords.delete(originalIndex);
    console.log(`Deleted record (index ${originalIndex}) successfully`);
  }

  isRecordDeleted(originalIndex: number): boolean {
    return this.deletedRecordIndexes.has(originalIndex);
  }

  applyModifications(record: DBFRecord): DBFRecord {
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

  getNewRecords(): DBFRecord[] {
    return [...this.newRecords];
  }

  getStats() {
    return {
      newRecords: this.newRecords.length,
      modifiedRecords: this.modifiedRecords.size,
      deletedRecords: this.deletedRecordIndexes.size,
    };
  }
}
