import { create } from "zustand";
import { QueuePlayerProps } from "../types/player.type";
import { convertCursorToTicks } from "@/lib/app-control";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import { ITrackData } from "@/features/songs/types/songs.type";
import { readCursorFile, readLyricsFile } from "@/lib/karaoke/ncn";
import useRuntimePlayer from "./runtime-player";
import useSongsStore from "@/features/songs/store/songs.store";
import { usePeerHostStore } from "@/features/remote/store/peer-js-store";
import useLyricsStore from "@/features/lyrics/store/lyrics.store";

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

    let songsManager = useSongsStore.getState().songsManager;
    const song = await songsManager?.getSong(music);
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

      if (music._selectBy) {
        const selectBy = music._selectBy;
        const lyrics = useLyricsStore.getState();
        lyrics.setClientId?.(selectBy.clientId);
      } else {
        const lyrics = useLyricsStore.getState();
        lyrics.setClientId?.(undefined);
      }

      setTimeout(() => {
        runtime.play();
        runtime.tickRun(true);
      }, 500);
    }
  },
}));

export default useQueuePlayer;
