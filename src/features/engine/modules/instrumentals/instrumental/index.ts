import { PROGRAM_CATEGORY } from "@/config/value";
import { SynthChannel } from "../channel";
import { EventManager } from "../events";
import {
  EventKey,
  INodeState,
  InstrumentDrum,
  InstrumentType,
  TEventType,
} from "../types/node.type";
import { EXPRESSION, MAIN_VOLUME } from "@/features/engine/types/node.type";
import { SynthNode } from "../node";
import {
  BaseSynthEngine,
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
  public group = new Map<InstrumentType, Map<number, SynthChannel>>();

  public expression: SynthNode<INodeState, number>[] = [];
  public velocity: SynthNode<INodeState, number>[] = [];
  public equalizer: SynthNode<INodeState, EQConfig>[] = [];

  public equalizerEvent = new EventManager<INodeState, TEventType<EQConfig>>();
  public settingEvent = new EventManager<INodeState, TEventType<number>>();
  public groupEvent = new EventManager<
    InstrumentType,
    TEventType<Map<number, SynthChannel>>
  >();

  private engine: BaseSynthEngine | undefined = undefined;

  constructor() {
    this.initializeGroupMap();
    this.initializeSettingNode();
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
    }
  }

  private initializeSettingNode() {
    this.expression = INSTRUMENT_TYPE_BY_INDEX.map(
      (_, i) => new SynthNode(this.settingEvent, "EXPRESSION", i, 100)
    );
    this.velocity = INSTRUMENT_TYPE_BY_INDEX.map(
      (_, i) => new SynthNode(this.settingEvent, "VELOCITY", i, 0)
    );
    this.equalizer = INSTRUMENT_TYPE_BY_INDEX.map(
      (_, i) =>
        new SynthNode<INodeState, EQConfig>(
          this.equalizerEvent,
          "EQUALIZER",
          i,
          {
            enabled: false,
            gains: [0, 0, 0],
            boostLevel: 0,
            inputVolume: 1,
            outputVolume: 1,
            volumeCompensation: 1,
          }
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

    this.groupEvent.trigger([newType.category, "CHANGE"], newType.index, {
      value: byType,
    });
  }

  updateEQ(type: InstrumentType | number, value: EQConfig, indexKey: number) {
    let groupType = this.getGroupType(type);
    const nodes: Map<number, SynthChannel> =
      this.group.get(groupType) ?? new Map();
    nodes.forEach((node) => {
      node.equalizer?.applyConfig(value);
    });
    this.equalizer[indexKey].setValue(value);
    this.equalizerEvent.trigger(["EQUALIZER", "CHANGE"], indexKey, { value });
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
        console.log("setExpression Link Ch:", node.channel + 1);
        if (node.channel !== 9) {
          this.updateController(node.channel, value);
          node.expression.setValue(value);
        }
      }
    });

    this.expression[indexKey].setValue(value);
    this.settingEvent.trigger(["EXPRESSION", "CHANGE"], indexKey, { value });
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
    this.settingEvent.trigger(["VELOCITY", "CHANGE"], indexKey, { value });
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

  setCallBackState(
    eventType: EventKey,
    indexKey: number,
    callback: (event: TEventType<number>) => void,
    componentId: string
  ) {
    this.settingEvent.add(eventType, indexKey, callback, componentId);
    let value: number = 100;
    if (eventType[0] === "EXPRESSION") {
      value = this.expression[indexKey].value ?? 100;
    } else if (eventType[0] === "VELOCITY") {
      value = this.velocity[indexKey].value ?? 0;
    }
    callback({ value });
  }

  removeCallback(
    eventType: EventKey,
    indexKey: number,
    componentId: string
  ): boolean {
    return this.settingEvent.remove(eventType, indexKey, componentId);
  }

  setCallBackEQ(
    eventType: EventKey,
    indexKey: number,
    callback: (event: TEventType<EQConfig>) => void,
    componentId: string
  ) {
    this.equalizerEvent.add(eventType, indexKey, callback, componentId);
    const value = this.equalizer[indexKey].value;
    callback({ value });
  }

  removeCallbackEQ(
    eventType: EventKey,
    indexKey: number,
    componentId: string
  ): boolean {
    return this.equalizerEvent.remove(eventType, indexKey, componentId);
  }

  setCallBackGroup(
    eventType: EventKey<InstrumentType>,
    indexKey: number,
    callback: (event: TEventType<Map<number, SynthChannel>>) => void,
    componentId: string
  ) {
    this.groupEvent.add(eventType, indexKey, callback, componentId);
    const value = this.group.get(eventType[0]);
    callback({ value });
  }
}
