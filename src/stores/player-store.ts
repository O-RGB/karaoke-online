import { create } from "zustand";
import { MIDI } from "spessasynth_lib";
import { convertCursorToTicks, mapCursorToIndices } from "@/lib/app-control";
import { fixMidiHeader } from "@/lib/karaoke/ncn";
import { getSong } from "@/lib/storage/song";
import { useSpessasynthStore } from "@/stores/spessasynth-store";
import useConfigStore from "@/stores/config-store";
import useNotificationStore from "@/stores/notification-store";

interface AppControlState {
  musicLibrary: Map<string, File>;
  playingTrack: SearchResult | undefined;
  midiPlaying: MIDI | undefined;
  lyrics: string[];
  cursorTicks: number[];
  cursorIndices: Map<number, number[]> | undefined;
  setPlayingTrackFile: (value: SearchResult) => void;
  setMusicLibraryFile: (files: Map<string, File>) => void;
  handleSetLyrics: (lyr: string[]) => void;
  setSongPlaying: (files: SongFilesDecode) => Promise<void>;
  loadAndPlaySong: (value: SearchResult) => Promise<void>;
}

export const useAppControlStore = create<AppControlState>((set, get) => ({
  musicLibrary: new Map(),
  playingTrack: undefined,
  midiPlaying: undefined,
  lyrics: [],
  cursorTicks: [],
  cursorIndices: undefined,

  setPlayingTrackFile: (value) => set({ playingTrack: value }),

  setMusicLibraryFile: (files) => set({ musicLibrary: files }),

  handleSetLyrics: (lyr) => set({ lyrics: lyr }),

  setSongPlaying: async (files) => {
    const player = useSpessasynthStore.getState().player;
    if (!player) return;

    player.pause();
    player.stop();
    set({ lyrics: [], cursorTicks: [], cursorIndices: undefined });

    let midiFileArrayBuffer = await files.mid.arrayBuffer();
    let parsedMidi = null;
    try {
      parsedMidi = new MIDI(midiFileArrayBuffer, files.mid.name);
    } catch (e) {
      console.error(e);
      const fix = await fixMidiHeader(files.mid);
      const fixArrayBuffer = await fix.arrayBuffer();
      parsedMidi = new MIDI(fixArrayBuffer, fix.name);
    }

    if (parsedMidi) {
      setTimeout(() => {
        set({ midiPlaying: parsedMidi });
        const timeDivision = parsedMidi.timeDivision;
        const cur = convertCursorToTicks(timeDivision, files.cur);
        const curMapping = mapCursorToIndices(cur);
        set({
          lyrics: files.lyr,
          cursorTicks: cur,
          cursorIndices: curMapping,
        });
        player.loadNewSongList([parsedMidi]);
        player.play();
      }, 1000);
    }
  },

  loadAndPlaySong: async (value) => {
    const setNotification = useNotificationStore.getState().setNotification;
    const System = useConfigStore.getState().config.system?.drive;
    const mode = System ? " Drive" : "ระบบ";

    // setNotification({
    //   text: "กำลังโหลดจาก" + mode,
    //   delay: 40000,
    //   icon: <AiOutlineLoading className="animate-spin" />,
    // });

    const song = await getSong(value, System);
    if (song) {
      await get().setSongPlaying(song);
      setNotification({ text: "เสร็จสิ้น" });
    } else {
      setNotification({ text: "ไม่พบเพลงใน" + mode });
    }
  },
}));
