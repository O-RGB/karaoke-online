import { BaseTable } from "../../core/base";
import { ISoundfontPlayer } from "./types";
import { TablePlayerSongs } from "./setup";

export class SoundfontPlayerManager extends BaseTable<ISoundfontPlayer> {
  constructor() {
    super(TablePlayerSongs.SOUND_FONT);
  }
}
