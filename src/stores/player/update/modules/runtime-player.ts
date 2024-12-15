import { create } from "zustand";
import { RuntimeProps } from "../types/player.type";
import {
  calculateTicks,
  convertTicksToTime,
  sortTempoChanges,
} from "@/lib/app-control";
import useQueuePlayer from "./queue-player";
import useEventStoreNew from "../../event-player/event-store";
import useLyricsStoreNew from "@/stores/lyrics/lyrics-store";
import { useSynthesizerEngine } from "@/stores/engine/synth-store";

const useRuntimePlayer = create<RuntimeProps>((set, get) => ({
  isPaused: false,
  isFinished: true,
  hasTransitioned: true,
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

  reset: () => {
    set({
      lyrics: [],
      ticksIndices: new Map(),
      ticks: [],
      currentTempo: 0,
      timeDivision: 0,
      midi: undefined,
      musicInfo: undefined,
      countDown: 10,
      isFinished: true,
      isPaused: true,
      // hasTransitioned: false,
    });
  },

  stop: () => {
    const player = useSynthesizerEngine.getState().engine?.player;
    player?.stop();
    set({ isPaused: true, isFinished: true });
    get().tickRun(false);
  },

  paused: () => {
    const player = useSynthesizerEngine.getState().engine?.player;
    player?.pause();
    set({ isPaused: true });
    get().tickRun(false);
  },

  play: () => {
    console.log("Play ing");
    const player = useSynthesizerEngine.getState().engine?.player;
    player?.play();

    set({ isPaused: false, isFinished: false });
    get().tickRun(true);
  },

  setIsFinished: (isFinished) => {
    set({ isFinished });
  },

  setCountDown: (queue) => {},

  setCurrentTime: (time) => {
    const player = useSynthesizerEngine.getState().engine?.player;
    if (player) {
      const duration = player.duration ?? 0;
      const newCurrentTime = (time / 100) * duration;
      // player.currentTime = newCurrentTime;

      player.setCurrentTime(newCurrentTime);
    }
  },

  setMidiInfo(
    ticks,
    ticksIndices,
    timeDivision,
    lyrics,
    midi,
    midiDecoded,
    musicInfo
  ) {
    const lyricsInit = useLyricsStoreNew.getState().lyricsInit;
    lyricsInit(lyrics, ticksIndices);
    set({
      ticks,
      ticksIndices,
      timeDivision,
      lyrics,
      midi,
      midiDecoded,
      musicInfo,
    });
  },
  tickRun: (isPlay: boolean) => {
    const { intervalId } = get();
    const player = useSynthesizerEngine.getState().engine?.player;
    const setEventRun = useEventStoreNew.getState().setEventRun;
    const setGainRun = useEventStoreNew.getState().setGainRun;
    const nextMusic = useQueuePlayer.getState().nextMusic;
    const lyricsRender = useLyricsStoreNew.getState().lyricsRender;
    const midi = get().midi;

    setEventRun(isPlay);
    if (isPlay) {
      if (!intervalId) {
        const newIntervalId = setInterval(async () => {
          setGainRun();
          const timeDivision = midi?.timeDivision;
          const tempoChanges: ITempoChange[] = midi?.tempoChanges ?? [];
          const currentTime = await player?.getCurrentTime();

          let tempos: ITempoChange[] = tempoChanges?.slice(0, -1).reverse();
          tempos = sortTempoChanges(tempos);

          if (!timeDivision || !tempoChanges || !currentTime) {
            return;
          }

          if (!player) {
            return;
          }

          const { tick, tempo } = await player.getCurrentTickAndTempo(
            timeDivision,
            currentTime,
            tempos
          );

          const lastTime = Math.floor(midi.duration ?? 0);
          const updateCountDown = lastTime - Math.floor(currentTime ?? 0);

          lyricsRender(tick);

          if (get().countDown === 0) {
            get().reset();
            get().tickRun(false);

            setTimeout(() => {
              nextMusic();
            }, 2000);
          } else {
            set({ countDown: updateCountDown });
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
