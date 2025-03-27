import { BaseSynthEngine } from "@/features/engine/types/synth.type";
import { PROGRAM_CATEGORY } from "@/config/value";
import { EXPRESSION } from "@/features/engine/types/node.type";
import { InstrumentType } from "../../types/inst.category.type";
import { SynthChannel } from "../channel";

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

  regroupNodes() {
    this.initializeGroupMap();
    this.nodes.forEach((node) => {
      const programValue = node.program?.value ?? 0;
      const instrumentTypeIndex = this.programGroup.findIndex((group) =>
        group.includes(programValue)
      );

      if (instrumentTypeIndex !== -1) {
        const instrumentType = INSTRUMENT_TYPE_BY_INDEX[instrumentTypeIndex];
        const currentGroup = this.group.get(instrumentType) || [];
        const updatedGroup = currentGroup.filter(
          (existingNode) => existingNode.channel !== node.channel
        );
        updatedGroup.push(node);
        this.group.set(instrumentType, updatedGroup);
      }
    });
  }

  setExpression(type: InstrumentType, value: number) {
    const nodes = this.group.get(type) || [];
    nodes.forEach((node) => {
      if (node.expression && node.channel) {
        this.engine.setController({
          channel: node.channel,
          controllerNumber: EXPRESSION,
          controllerValue: value,
        });
        node.expression.setValue(value);
      }
    });
  }

  getExperssion(type: InstrumentType) {
    const nodes = this.group.get(type) || [];
    if (nodes.length > 0) {
      return nodes[0].expression?.value;
    }
    return undefined;
  }

  setVelocity(type: InstrumentType, value: number) {
    const nodes = this.group.get(type) || [];
    nodes.forEach((node) => {
      if (node.velocity && node.channel) {
        this.engine.setVelocity({ channel: node.channel, value });
        node.velocity.setValue(value);
      }
    });
  }

  getVelocity(type: InstrumentType) {
    const nodes = this.group.get(type) || [];
    if (nodes.length > 0) {
      return nodes[0].velocity?.value;
    }
    return undefined;
  }

  getNodesByType(type: InstrumentType): SynthChannel[] {
    return this.group.get(type) || [];
  }

  printNodeGrouping() {
    console.log("Current Node Grouping:");
    this.group.forEach((nodes, type) => {
      console.log(
        `${type}: ${nodes
          .map((n) => `Channel ${n.channel} (Program ${n.program?.value})`)
          .join(", ")}`
      );
    });
  }
}
