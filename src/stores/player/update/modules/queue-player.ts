import { create } from "zustand";
import { QueuePlayerProps } from "../types/player.type";
import { useSpessasynthStore } from "@/stores/spessasynth/spessasynth-store";
import { getSong } from "@/lib/storage/song";
import useConfigStore from "@/stores/config/config-store";
import { MIDI } from "spessasynth_lib";
import { fixMidiHeader } from "@/lib/karaoke/ncn";
import { convertCursorToTicks, mapCursorToIndices } from "@/lib/app-control";
import useRuntimePlayer from "./runtime-player";

const useQueuePlayer = create<QueuePlayerProps>((set, get) => ({
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
    let nextSong: SearchResult | undefined = undefined;
    if (queue.length > 0) {
      nextSong = queue[0];
    }

    if (!nextSong) {
      return;
    }

    get().playMusic(0);
    get().removeQueue(0);
  },

  playMusic: async (index) => {
    const player = useSpessasynthStore.getState().player;
    const runtime = useRuntimePlayer.getState();

    if (!player) {
      return;
    }

    const queue = get().queue;
    const music = queue[index];

    if (!music) {
      return;
    }

    const url = useConfigStore.getState().config.system?.url;
    const song = await getSong(music, url);

    if (!song) {
      return;
    }

    runtime.stop();

    let midiFileArrayBuffer = await song.mid.arrayBuffer();
    let parsedMidi = null;
    try {
      parsedMidi = new MIDI(midiFileArrayBuffer, song.mid.name);
    } catch (e) {
      // console.error(e);
      const fix = await fixMidiHeader(song.mid);
      const fixArrayBuffer = await fix.arrayBuffer();
      parsedMidi = new MIDI(fixArrayBuffer, fix.name);
    }

    if (parsedMidi) {
      const timeDivision = parsedMidi.timeDivision;
      const ticks = convertCursorToTicks(timeDivision, song.cur);
      const ticksIndices = mapCursorToIndices(ticks);

      runtime.setMidiInfo(
        ticks,
        ticksIndices,
        timeDivision,
        song.lyr,
        parsedMidi,
        song,
        music
      );

      // const isFinished = runtime.isFinished;

      // if (isFinished) {
      player?.loadNewSongList([parsedMidi], false);
      // }
      setTimeout(() => {
        runtime.play();
        runtime.tickRun(true);
      }, 500);
    }
  },
}));

export default useQueuePlayer;
