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
import useNotificationStore from "@/features/notification-store";

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
    const client = usePeerHostStore.getState().requestToClient;
    const addNotification = useNotificationStore.getState().addNotification

    if (!player) {
      console.error("[playMusic] Player engine is not available");

      addNotification({
        title: "ไม่สามารถเล่นเพลงได้",
        description: "ระบบเล่นเพลงยังไม่พร้อม กรุณาลองใหม่อีกครั้ง",
        variant: "error",
      });
      return;
    }

    const queue = get().queue;
    const music = queue[index];

    if (!music) {
      console.error("[playMusic] Music not found in queue", { index, queue });

      addNotification({
        title: "ไม่พบเพลงในคิว",
        description: "เพลงที่เลือกอาจถูกลบออก หรือคิวไม่ถูกต้อง",
        variant: "error",
      });

      player.stop();
      player.musicQuere = undefined;
      return;
    }

    let song: MusicLoadAllData | undefined;
    set({ loading: true });

    try {
      if (!music._bufferFile) {
        const songsManager = useSongsStore.getState().songsManager;

        if (!songsManager) {
          throw new Error("SongsManager is not initialized");
        }

        song = await songsManager.getSong(music);
      } else {
        const karaokeExtension: KaraokeExtension = {
          ykr: music._bufferFile,
        };

        song = await musicProcessGroup(karaokeExtension);
      }
    } catch (error) {
      console.error("[playMusic] Failed to load song", error);

      addNotification({
        title: "โหลดเพลงไม่สำเร็จ",
        description: "เกิดข้อผิดพลาดระหว่างเตรียมเพลง",
        variant: "error",
      });

      set({ loading: false });
      return;
    }

    set({ loading: false });

    if (!song) {
      console.error("[playMusic] Song data is empty after loading");

      addNotification({
        title: "ไม่สามารถเล่นเพลงได้",
        description: "ข้อมูลเพลงไม่สมบูรณ์",
        variant: "error",
      });
      return;
    }

    player.stop();
    await new Promise((r) => setTimeout(r, 100));

    const isOk = await player.loadMidi(song);

    if (!isOk) {
      console.error("[playMusic] Player failed to load music", song);

      addNotification({
        title: "เล่นเพลงไม่สำเร็จ",
        description: "ระบบไม่สามารถโหลดเพลงเข้าสู่ตัวเล่นได้",
        variant: "error",
      });
      return;
    }

    player.setCurrentTiming(0);
    console.log("[playMusic] Start playing");

    setTimeout(() => {
      player.play();
    }, 500);

    client?.(null, "system/music-info", song.trackData);
  },
}));

export default useQueuePlayer;
