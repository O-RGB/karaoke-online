import { create } from "zustand";
import { RuntimeProps } from "../types/player.type";
import { sortTempoChanges } from "@/lib/app-control";
import useQueuePlayer from "./queue-player";
import useLyricsStoreNew from "@/features/lyrics/store/lyrics.store";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import useMixerStoreNew from "../../event-player/modules/event-mixer-store";

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
    const player = useSynthesizerEngine.getState().engine?.player;
    player?.setCurrentTiming(timing);
  },

  setMidiInfo(cursors, timeDivision, lyrics, midi, midiDecoded, musicInfo) {
    const lyricsInit = useLyricsStoreNew.getState().lyricsInit;
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
    const player = useSynthesizerEngine.getState().engine?.player;

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
          const updateCountDown = lastTime - Math.floor(currentTime ?? 0);

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
