import { BaseTable } from "../../core/base";
import { ISoundfontChunk, ISoundfontPlayer } from "./types";
import { PLAYER, TablePlayerSongs } from "./setup";

export class SoundfontPlayerManager extends BaseTable<ISoundfontPlayer> {
  constructor() {
    super(PLAYER.name, TablePlayerSongs.SOUND_FONT, PLAYER.stores[0]);
  }
}

export class SoundfontPlayerChunkManager extends BaseTable<ISoundfontChunk> {
  constructor() {
    super(PLAYER.name, TablePlayerSongs.SOUND_FONT_CHUNK, PLAYER.stores[1]);
  }
}
