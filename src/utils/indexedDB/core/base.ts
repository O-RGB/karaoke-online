import { DatabaseManagerCore } from "./common";

export class BaseTable<T extends { id: number }> {
  protected db = DatabaseManagerCore.getInstance();

  constructor(private storeName: string) {}

  async add(data: Omit<T, "id">): Promise<IDBValidKey> {
    return this.db.addToStore(this.storeName, data);
  }

  async getAll(): Promise<T[]> {
    return this.db.getAllFromStore(this.storeName);
  }

  async delete(id: number): Promise<void> {
    return this.db.deleteFromStore(this.storeName, id);
  }

  async find(predicate: (item: T) => boolean): Promise<T[]> {
    return this.db.findInStore(this.storeName, predicate);
  }

  async get(id: number): Promise<T | undefined> {
    return this.db.getFromStore(this.storeName, id);
  }

  async update(id: number, updatedFields: Partial<T>): Promise<void> {
    const existing = await this.get(id);
    if (existing) {
      const updated = { ...existing, ...updatedFields };
      await this.db.putToStore(this.storeName, updated);
    }
  }
}
