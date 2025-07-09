import { DatabaseCommonCore, StoreConfig } from "./common";

interface TimeStamped {
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GetAllOptions {
  limit?: number;
  offset?: number;
}

export class BaseTable<T extends TimeStamped> {
  protected db = DatabaseCommonCore.getInstance();

  constructor(
    private dbName: string,
    private storeName: string,
    private storeDetail: StoreConfig
  ) {}

  /**
   * เพิ่มข้อมูลใหม่ พร้อมใส่ createdAt และ updatedAt อัตโนมัติ
   */
  async add(data: Partial<T>): Promise<IDBValidKey> {
    const now = new Date();
    const dataToAdd = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    return this.db.add(this.dbName, this.storeName, dataToAdd);
  }

  /**
   * MODIFIED: ดึงข้อมูลทั้งหมดจากตาราง
   * รองรับการทำ Pagination ด้วย limit และ offset
   * @param options - ตัวเลือกสำหรับ limit และ offset
   */
  async getAll(options?: GetAllOptions): Promise<T[]> {
    if (options?.limit || options?.offset) {
      return this.db.getAllWithOffset(this.dbName, this.storeName, options);
    }

    return this.db.getAll(this.dbName, this.storeName);
  }

  /**
   * MODIFIED: ดึง ID ทั้งหมดในตาราง
   * รองรับการทำ Pagination ด้วย limit และ offset (ประสิทธิภาพสูง)
   * @param options - ตัวเลือกสำหรับ limit และ offset
   * @returns Promise<IDBValidKey[]>
   */
  async getAllIds(options?: GetAllOptions): Promise<IDBValidKey[]> {
    if (options?.limit || options?.offset) {
      return this.db.getAllKeysWithOffset(this.dbName, this.storeName, options);
    }

    return this.db.getAllKeys(this.dbName, this.storeName);
  }

  /**
   * ลบข้อมูลตาม ID
   */
  async delete(id: number): Promise<void> {
    return this.db.delete(this.dbName, this.storeName, id);
  }

  /**
   * ค้นหาข้อมูลตามเงื่อนไข
   * หมายเหตุ: การ find แบบนี้จะดึงข้อมูลทั้งหมดมา filter ใน memory ก่อน
   * หากต้องการประสิทธิภาพสูงสุดสำหรับ query ที่ซับซ้อน ควรพิจารณาใช้ index
   */
  async find(predicate: (item: T) => boolean): Promise<T[]> {
    return this.db.find(this.dbName, this.storeName, predicate);
  }

  /**
   * ดึงข้อมูล 1 รายการตาม ID
   */
  async get(id: number): Promise<T | undefined> {
    return this.db.get(this.dbName, this.storeName, id);
  }

  /**
   * อัปเดตข้อมูล พร้อมอัปเดต updatedAt อัตโนมัติ
   */
  async update(id: number, updatedFields: Partial<T>): Promise<void> {
    const existing = await this.get(id);
    if (existing) {
      const updated = {
        ...existing,
        ...updatedFields,
        updatedAt: new Date(),
      };
      await this.db.put(this.dbName, this.storeName, updated as any);
    }
  }

  /**
   * ดึงรายละเอียดของ Store
   */
  getStoreDetail(): StoreConfig {
    return this.storeDetail;
  }

  deleteDatabase(): Promise<boolean> {
    return this.db.forceDeleteDatabase(this.dbName);
  }
}
