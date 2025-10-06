import { create } from "zustand";
import { QueuePlayerProps } from "../types/player.type";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import { ITrackData } from "@/features/songs/types/songs.type";
import { usePeerHostStore } from "@/features/remote/store/peer-js-store";
import useSongsStore from "@/features/songs/store/songs.store";

const useQueuePlayer = create<QueuePlayerProps>((set, get) => ({
  loading: false,
  queue: [],
  addQueue: async (value) => {
    const player = useSynthesizerEngine.getState().engine?.player;
    let queue = [...get().queue];
    set({ queue: [] });

    queue.push(value);
    console.log("adding queure", value);
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
      return;
    }

    set({ loading: true });
    let songsManager = useSongsStore.getState().songsManager;
    const song = await songsManager?.getSong(music);

    set({ loading: false });

    if (!song) {
      console.error("Songs Manager Not Found!!");
      return;
    }

    player.stop();
    await new Promise((resolve) => setTimeout(resolve, 100));
    const isOk = await player.loadMidi(song);
    if (!isOk) {
      console.error("Engine can't load music to player!!");
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setTimeout(async () => {
      player.play();
      const requestToClient = usePeerHostStore.getState().requestToClient;
      await requestToClient(null, "system/init", {
        musicInfo: music,
      });
    }, 500);
  },
}));

export default useQueuePlayer;
