import { IDBPDatabase, IDBPTransaction, openDB } from "idb";

// Types
export interface IndexConfig {
  name: string;
  keyPath: string | string[];
  options?: IDBIndexParameters;
}

export interface StoreConfig {
  name: string;
  keyPath?: string | string[];
  autoIncrement?: boolean;
  indexes?: IndexConfig[];
}

export interface DatabaseConfig {
  name: string;
  version: number;
  stores: StoreConfig[];
}

export interface DatabaseStats {
  [dbName: string]: {
    version: number;
    stores: {
      [storeName: string]: number | string;
    };
  };
}

/**
 * DatabaseManagerCore - จัดการ IndexedDB แบบ Singleton
 * TypeScript 2025 Version with modern features
 */
export class DatabaseCommonCore {
  private static instance: DatabaseCommonCore | null = null;
  private readonly databases: Map<string, IDBPDatabase> = new Map();
  private readonly configs: Map<string, DatabaseConfig> = new Map();

  constructor() {}

  /**
   * Singleton pattern - รับ instance เดียว
   */
  public static getInstance(): DatabaseCommonCore {
    DatabaseCommonCore.instance ??= new DatabaseCommonCore();
    return DatabaseCommonCore.instance;
  }

  // ==================== Configuration Management ====================

  /**
   * ลงทะเบียน database config
   */
  public registerDatabase(config: DatabaseConfig): void {
    this.configs.set(config.name, { ...config });
  }

  /**
   * ลงทะเบียน databases หลายตัวพร้อมกัน
   */
  public registerDatabases(configs: readonly DatabaseConfig[]): void {
    configs.forEach((config) => this.registerDatabase(config));
  }

  // ==================== Database Creation & Management ====================

  /**
   * สร้าง database ใหม่
   */
  public async createDatabase(config: DatabaseConfig): Promise<IDBPDatabase> {
    try {
      // ลงทะเบียน config
      this.registerDatabase(config);

      const db = await openDB(config.name, config.version, {
        upgrade: (database, oldVersion, newVersion, transaction) => {
          console.log(
            `Creating/Upgrading ${config.name} from v${oldVersion} to v${newVersion}`
          );

          // สร้าง stores ทั้งหมด
          config.stores.forEach((storeConfig) => {
            if (!database.objectStoreNames.contains(storeConfig.name)) {
              const store = database.createObjectStore(storeConfig.name, {
                keyPath: storeConfig.keyPath,
                autoIncrement: storeConfig.autoIncrement ?? false,
              });

              // สร้าง indexes ถ้ามี
              storeConfig.indexes?.forEach((indexConfig) => {
                store.createIndex(
                  indexConfig.name,
                  indexConfig.keyPath,
                  indexConfig.options
                );
              });

              console.log(`Created store: ${storeConfig.name}`);
            }
          });
        },
        blocked: () => console.warn(`${config.name} upgrade blocked`),
        blocking: () =>
          console.warn(`${config.name} is blocking another upgrade`),
        terminated: () => console.error(`${config.name} connection terminated`),
      });

      this.databases.set(config.name, db);
      return db;
    } catch (error) {
      console.error(`Error creating database ${config.name}:`, error);
      throw error;
    }
  }

  /**
   * เพิ่ม store ใหม่เข้าไปใน database ที่มีอยู่
   */
  public async addStore(
    dbName: string,
    storeConfig: StoreConfig
  ): Promise<void> {
    const config = this.configs.get(dbName);
    if (!config) {
      throw new Error(`Database config not found: ${dbName}`);
    }

    // ตรวจสอบว่า store มีอยู่แล้วหรือไม่
    if (config.stores.some((store) => store.name === storeConfig.name)) {
      console.log(`Store ${storeConfig.name} already exists in ${dbName}`);
      return;
    }

    // ปิดการเชื่อมต่อเก่า
    await this.closeDatabase(dbName);

    // เพิ่ม store config
    config.stores.push({ ...storeConfig });
    config.version += 1;

    // สร้าง database ใหม่
    await this.createDatabase(config);
  }

  /**
   * ลบ store ออกจาก database
   */
  public async removeStore(dbName: string, storeName: string): Promise<void> {
    const config = this.configs.get(dbName);
    if (!config) {
      throw new Error(`Database config not found: ${dbName}`);
    }

    // ลบ store config
    config.stores = config.stores.filter((store) => store.name !== storeName);
    config.version += 1;

    // ปิดการเชื่อมต่อเก่า
    await this.closeDatabase(dbName);

    // สร้าง database ใหม่
    await this.createDatabase(config);
  }

  /**
   * ได้รับ database instance
   */
  public async getDatabase(dbName: string): Promise<IDBPDatabase> {
    // ถ้ามี instance อยู่แล้ว
    const existingDb = this.databases.get(dbName);
    if (existingDb) {
      return existingDb;
    }

    // ค้นหา config
    const config = this.configs.get(dbName);
    if (!config) {
      throw new Error(
        `Database config not found: ${dbName}. Please register the database first.`
      );
    }

    // สร้าง database
    return await this.createDatabase(config);
  }

  /**
   * ได้รับ database ที่มี store นั้นๆ
   */
  public async getDatabaseForStore(storeName: string): Promise<IDBPDatabase> {
    // หาใน configs ที่ลงทะเบียนไว้
    for (const config of Array.from(this.configs.values())) {
      if (config.stores.some((store) => store.name === storeName)) {
        return await this.getDatabase(config.name);
      }
    }

    throw new Error(`Store ${storeName} not found in any registered database`);
  }

  // ==================== CRUD Operations ====================

  /**
   * เพิ่มข้อมูล
   */
  public async add<T = any>(
    dbName: string,
    storeName: string,
    data: T
  ): Promise<IDBValidKey> {
    const db = await this.getDatabase(dbName);
    const key = (data as any).id;
    return await db.add(storeName, data, key);
  }

  /**
   * เพิ่มข้อมูลโดยอ้างอิง store name อย่างเดียว
   */
  public async addToStore<T = any>(
    storeName: string,
    data: T
  ): Promise<IDBValidKey> {
    const db = await this.getDatabaseForStore(storeName);
    const key = (data as any).id;
    return await db.add(storeName, data, key);
  }

  /**
   * อัพเดท/บันทึกข้อมูล
   */
  public async put<T = any>(
    dbName: string,
    storeName: string,
    data: T
  ): Promise<IDBValidKey> {
    const db = await this.getDatabase(dbName);
    return await db.put(storeName, data);
  }

  public async putToStore<T = any>(
    storeName: string,
    data: T
  ): Promise<IDBValidKey> {
    const db = await this.getDatabaseForStore(storeName);
    return await db.put(storeName, data);
  }

  /**
   * ดึงข้อมูลตาม key
   */
  public async get<T = any>(
    dbName: string,
    storeName: string,
    key: IDBValidKey
  ): Promise<T | undefined> {
    const db = await this.getDatabase(dbName);
    return await db.get(storeName, key);
  }

  public async getFromStore<T = any>(
    storeName: string,
    key: IDBValidKey
  ): Promise<T | undefined> {
    const db = await this.getDatabaseForStore(storeName);
    return await db.get(storeName, key);
  }

  /**
   * ดึงข้อมูลทั้งหมด
   */
  public async getAll<T = any>(
    dbName: string,
    storeName: string,
    query?: IDBValidKey | IDBKeyRange,
    count?: number
  ): Promise<T[]> {
    const db = await this.getDatabase(dbName);
    return await db.getAll(storeName, query, count);
  }

  public async getAllFromStore<T = any>(
    storeName: string,
    query?: IDBValidKey | IDBKeyRange,
    count?: number
  ): Promise<T[]> {
    const db = await this.getDatabaseForStore(storeName);
    return await db.getAll(storeName, query, count);
  }

  public async getAllKeys(
    dbName: string,
    storeName: string,
    query?: IDBValidKey | IDBKeyRange,
    count?: number
  ): Promise<IDBValidKey[]> {
    const db = await this.getDatabase(dbName);
    return await db.getAllKeys(storeName, query, count);
  }

  public async getAllKeysFromStore(
    storeName: string,
    query?: IDBValidKey | IDBKeyRange,
    count?: number
  ): Promise<IDBValidKey[]> {
    const db = await this.getDatabaseForStore(storeName);
    return await db.getAllKeys(storeName, query, count);
  }

  /**
   * ดึงข้อมูลแบบมีเงื่อนไข
   */
  public async find<T = any>(
    dbName: string,
    storeName: string,
    predicate: (item: T) => boolean
  ): Promise<T[]> {
    const items = await this.getAll<T>(dbName, storeName);
    return items.filter(predicate);
  }

  public async findInStore<T = any>(
    storeName: string,
    predicate: (item: T) => boolean
  ): Promise<T[]> {
    const items = await this.getAllFromStore<T>(storeName);
    return items.filter(predicate);
  }

  /**
   * ค้นหาข้อมูลแบบ async iterator (สำหรับข้อมูลขนาดใหญ่)
   */
  public async *findIterator<T = any>(
    dbName: string,
    storeName: string,
    predicate: (item: T) => boolean
  ): AsyncGenerator<T, void, unknown> {
    const db = await this.getDatabase(dbName);
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);

    for await (const cursor of store) {
      if (predicate(cursor.value)) {
        yield cursor.value;
      }
    }
  }

  /**
   * ลบข้อมูลตาม key
   */
  public async delete(
    dbName: string,
    storeName: string,
    key: IDBValidKey | IDBKeyRange
  ): Promise<void> {
    const db = await this.getDatabase(dbName);
    await db.delete(storeName, key);
  }

  public async deleteFromStore(
    storeName: string,
    key: IDBValidKey | IDBKeyRange
  ): Promise<void> {
    const db = await this.getDatabaseForStore(storeName);
    await db.delete(storeName, key);
  }

  /**
   * ลบข้อมูลทั้งหมดใน store
   */
  public async clear(dbName: string, storeName: string): Promise<void> {
    const db = await this.getDatabase(dbName);
    await db.clear(storeName);
  }

  public async clearStore(storeName: string): Promise<void> {
    const db = await this.getDatabaseForStore(storeName);
    await db.clear(storeName);
  }

  /**
   * นับจำนวนข้อมูล
   */
  public async count(
    dbName: string,
    storeName: string,
    query?: IDBValidKey | IDBKeyRange
  ): Promise<number> {
    const db = await this.getDatabase(dbName);
    return await db.count(storeName, query);
  }

  public async countInStore(
    storeName: string,
    query?: IDBValidKey | IDBKeyRange
  ): Promise<number> {
    const db = await this.getDatabaseForStore(storeName);
    return await db.count(storeName, query);
  }

  /**
   * Batch operations สำหรับประสิทธิภาพที่ดีขึ้น
   */
  public async batchAdd<T = any>(
    dbName: string,
    storeName: string,
    items: readonly T[]
  ): Promise<IDBValidKey[]> {
    const db = await this.getDatabase(dbName);
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);

    const promises = items.map((item) => store.add(item));
    const results = await Promise.all(promises);
    await tx.done;

    return results;
  }

  public async batchPut<T = any>(
    dbName: string,
    storeName: string,
    items: readonly T[]
  ): Promise<IDBValidKey[]> {
    const db = await this.getDatabase(dbName);
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);

    const promises = items.map((item) => store.put(item));
    const results = await Promise.all(promises);
    await tx.done;

    return results;
  }

  /**
   * Transaction แบบ custom
   */
  public async transaction<R>(
    dbName: string,
    storeNames: string | readonly string[],
    mode: IDBTransactionMode,
    callback: (
      tx: IDBPTransaction<unknown, string[], IDBTransactionMode>
    ) => Promise<R>
  ): Promise<R> {
    const db = await this.getDatabase(dbName);
    const stores = Array.isArray(storeNames) ? storeNames : [storeNames];
    const tx = db.transaction(stores, mode);
    const result = await callback(tx);
    await tx.done;
    return result;
  }

  // ==================== Connection Management ====================

  /**
   * ปิดการเชื่อมต่อ database - รอให้ปิดจริงๆ
   */
  public async closeDatabase(dbName: string): Promise<void> {
    const db = this.databases.get(dbName);
    if (!db) return;

    return new Promise<void>((resolve) => {
      // ฟัง event ที่บอกว่าปิดแล้ว
      const closeHandler = () => {
        console.log(`Database ${dbName} closed completely`);
        resolve();
      };

      db.addEventListener("close", closeHandler, { once: true });

      // ปิด database
      db.close();
      this.databases.delete(dbName);

      // Fallback: รอสักครู่แล้ว resolve (กรณีที่ event ไม่ fire)
      setTimeout(() => {
        db.removeEventListener("close", closeHandler);
        resolve();
      }, 100);
    });
  }

  /**
   * ปิดการเชื่อมต่อทั้งหมด - รอให้ปิดจริงๆ
   */
  public async closeAllDatabases(): Promise<void> {
    const closePromises = Array.from(this.databases.keys()).map((dbName) =>
      this.closeDatabase(dbName)
    );

    await Promise.all(closePromises);

    // รอเพิ่มเติมให้แน่ใจว่าปิดหมดแล้ว
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log("All databases closed and ready for deletion");
  }

  // ==================== Database Deletion ====================

  /**
   * ลบ database - รอให้ blocking หมด
   */
  public async deleteDatabase(dbName: string): Promise<boolean> {
    try {
      // ปิดการเชื่อมต่อก่อน
      await this.closeDatabase(dbName);

      // รออีกนิดหนึ่งให้แน่ใจ
      await new Promise((resolve) => setTimeout(resolve, 100));

      return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(dbName);

        let resolved = false;

        const cleanup = () => {
          if (!resolved) {
            resolved = true;
            this.configs.delete(dbName);
          }
        };

        request.onsuccess = () => {
          cleanup();
          console.log(`Database ${dbName} deleted successfully`);
          resolve(true);
        };

        request.onerror = (event) => {
          cleanup();
          console.error(`Error deleting database ${dbName}:`, event);
          resolve(false);
        };

        request.onblocked = () => {
          console.warn(`Database ${dbName} deletion blocked - retrying...`);
          // อย่า reject ทันที ให้ลองรออีกหน่อย
          setTimeout(() => {
            if (!resolved) {
              console.error(`Database ${dbName} deletion permanently blocked`);
              cleanup();
              resolve(false);
            }
          }, 2000); // รอ 2 วินาที
        };
      });
    } catch (error) {
      console.error(`Error deleting database ${dbName}:`, error);
      return false;
    }
  }

  /**
   * ลบ database แบบ force (สำหรับกรณีที่ติด blocking)
   */
  public async forceDeleteDatabase(dbName: string): Promise<boolean> {
    try {
      // ปิดทุก connection ที่เป็นไปได้
      await this.closeDatabase(dbName);

      // รอให้นานขึ้น
      await new Promise((resolve) => setTimeout(resolve, 500));

      // พยายามลบหลายครั้ง
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`Attempting to delete ${dbName} (attempt ${attempt})`);

          const success = await new Promise<boolean>((resolve) => {
            const request = indexedDB.deleteDatabase(dbName);

            const timeout = setTimeout(() => {
              console.warn(`Delete attempt ${attempt} timed out for ${dbName}`);
              resolve(false);
            }, 3000);

            request.onsuccess = () => {
              clearTimeout(timeout);
              console.log(`Database ${dbName} deleted on attempt ${attempt}`);
              this.configs.delete(dbName);
              resolve(true);
            };

            request.onerror = () => {
              clearTimeout(timeout);
              resolve(false);
            };

            request.onblocked = () => {
              console.warn(`Attempt ${attempt} blocked for ${dbName}`);
              // ไม่ resolve ทันที ให้รอ timeout
            };
          });

          if (success) {
            return true;
          }

          // รอก่อนลองใหม่
          if (attempt < 3) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`Attempt ${attempt} failed for ${dbName}:`, error);
        }
      }

      console.error(`All attempts failed for ${dbName}`);
      return false;
    } catch (error) {
      console.error(`Force delete failed for ${dbName}:`, error);
      return false;
    }
  }

  /**
   * ลบ databases ทั้งหมด - ทีละตัวเพื่อหลีกเลี่ยง blocking
   */
  public async deleteAllDatabases(): Promise<boolean> {
    try {
      // ปิดทั้งหมดก่อน
      await this.closeAllDatabases();

      const dbNames = Array.from(this.configs.keys());
      const results: boolean[] = [];

      // ลบทีละตัวแทนที่จะลบพร้อมกัน
      for (const dbName of dbNames) {
        try {
          const result = await this.deleteDatabase(dbName);
          results.push(result);

          // รอระหว่างการลบแต่ละ database
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Failed to delete database ${dbName}:`, error);
          results.push(false);
        }
      }

      const success = results.every((result) => result === true);

      if (success) {
        console.log("All databases deleted successfully");
      } else {
        console.warn("Some databases could not be deleted");
      }

      return success;
    } catch (error) {
      console.error("Error deleting all databases:", error);
      return false;
    }
  }

  /**
   * Uninstall ทั้งหมดอย่างปลอดภัย
   */
  public async safeUninstall(): Promise<boolean> {
    try {
      console.log("Starting safe uninstall process...");

      // 1. ปิดการเชื่อมต่อทั้งหมด
      await this.closeAllDatabases();
      console.log("All connections closed");

      // 2. รอให้แน่ใจว่าปิดหมดแล้ว
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 3. ลบทีละ database
      const dbNames = Array.from(this.configs.keys());
      let allSuccess = true;

      for (const dbName of dbNames) {
        console.log(`Deleting database: ${dbName}`);

        const success = await this.forceDeleteDatabase(dbName);
        if (!success) {
          console.error(`Failed to delete database: ${dbName}`);
          allSuccess = false;
        }

        // รอระหว่างการลบ
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      if (allSuccess) {
        console.log("Safe uninstall completed successfully");
      } else {
        console.warn("Safe uninstall completed with some errors");
      }

      return allSuccess;
    } catch (error) {
      console.error("Safe uninstall failed:", error);
      return false;
    }
  }

  // ==================== Utility Methods ====================

  /**
   * รีเซ็ต databases ทั้งหมด
   */
  public async resetAllDatabases(): Promise<void> {
    const configs = Array.from(this.configs.values());
    await this.deleteAllDatabases();

    // สร้าง databases ใหม่
    for (const config of configs) {
      await this.createDatabase(config);
    }
  }

  /**
   * ตรวจสอบว่ามี database ที่ยังไม่ได้ปิดหรือไม่
   */
  public hasOpenConnections(): boolean {
    return this.databases.size > 0;
  }

  /**
   * รอให้ทุก connection ปิด
   */
  public async waitForAllConnectionsClosed(
    maxWaitMs: number = 5000
  ): Promise<boolean> {
    const startTime = Date.now();

    while (this.hasOpenConnections() && Date.now() - startTime < maxWaitMs) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return !this.hasOpenConnections();
  }

  /**
   * ดูรายการ databases ที่ลงทะเบียนไว้
   */
  public getRegisteredDatabases(): readonly string[] {
    return Array.from(this.configs.keys());
  }

  /**
   * ดูรายการ stores ใน database
   */
  public getStoresInDatabase(dbName: string): readonly string[] {
    const config = this.configs.get(dbName);
    return config ? config.stores.map((store) => store.name) : [];
  }

  /**
   * ดูข้อมูล config ของ database
   */
  public getDatabaseConfig(
    dbName: string
  ): Readonly<DatabaseConfig> | undefined {
    const config = this.configs.get(dbName);
    return config ? { ...config } : undefined;
  }

  /**
   * ตรวจสอบว่ามี store อยู่หรือไม่
   */
  public hasStore(dbName: string, storeName: string): boolean {
    const config = this.configs.get(dbName);
    return config?.stores.some((store) => store.name === storeName) ?? false;
  }

  /**
   * ดูสถิติการใช้งาน
   */
  public async getDatabaseStats(): Promise<DatabaseStats> {
    const stats: DatabaseStats = {};

    for (const config of Array.from(this.configs.values())) {
      stats[config.name] = {
        version: config.version,
        stores: {},
      };

      for (const store of config.stores) {
        try {
          stats[config.name].stores[store.name] = await this.count(
            config.name,
            store.name
          );
        } catch (error) {
          stats[config.name].stores[store.name] = "Error";
        }
      }
    }

    return stats;
  }

  /**
   * Export database เป็น JSON
   */
  public async exportDatabase(dbName: string): Promise<Record<string, any[]>> {
    const result: Record<string, any[]> = {};
    const stores = this.getStoresInDatabase(dbName);

    for (const storeName of stores) {
      try {
        result[storeName] = await this.getAll(dbName, storeName);
      } catch (error) {
        console.error(`Error exporting store ${storeName}:`, error);
        result[storeName] = [];
      }
    }

    return result;
  }

  /**
   * ทำ backup ทั้งหมด
   */
  public async backupAll(): Promise<Record<string, Record<string, any[]>>> {
    const backup: Record<string, Record<string, any[]>> = {};

    for (const dbName of this.getRegisteredDatabases()) {
      try {
        backup[dbName] = await this.exportDatabase(dbName);
      } catch (error) {
        console.error(`Error backing up database ${dbName}:`, error);
        backup[dbName] = {};
      }
    }

    return backup;
  }
}
