import { BaseSynthPlayerEngine, TimingModeType } from "../../types/synth.type";
import { MusicLoadAllData } from "@/features/songs/types/songs.type";

export class TimerWorker {
  private worker: Worker | null = null;
  private player: BaseSynthPlayerEngine | null = null;
  private timingMode: TimingModeType = "Tick";
  constructor(player: BaseSynthPlayerEngine) {
    this.player = player;
  }
  updateMusic(musicInfo: MusicLoadAllData) {
    if (musicInfo.musicType === "MIDI") {
      this.timingMode = "Tick";

      const metadata = musicInfo.metadata as any;
      const duration = metadata?.duration;
      const ticksPerBeat = metadata?.ticksPerBeat;

      if (duration == null) {
        throw new Error(
          "[updateMusic][MIDI] Missing required metadata: duration"
        );
      }

      if (ticksPerBeat == null) {
        throw new Error(
          "[updateMusic][MIDI] Missing required metadata: ticksPerBeat"
        );
      }

      this.updateTempoMap(musicInfo.tempoRange);
      this.updateDuration(duration);
      this.updatePpq(ticksPerBeat);
    } else {
      this.timingMode = "Time";

      const durationFromMeta = (musicInfo.metadata as any)?.duration;
      const durationFromRoot = musicInfo.duration;

      if (durationFromMeta != null) {
        this.updateDuration(durationFromMeta);
      } else if (durationFromRoot != null) {
        this.updateDuration(durationFromRoot);
      } else {
        throw new Error(
          "[updateMusic][Audio] Unable to determine duration (metadata.duration and musicInfo.duration are both missing)"
        );
      }
    }

    this.updateMode(this.timingMode);
  }

  initWorker() {
    const worker = new Worker(
      new URL("/public/worker/timer-worker.ts", import.meta.url)
    );

    worker.onmessage = (e: MessageEvent) => {
      const { type, value, bpm, countdown, isEnd } = e.data;
      switch (type) {
        case "Tick":
        case "Time":
          this.player?.timingUpdate(value);

          if (bpm !== undefined) {
            this.player?.tempoUpdate(bpm);
          }

          if (countdown !== undefined) {
            this.player?.countDownUpdate(countdown);
          }
          break;
      }
    };

    this.worker = worker;
  }

  terminateWorker() {
    if (this.worker) {
      this.worker.postMessage({ command: "stop" });
      this.worker.terminate();
      this.worker = null;
    }
  }

  startTimer() {
    this.worker?.postMessage({ command: "start" });
  }

  stopTimer() {
    this.worker?.postMessage({ command: "stop" });
  }

  seekTimer(value: number) {
    this.worker?.postMessage({ command: "seek", value: value });
  }

  resetTimer() {
    this.worker?.postMessage({ command: "reset" });
  }

  forceStopTimer() {
    if (this.worker) {
      this.worker.postMessage({ command: "stop" });
      this.worker.postMessage({ command: "reset" });
    }
  }

  updateTempoMap(tempos: any) {
    this.worker?.postMessage({ command: "setTempoMap", value: { tempos } });
  }

  updatePpq(ppq: number) {
    this.worker?.postMessage({ command: "updatePpq", value: { ppq } });
  }

  updateDuration(duration: number) {
    this.worker?.postMessage({
      command: "updateDuration",
      value: { duration },
    });
  }

  updateMode(mode: TimingModeType) {
    console.log("update mode", mode);
    this.worker?.postMessage({ command: "updateMode", value: { mode } });
  }

  updatePlaybackRate(rate: number) {
    this.worker?.postMessage({
      command: "updatePlaybackRate",
      value: { rate },
    });
  }
}
