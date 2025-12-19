import { create } from "zustand";
import { QueuePlayerProps } from "../types/player.type";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import {
  ITrackData,
  KaraokeExtension,
  MusicLoadAllData,
} from "@/features/songs/types/songs.type";
import useSongsStore from "@/features/songs/store/songs.store";
import { usePeerHostStore } from "@/features/remote/store/peer-js-store";
import { musicProcessGroup } from "@/lib/karaoke/read";

const useQueuePlayer = create<QueuePlayerProps>((set, get) => ({
  loading: false,
  queue: [],
  addQueue: async (value) => {
    console.log("REMOTE YOUTUBE: ", value);
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
    const client = usePeerHostStore.getState().requestToClient;

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
    } else if (music._bufferFile) {
      let karaokeExtension: KaraokeExtension = {};
      karaokeExtension.ykr = music._bufferFile;
      song = await musicProcessGroup(karaokeExtension);
      set({ loading: false });
    }

    player.stop();
    await new Promise((resolve) => setTimeout(resolve, 100));
    const isOk = await player.loadMidi(song);

    if (!isOk) {
      console.error("Engine can't load music to player!!");
      return;
    }

    player.setCurrentTiming(0);
    console.log("Play Form Quere-player");
    setTimeout(() => {
      player.play();
    }, 500);

    // setTimeout(async () => {
    //   // const requestToClient = usePeerHostStore.getState().requestToClient;
    //   // await requestToClient(null, "system/init", {
    //   //   musicInfo: music,
    //   // });
    // }, 500);
    if (song) client(null, "system/music-info", song.trackData);
  },
}));

export default useQueuePlayer;
