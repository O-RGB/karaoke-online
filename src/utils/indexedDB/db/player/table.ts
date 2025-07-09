import { BaseTable } from "../../core/base";
import { ISoundfontPlayer } from "./types";
import { PLAYER, TablePlayerSongs } from "./setup";

export class SoundfontPlayerManager extends BaseTable<ISoundfontPlayer> {
  constructor() {
    super(PLAYER.name, TablePlayerSongs.SOUND_FONT, PLAYER.stores[0]);
  }
}
