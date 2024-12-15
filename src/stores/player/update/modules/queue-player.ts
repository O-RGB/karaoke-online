import { create } from "zustand";
import { QueuePlayerProps } from "../types/player.type";

import { getSong } from "@/lib/storage/song";
import useConfigStore from "@/stores/config/config-store";
import { convertCursorToTicks, mapCursorToIndices } from "@/lib/app-control";
import useRuntimePlayer from "./runtime-player";
import { useSynthesizerEngine } from "@/stores/engine/synth-store";

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

    console.log(
      "%csrc/stores/player/update/modules/queue-player.ts:40 queue",
      "color: #007acc;",
      queue
    );
    let nextSong: SearchResult | undefined = undefined;
    if (queue.length > 0) {
      nextSong = queue[0];
    }

    if (!nextSong) {
      console.log(
        "%csrc/stores/player/update/modules/queue-player.ts:47 return",
        "color: #007acc;"
      );
      return;
    }

    console.log(
      "%csrc/stores/player/update/modules/queue-player.ts:51 playMusic",
      "color: white; background-color: #007acc;"
    );
    get().playMusic(0);
    get().removeQueue(0);
  },

  playMusic: async (index) => {
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

    const url = useConfigStore.getState().config.system?.url;
    const song = await getSong(music, url);

    if (!song) {
      return;
    }

    runtime.stop();

    console.log("prepae load new song");

    const parsedMidi = await player.player?.loadMidi(song.mid);

    // let midiFileArrayBuffer = await song.mid.arrayBuffer();
    // let parsedMidi = null;
    // try {
    //   parsedMidi = new MIDI(midiFileArrayBuffer, song.mid.name);
    // } catch (e) {
    //   // console.error(e);
    //   const fix = await fixMidiHeader(song.mid);
    //   const fixArrayBuffer = await fix.arrayBuffer();
    //   parsedMidi = new MIDI(fixArrayBuffer, fix.name);
    // }

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

      // player?.loadNewSongList([parsedMidi], false);

      console.log(parsedMidi);

      setTimeout(() => {
        runtime.play();
        runtime.tickRun(true);
      }, 500);
    }
  },
}));

export default useQueuePlayer;
