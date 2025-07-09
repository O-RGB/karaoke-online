import { ITrackData } from "@/features/songs/types/songs.type";
import { DBFHeader, DBFField } from "./types/dbf-type";

export class DBFParser {
  // DBF Parser methods
  async parseHeader(fileBuffer: ArrayBuffer): Promise<DBFHeader> {
    const view = new DataView(fileBuffer);
    const recordCount = view.getUint32(4, true);
    const headerLength = view.getUint16(8, true);
    const recordLength = view.getUint16(10, true);
    const fieldCount = Math.floor((headerLength - 33) / 32);

    const fields: DBFField[] = [];
    let offset = 32;

    for (let i = 0; i < fieldCount; i++) {
      const nameBytes = new Uint8Array(fileBuffer, offset, 11);
      const name = new TextDecoder("ascii")
        .decode(nameBytes)
        .replace(/\0.*$/, "");
      const fieldType = String.fromCharCode(view.getUint8(offset + 11));
      const length = view.getUint8(offset + 16);
      fields.push({ name, type: fieldType, length });
      offset += 32;
    }

    return { recordCount, headerLength, recordLength, fields };
  }

  tryDecode(fieldBytes: Uint8Array): string {
    const encodings = ["tis-620", "cp874", "utf-8", "latin1", "ascii"];
    for (const encoding of encodings) {
      try {
        return new TextDecoder(encoding as any).decode(fieldBytes).trim();
      } catch (e) {
        continue;
      }
    }
    return "";
  }

  async parseRecords(
    fileBuffer: ArrayBuffer,
    header: DBFHeader,
    start: number = 0,
    end?: number
  ): Promise<ITrackData[]> {
    const actualEnd = end || header.recordCount;
    const records: ITrackData[] = [];
    const view = new DataView(fileBuffer);

    for (let i = start; i < Math.min(actualEnd, header.recordCount); i++) {
      const recordOffset = header.headerLength + i * header.recordLength;
      if (view.getUint8(recordOffset) === 0x2a) continue;

      const record: any = { _originalIndex: i };
      let fieldOffset = recordOffset + 1;

      for (const field of header.fields) {
        const fieldBytes = new Uint8Array(
          fileBuffer,
          fieldOffset,
          field.length
        );
        record[field.name] = this.tryDecode(fieldBytes);
        fieldOffset += field.length;
      }

      records.push(record);
    }

    return records;
  }
}
