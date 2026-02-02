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

      // [New] Extract Data
      const timeSignatures = metadata?.timeSignatures;
      const firstNote = metadata?.firstNote ?? 0;

      if (duration == null)
        throw new Error("[updateMusic][MIDI] Missing duration");
      if (ticksPerBeat == null)
        throw new Error("[updateMusic][MIDI] Missing ticksPerBeat");

      this.updateDuration(duration);
      this.updatePpq(ticksPerBeat);

      // [New] Send Data to Worker
      if (timeSignatures) {
        this.updateTimeSignatures(timeSignatures);
      }
      this.updateFirstNote(firstNote);
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

      // Reset for Audio
      this.updateTimeSignatures([]);
      this.updateFirstNote(0);
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
          const { bpm, elapsedSeconds, countdown, totalSeconds, beatInfo } =
            data;

          if (bpm !== undefined) this.player?.tempoUpdate(bpm);
          if (elapsedSeconds !== undefined)
            this.player?.secondsUpdate(elapsedSeconds);
          if (countdown !== undefined) this.player?.countDownUpdate(countdown);
          if (totalSeconds !== undefined)
            this.player?.durationUpdate(totalSeconds);

          // [New] ส่ง Beat Info ให้ Player
          if (beatInfo !== undefined) {
            const { measure, beat, numerator } = data.beatInfo;
            // ต้องเพิ่ม method นี้ใน Interface Player ด้วย
            // this.player?.beatUpdate?.(beatInfo);
            this.player?.beatUpdate(beat, numerator);
            // console.log("[data.beatInfo] ", data.beatInfo);
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

          // [New] Update beat on seek
          if (data.beatInfo !== undefined) {
            const { measure, beat, numerator } = data.beatInfo;
            // this.player?.beatUpdate?.(data.beatInfo);
            // console.log("[data.beatInfo] ", data.beatInfo);
            this.player?.beatUpdate(beat, numerator);

            //             {
            //     "measure": 59,
            //     "beat": 2,
            //     "subBeat": 0.635156773514882,
            //     "numerator": 4,
            //     "denominator": 4,
            //     "isPreStart": false
            // }
          }
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

  // [New] Methods
  updateTimeSignatures(timeSignatures: any[]) {
    this.worker?.postMessage({
      command: "updateTimeSignatures",
      value: { timeSignatures },
    });
  }

  updateFirstNote(firstNote: number) {
    this.worker?.postMessage({
      command: "updateFirstNote",
      value: { firstNote },
    });
  }
}
