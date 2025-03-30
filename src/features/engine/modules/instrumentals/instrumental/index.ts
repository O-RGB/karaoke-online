import { PROGRAM_CATEGORY } from "@/config/value";
import { SynthChannel } from "../channel";
import { EventManager } from "../events";
import {
  EventKey,
  INodeState,
  InstrumentType,
  TEventType,
} from "../types/node.type";
import { EXPRESSION } from "@/features/engine/types/node.type";
import { SynthNode } from "../node";
import {
  BaseSynthEngine,
  IProgramChange,
} from "@/features/engine/types/synth.type";

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
  }

  public update(
    event: IProgramChange,
    oldProgram: number,
    oldChannel: number,
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
        const oldVelocity = this.velocity[oldType.index].value ?? 0;
        this.updateController(event.channel, oldExpression);
        this.updateVelocity(event.channel, oldVelocity);
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

    this.groupEvent.trigger([newType.category, "CHANGE"], newType.index, {
      value: byType,
    });
  }

  setExpression(type: InstrumentType, value: number, indexKey: number) {
    const nodes: Map<number, SynthChannel> = this.group.get(type) ?? new Map();
    nodes.forEach((node) => {
      if (node.expression !== undefined && node.channel !== undefined) {
        console.log("setExpression Link Ch:", node.channel + 1);
        if (node.channel !== 9) {
          this.updateController(node.channel, value);
          node.expression.setValue(value);
        }
      }
    });

    console.log("this.expression", this.expression);

    this.expression[indexKey].setValue(value);
    this.settingEvent.trigger(["EXPRESSION", "CHANGE"], indexKey, { value });
  }

  setVelocity(type: InstrumentType, value: number, indexKey: number) {
    const nodes: Map<number, SynthChannel> = this.group.get(type) ?? new Map();
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

  updateController(channel: number, value: number) {
    if (channel !== 9 && channel !== 8) {
      this.engine?.setController?.({
        channel: channel,
        controllerNumber: EXPRESSION,
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
