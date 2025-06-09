export interface StoreConfig {
  name: string;
  keyPath?: string;
  autoIncrement?: boolean;
  indexes?: IndexConfig[];
}

export interface IndexConfig {
  name: string;
  keyPath: string;
  options?: IDBIndexParameters;
}

export interface DatabaseConfig {
  name: string;
  version: number;
  stores: StoreConfig[];
}
