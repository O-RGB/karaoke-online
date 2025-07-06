import { DatabaseCommonCore, DatabaseConfig } from "./core/common";
import { DISPLAY } from "./db/display/setup";
import { LOCAL_SONGS } from "./db/local-songs/setup";
import { PLAYER } from "./db/player/setup";
import { SERVER_SONGS } from "./db/server-cache/setup";
import { USER_SONGS } from "./db/user-songs/setup";

// export const DISPLAY: DatabaseConfig = {
//   name: "display",
//   version: 1,
//   stores: [
//     { name: TableDisplaySongs.FONT, keyPath: "id", autoIncrement: true },
//     { name: TableDisplaySongs.WALLPAPER, keyPath: "id", autoIncrement: true },
//   ],
// };

export class DatabaseService {
  private dbManager: DatabaseCommonCore;
  private registerDatabases: DatabaseConfig[] = [];

  constructor() {
    this.dbManager = DatabaseCommonCore.getInstance();
  }

  async initialize() {
    this.registerDatabases = [
      DISPLAY,
      LOCAL_SONGS,
      USER_SONGS,
      PLAYER,
      SERVER_SONGS,
    ];
    this.dbManager.registerDatabases(this.registerDatabases);
    for (const config of this.registerDatabases) {
      await this.dbManager.createDatabase(config);
    }
  }

  async cleanup() {
    await this.dbManager.closeAllDatabases();
  }

  async reset() {
    await this.dbManager.resetAllDatabases();
  }

  async uninstall() {
    await this.cleanup();
    await this.dbManager.deleteAllDatabases();
  }

  async deleteDatabases(dbNames?: string[]) {
    const namesToDelete =
      dbNames ?? this.registerDatabases.map((config) => config.name);

    if (namesToDelete.length === 0) {
      console.log("No databases to delete.");
      return;
    }

    console.log(`Preparing to delete databases: ${namesToDelete.join(", ")}`);

    for (const name of namesToDelete) {
      try {
        await this.dbManager.closeDatabase(name); // ควรปิดก่อนลบ
        await this.dbManager.deleteDatabase(name);
        console.log(`Successfully deleted database: ${name}`);
      } catch (error) {
        console.error(`Failed to delete database: ${name}`, error);
      }
    }
  }

  async deleteAllDatabases() {
    console.log("Deleting all registered databases...");
    await this.deleteDatabases();
  }
}
