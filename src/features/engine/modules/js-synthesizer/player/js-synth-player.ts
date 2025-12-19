import {
  BaseSynthEvent,
  BaseSynthPlayerEngine,
} from "../../../types/synth.type";
import { fixMidiHeader } from "@/lib/karaoke/ncn";
import { IMIDIEvent, Synthesizer as JsSynthesizer } from "js-synthesizer";
import { JsSynthEngine } from "../js-synth-engine";
import { EventEmitter } from "../../instrumentals/events";
import { IMidiParseResult } from "@/lib/karaoke/songs/midi/types";
import { parseMidi } from "@/lib/karaoke/songs/midi/reader";
import { MusicLoadAllData } from "@/features/songs/types/songs.type";
import { useYoutubePlayer } from "../../youtube/youtube-player";
import {
  PeerHostState,
  usePeerHostStore,
} from "@/features/remote/store/peer-js-store";

export class JsSynthPlayerEngine implements BaseSynthPlayerEngine {
  private player: JsSynthesizer | undefined = undefined;
  private engine: JsSynthEngine;
  public paused: boolean = false;
  public isFinished: boolean = false;
  public midiData: IMidiParseResult | undefined = undefined;

  public eventInit?: BaseSynthEvent | undefined;
  public controller = new EventEmitter<string, number>();
  public musicQuere: MusicLoadAllData | undefined = undefined;

  public mp3Element?: HTMLAudioElement;
  private mp3PausedOffset = 0;

  public youtubeId?: string;
  private youtubePausedTime = 0;

  private channelPrograms = new Array(16).fill(0);
  private peerHost: PeerHostState | undefined = undefined;

  addEvent(input: Partial<BaseSynthEvent>): void {
    this.eventInit = { ...this.eventInit, ...input };
  }

  constructor(
    player: JsSynthesizer,
    engine: JsSynthEngine,
    peerHost: PeerHostState
  ) {
    this.player = player;
    this.engine = engine;
    this.peerHost = peerHost;
  }
  async play(): Promise<void> {
    if (!this.musicQuere) return;

    if (this.musicQuere.musicType === "MP3" && this.mp3Element) {
      this.mp3Element.currentTime = this.mp3PausedOffset;
      await this.mp3Element.play();
    } else if (this.musicQuere?.musicType === "YOUTUBE") {
      const youtubePlayer = useYoutubePlayer.getState();
      if (this.youtubePausedTime > 0) {
        youtubePlayer.seekTo(this.youtubePausedTime);
      }
      youtubePlayer.play();
      await youtubePlayer.waitUntilPlaying();
      setTimeout(() => {
        youtubePlayer.play();
      }, 1000);
    } else {
      await this.player?.playPlayer();
    }

    this.engine.timer?.startTimer();
    this.eventInit?.onPlay?.();
    this.paused = false;
    this.engine.playerUpdated.emit(["PLAYER", "CHANGE"], 0, "PLAY");
  }

  pause(): void {
    if (!this.musicQuere) return;

    if (this.musicQuere.musicType === "MP3" && this.mp3Element) {
      this.mp3PausedOffset = this.mp3Element.currentTime;
      this.mp3Element.pause();
    } else if (this.musicQuere?.musicType === "YOUTUBE") {
      const youtubePlayer = useYoutubePlayer.getState();
      youtubePlayer.setPause(true);
      youtubePlayer.pause();
      this.youtubePausedTime = youtubePlayer.player?.getCurrentTime() ?? 0;
    } else {
      this.player?.stopPlayer();
    }

    this.engine.timer?.stopTimer();
    this.paused = true;
    this.engine.playerUpdated.emit(["PLAYER", "CHANGE"], 0, "PAUSE");
  }

  stop(): void {
    if (!this.musicQuere) return;

    if (this.musicQuere.musicType === "MP3" && this.mp3Element) {
      this.mp3Element.pause();
      this.mp3Element.currentTime = 0;
      this.mp3PausedOffset = 0;
    } else if (this.musicQuere?.musicType === "YOUTUBE") {
      const youtubePlayer = useYoutubePlayer.getState();
      youtubePlayer.setPause(true);
      youtubePlayer.stop();
      this.youtubePausedTime = 0;
    } else {
      this.player?.stopPlayer();
    }

    this.engine.timer?.stopTimer();
    this.paused = true;
    this.engine.playerUpdated.emit(["PLAYER", "CHANGE"], 0, "STOP");
  }

  async getCurrentTiming() {
    const currentTick = (await this.player?.retrievePlayerCurrentTick()) ?? 0;
    return currentTick;
  }
  async setCurrentTiming(seconds: number): Promise<void> {
    const wasPlaying = !this.paused;
    this.pause();

    if (this.musicQuere?.musicType === "MP3" && this.mp3Element) {
      this.mp3PausedOffset = seconds;
      this.mp3Element.currentTime = seconds;
      this.engine.timer?.seekTimer(seconds);

      if (wasPlaying) {
        await this.mp3Element.play();
        this.paused = false;
        this.engine.timer?.startTimer();
        this.eventInit?.onPlay?.();
        this.engine.playerUpdated.emit(["PLAYER", "CHANGE"], 0, "PLAY");
      }
    } else if (this.musicQuere?.musicType === "YOUTUBE") {
      const youtubePlayer = useYoutubePlayer.getState();
      youtubePlayer.seekTo(seconds);
      this.youtubePausedTime = seconds;
      this.engine.timer?.seekTimer(seconds);
      await youtubePlayer.waitUntilPlaying();

      if (wasPlaying) {
        await this.play();
      }
    } else {
      this.player?.seekPlayer(seconds);
      this.engine.timer?.seekTimer(seconds);
      if (wasPlaying) {
        await this.play();
        console.log("Play Form JsSynth: setCurrentTime");
      }
      this.engine.panic();
    }
  }

  speedUpdate(speed: number): void {
    this.engine.speedUpdated.emit(["SPEED", "CHANGE"], 0, speed);
  }

  tempoUpdate(tempo: number): void {
    this.engine.tempoUpdated.emit(["TEMPO", "CHANGE"], 0, tempo);
  }

  timingUpdate(tickOrTime: number): void {
    this.engine.timerUpdated.emit(["TIMING", "CHANGE"], 0, tickOrTime);
  }

  countDownUpdate(time: number): void {
    this.engine.countdownUpdated.emit(["COUNTDOWN", "CHANGE"], 0, time);
  }

  async loadYoutube(youtubeId: string): Promise<boolean> {
    const youtubePlayer = useYoutubePlayer.getState();
    if (!youtubePlayer.isReady) return false;
    this.engine.timer?.seekTimer(0);
    youtubePlayer.setYoutubeId(youtubeId);
    youtubePlayer.setShow(true);
    this.youtubePausedTime = 0;
    return true;
  }

  async loadMp3(file: File): Promise<boolean> {
    if (!this.engine.audio) {
      console.error("AudioContext is not initialized.");
      return false;
    }

    try {
      this.engine.timer?.seekTimer(0);

      const audioEl = new Audio(URL.createObjectURL(file));
      audioEl.crossOrigin = "anonymous";
      audioEl.preload = "auto";

      const track = this.engine.audio.createMediaElementSource(audioEl);
      if (this.engine.globalEqualizer) {
        track.connect(this.engine.globalEqualizer.input);
      }

      this.mp3Element = audioEl;
      this.mp3PausedOffset = 0;

      return true;
    } catch (error) {
      console.error("Error loading MP3:", error);
      this.mp3Element = undefined;
      return false;
    }
  }

  async getCurrentTickAndTempo() {
    const _bpm = (await this.player?.retrievePlayerBpm()) || 0;
    const currentTick = (await this.player?.retrievePlayerCurrentTick()) || 0;
    return { tick: currentTick, tempo: _bpm };
  }

  async prepareMidi(midi: File) {
    this.engine.timer?.seekTimer(0);
    const buffer = await midi.arrayBuffer();
    let midiData: IMidiParseResult;
    let midiBuffer: ArrayBuffer;

    try {
      midiData = await parseMidi(buffer);
      midiBuffer = buffer;
    } catch (error) {
      const fixed = await fixMidiHeader(midi);
      midiBuffer = await fixed.arrayBuffer();
      midiData = await parseMidi(midiBuffer);
    }

    this.midiData = midiData;
    this.channelPrograms.fill(0);
    await this.player?.resetPlayer();
    await this.player?.addSMFDataToPlayer(midiBuffer);
    this.engine.updateSpeed();
    this.engine.updatePitch(null);
    this.eventChange();
    return true;
  }

  async loadMidi(data?: MusicLoadAllData): Promise<boolean> {
    if (!data) return false;
    this.stop();

    const youtubePlayer = useYoutubePlayer.getState();
    youtubePlayer.setShow(false);
    this.engine.timer?.stopTimer();

    const mid = data.files.midi;
    if (mid !== undefined) {
      this.engine.timer?.updateMusic(data);
      this.engine.timer?.updateTempoMap(data.tempoRange);
      this.engine.timer?.updatePpq((data.metadata as any).ticksPerBeat);
      this.musicQuere = data;
      this.engine.musicUpdated.emit(["MUSIC", "CHANGE"], 0, data);
      return !!this.prepareMidi(mid);
    }

    const mp3 = data.files.mp3;
    if (mp3 != undefined) {
      this.engine.timer?.updateMusic(data);
      this.musicQuere = data;
      this.engine.musicUpdated.emit(["MUSIC", "CHANGE"], 0, data);
      return this.loadMp3(mp3);
    }

    const ykr = data.files.ykr;
    if (ykr != undefined && data.youtubeId) {
      this.engine.timer?.updateMusic(data);
      this.musicQuere = data;
      this.engine.musicUpdated.emit(["MUSIC", "CHANGE"], 0, data);
      return this.loadYoutube(data.youtubeId);
    }

    if (data.isRemoteYoutube && data.youtubeId) {
      this.engine.timer?.updateMusic(data);
      this.musicQuere = data;
      this.engine.musicUpdated.emit(["MUSIC", "CHANGE"], 0, data);
      return this.loadYoutube(data.youtubeId);
    }

    return false;
  }

  setMidiOutput(): void {}
  resetMidiOutput(): void {}

  eventChange(): void {
    const sendToMaster = this.peerHost?.sendToMaster;
    this.player?.hookPlayerMIDIEvents((s, t, event: IMIDIEvent) => {
      const vel = event.getVelocity();
      const midiNote = event.getKey();
      const channel = event.getChannel();
      const program = event.getProgram();
      const value = event.getValue();
      const control = event.getControl();

      // NODE
      const currentProgram = this.engine.nodes[channel]?.program?.value ?? 0;
      const isMute = this.engine.nodes[channel]?.volume?.isMute ?? false;

      const isNoteOn = t === 0x90 && vel > 0;
      const isNoteOff = t === 0x80 || (t === 0x90 && vel === 0);

      if (isNoteOn) {
        if (isMute) {
          return true;
        }
        const modified = this.engine.notesModifier.noteOn({
          channel,
          midiNote,
          velocity: vel,
        });
        const insts = this.engine.instrumentals.noteOn(
          modified,
          currentProgram
        );

        this.player?.midiNoteOn(channel, insts.midiNote, insts.velocity);
        sendToMaster?.("system/note", {
          event: insts,
        });
        return true;
      } else if (isNoteOff) {
        if (isMute) {
          return true;
        }
        const modified = this.engine.notesModifier.noteOff({
          channel,
          midiNote,
          velocity: vel,
        });
        const insts = this.engine.instrumentals.noteOff(
          modified,
          currentProgram
        );

        this.player?.midiNoteOff(channel, insts.midiNote);
        return true;
      }

      switch (t) {
        case 192: // Program Change
          this.eventInit?.programChangeCallback?.({
            program,
            channel,
          });
          sendToMaster?.("system/program", {
            program,
            channel,
          });
          break;
        case 176: // controller Change
          this.eventInit?.controllerChangeCallback?.({
            channel,
            controllerNumber: control,
            controllerValue: value,
          });
          sendToMaster?.("system/controller", {
            channel,
            controllerNumber: control,
            controllerValue: value,
          });
          break;
        case 81: // Tempo Change
          console.log("Tempo Change", vel, t, program);
          break;
      }

      return false;
    });
  }
}
