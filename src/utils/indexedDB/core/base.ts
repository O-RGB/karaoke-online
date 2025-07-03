import { DatabaseCommonCore, StoreConfig } from "./common";

// ADDED: Interface สำหรับการจัดการเวลา
interface TimeStamped {
  createdAt?: Date;
  updatedAt?: Date;
}

// MODIFIED: Generic T ต้องสืบทอดจาก TimeStamped
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
    // MODIFIED: เพิ่ม timestamps อัตโนมัติ
    const dataToAdd = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    return this.db.add(this.dbName, this.storeName, dataToAdd);
  }

  /**
   * ดึงข้อมูลทั้งหมดจากตาราง
   */
  async getAll(): Promise<T[]> {
    return this.db.getAll(this.dbName, this.storeName);
  }

  /**
   * ADDED: ดึง ID ทั้งหมดในตาราง โดยไม่โหลดข้อมูลทั้งหมด (ประสิทธิภาพสูง)
   * @returns Promise<IDBValidKey[]>
   */
  async getAllIds(): Promise<IDBValidKey[]> {
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
      // MODIFIED: อัปเดต updatedAt อัตโนมัติ
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
}
