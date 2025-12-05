import { create } from "zustand";
import { QueuePlayerProps } from "../types/player.type";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import {
  ITrackData,
  MusicLoadAllData,
} from "@/features/songs/types/songs.type";
import useSongsStore from "@/features/songs/store/songs.store";

const useQueuePlayer = create<QueuePlayerProps>((set, get) => ({
  loading: false,
  queue: [],
  addQueue: async (value) => {
    const player = useSynthesizerEngine.getState().engine?.player;
    let queue = [...get().queue];
    set({ queue: [] });

    queue.push(value);
    set({ queue });

    if (!player?.musicQuere) {
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

    get().playMusic(0);
    get().removeQueue(0);
  },
  playMusic: async (index) => {
    const player = useSynthesizerEngine.getState().engine?.player;

    if (!player) {
      console.error("Player Not Working!!");
      return;
    }

    const queue = get().queue;
    const music = queue[index];

    if (!music) {
      console.error("music metadata Not Found!!");

      player.stop();
      if (player) {
        player.musicQuere = undefined;
      }

      return;
    }

    let song: MusicLoadAllData | undefined = undefined;
    set({ loading: true });

    if (!music._bufferFile) {
      let songsManager = useSongsStore.getState().songsManager;
      song = await songsManager?.getSong(music);

      set({ loading: false });

      if (!song) {
        console.error("Songs Manager Not Found!!");
        return;
      }
    } else {
      song = music._bufferFile;
      set({ loading: false });
    }

    console.log("playMusic");

    player.stop();
    await new Promise((resolve) => setTimeout(resolve, 100));
    const isOk = await player.loadMidi(song);
    if (!isOk) {
      console.error("Engine can't load music to player!!");
      return;
    }
    await new Promise(() =>
      setTimeout(() => {
        player.setCurrentTiming(0);
      }, 500)
    );
    await new Promise(() =>
      setTimeout(() => {
        player.play();
      }, 500)
    );

    // setTimeout(async () => {
    //   // const requestToClient = usePeerHostStore.getState().requestToClient;
    //   // await requestToClient(null, "system/init", {
    //   //   musicInfo: music,
    //   // });
    // }, 500);
  },
}));

export default useQueuePlayer;
