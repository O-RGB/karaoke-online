import {
  modulatorSources,
  NON_CC_INDEX_OFFSET,
  Synthetizer as Spessasynth,
} from "spessasynth_lib";

import {
  BaseSynthEngine,
  BaseSynthPlayerEngine,
  IControllerChange,
  ILockController,
  IMuteController,
  IProgramChange,
  TimingModeType,
} from "../../types/synth.type";

import { loadAudioContext, loadPlayer } from "./lib/spessasynth";
import { BASS, CHANNEL_DEFAULT, DEFAULT_SOUND_FONT } from "@/config/value";
import { MainNodeController } from "@/features/engine/lib/node";
import { SpessaPlayerEngine } from "./player/spessa-synth-player";
import { AudioMeter } from "../../lib/gain";
import { RemoteSendMessage } from "@/features/remote/types/remote.type";
import { INodeCallBack } from "../../types/node.type";

export class SpessaSynthEngine implements BaseSynthEngine {
  public time: TimingModeType = "Time";
  public synth: Spessasynth | undefined;
  public audio: AudioContext | undefined;
  public player: BaseSynthPlayerEngine | undefined;
  public preset: number[] = [];
  public analysers: AnalyserNode[] = [];
  public soundfontName: string | undefined;
  public soundfontFile: File | undefined;
  public bassLocked: number | undefined = undefined;
  public bassDetect: IProgramChange | undefined = undefined;

  public controllerItem: MainNodeController | undefined = undefined;
  public gainNode: AudioMeter | undefined = undefined;

  private sendMessage?: (info: RemoteSendMessage) => void;

  constructor(
    setInstrument?: (instrument: IPersetSoundfont[]) => void,
    bassLocked?: number,
    sendMessage?: (info: RemoteSendMessage) => void
  ) {
    this.startup(setInstrument);
    if (bassLocked) {
      this.bassLocked = bassLocked;
    }
    this.sendMessage = sendMessage;
  }

  async startup(setInstrument?: (instrument: IPersetSoundfont[]) => void) {
    const { audioContext, channels } = await loadAudioContext();
    if (!audioContext)
      return { audio: undefined, synth: undefined, player: undefined };

    const synth = await this.loadDefaultSoundFont(audioContext);
    if (!synth)
      return { audio: undefined, synth: undefined, player: undefined };

    synth.highPerformanceMode = false;
    const player = await loadPlayer(synth);

    this.synth = synth;
    this.audio = audioContext;

    this.persetChange((e) => setInstrument?.(e));
    this.synth?.setDrums(8, true);

    this.player = new SpessaPlayerEngine(player);
    this.controllerItem = new MainNodeController();

    if (audioContext) {
      const analysers: AnalyserNode[] = [];
      for (let ch = 0; ch < CHANNEL_DEFAULT.length; ch++) {
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        this.controllerItem.initAnalyser(ch, analyser);
        analysers.push(analyser);
      }
      synth?.connectIndividualOutputs(analysers);

      this.analysers = analysers;
      this.gainNode = new AudioMeter(audioContext, analysers);
    }

    this.controllerChange();
    this.programChange();

    return { synth: synth, audio: this.audio };
  }

  async loadDefaultSoundFont(audio?: AudioContext): Promise<any> {
    let arraybuffer: ArrayBuffer | undefined = undefined;
    if (this.soundfontFile) {
      arraybuffer = await this.soundfontFile.arrayBuffer();
    } else {
      const res = await fetch(DEFAULT_SOUND_FONT);
      arraybuffer = await res.arrayBuffer();
      if (audio) {
        const synthInstance = new Spessasynth(audio.destination, arraybuffer);

        synthInstance.setMainVolume(0.7);
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
  }

  getAnalyserNode(auto: AudioContext) {
    return Array.from({ length: 16 }, () => {
      const analyser = auto.createAnalyser();
      analyser.fftSize = 256;
      return analyser;
    });
  }

  private sendMessageData(
    node?: INodeCallBack,
    value?:
      | IControllerChange
      | IProgramChange
      | ILockController
      | IMuteController
  ) {
    if (!this.sendMessage || !node || !value) {
      return;
    }

    let message: INodeCallBack = {
      ...node,
      value,
    };
    this.sendMessage({
      user: "SUPER",
      message,
    });
  }

  async setSoundFont(file: File) {
    const bf = await file.arrayBuffer();
    try {
      this.synth?.soundfontManager.reloadManager(bf);
      this.soundfontName = file.name;
      return true;
    } catch (error) {
      return false;
    }
  }

  controllerChange(event?: (event: IControllerChange) => void): void {
    return this.synth?.eventHandler.addEvent(
      "controllerchange",
      "",
      (e: IControllerChange) => {
        const { event } =
          this.controllerItem?.onControllerChange(e, false) ?? {};
        this.sendMessageData(event, e);
      }
    );
  }

  programChange(event?: (event: IProgramChange) => void): void {
    return this.synth?.eventHandler.addEvent(
      "programchange",
      "",
      (e: IProgramChange) => {
        const { channel, program } = e;

        const isBass = BASS.includes(program);

        if (isBass) {
          this.bassDetect = e;
        }

        if (isBass && this.bassLocked) {
          const lockNum: number = this.bassLocked;

          if (this.bassDetect?.program !== lockNum) {
            this.setProgram(channel, lockNum);
            let bassMapping = { channel, program: lockNum };

            this.controllerItem?.onProgramChange(bassMapping, false);
          }
        } else {
          this.controllerItem?.onProgramChange(e, false);
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

  setProgram(channel: number, programNumber: number, userChange?: boolean) {
    this.synth?.programChange(channel, programNumber, userChange);
  }
  setController(
    channel: number,
    controllerNumber: number,
    controllerValue: number,
    force?: boolean
  ): void {
    let controllerObj: IControllerChange = {
      channel,
      controllerNumber,
      controllerValue,
    };
    let { event, isLock } =
      this.controllerItem?.onControllerChange(controllerObj, true) ?? {};

    if (isLock === true) {
      this.lockController(channel, controllerNumber, false);
    }

    this.synth?.controllerChange(
      channel,
      controllerNumber,
      controllerValue,
      force
    );

    if (isLock === true) {
      this.lockController(channel, controllerNumber, true);
    }
    this.sendMessageData(event, controllerObj);
  }

  lockController(
    channel: number,
    controllerNumber: number,
    isLocked: boolean
  ): void {
    this.synth?.lockController(channel, controllerNumber, isLocked);
    this.controllerItem?.onLockChange(
      { channel, controllerNumber, isLocked },
      false
    );
  }

  updatePreset(channel: number, value: number): void {
    this.synth?.programChange(channel, value);
  }

  updatePitch(channel: number, semitones: number = 0): void {
    const PITCH_CENTER = 8192;
    const PITCH_RANGE = 16384;
    const SEMITONE_STEP = PITCH_RANGE / 24;
    const pitchValue = Math.max(
      0,
      Math.min(
        PITCH_RANGE - 1,
        Math.round(PITCH_CENTER + semitones * SEMITONE_STEP)
      )
    );
    const MSB = (pitchValue >> 7) & 0x7f;
    const LSB = pitchValue & 0x7f;
    const sendPitch = (channel: number) => {
      this.lockController(
        channel,
        NON_CC_INDEX_OFFSET + modulatorSources.pitchWheel,
        false
      );

      this.synth?.setPitchBendRange(channel, Math.abs(semitones));
      this.synth?.pitchWheel(channel, MSB, LSB);
      if (semitones !== 0) {
        this.lockController(
          channel,
          NON_CC_INDEX_OFFSET + modulatorSources.pitchWheel,
          true
        );
      }
    };
    if (channel !== null) {
      sendPitch(channel);
    } else {
      for (let i = 0; i < 16; i++) {
        sendPitch(i);
      }
    }
  }

  setMute(channel: number, isMuted: boolean): void {
    this.synth?.muteChannel(channel, isMuted);
    this.controllerItem?.onMuteChange({ channel, isMute: isMuted }, false);
  }

  setBassLocked(bassNumber: number, isLock: boolean): void {
    const backup = this.bassDetect;
    if (isLock) {
      this.bassLocked = bassNumber;

      if (backup) {
        this.setProgram(backup.channel, bassNumber);
      }
    } else {
      if (backup) {
        this.setProgram(backup.channel, backup.program);
      }

      this.bassLocked = undefined;
    }
  }
}
