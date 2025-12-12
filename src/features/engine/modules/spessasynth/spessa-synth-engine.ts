import { Synthetizer as Spessasynth } from "spessasynth_lib";
import { loadAudioContext, loadPlayer } from "./lib/spessasynth";
import { CHANNEL_DEFAULT, DEFAULT_SOUND_FONT } from "@/config/value";
import { SpessaPlayerEngine } from "./player/spessa-synth-player";
import { RemoteSendMessage } from "@/features/remote/types/remote.type";
import {
  ConfigSystem,
  SoundSetting,
  SoundSystemMode,
} from "@/features/config/types/config.type";
import { SynthChannel } from "../instrumentals/channel";
import { InstrumentalNode } from "../instrumentals/instrumental";
import { BassConfig } from "../instrumentals/config";
import {
  CHORUSDEPTH,
  EXPRESSION,
  MAIN_VOLUME,
  PAN,
  REVERB,
} from "../../types/node.type";
import {
  BaseSynthEngine,
  BaseSynthPlayerEngine,
  IControllerChange,
  INoteChange,
  IProgramChange,
  IVelocityChange,
  TimingModeType,
  IPersetSoundfont,
  PlayerStatusType,
} from "../../types/synth.type";
import { GlobalEqualizer } from "../equalizer/global-equalizer";
import { RecordingsManager } from "@/utils/indexedDB/db/display/table";
import { TimerWorker } from "../timer";
import { EventEmitter } from "../instrumentals/events";
import { MusicLoadAllData } from "@/features/songs/types/songs.type";
import { NotesModifierManager } from "../notes-modifier-manager";
import { InstrumentalsControl } from "../instrumentals-group";
import { SynthControl } from "../instrumentals/node";

export class SpessaSynthEngine implements BaseSynthEngine {
  public time: TimingModeType = "Time";
  public synth: Spessasynth | undefined;
  public audio: AudioContext | undefined;
  public player: BaseSynthPlayerEngine | undefined;
  public preset: number[] = [];
  public analysers: AnalyserNode[] = [];
  public soundfontName: string = "Default Soundfont sf2";
  public soundfontFile: File | undefined;
  public soundfontFrom: SoundSystemMode = "DATABASE_FILE_SYSTEM";

  public instrumentalTest: InstrumentalsControl = new InstrumentalsControl();

  public nodes: SynthChannel[] = [];
  public instrumental = new InstrumentalNode();

  public bassConfig: BassConfig | undefined = undefined;
  public globalEqualizer: GlobalEqualizer | undefined = undefined;

  public systemConfig?: Partial<ConfigSystem> = undefined;
  public timer: TimerWorker | undefined = undefined;
  public timerUpdated = new EventEmitter<"TIMING", number>();
  public tempoUpdated = new EventEmitter<"TEMPO", number>();
  public speedUpdated = new EventEmitter<"SPEED", number>();
  public pitchUpdated = new EventEmitter<"PITCH", number>();
  public playerUpdated = new EventEmitter<"PLAYER", PlayerStatusType>();
  public countdownUpdated = new EventEmitter<"COUNTDOWN", number>();
  public musicUpdated = new EventEmitter<"MUSIC", MusicLoadAllData>();
  public gain = new EventEmitter<"GAIN", number>();
  public musicQuere: MusicLoadAllData | undefined = undefined;

  public currentPlaybackRate: number = 1.0;
  public globalPitch: number = 0;

  public notesModifier: NotesModifierManager = new NotesModifierManager();

  public isRecording: boolean = false;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private micSource: MediaStreamAudioSourceNode | null = null;
  private micStream: MediaStream | null = null;
  private recorderDestination: MediaStreamAudioDestinationNode | null = null;

  constructor(
    setInstrument?: (instrument: IPersetSoundfont[]) => void,
    config?: Partial<SoundSetting>,
    systemConfig?: Partial<ConfigSystem>
  ) {
    this.startup(setInstrument, systemConfig);
    this.bassConfig = config ? new BassConfig(config) : undefined;
    this.systemConfig = systemConfig;
  }
  connectAudioChain(useEq: boolean): void {
    throw new Error("Method not implemented.");
  }
  getMainGainLevel(): number {
    throw new Error("Method not implemented.");
  }
  toggleChannelEqualizer?(channelIndex: number, enabled: boolean): void {
    throw new Error("Method not implemented.");
  }
  toggleAllEqualizers?(enabled: boolean): void {
    throw new Error("Method not implemented.");
  }
  isChannelEQEnabled?(channelIndex: number): boolean {
    throw new Error("Method not implemented.");
  }
  resetChannelEQ?(channelIndex: number): void {
    throw new Error("Method not implemented.");
  }
  updateChannelEQBand?(
    channelIndex: number,
    bandIndex: number,
    gainValue: number
  ): void {
    throw new Error("Method not implemented.");
  }
  getChannelEQSettings?(
    channelIndex: number
  ): { frequency: number; gain: number }[] | null {
    throw new Error("Method not implemented.");
  }
  setupMIDIEventHook?(): void {
    throw new Error("Method not implemented.");
  }

  async startup(
    setInstrument?: (instrument: IPersetSoundfont[]) => void,
    systemConfig?: Partial<ConfigSystem>
  ) {
    const { audioContext, channels } = await loadAudioContext();
    if (!audioContext)
      return { audio: undefined, synth: undefined, player: undefined };

    const synth = await this.loadDefaultSoundFont(audioContext);
    if (!synth)
      return { audio: undefined, synth: undefined, player: undefined };

    const player = await loadPlayer(synth);
    synth.setMainVolume(1);

    this.synth = synth;
    this.audio = audioContext;

    this.persetChange((e) => setInstrument?.(e));
    this.synth?.setDrums(9, true);
    this.player = new SpessaPlayerEngine(player, this);
    this.timer = new TimerWorker(this.player);
    this.instrumental.setEngine(this);

    const analysers: AnalyserNode[] = [];

    for (let ch = 0; ch < CHANNEL_DEFAULT.length; ch++) {
      const synthChannel = new SynthChannel(
        ch,
        this.instrumental,
        audioContext,
        synth.keyModifierManager,
        systemConfig
      );

      this.nodes.push(synthChannel);
      const analyser = synthChannel.getAnalyser();
      if (analyser) {
        analysers.push(analyser);
      }
    }

    if (systemConfig?.sound?.equalizer) {
      this.globalEqualizer = new GlobalEqualizer(synth.context);
      synth.worklet.connect(this.globalEqualizer.input);
      this.globalEqualizer.output.connect(synth.context.destination);
    } else {
      synth.worklet.connect(synth.context.destination);
    }

    synth?.connectIndividualOutputs(analysers);

    this.timer.initWorker();
    this.controllerChange();
    this.programChange();
    this.noteOnChange();
    this.noteOffChange();
    this.polyPressureChange();

    return { synth: synth, audio: this.audio };
  }
  async loadDefaultSoundFont(audio?: AudioContext): Promise<any> {
    let arraybuffer: ArrayBuffer | undefined = undefined;

    console.log("this.soundfontFile", this.soundfontFile);
    if (this.soundfontFile) {
      arraybuffer = await this.soundfontFile.arrayBuffer();
    } else {
      const res = await fetch(DEFAULT_SOUND_FONT);
      arraybuffer = await res.arrayBuffer();
      if (audio) {
        const synthInstance = new Spessasynth(audio.destination, arraybuffer);

        synthInstance.highPerformanceMode = false;

        const blob = new Blob([arraybuffer], {
          type: "application/octet-stream",
        });
        const fileBlob = new File([blob], "soundfont.sf2", {
          type: "application/octet-stream",
        });
        this.soundfontFile = fileBlob;

        await synthInstance.isReady;
        return synthInstance;
      }
    }

    await this.synth?.soundfontManager.reloadManager(arraybuffer);
    this.soundfontName = "Default Soundfont sf2";
    this.soundfontFrom = "DATABASE_FILE_SYSTEM";
  }

  setGain(value?: number): void {}

  getAnalyserNode(auto: AudioContext) {
    return Array.from({ length: 16 }, () => {
      const analyser = auto.createAnalyser();
      analyser.fftSize = 256;
      return analyser;
    });
  }

  // private sendMessageData(value?: IControllerChange) {
  //   if (!this.sendMessage || !value) {
  //     return;
  //   }

  //   if (value)
  //     this.sendMessage({
  //       user: "SUPER",
  //       message: value,
  //       type: {
  //         event: "CHANGE",
  //         type: "CONTROLLER",
  //       },
  //     });
  // }

  async setSoundFont(file: File, from: SoundSystemMode) {
    const bf = await file.arrayBuffer();
    try {
      this.synth?.soundfontManager.reloadManager(bf);
      this.soundfontName = file.name;
      this.soundfontFrom = from;
      return true;
    } catch (error) {
      return false;
    }
  }

  polyPressureChange(event?: (event: INoteChange) => void): void {
    return this.synth?.eventHandler.addEvent(
      "polypressure",
      "poly-perssure-listener",
      (e: any) => {
        console.log(e);
      }
    );
  }
  noteOnChange(event?: (event: INoteChange) => void): void {
    return this.synth?.eventHandler.addEvent(
      "noteon",
      "note-on-listener",
      (e: INoteChange) => {
        this.nodes[e.channel].noteOnChange(e);
      }
    );
  }
  noteOffChange(event?: (event: INoteChange) => void): void {
    return this.synth?.eventHandler.addEvent(
      "noteoff",
      "note-off-listener",
      (e: INoteChange) => {
        this.nodes[e.channel].noteOffChange(e);
      }
    );
  }
  controllerChange(event?: (event: IControllerChange) => void): void {
    return this.synth?.eventHandler.addEvent(
      "controllerchange",
      "",
      (e: IControllerChange) => {
        this.nodes[e.channel].controllerChange(e);
      }
    );
  }
  programChange(event?: (event: IProgramChange) => void): void {
    return this.synth?.eventHandler.addEvent(
      "programchange",
      "",
      (e: IProgramChange) => {
        const { channel, program } = e;
        const has = this.bassConfig?.onProgramChange(e);

        if (has?.isBass) {
          const nodeProgram = this.nodes[channel].program?.value;
          if (nodeProgram === program) return;

          this.setProgram(has.event);
          this.nodes[channel].programChange(has.event);
        } else {
          this.nodes[channel].programChange(e);
        }
      }
    );
  }

  persetChange(event: (event: IPersetSoundfont[]) => void): void {
    return this.synth?.eventHandler.addEvent(
      "presetlistchange",
      "",
      (perset: IPersetSoundfont[]) => {
        let sort = perset.sort((a, b) => a.program - b.program);
        let notFirst = sort.filter((x, i) => i !== 1);
        event(notFirst);
      }
    );
  }

  setProgram(event: IProgramChange) {
    this.synth?.programChange(event.channel, event.program, event.userChange);
    this.nodes[event.channel].programChange(event);
  }

  setVelocity(event: IVelocityChange): void {
    this.synth?.velocityOverride(event.channel, event.value);
  }

  setController(event: IControllerChange, form?: string): void {
    const node = this.nodes[event.channel];

    let isLocked = false;

    switch (event.controllerNumber) {
      case MAIN_VOLUME:
        isLocked = node.volume?.isLocked ?? false;
        break;
      case PAN:
        isLocked = node.pan?.isLocked ?? false;
        break;
      case REVERB:
        isLocked = node.reverb?.isLocked ?? false;
        break;
      case CHORUSDEPTH:
        isLocked = node.chorus?.isLocked ?? false;
        break;
      case EXPRESSION:
        isLocked = node.expression?.isLocked ?? false;
        break;

      default:
        break;
    }

    if (isLocked === true || event.force) {
      this.lockController({ ...event, controllerValue: false });
    }
    this.synth?.controllerChange(
      event.channel,
      event.controllerNumber,
      event.controllerValue,
      event.force
    );
    if (isLocked === true || event.force) {
      this.lockController({ ...event, controllerValue: true });
    }
  }

  lockController(event: IControllerChange<boolean>): void {
    this.synth?.lockController(
      event.channel,
      event.controllerNumber,
      event.controllerValue
    );

    this.nodes[event.channel].lockChange({
      channel: event.channel,
      controllerNumber: event.controllerNumber,
      controllerValue: event.controllerValue,
    });
  }

  updatePreset(channel: number, value: number): void {
    this.synth?.programChange(channel, value);
  }

  updatePitch(channel: number, semitones: number = 0): void {
    if (channel) {
      this.synth?.transposeChannel(channel, semitones);
    } else {
      this.synth?.transpose(semitones);
    }
  }

  updateSpeed(value: number): void {
    this.player?.setPlayBackRate?.(value / 100);
  }

  onPlay(event: () => void): void {}

  onStop(event: () => void): void {}

  setMute(event: IControllerChange<boolean>): void {
    this.synth?.muteChannel(event.channel, event.controllerValue);
    this.nodes[event.channel].muteChange({
      channel: event.channel,
      controllerNumber: event.controllerNumber,
      controllerValue: event.controllerValue,
    });
  }

  setBassLock(program: number) {
    this.bassConfig?.setLockBass(program);
    const bass = this.instrumental.group.get("bass");
    bass?.forEach((node) => {
      if (node.channel !== undefined) {
        this.setProgram({ channel: node.channel, program });
      }
    });
  }

  panic(): void {}

  async startRecording(options: { includeMicrophone: boolean }): Promise<void> {
    if (this.isRecording) {
      console.warn("Already recording.");
      return;
    }
    if (!this.audio || !this.synth) {
      throw new Error("AudioContext or Synthesizer not initialized.");
    }

    await this.audio.resume();

    this.recorderDestination = this.audio.createMediaStreamDestination();

    const synthOutputNode = this.globalEqualizer
      ? this.globalEqualizer.output
      : this.synth.worklet;
    synthOutputNode.connect(this.recorderDestination);

    if (options.includeMicrophone) {
      try {
        this.micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });

        this.micSource = this.audio.createMediaStreamSource(this.micStream);
        this.micSource.connect(this.recorderDestination);
      } catch (err) {
        console.error("Error accessing microphone:", err);
        synthOutputNode.disconnect(this.recorderDestination);
        this.recorderDestination = null;
        throw new Error("Could not access microphone.");
      }
    }

    this.recordedChunks = [];
    const mimeType = "audio/webm; codecs=opus";
    this.mediaRecorder = new MediaRecorder(this.recorderDestination.stream, {
      mimeType: mimeType,
      audioBitsPerSecond: 128000,
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.start();
    this.isRecording = true;
    console.log("🔴 Recording started.", {
      includeMicrophone: options.includeMicrophone,
    });
  }

  async stopRecording(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        console.warn("stopRecording called but not in a recording state.");
        return reject(new Error("Recording is not active."));
      }

      this.mediaRecorder.onstop = async () => {
        if (this.recordedChunks.length === 0) {
          console.warn(
            "Recording stopped, but no audio data was captured. The audio stream might be silent."
          );
          this.cleanupRecording();
          return reject(new Error("No audio data was recorded."));
        }

        const blob = new Blob(this.recordedChunks, { type: "audio/webm" });
        const recordingName = `recording-${new Date().toISOString()}.webm`;

        try {
          const recordingsManager = new RecordingsManager();
          await recordingsManager.add({
            file: new File([blob], recordingName),
            createdAt: new Date(),
          });
          console.log("Recording saved to database.");
        } catch (dbError) {
          console.error("Failed to save recording to database:", dbError);
        }

        const audioUrl = URL.createObjectURL(blob);

        console.log(`Recording finished. URL: ${audioUrl}, Size: ${blob.size}`);
        this.cleanupRecording();
        resolve(audioUrl);
      };

      this.mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        this.cleanupRecording();
        reject(
          new Error(
            `An error occurred during recording: ${(event as any).error.name}`
          )
        );
      };

      console.log("Calling mediaRecorder.stop()...");
      this.mediaRecorder.stop();
    });
  }

  private cleanupRecording() {
    if (!this.audio || !this.synth) return;

    const synthOutputNode = this.globalEqualizer
      ? this.globalEqualizer.output
      : this.synth.worklet;
    if (this.recorderDestination) {
      synthOutputNode.disconnect(this.recorderDestination);
    }

    if (this.micSource && this.recorderDestination) {
      this.micSource.disconnect(this.recorderDestination);
    }
    this.micStream?.getTracks().forEach((track) => track.stop());

    this.isRecording = false;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.micSource = null;
    this.micStream = null;
    this.recorderDestination = null;
    console.log("🎧 Recording stopped and resources cleaned up.");
  }

  async unintsall() {
    if (this.isRecording) {
      console.log("Stopping recording before uninstalling...");
      await this.stopRecording();
    }
    await this.audio?.suspend();
    console.log("Synth engine uninstalled.");
  }
}
