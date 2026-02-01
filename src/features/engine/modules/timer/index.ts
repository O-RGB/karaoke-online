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

      if (duration == null)
        throw new Error("[updateMusic][MIDI] Missing duration");
      if (ticksPerBeat == null)
        throw new Error("[updateMusic][MIDI] Missing ticksPerBeat");

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
        throw new Error("[updateMusic][Audio] Missing duration");
      }
    }

    this.updateMode(this.timingMode);
  }

  initWorker() {
    const worker = new Worker(
      new URL("/public/timer-worker/worker.ts", import.meta.url)
    );

    worker.onmessage = (e: MessageEvent) => {
      const data = e.data;

      switch (data.type) {
        case "displayUpdate": {
          const { bpm, elapsedSeconds, countdown, totalSeconds } = data;
          if (bpm !== undefined) {
            this.player?.tempoUpdate(bpm);
          }
          if (elapsedSeconds !== undefined) {
            this.player?.secondsUpdate(elapsedSeconds);
          }
          if (countdown !== undefined) {
            this.player?.countDownUpdate(countdown);
          }
          if (totalSeconds !== undefined) {
            this.player?.durationUpdate(totalSeconds);
          }
          break;
        }

        case "Tick":
        case "Time": {
          this.player?.timingUpdate(data.value);
          break;
        }

        case "seekResponse": {
          this.player?.setCurrentTiming?.(data.seekValue);
          this.player?.secondsUpdate(data.elapsedSeconds);
          this.player?.countDownUpdate(data.countdown);
          this.player?.durationUpdate(data.totalSeconds);
          if (data.bpm !== undefined) this.player?.tempoUpdate(data.bpm);
          break;
        }
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

  updateTempo(mppq: number) {
    this.worker?.postMessage({ command: "updateTempo", value: { mppq } });
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
    this.worker?.postMessage({ command: "updateMode", value: { mode } });
  }

  updatePlaybackRate(rate: number) {
    this.worker?.postMessage({
      command: "updatePlaybackRate",
      value: { rate },
    });
  }
}
