import { BaseSynthEngine } from "@/features/engine/types/synth.type";
import { PROGRAM_CATEGORY } from "@/config/value";
import { EXPRESSION } from "@/features/engine/types/node.type";
import { InstrumentType } from "../../types/inst.category.type";
import { SynthChannel } from "../channel";
import { EventKey, TEventType } from "../types/node.type";
import { SynthNodeState } from "../state";
import { EventManager } from "../events";

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

export class InstrumentalNode {
  public programGroup = PROGRAM_CATEGORY;
  public nodes: SynthChannel[] = [];

  public expression: SynthNodeState<number>[] = [];
  public velocity: SynthNodeState<number>[] = [];
  public settingEvent = new EventManager<TEventType<number>>();

  public group: Map<InstrumentType, SynthChannel[]> = new Map<
    InstrumentType,
    SynthChannel[]
  >();

  private engine: BaseSynthEngine;

  constructor(engine: BaseSynthEngine, nodes: SynthChannel[]) {
    this.engine = engine;
    this.nodes = nodes;
    this.regroupNodes();
  }

  private initializeGroupMap() {
    this.group.clear();
    for (let index = 0; index < this.programGroup.length; index++) {
      this.group.set(INSTRUMENT_TYPE_BY_INDEX[index], []);
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

  regroupNodes() {
    const cloneExpression = this.expression.map((v) => v.value ?? 100);
    const cloneVelocity = this.velocity.map((v) => v.value ?? 100);

    console.log("before reset = ", cloneExpression);
    this.initializeGroupMap();
    this.initializeSettingNode();
    this.nodes.forEach((node) => {
      const programValue = node.program?.value ?? 0;
      const instrumentTypeIndex = this.programGroup.findIndex((group) =>
        group.includes(programValue)
      );

      if (instrumentTypeIndex !== -1) {
        const instrumentType = INSTRUMENT_TYPE_BY_INDEX[instrumentTypeIndex];
        const currentGroup = this.group.get(instrumentType) ?? [];
        const updatedGroup = currentGroup.filter(
          (existingNode) => existingNode.channel !== node.channel
        );
        updatedGroup.push(node);
        this.group.set(instrumentType, updatedGroup);
        for (let i = 0; i < updatedGroup.length; i++) {
          const element = updatedGroup[i];
          console.log("reset instrumental: element - ", element);
          if (element.channel) {
            const ex = cloneExpression[i];
            this.expression[i].setValue(ex);
            element.expression?.setValue(ex);

            console.log("reset instrumental: EXPRESSION - ", ex);
            this.engine.setController({
              channel: element.channel,
              controllerNumber: EXPRESSION,
              controllerValue: ex,
            });

            const ve = cloneVelocity[i];
            element.velocity?.setValue(ve);
            this.velocity[i].setValue(ve);
            console.log("reset instrumental: Velocity - ", ve);
            this.engine.setVelocity({
              channel: element.channel,
              value: ve,
            });
          }
        }
      }
    });
  }

  setExpression(type: InstrumentType, value: number, indexKey: number) {
    const nodes = this.group.get(type) ?? [];
    nodes.forEach((node) => {
      if (node.expression && node.channel) {
        this.engine.setController(
          {
            channel: node.channel,
            controllerNumber: EXPRESSION,
            controllerValue: value,
          },
          "setExpression"
        );
        node.expression.setValue(value);
      }
    });
    this.expression[indexKey].setValue(value);
    this.settingEvent.trigger(["EXPRESSION", "CHANGE"], indexKey, { value });

    console.log(this.expression);
  }

  getExperssion(indexKey: number) {
    const value = this.expression[indexKey].value;
    if (value)
      this.settingEvent.trigger(["EXPRESSION", "CHANGE"], indexKey, { value });
    return value;
  }

  setVelocity(type: InstrumentType, value: number, indexKey: number) {
    const nodes = this.group.get(type);
    nodes?.forEach((node) => {
      if (node.velocity && node.channel) {
        this.engine.setVelocity({ channel: node.channel, value });
        node.velocity.setValue(value);
      }
    });
    this.velocity[indexKey].setValue(value);
    this.settingEvent.trigger(["VELOCITY", "CHANGE"], indexKey, { value });
    console.log(this.velocity);
  }

  getVelocity(indexKey: number) {
    const value = this.velocity[indexKey].value;
    if (value)
      this.settingEvent.trigger(["VELOCITY", "CHANGE"], indexKey, { value });
    return value;
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
