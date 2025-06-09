// Types
export interface DBFField {
  name: string;
  type: string;
  length: number;
}

export interface DBFHeader {
  recordCount: number;
  headerLength: number;
  recordLength: number;
  fields: DBFField[];
}
