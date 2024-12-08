import { create } from "zustand";
import { RuntimeProps } from "../types/player.type";
import { useSpessasynthStore } from "@/stores/spessasynth-store";
import {
  calculateTicks,
  convertTicksToTime,
  sortTempoChanges,
} from "@/lib/app-control";
import useQueuePlayer from "./queue-player";

const useRuntimePlayer = create<RuntimeProps>((set, get) => ({
  isPaused: false,
  isFinished: true,
  countDown: 10,
  currentTime: 0,
  currentTick: 0,
  intervalId: undefined,

  lyrics: [],
  ticksIndices: new Map(),
  ticks: [],
  currentTempo: 0,
  timeDivision: 0,
  midi: undefined,
  musicInfo: undefined,

  paused: () => {
    const player = useSpessasynthStore.getState().player;
    player?.pause();
    set({ isPaused: true });
    get().tickRun(false);
  },

  play: () => {
    const player = useSpessasynthStore.getState().player;
    player?.play();

    set({ isPaused: false, isFinished: false });
    get().tickRun(true);
  },

  setIsFinished: (isFinished) => {
    set({ isFinished });
  },

  setCountDown: (queue) => {},

  setCurrentTime: (time) => {
    const player = useSpessasynthStore.getState().player;
    if (player) {
      const duration = player.duration ?? 0;
      const newCurrentTime = (time / 100) * duration;
      player.currentTime = newCurrentTime;
    }
  },

  setMidiInfo(ticks, ticksIndices, timeDivision, lyrics, midi, midiDecoded) {
    set({
      ticks,
      ticksIndices,
      timeDivision,
      lyrics,
      midi,
      midiDecoded,
    });
  },
  tickRun: (isPlay: boolean) => {
    const { intervalId } = get();
    const player = useSpessasynthStore.getState().player;
    const nextMusic = useQueuePlayer.getState().nextMusic;
    const midi = get().midi;
    if (isPlay) {
      if (!intervalId) {
        const newIntervalId = setInterval(() => {
          const timeDivision = midi?.timeDivision;
          const tempoChanges: ITempoChange[] = midi?.tempoChanges ?? [];
          const currentTime = player?.currentTime;

          let tempos: ITempoChange[] = tempoChanges?.slice(0, -1).reverse();
          tempos = sortTempoChanges(tempos);

          if (!timeDivision || !tempoChanges || !currentTime) {
            return;
          }

          const tempoTimeChange = convertTicksToTime(timeDivision, tempos);

          let { tick, tempo } = calculateTicks(
            timeDivision,
            currentTime,
            tempoTimeChange
          );

          const lastTime = Math.floor(player?.duration ?? 0);
          const countDown = lastTime - Math.floor(currentTime ?? 0);
          if (countDown < 10) {
            set({ countDown });
          }
          if (countDown === 0) {
            setTimeout(() => {
              nextMusic();
              set({ countDown: 10 });
            }, 1000);
          }

          set({
            currentTick: tick,
            currentTempo: tempo,
            currentTime: currentTime,
          });
        }, 100);

        set({ intervalId: newIntervalId });
      }
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        set({ intervalId: undefined });
      }
    }
  },
}));

export default useRuntimePlayer;
