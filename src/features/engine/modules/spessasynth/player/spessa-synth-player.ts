import { MIDI, Sequencer, Synthetizer as Spessasynth } from "spessasynth_lib";

import { fixMidiHeader } from "@/lib/karaoke/ncn";
import { calculateTicks, convertTicksToTime } from "@/lib/app-control";
import { BaseSynthPlayerEngine } from "@/features/engine/types/synth.type";
import { SoundSetting } from "@/features/config/types/config.type";
import { SpessaSynthEngine } from "../spessa-synth-engine";
import { MAIN_VOLUME } from "@/features/engine/types/node.type";

export class SpessaPlayerEngine implements BaseSynthPlayerEngine {
  private player: Sequencer | undefined;
  public paused: boolean = false;
  public isFinished: boolean = false;
  public currentTiming: number = 0;
  public midiData: MIDI | undefined = undefined;
  public duration: number = 0;
  public durationTiming: number = 0;
  public config?: Partial<SoundSetting>;

  constructor(player: Sequencer | undefined, config?: Partial<SoundSetting>) {
    this.player = player;
    this.config = config;
  }

  // conifgInit() {
  //   const mixer = this.config?.mixer;
  //   if (!mixer) return;
  //   const mixerObj = Object.values(mixer).map((item) => ({
  //     ...item,
  //     program: Object.values(item.program), // แปลง program เป็น array
  //   }));
  //   console.log("mixerObj", mixerObj);
  //   mixerObj?.map((v) => {
  //     const { program, value } = v;
  //     const node = this.engine?.controllerItem?.searchProgram(program);
  //     if (node) {
  //       const channel = node.channel;
  //       this.engine?.setController(channel, MAIN_VOLUME, value);
  //       this.engine?.lockController(channel, MAIN_VOLUME, true);
  //     }
  //   });
  // }

  play(): void {
    this.player?.play();
    this.paused = false;
    // this.conifgInit();
  }
  stop(): void {
    this.player?.stop();
    this.player?.pause();
    this.paused = true;
  }
  pause(): void {
    this.player?.pause();
    this.paused = true;
  }

  async getCurrentTiming() {
    return this.player?.currentTime ?? 0;
  }

  setCurrentTiming(timing: number): void {
    if (!this.player) {
      return;
    }
    this.player.currentTime = timing;
  }

  async getCurrentTickAndTempo(
    timeDivision: number,
    currentTime: number,
    tempos: ITempoChange[]
  ) {
    const tempoTimeChange = convertTicksToTime(timeDivision, tempos);
    return calculateTicks(timeDivision, currentTime, tempoTimeChange);
  }

  async loadMidi(midi: File) {
    let midiFileArrayBuffer = await midi.arrayBuffer();
    let parsedMidi: MIDI | null = null;
    try {
      parsedMidi = new MIDI(midiFileArrayBuffer, midi.name);
    } catch (e) {
      console.error(e);
      const fix = await fixMidiHeader(midi);
      const fixArrayBuffer = await fix.arrayBuffer();
      parsedMidi = new MIDI(fixArrayBuffer, fix.name);
    }
    this.midiData = parsedMidi;
    this.duration = parsedMidi.duration;
    this.player?.loadNewSongList([parsedMidi], false);

    this.durationTiming = parsedMidi.duration;

    return parsedMidi;
  }

  setMidiOutput(output: MIDIOutput): void {
    this.player?.connectMidiOutput(output);
  }
  resetMidiOutput(): void {
    this.player?.resetMIDIOut();
  }
}
