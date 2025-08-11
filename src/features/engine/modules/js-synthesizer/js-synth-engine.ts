import { CHANNEL_DEFAULT, DEFAULT_SOUND_FONT } from "@/config/value";
import { JsSynthPlayerEngine } from "./player/js-synth-player";

import {
  BaseSynthEngine,
  BaseSynthPlayerEngine,
  IControllerChange,
  INoteChange,
  IProgramChange,
  IVelocityChange,
  TimingModeType,
} from "../../types/synth.type";
import { Synthesizer as JsSynthesizer } from "js-synthesizer";
import { InstrumentalNode } from "../instrumentals/instrumental";
import { SynthChannel } from "../instrumentals/channel";
import { BassConfig } from "../instrumentals/config";
import {
  ConfigSystem,
  SoundSystemMode,
} from "@/features/config/types/config.type";
import {
  CHORUSDEPTH,
  EXPRESSION,
  MAIN_VOLUME,
  PAN,
  REVERB,
} from "../../types/node.type";
import { GlobalEqualizer } from "../equalizer/global-equalizer";
import { PlayerSetTempoType } from "js-synthesizer/dist/lib/Constants";

export class JsSynthEngine implements BaseSynthEngine {
  public time: TimingModeType = "Tick";
  public synth: JsSynthesizer | undefined;
  public audio: AudioContext | undefined;
  public player: BaseSynthPlayerEngine | undefined;
  public preset: number[] = [];
  public analysers: AnalyserNode[] = [];
  public soundfontName: string | undefined;
  public soundfontFile: File | undefined;
  public soundfontFrom: SoundSystemMode = "DATABASE_FILE_SYSTEM";
  public globalEqualizer: GlobalEqualizer | undefined;

  public nodes: SynthChannel[] = [];
  public instrumental = new InstrumentalNode();

  public bassConfig: BassConfig | undefined = undefined;

  // --- 🎤 Properties สำหรับการบันทึกเสียง ---
  public isRecording: boolean = false;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private micSource: MediaStreamAudioSourceNode | null = null;
  private micStream: MediaStream | null = null;
  private recorderDestination: MediaStreamAudioDestinationNode | null = null;
  private synthAudioNode: AudioNode | null = null; // เก็บ AudioNode ของ synth

  private setInstrument: ((instrument: IPersetSoundfont[]) => void) | undefined;
  constructor(
    setInstrument?: (instrument: IPersetSoundfont[]) => void,
    systemConfig?: Partial<ConfigSystem>
  ) {
    this.setInstrument = setInstrument;
    this.startup(systemConfig);
  }

  async startup(systemConfig?: Partial<ConfigSystem>) {
    const audioContext = new AudioContext();

    const { Synthesizer } = await import("js-synthesizer");
    const synth = new Synthesizer();

    synth.init(audioContext.sampleRate);

    synth.setGain(0.3);

    this.loadDefaultSoundFont();

    this.synth = synth;
    this.audio = audioContext;

    this.player = new JsSynthPlayerEngine(synth, this);
    this.instrumental.setEngine(this);

    const analysers: AnalyserNode[] = [];
    this.nodes = [];

    // สร้าง AudioNode จาก synth และเก็บไว้ใน property
    this.synthAudioNode = synth.createAudioNode(audioContext, 8192);

    this.globalEqualizer = new GlobalEqualizer(this.synthAudioNode.context);
    this.synthAudioNode.connect(this.globalEqualizer.input);
    this.globalEqualizer.output.connect(audioContext.destination);

    for (let ch = 0; ch < CHANNEL_DEFAULT.length; ch++) {
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      this.nodes.push(
        new SynthChannel(
          ch,
          this.instrumental,
          audioContext,
          undefined,
          systemConfig
        )
      );
      this.nodes[ch].setVelocityRender(true);
      analysers.push(analyser);
    }

    this.controllerChange();
    this.programChange();
    this.noteOffChange();
    this.noteOnChange();

    return { synth: synth, audio: this.audio };
  }

  async loadPresetSoundFont(sfId?: number) {
    if (!sfId) {
      return [];
    }

    const preset = await this.synth?.getSFontObject(sfId);
    if (preset) {
      const list = await preset.getPresetIterable();
      const presetList = Array.from(list);

      const instrument: IPersetSoundfont[] = presetList.map((data) => ({
        bank: data.bankNum,
        presetName: data.name,
        program: data.num,
      }));
      this.setInstrument?.(instrument);
    }
  }

  async loadDefaultSoundFont() {
    let arraybuffer: ArrayBuffer | undefined = undefined;
    if (this.soundfontFile) {
      arraybuffer = await this.soundfontFile.arrayBuffer();
    } else {
      const res = await fetch(DEFAULT_SOUND_FONT);
      arraybuffer = await res.arrayBuffer();

      const blob = new Blob([arraybuffer], {
        type: "application/octet-stream",
      });
      const fileBlob = new File([blob], "soundfont.sf2", {
        type: "application/octet-stream",
      });
      this.soundfontFile = fileBlob;
    }

    const sfId = await this.synth?.loadSFont(arraybuffer);
    this.soundfontName = "Default Soundfont sf2";

    this.loadPresetSoundFont(sfId);
  }

  async setSoundFont(file: File, from: SoundSystemMode) {
    const bf = await file.arrayBuffer();
    try {
      const sfId = await this.synth?.loadSFont(bf);
      this.soundfontName = file.name;
      this.soundfontFrom = from;
      this.loadPresetSoundFont(sfId);
      return true;
    } catch (error) {
      return false;
    }
  }

  // --- 🎤 การจัดการการบันทึกเสียง ---

  async startRecording(options: { includeMicrophone: boolean }): Promise<void> {
    if (this.isRecording) {
      console.warn("Already recording.");
      return;
    }
    if (!this.audio || !this.synthAudioNode) {
      throw new Error("AudioContext or Synthesizer Node not initialized.");
    }

    await this.audio.resume();

    // สร้าง Destination Node สำหรับรวบรวมเสียงที่จะบันทึก
    this.recorderDestination = this.audio.createMediaStreamDestination();

    // เชื่อมต่อเสียงจาก Synth ไปยัง Destination
    this.synthAudioNode.connect(this.recorderDestination);

    // หากต้องการบันทึกเสียงจากไมโครโฟนด้วย
    if (options.includeMicrophone) {
      try {
        this.micStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        this.micSource = this.audio.createMediaStreamSource(this.micStream);
        this.micSource.connect(this.recorderDestination); // เชื่อมเสียงไมโครโฟนไปยัง Destination
      } catch (err) {
        console.error("Error accessing microphone:", err);
        // หากเกิดข้อผิดพลาด ให้ยกเลิกการเชื่อมต่อและหยุดการทำงาน
        this.synthAudioNode.disconnect(this.recorderDestination);
        this.recorderDestination = null;
        throw new Error("Could not access microphone.");
      }
    }

    this.recordedChunks = [];
    const mimeType = "audio/webm; codecs=opus";
    this.mediaRecorder = new MediaRecorder(this.recorderDestination.stream, {
      mimeType: mimeType,
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.start();
    this.isRecording = true;
    console.log("🔴 JS-Synth Recording started.");
  }

  async stopRecording(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        return reject(new Error("Recording is not active."));
      }

      this.mediaRecorder.onstop = () => {
        if (this.recordedChunks.length === 0) {
          this.cleanupRecording();
          return reject(new Error("No audio data was recorded."));
        }

        const blob = new Blob(this.recordedChunks, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(blob);

        this.cleanupRecording();
        resolve(audioUrl);
      };

      this.mediaRecorder.onerror = (event) => {
        this.cleanupRecording();
        reject(
          new Error(
            `An error occurred during recording: ${(event as any).error.name}`
          )
        );
      };

      this.mediaRecorder.stop();
    });
  }

  private cleanupRecording(): void {
    if (this.synthAudioNode && this.recorderDestination) {
      this.synthAudioNode.disconnect(this.recorderDestination);
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
    console.log("🎧 JS-Synth Recording stopped and resources cleaned up.");
  }

  // --- ส่วนที่เหลือของคลาส ---

  controllerChange(callback?: (event: IControllerChange) => void): void {
    if (this.player?.addEvent) {
      this.player.addEvent({
        controllerChangeCallback: (e) => {
          this.nodes[e.channel].controllerChange(e);
          callback?.(e);
        },
      });
    }
  }

  noteOffChange(callback?: (event: INoteChange) => void): void {
    const notes = this.nodes;
    if (this.player?.addEvent) {
      this.player.addEvent({
        onNoteOffChangeCallback: (e) => {
          notes[e.channel].noteOffChange(e);
          callback?.(e);
        },
      });
    }
  }

  noteOnChange(callback?: (event: INoteChange) => void): void {
    const notes = this.nodes;
    if (this.player?.addEvent) {
      this.player.addEvent({
        onNoteOnChangeCallback: (e) => {
          notes[e.channel].noteOnChange(e);
          callback?.(e);
        },
      });
    }
  }
  persetChange(): void {}
  programChange(callback?: (event: IProgramChange) => void): void {
    if (this.player?.addEvent) {
      this.player.addEvent({
        programChangeCallback: (e) => {
          callback?.(e);
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
        },
      });
    }
  }
  setProgram(event: IProgramChange): void {
    this.synth?.midiProgramChange(event.channel, event.program);
    this.nodes[event.channel].programChange(event);
  }

  setMute(event: IControllerChange<boolean>): void {
    this.nodes[event.channel].muteChange({
      channel: event.channel,
      controllerNumber: event.controllerNumber,
      controllerValue: event.controllerValue,
    });
    this.setController({
      ...event,
      controllerValue: event.controllerValue ? 0 : 100,
    });
  }
  setVelocity(event: IVelocityChange): void {}
  setMidiOutput(): void {}
  setController(event: IControllerChange): void {
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
    this.synth?.midiControl(
      event.channel,
      event.controllerNumber,
      event.controllerValue
    );

    node.volume?.setValue(event.controllerValue);
  }

  lockController(event: IControllerChange<boolean>): void {
    this.nodes[event.channel].lockChange({
      channel: event.channel,
      controllerNumber: event.controllerNumber,
      controllerValue: event.controllerValue,
    });
  }
  updatePitch(channel: number, semitones: number = 0): void {
    for (let index = 0; index < CHANNEL_DEFAULT.length; index++) {
      console.log(index, semitones);
      this.nodes[index].transpose?.setValue(semitones);
    }
  }

  updatePreset(channel: number, value: number): void {
    this.setProgram({ channel: channel, program: value });
  }

  updateSpeed(value: number) {
    this.synth?.retrievePlayerBpm().then((bpm) => {
      const newBpm = bpm + value;
      this.synth?.setPlayerTempo(PlayerSetTempoType.ExternalBpm, newBpm);
    });
  }

  setBassLock(program: number): void {
    this.bassConfig?.setLockBass(program);
    const bass = this.instrumental.group.get("bass");
    bass?.forEach((node) => {
      if (node.channel !== undefined) {
        this.setProgram({ channel: node.channel, program });
      }
    });
  }
  async unintsall() {
    this.audio?.suspend();
  }
}
