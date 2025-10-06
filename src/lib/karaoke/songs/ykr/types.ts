import { ChordEvent, SongInfo } from "../midi/types";
import { LyricWordData, MusicMode } from "../types";

export interface PlayerState {
  duration: number;
  youtubeId: string;
}

export interface ProjectData {
  playerState: PlayerState;
  lyricsData: LyricWordData[][];
  chordsData: ChordEvent[];
  metadata: SongInfo;
}

export interface Project {
  id: string;
  name: string;
  mode: MusicMode;
  data: ProjectData;
  createdAt: Date;
  updatedAt: Date;
}
