import { DatabaseCommonCore } from "./core/common";
import { DISPLAY } from "./db/display/setup";
import { LOCAL_SONGS } from "./db/local-songs/setup";
import { PLAYER } from "./db/player/setup";
import { SERVER_SONGS } from "./db/server-cache/setup";
import { USER_SONGS } from "./db/user-songs/setup";

export class DatabaseService {
  private dbManager: DatabaseCommonCore;

  constructor() {
    this.dbManager = DatabaseCommonCore.getInstance();
  }

  async initialize() {
    const DATABASES = [DISPLAY, LOCAL_SONGS, USER_SONGS, PLAYER, SERVER_SONGS];
    this.dbManager.registerDatabases(DATABASES);
    for (const config of DATABASES) {
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
}
