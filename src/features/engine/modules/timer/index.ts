import useQueuePlayer from "@/features/player/player/modules/queue-player";
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
      this.updateTempoMap(musicInfo.tempoRange);
      this.updateDuration((musicInfo.metadata as any).duration);
      this.updatePpq((musicInfo.metadata as any).ticksPerBeat);
    } else {
      this.timingMode = "Time";
      this.updateDuration((musicInfo.metadata as any).duration);
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
          console.log(value);
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
}
