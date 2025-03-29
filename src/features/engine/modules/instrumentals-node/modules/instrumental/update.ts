import { CHANNEL_DEFAULT, PROGRAM_CATEGORY } from "@/config/value";
import { InstrumentType } from "../../types/inst.category.type";
import { SynthChannel } from "../channel";
import {
  BaseSynthEngine,
  IControllerChange,
  IProgramChange,
} from "@/features/engine/types/synth.type";
import { EventManager } from "../events";
import { SynthNodeState } from "../state";
import { EventKey, TEventType } from "../types/node.type";
import { EXPRESSION } from "@/features/engine/types/node.type";

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

export class InstrumentalNodeUpdate {
  public programGroup = PROGRAM_CATEGORY;
  public group = new Map<InstrumentType, Map<number, SynthChannel>>();

  public expression: SynthNodeState<number>[] = [];
  public velocity: SynthNodeState<number>[] = [];
  public settingEvent = new EventManager<TEventType<number>>();

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
      (v, i) => new SynthNodeState(this.settingEvent, "EXPRESSION", i, 100)
    );
    this.velocity = INSTRUMENT_TYPE_BY_INDEX.map(
      (v, i) => new SynthNodeState(this.settingEvent, "VELOCITY", i, 100)
    );
  }

  public update(
    event: IProgramChange,
    oldProgram: number,
    value: SynthChannel
  ): void {
    const oldType = this.findProgramCategory(oldProgram);
    const newType = this.findProgramCategory(event.program);

    if (!newType) {
      console.warn(`No category found for program: ${event.program}`);
      return;
    }

    // console.log("oldType", oldType?.index, oldType?.category);
    // console.log("newType", newType?.index, newType?.category);

    let oldExpression: number = oldType
      ? this.expression[oldType.index].value ?? 98
      : 99;

    if (oldType) {
      const oldTypeChannels = this.group.get(oldType.category);
      if (oldTypeChannels) {
        oldTypeChannels.delete(event.channel);
      }
    }

    const { category: type } = newType;
    const byType = this.group.get(type) ?? new Map<number, SynthChannel>();
    byType.set(event.channel, value);
    this.group.set(type, byType);
    // this.engine?.setController({
    //   channel: event.channel,
    //   controllerNumber: EXPRESSION,
    //   controllerValue: oldExpression,
    // });
    // console.log(this.expression.map((v) => v.value));
    // console.log("oldExpression", oldExpression);
    // console.log(" ####### ");
  }

  setExpression(type: InstrumentType, value: number, indexKey: number) {
    const nodes: Map<number, SynthChannel> = this.group.get(type) ?? new Map();
    nodes.forEach((node) => {
      if (node.expression !== undefined && node.channel !== undefined) {
        this.engine?.setController?.(
          {
            channel: node.channel,
            controllerNumber: EXPRESSION,
            controllerValue: value,
          },
          "InstrumentalNodeUpdate.setExpression"
        );
        node.expression.setValue(value);
      }
    });
    this.expression[indexKey].setValue(value);
    this.settingEvent.trigger(["EXPRESSION", "CHANGE"], indexKey, { value });
  }

  //   setVelocity(type: InstrumentType, value: number, indexKey: number) {
  //     const nodes = this.group.get(type) ?? new Map();
  //     nodes?.forEach((node) => {
  //       if (node.velocity && node.channel) {
  //         this.setVelocity({ channel: node.channel, value });
  //         node.velocity.setValue(value);
  //       }
  //     });
  //     this.velocity[indexKey].setValue(value);
  //     this.settingEvent.trigger(["VELOCITY", "CHANGE"], indexKey, { value });
  //     console.log(this.velocity);
  //   }

  findProgramCategory(
    program: number
  ): { category: InstrumentType; index: number } | null {
    const index = PROGRAM_CATEGORY.findIndex((group) =>
      group.includes(program)
    );
    return index !== -1
      ? { category: INSTRUMENT_TYPE_BY_INDEX[index], index }
      : null;
  }

  setCallBackState(
    eventType: EventKey,
    channel: number,
    callback: (event: TEventType<number>) => void
  ): void {
    this.settingEvent.add(eventType, channel, callback);
  }

  removeCallback(
    eventType: EventKey,
    channel: number,
    callback: (event: TEventType<number>) => void
  ): boolean {
    return this.settingEvent.remove(eventType, channel, callback);
  }
}
