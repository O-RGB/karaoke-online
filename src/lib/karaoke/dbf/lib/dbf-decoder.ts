import { DBFHeader, DBFField, DBFRecord } from "../types/dbf.type";

export class DBFParser {
  private header: DBFHeader | null = null;

  constructor() {}

  async parseHeader(fileBuffer: ArrayBuffer): Promise<DBFHeader> {
    const view = new DataView(fileBuffer);

    // Extract basic info
    const recordCount = view.getUint32(4, true); // little endian
    const headerLength = view.getUint16(8, true);
    const recordLength = view.getUint16(10, true);

    // Calculate field count
    const fieldCount = Math.floor((headerLength - 33) / 32);

    // Read field descriptors
    const fields: DBFField[] = [];
    let offset = 32;

    for (let i = 0; i < fieldCount; i++) {
      // Field name (first 11 bytes, null-terminated)
      const nameBytes = new Uint8Array(fileBuffer, offset, 11);
      const name = new TextDecoder("ascii")
        .decode(nameBytes)
        .replace(/\0.*$/, "");

      // Field type
      const fieldType = String.fromCharCode(view.getUint8(offset + 11));

      // Field length
      const length = view.getUint8(offset + 16);

      fields.push({ name, type: fieldType, length });
      offset += 32;
    }

    this.header = {
      recordCount,
      headerLength,
      recordLength,
      fields,
    };

    return this.header;
  }

  private tryDecode(fieldBytes: Uint8Array, encodings: string[]): string {
    for (const encoding of encodings) {
      try {
        const decoder = new TextDecoder(encoding as any);
        return decoder.decode(fieldBytes).trim();
      } catch (e) {
        // Ignore unsupported encodings
      }
    }
    return ""; // fallback if all decoding fails
  }

  async parseRecords(
    fileBuffer: ArrayBuffer,
    start: number = 0,
    end?: number
  ): Promise<DBFRecord[]> {
    if (!this.header) {
      await this.parseHeader(fileBuffer);
    }

    const actualEnd = end || this.header!.recordCount;
    const records: DBFRecord[] = [];
    const view = new DataView(fileBuffer);

    const encodings = ["tis-620", "cp874", "utf-8", "latin1", "ascii"];

    for (
      let i = start;
      i < Math.min(actualEnd, this.header!.recordCount);
      i++
    ) {
      const recordOffset =
        this.header!.headerLength + i * this.header!.recordLength;

      if (view.getUint8(recordOffset) === 0x2a) {
        continue;
      }

      const record: DBFRecord = { _originalIndex: i };
      let fieldOffset = recordOffset + 1;

      for (const field of this.header!.fields) {
        const fieldBytes = new Uint8Array(
          fileBuffer,
          fieldOffset,
          field.length
        );

        const value = this.tryDecode(fieldBytes, encodings);
        record[field.name] = value;

        fieldOffset += field.length;
      }

      records.push(record);
    }

    return records;
  }
}
