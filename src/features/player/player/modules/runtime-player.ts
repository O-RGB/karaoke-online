import { create } from "zustand";
import { RuntimeProps } from "../types/player.type";
import { sortTempoChanges } from "@/lib/app-control";
import useQueuePlayer from "./queue-player";
import useLyricsStore from "@/features/lyrics/store/lyrics.store";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import useConfigStore from "@/features/config/config-store";

const useRuntimePlayer = create<RuntimeProps>((set, get) => ({
  isPaused: false,
  isFinished: true,
  hasTransitioned: true,
  countDown: 10,
  currentTime: 0,
  currentTick: 0,
  intervalId: undefined,
  lyrics: [],
  cursors: [],
  currentTempo: 0,
  timeDivision: 0,
  midi: undefined,
  musicInfo: undefined,

  reset: () => {
    const nodes = useSynthesizerEngine.getState().engine?.nodes;
    nodes?.map((c) => c.note?.reset());
    set({
      lyrics: [],
      cursors: [],
      currentTempo: 0,
      timeDivision: 0,
      midi: undefined,
      musicInfo: undefined,
      countDown: 10,
      isFinished: true,
      isPaused: true,
    });
  },

  stop: () => {
    useLyricsStore.getState().reset();
    get().paused();
    get().reset();
    set({ isPaused: true, isFinished: true });
  },

  paused: () => {
    const nodes = useSynthesizerEngine.getState().engine?.nodes;
    const player = useSynthesizerEngine.getState().engine?.player;
    nodes?.map((c) => c.note?.reset());
    player?.pause();
    set({ isPaused: true });
    get().tickRun(false);
  },

  play: () => {
    const player = useSynthesizerEngine.getState().engine?.player;
    const engine = useSynthesizerEngine.getState().engine;
    player?.play();

    set({ isPaused: false, isFinished: false });
    get().tickRun(true);

    engine?.setupMIDIEventHook?.();
  },

  setIsFinished: (isFinished) => {
    set({ isFinished });
  },

  setCountDown: (queue) => {},

  setCurrentTime: (timing) => {
    const nodes = useSynthesizerEngine.getState().engine?.nodes;
    nodes?.map((c) => c.note?.reset());
    const player = useSynthesizerEngine.getState().engine?.player;
    player?.setCurrentTiming(timing);
  },

  setMidiInfo(cursors, timeDivision, lyrics, midi, midiDecoded, musicInfo) {
    const lyricsInit = useLyricsStore.getState().lyricsInit;
    lyricsInit(lyrics, cursors);
    set({
      cursors,
      timeDivision,
      lyrics,
      midi,
      midiDecoded,
      musicInfo,
    });
  },
  tickRun: (isPlay: boolean) => {
    const { intervalId } = get();
    const time = useSynthesizerEngine.getState().engine?.time;
    // time =  "Tick" | "Time"
    const player = useSynthesizerEngine.getState().engine?.player;
    const render = useConfigStore.getState().config.refreshRate?.render;

    if (!player || !player.midiData) {
      return;
    }

    const nextMusic = useQueuePlayer.getState().nextMusic;

    const midi = player.midiData;
    const timeDivision = midi.timeDivision;
    const duration = midi.duration;
    const tempoChanges: ITempoChange[] = midi.tempoChanges;

    if (isPlay) {
      if (!intervalId) {
        const newIntervalId = setInterval(async () => {
          const currentTime = await player.getCurrentTiming();

          let tempos: ITempoChange[] = tempoChanges?.slice(0, -1).reverse();
          tempos = sortTempoChanges(tempos);

          const { tick, tempo } = await player.getCurrentTickAndTempo(
            timeDivision,
            currentTime,
            tempos
          );

          const lastTime = Math.floor(duration);
          let updateCountDown = 0;
          if (time === "Time") {
            updateCountDown = lastTime - Math.floor(currentTime ?? 0);
          } else {
            const lastTick = midi.lastVoiceEventTick;
            const remainingTicks = lastTick - tick;

            const secondsPerTick =
              tempo > 0 && timeDivision > 0 ? 60 / (tempo * timeDivision) : 0;

            updateCountDown = Math.floor(remainingTicks * secondsPerTick);
          }

          if (get().countDown === 0) {
            get().stop();
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
        }, render);

        set({ intervalId: newIntervalId });
      }
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        set({ intervalId: undefined });
      }
    }
  },
  uninstall() {
    get().stop();
    set({
      isPaused: false,
      isFinished: true,
      hasTransitioned: true,
      countDown: 10,
      currentTime: 0,
      currentTick: 0,
      intervalId: undefined,
      lyrics: [],
      cursors: [],
      currentTempo: 0,
      timeDivision: 0,
      midi: undefined,
      musicInfo: undefined,
    });
  },
}));

export default useRuntimePlayer;
