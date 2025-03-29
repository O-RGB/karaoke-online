import { Synthetizer as Spessasynth } from "spessasynth_lib";

import {
  BaseSynthEngine,
  BaseSynthPlayerEngine,
  IControllerChange,
  ILockController,
  IMuteController,
  IProgramChange,
  IVelocityChange,
  TimingModeType,
} from "../../types/synth.type";

import { loadAudioContext, loadPlayer } from "./lib/spessasynth";
import { BASS, CHANNEL_DEFAULT, DEFAULT_SOUND_FONT } from "@/config/value";
import { SpessaPlayerEngine } from "./player/spessa-synth-player";
import { AudioMeter } from "../../lib/gain";
import { RemoteSendMessage } from "@/features/remote/types/remote.type";
import { SoundSetting } from "@/features/config/types/config.type";
import { SynthChannel } from "../instrumentals-node/modules/channel";
import { InstrumentalNode } from "../instrumentals-node/modules/instrumental";
import { InstrumentalNodeUpdate } from "../instrumentals-node/modules/instrumental/update";
import {
  CHORUSDEPTH,
  EXPRESSION,
  MAIN_VOLUME,
  PAN,
  REVERB,
} from "../../types/node.type";

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

  public nodes: SynthChannel[] = [];
  public instrumentalNodes = new InstrumentalNodeUpdate();

  public gainNode: AudioMeter | undefined = undefined;
  public config: Partial<SoundSetting> | undefined;

  private sendMessage?: (info: RemoteSendMessage) => void;

  constructor(
    setInstrument?: (instrument: IPersetSoundfont[]) => void,
    sendMessage?: (info: RemoteSendMessage) => void,
    config?: Partial<SoundSetting>
  ) {
    this.startup(setInstrument, config);

    this.config = config;
    this.sendMessage = sendMessage;
  }

  async startup(
    setInstrument?: (instrument: IPersetSoundfont[]) => void,
    config?: Partial<SoundSetting>
  ) {
    const { audioContext, channels } = await loadAudioContext();
    if (!audioContext)
      return { audio: undefined, synth: undefined, player: undefined };

    const synth = await this.loadDefaultSoundFont(audioContext);
    if (!synth)
      return { audio: undefined, synth: undefined, player: undefined };

    synth.highPerformanceMode = true;
    const player = await loadPlayer(synth);

    this.synth = synth;
    this.audio = audioContext;

    this.persetChange((e) => setInstrument?.(e));
    this.synth?.setDrums(8, true);

    this.player = new SpessaPlayerEngine(player, config);
    this.instrumentalNodes.setEngine(this);
    this.nodes = CHANNEL_DEFAULT.map(
      (v, i) => new SynthChannel(i, this.instrumentalNodes)
    );

    if (audioContext) {
      const analysers: AnalyserNode[] = [];
      for (let ch = 0; ch < CHANNEL_DEFAULT.length; ch++) {
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        // this.controllerItem.initAnalyser(ch, analyser);
        this.nodes[ch].setAnalyser(analyser);
        analysers.push(analyser);
      }
      synth?.connectIndividualOutputs(analysers);

      this.analysers = analysers;
      this.gainNode = new AudioMeter(audioContext, analysers);
    }

    this.controllerChange();
    this.programChange();

    // CHANNEL_DEFAULT.map((_, ch) => synth.lockController(ch, EXPRESSION, true));

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
    node?: SynthChannel,
    value?:
      | IControllerChange
      | IProgramChange
      | ILockController
      | IMuteController
  ) {
    if (!this.sendMessage || !node || !value) {
      return;
    }

    let message: any = {
      node,
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
        const node = this.nodes[e.channel];
        this.nodes[e.channel].controllerChange(e);
        this.sendMessageData(node, e);
      }
    );
  }

  // conifgInit() {
  //   const mixer = this.config?.mixer;
  //   if (!mixer) return;
  //   const mixerObj = Object.values(mixer).map((item) => ({
  //     ...item,
  //     program: Object.values(item.program), // แปลง program เป็น array
  //   }));

  //   mixerObj?.map((v) => {
  //     const { program, value } = v;
  //     const node = this.controllerItem?.searchProgram(program);
  //     if (node) {
  //       const channel = node.channel;
  //       this.setController({
  //         channel,
  //         controllerNumber: MAIN_VOLUME,
  //         controllerValue: value,
  //       });
  //       this.lockController({
  //         channel,
  //         controllerNumber: MAIN_VOLUME,
  //         controllerValue: true,
  //       });
  //     }
  //   });
  // }

  programChange(event?: (event: IProgramChange) => void): void {
    return this.synth?.eventHandler.addEvent(
      "programchange",
      "",
      (e: IProgramChange) => {
        const { channel } = e;
        this.nodes[channel].programChange(e, "programChange");
        // // console.log("programchange", e);
        // const isBass = BASS.includes(program);

        // if (isBass) {
        //   this.bassDetect = e;
        // }

        // if (isBass && this.bassLocked) {
        //   const lockNum: number = this.bassLocked;

        //   if (this.bassDetect?.program !== lockNum) {
        //     this.setProgram({ channel, program: lockNum });
        //     let bassMapping = { channel, program: lockNum };
        //     this.nodes[channel].programChange(bassMapping, "programChange");
        //   }
        // } else {
        //   this.nodes[channel].programChange(e, "programChange");
        // }
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
    // this.instrumentalNodes?.regroupNodes();
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

    console.log("isLocked", isLocked);

    if (isLocked === true || event.force) {
      this.lockController({ ...event, controllerValue: false });
    }
    this.synth?.controllerChange(
      event.channel,
      event.controllerNumber,
      event.controllerValue,
      event.force
    );
    console.log("Update Controller: ", event);
    if (isLocked === true || event.force) {
      this.lockController({ ...event, controllerValue: true });
    }
    this.sendMessageData(node, event);
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

  setMute(event: IControllerChange<boolean>): void {
    this.synth?.muteChannel(event.channel, event.controllerValue);
    this.nodes[event.channel].muteChange({
      channel: event.channel,
      controllerNumber: event.controllerNumber,
      controllerValue: event.controllerValue,
    });
  }

  setBassLocked(bassNumber: number, isLock: boolean): void {
    const backup = this.bassDetect;
    if (isLock) {
      this.bassLocked = bassNumber;

      if (backup) {
        this.setProgram({ channel: backup.channel, program: bassNumber });
      }
    } else {
      if (backup) {
        this.setProgram({ channel: backup.channel, program: backup.program });
      }

      this.bassLocked = undefined;
    }
  }
}
