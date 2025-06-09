import { create } from "zustand";
import { QueuePlayerProps } from "../types/player.type";

// import { getSong } from "@/lib/storage/song";
import useConfigStore from "@/features/config/config-store";
import { convertCursorToTicks } from "@/lib/app-control";
import useRuntimePlayer from "./runtime-player";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import useLyricsStore from "@/features/lyrics/store/lyrics.store";
import { ITrackData, SearchResult } from "@/features/songs/types/songs.type";
import useSongsStore from "@/features/songs/store/songs.store";
import { readCursorFile, readLyricsFile } from "@/lib/karaoke/ncn";
import { file } from "jszip";

const useQueuePlayer = create<QueuePlayerProps>((set, get) => ({
  driveLoading: false,
  queue: [],
  addQueue: async (value) => {
    const runtime = useRuntimePlayer.getState();
    let queue = [...get().queue];
    set({ queue: [] });

    queue.push(value);
    set({ queue });

    if (runtime.isFinished) {
      get().playMusic(0);
      get().removeQueue(0);
    }
  },

  removeQueue: (index) => {
    let queue = get().queue;
    const updated = queue.filter((x, i) => i !== index);
    set({ queue: updated });
  },

  moveQueue: (queue) => {
    set({ queue: queue });
  },

  nextMusic: () => {
    const queue = get().queue;

    let nextSong: ITrackData | undefined = undefined;
    if (queue.length > 0) {
      nextSong = queue[0];
    }

    if (!nextSong) {
      useRuntimePlayer.getState().stop();
      return;
    }

    get().playMusic(0);
    get().removeQueue(0);
  },

  playMusic: async (index) => {
    const isLoad = get().driveLoading;

    if (isLoad) {
      return;
    }

    const player = useSynthesizerEngine.getState().engine;
    const runtime = useRuntimePlayer.getState();

    if (!player) {
      return;
    }

    const queue = get().queue;
    const music = queue[index];

    if (!music) {
      return;
    }

    let url = useConfigStore.getState().config.system?.url;
    const api = useConfigStore.getState().config.system?.api;
    // if (api) {
    //   music.from = "DRIVE_EXTHEME";
    //   url =
    //     "https://script.google.com/macros/s/AKfycbxyjT972t0EKoIdYcx9nwFfTWssHm_aSFSufR4LLC4dGciAkVYm5kCUYfy2jRI3CC6tzQ/exec";
    // }
    // if (music.from === "DRIVE_EXTHEME" || music.from === "DRIVE" || api) {
    //   runtime.paused();
    //   set({ driveLoading: true });
    // }
    // let song = undefined;
    let songsManager = useSongsStore.getState().songsManager;
    const song = await songsManager?.manager?.getSong(music);

    // if (api) {
    //   song = await getSong(music, url);
    // } else {
    //   song = await getSong(music, url);
    // }
    set({ driveLoading: false });

    if (!song) {
      return;
    }

    runtime.stop();

    const parseCur = (await readCursorFile(song.cur)) ?? [];
    const parseLyr = await readLyricsFile(song.lyr);

    const parsedMidi = await player.player?.loadMidi(song.midi);

    if (parsedMidi) {
      const timeDivision = parsedMidi.timeDivision;
      const cursors = convertCursorToTicks(timeDivision, parseCur);

      runtime.setMidiInfo(
        cursors,
        timeDivision,
        parseLyr,
        parsedMidi,
        song,
        music
      );

      setTimeout(() => {
        runtime.play();
        runtime.tickRun(true);
      }, 500);
    }
  },
}));

export default useQueuePlayer;
