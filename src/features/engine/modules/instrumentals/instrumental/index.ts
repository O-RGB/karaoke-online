import { PROGRAM_CATEGORY } from "@/config/value";
import { SynthChannel } from "../channel";
import { EventEmitter, } from "../events";
import {
  EventKey,
  IMidiOutput,
  INodeState,
  INoteState,
  InstrumentDrum,
  InstrumentType,
  TEventType,
} from "../types/node.type";
import { EXPRESSION, MAIN_VOLUME } from "@/features/engine/types/node.type";
import { SynthControl } from "../node";
import {
  BaseSynthEngine,
  INoteChange,
  IProgramChange,
} from "@/features/engine/types/synth.type";
import { EQConfig } from "../../equalizer/types/equalizer.type";

export const INSTRUMENT_TYPE_BY_INDEX: InstrumentType[] = [
  "piano",
  "chromatic_percussion",
  "organ",
  "guitar_clean",
  "guitar_nylon",
  "guitar_jazz",
  "guitar_overdriven",
  "guitar_distortion",
  "bass",
  "string",
  "ensemble",
  "brass",
  "reed",
  "pipe",
  "synth_lead",
  "synth_pad",
  "synth_effect",
  "ethnic",
  "percussive",
  "sound_effects",
];

export const INSTRUMENT_DRUM: InstrumentDrum[] = [
  "general",
  "lukthung",
  "lukkrung",
  "phuea_chiwit",
  "sixties",
  "string",
  "shock",
  "jimmix",
  "saching",
  "jazz",
  "thai_classical",
];

export const findProgramCategory = (
  program: number
): { category: InstrumentType; index: number } | null => {
  const index = PROGRAM_CATEGORY.findIndex((group) => group.includes(program));
  return index !== -1
    ? { category: INSTRUMENT_TYPE_BY_INDEX[index], index }
    : null;
};

export class InstrumentalNode {
  public programGroup = PROGRAM_CATEGORY;
  public isMidiOutput: boolean = false
  public group = new Map<InstrumentType, Map<number, SynthChannel>>();
  public midiOutput: IMidiOutput = { port: null, isConnected: false };
  public notesEvent = new Map<InstrumentType, Map<number, EventEmitter<INoteState, INoteChange>>>();

  public expression: SynthControl<INodeState, number>[] = [];
  public velocity: SynthControl<INodeState, number>[] = [];
  public equalizer: SynthControl<INodeState, EQConfig>[] = [];

  private engine: BaseSynthEngine | undefined = undefined;
  public groupEvent = new EventEmitter<InstrumentType, Map<number, SynthChannel>>()

  constructor() {
    this.initializeGroupMap();
    this.initializeSettingNode();
  }

  public connectMIDIOutput(outputPort: MIDIOutput) {
    this.midiOutput = { port: outputPort, isConnected: true };
    console.log(`Connected to MIDI output: ${outputPort.name}`);
  }

  private getGroupType(type: InstrumentType | number) {
    let groupType: InstrumentType | undefined = undefined;
    if (typeof type === "number") {
      groupType = INSTRUMENT_TYPE_BY_INDEX[type];
    } else {
      groupType = type;
    }
    return groupType;
  }

  public setEngine(engine: BaseSynthEngine) {
    this.engine = engine;
  }

  private initializeGroupMap() {
    for (let index = 0; index < this.programGroup.length; index++) {
      this.group.set(INSTRUMENT_TYPE_BY_INDEX[index], new Map());
      this.notesEvent.set(INSTRUMENT_TYPE_BY_INDEX[index], new Map())
      this.groupEvent.emit([INSTRUMENT_TYPE_BY_INDEX[index], "CHANGE"], index, new Map())
    }
  }

  private initializeSettingNode() {
    this.expression = INSTRUMENT_TYPE_BY_INDEX.map(
      (_, i) => new SynthControl(undefined, "EXPRESSION", i, 100)
    );
    this.velocity = INSTRUMENT_TYPE_BY_INDEX.map(
      (_, i) => new SynthControl(undefined, "VELOCITY", i, 0)
    );

    this.equalizer = INSTRUMENT_TYPE_BY_INDEX.map(
      (_, i) =>
        new SynthControl(
          undefined,
          "EQUALIZER",
          i,
          {
            enabled: false,
            gains: [0, 0, 0],
            boostLevel: 0,
            inputVolume: 1,
            outputVolume: 1,
            volumeCompensation: 1,
          } as EQConfig
        )
    );
  }

  public update(
    event: IProgramChange,
    oldProgram: number,
    value: SynthChannel
  ): void {
    const oldType = findProgramCategory(oldProgram);
    const newType = findProgramCategory(event.program);

    if (!newType) {
      console.warn(`No category found for program: ${event.program}`);
      return;
    }

    if (oldType) {
      const oldTypeChannels = this.group.get(oldType.category);
      if (oldTypeChannels) {
        oldTypeChannels.delete(event.channel);
        const oldExpression = this.expression[oldType.index].value ?? 100;
        this.updateController(event.channel, oldExpression);
        const oldVelocity = this.velocity[oldType.index].value ?? 0;
        this.updateVelocity(event.channel, oldVelocity);
        const oldEqualizer = this.equalizer[oldType.index].value;
        if (oldEqualizer)
          this.updateEQ(oldType.category, oldEqualizer, oldType.index);
        this.groupEvent.emit([oldType.category, "CHANGE"], oldType.index, oldTypeChannels)
      }
    }

    const { category: type } = newType;
    const byType = this.group.get(type) ?? new Map<number, SynthChannel>();

    byType.set(event.channel, value);
    this.group.set(type, byType);

    const newExpression = this.expression[newType.index].value ?? 100;
    this.updateController(event.channel, newExpression);
    const newVelocity = this.velocity[newType.index].value ?? 0;
    this.updateVelocity(event.channel, newVelocity);
    const oldEqualizer = this.equalizer[newType.index].value;
    if (oldEqualizer)
      this.updateEQ(newType.category, oldEqualizer, newType.index);
    this.groupEvent.emit([newType.category, "CHANGE"], newType.index, byType)

  }

  updateEQ(type: InstrumentType | number, value: EQConfig, indexKey: number) {
    let groupType = this.getGroupType(type);
    const nodes: Map<number, SynthChannel> = this.group.get(groupType) ?? new Map();
    nodes.forEach((node) => node.equalizer?.applyConfig(value));
    this.equalizer[indexKey].setValue(value);
  }

  setExpression(
    type: InstrumentType | number,
    value: number,
    indexKey: number
  ) {
    let groupType = this.getGroupType(type);
    const nodes: Map<number, SynthChannel> =
      this.group.get(groupType) ?? new Map();
    nodes.forEach((node) => {
      if (node.expression !== undefined && node.channel !== undefined) {
        if (node.channel !== 9) {
          this.updateController(node.channel, value);
          node.expression.setValue(value);
        }
      }
    });

    this.expression[indexKey].setValue(value);
  }

  setVelocity(type: InstrumentType | number, value: number, indexKey: number) {
    let groupType = this.getGroupType(type);
    const nodes: Map<number, SynthChannel> =
      this.group.get(groupType) ?? new Map();
    nodes?.forEach((node) => {
      if (node.velocity !== undefined && node.channel !== undefined) {
        if (node.channel !== 9) {
          this.engine?.setVelocity({ channel: node.channel, value });
          node.velocity.setValue(value);
        }
      }
    });
    this.velocity[indexKey].setValue(value);
  }

  getGain() {
    let gain: number[] = [];
    this.group.forEach((types) => {
      let node: SynthChannel[] = Array.from(types.values());
      const volumes = node.map((n) => n.getGain());
      const totalGain = volumes.reduce((acc, volume) => acc + volume, 0);
      const averageGain = totalGain / volumes.length;
      gain.push(averageGain);
    });
    return gain;
  }

  onNoteOnEvent(type: InstrumentType) {
    if (this.isMidiOutput) {
      const channels = this.group.get(type)
      channels?.forEach((k) => {
        k.globalNoteOnEvent.on(["NOTE_ON", "CHANGE"], 0, ((c) => {
          console.log(k, c)
          if (this.midiOutput.isConnected && this.midiOutput.port) {
            const channel = k.channel || 0;
            const noteNumber = c.midiNote || 60;
            const velocity = c.velocity || 127;

            // MIDI Note On command (0x90 = 144)
            this.midiOutput.port.send([0x90 + channel, noteNumber, velocity]);
          }
        }), "instrumentall-system")
        k.globalNoteOnEvent.on(["NOTE_OFF", "CHANGE"], 0, ((c) => {
          console.log(k, c)
          if (this.midiOutput.isConnected && this.midiOutput.port) {
            const channel = k.channel || 0;
            const noteNumber = c.midiNote || 60;
            const velocity = c.velocity || 127;

            // MIDI Note On command (0x80 = 128)
            this.midiOutput.port.send([0x80 + channel, noteNumber, velocity]);
          }
        }), "instrumentall-system")
        if (k.channel) {
          this.engine?.setController({ channel: k.channel, controllerNumber: MAIN_VOLUME, controllerValue: 0 })
          this.updateController(k.channel, 0);
        }
      })
    }
  }

  setMidiOutput(callback: (isMidiOutput: boolean) => { type: InstrumentType, isOutput: boolean }) {
    const { isOutput, type } = callback(this.isMidiOutput)
    this.isMidiOutput = isOutput
    if (isOutput) {
      this.onNoteOnEvent(type)
    } else {
      const channels = this.group.get(type)
      channels?.forEach((k) => {
        k.globalNoteOnEvent.off(["NOTE_ON", "CHANGE"], 0, "instrumentall-system")
        if (k.channel) {
          this.engine?.setController({ channel: k.channel, controllerNumber: MAIN_VOLUME, controllerValue: 100 })
          this.updateController(k.channel, 100);
        }
      })
    }
  }

  sendMIDIControlChange(channel: number, controlNumber: number, value: number) {
    if (this.midiOutput.isConnected && this.midiOutput.port) {
      // MIDI Control Change command (0xB0 = 176)
      this.midiOutput.port.send([0xB0 + channel, controlNumber, value]);
    }
  }


  updateController(
    channel: number,
    value: number,
    type: "EXPRESSION" | "VOLUME" = "EXPRESSION"
  ) {
    if (channel !== 9) {
      this.engine?.setController?.({
        channel: channel,
        controllerNumber: type === "EXPRESSION" ? EXPRESSION : MAIN_VOLUME,
        controllerValue: value,
      });
    }
  }

  updateVelocity(channel: number, value: number) {
    if (channel !== 9 && channel !== 8) {
      this.engine?.setVelocity({ channel, value });
    }
  }

  linkEvent(
    eventKey: EventKey<InstrumentType>,
    indexKey: number,
    callback: (event: Map<number, SynthChannel>) => void,
    componentId: string
  ) {
    this.groupEvent.on(eventKey, indexKey, callback, componentId)
    const event = this.group.get(eventKey[0])
    if (event) {
      callback(event)
    }
  }

  unlinkEvent(
    eventKey: EventKey<InstrumentType>,
    indexKey: number,
    componentId: string
  ) {
    this.groupEvent.off(eventKey, indexKey, componentId)
  }

}
