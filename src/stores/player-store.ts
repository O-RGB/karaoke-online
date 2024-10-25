import { create } from "zustand";
import { MIDI } from "spessasynth_lib";
import { convertCursorToTicks, mapCursorToIndices } from "@/lib/app-control";
import { fixMidiHeader } from "@/lib/karaoke/ncn";
import { getSong } from "@/lib/storage/song";
import { useSpessasynthStore } from "@/stores/spessasynth-store";
import useConfigStore from "@/stores/config-store";
import useNotificationStore from "@/stores/notification-store";

interface PlayerState {
  musicLibrary: Map<string, File>;
  playingTrack: IPlayingQueues | undefined;
  midiPlaying: MIDI | undefined;
  lyrics: string[];
  cursorTicks: number[];
  cursorIndices: Map<number, number[]> | undefined;
  playingQueue: IPlayingDecodedQueues[];
  setPlayingQueue: (value: IPlayingDecodedQueues[]) => void;
  setPlayingTrackFile: (value: IPlayingQueues) => void;
  setMusicLibraryFile: (files: Map<string, File>) => void;
  handleSetLyrics: (lyr: string[]) => void;
  setSongPlaying: (
    files: SongFilesDecode,
    info?: SearchResult
  ) => Promise<void>;
  loadAndPlaySong: (
    value: SearchResult
  ) => Promise<IPlayingDecodedQueues[] | undefined>;
  setMidiPlayer: (midi: MIDI) => Promise<void>;

  setPaused: (value: boolean) => void;
  paused: boolean;

  setIsFinished: (value: boolean) => void;
  isFinished: boolean;

  setCountDown: (value: number) => void;
  countDown: number;
}

export const usePlayer = create<PlayerState>((set, get) => ({
  musicLibrary: new Map(),
  playingTrack: undefined,
  midiPlaying: undefined,
  lyrics: [],
  cursorTicks: [],
  paused: false,
  setPaused: (value: boolean) => set({ paused: value }),
  isFinished: false,
  setIsFinished: (value: boolean) => set({ isFinished: value }),
  cursorIndices: undefined,
  playingQueue: [],

  setCountDown: (value) => set({ countDown: value }),
  countDown: 10,
  setPlayingQueue: (value) => set({ playingQueue: value }),

  setPlayingTrackFile: (value) => set({ playingTrack: value }),

  setMusicLibraryFile: (files) => set({ musicLibrary: files }),

  handleSetLyrics: (lyr) => set({ lyrics: lyr }),

  setSongPlaying: async (files, info) => {
    const player = useSpessasynthStore.getState().player;
    if (!player) return;

    if (player.paused) {
      player.pause();
      player.stop();
      set({ lyrics: [], cursorTicks: [], cursorIndices: undefined });
    }
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
      setTimeout(async () => {
        set({ midiPlaying: parsedMidi });
        const timeDivision = parsedMidi.timeDivision;
        const cur = convertCursorToTicks(timeDivision, files.cur);
        const curMapping = mapCursorToIndices(cur);

        set({
          lyrics: files.lyr,
          cursorTicks: cur,
          cursorIndices: curMapping,
        });
        get().setMidiPlayer(parsedMidi);
      }, 1000);
    }
  },

  setMidiPlayer: async (midi: MIDI) => {
    const player = useSpessasynthStore.getState().player;
    if (!player) return;
    player.loadNewSongList([midi]);
    player.play();
    get().setIsFinished(false);
    get().setPaused(false);
  },

  loadAndPlaySong: async (value) => {
    const setNotification = useNotificationStore.getState().setNotification;
    const System = useConfigStore.getState().config.system?.drive;
    const {} = get();
    const mode = System ? " Drive" : "ระบบ";
    // setNotification({
    //   text: "กำลังโหลดจาก" + mode,
    //   delay: 40000,
    //   icon: <AiOutlineLoading className="animate-spin" />,
    // });
    console.log("value", value);
    setNotification({ text: "กำลังโหลดจาก" + mode, delay: 40000 });

    const song = await getSong(value);
    if (song) {
      const data: IPlayingDecodedQueues[] = [
        ...get().playingQueue,
        {
          file: song,
          songInfo: value,
        },
      ];
      set({
        playingQueue: [...data],
      });

      if (data.length > 1) {
        setNotification({ text: "เพิ่มในคิวแล้ว" });
      } else {
        setNotification({ text: "เสร็จสิ้น" });
      }
      return data;
    } else {
      setNotification({ text: "ไม่พบเพลงใน" + mode });
    }
  },
}));
