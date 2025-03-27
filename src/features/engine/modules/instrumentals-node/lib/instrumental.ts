// import { BaseSynthEngine } from "@/features/engine/types/synth.type";
// import { PROGRAM_CATEGORY } from "@/config/value";
// import { EXPRESSION } from "@/features/engine/types/node.type";
// import { InstrumentType } from "../types/inst.category.type";
// import { SynthChannel } from "../modules/channel";

// export const INSTRUMENT_TYPE_BY_INDEX: InstrumentType[] = [
//   "piano",
//   "chromatic_percussion",
//   "organ",
//   "guitar_clean",
//   "guitar_nylon",
//   "guitar_jazz",
//   "guitar_overdriven",
//   "guitar_distortion",
//   "bass",
//   "string",
//   "ensemble",
//   "brass",
//   "reed",
//   "pipe",
//   "synth_lead",
//   "synth_pad",
//   "synth_effect",
//   "ethnic",
//   "percussive",
//   "sound_effects",
// ];

// const programGroup = PROGRAM_CATEGORY;

// export class InstrumentalNode {
//   public nodes: Map<InstrumentType, SynthChannel[]> = new Map<
//     InstrumentType,
//     SynthChannel[]
//   >();

//   private engine: BaseSynthEngine;

//   constructor(engine: BaseSynthEngine, nodes: SynthChannel[]) {
//     this.setup(nodes);
//     this.engine = engine;
//   }

//   setup(nodes: SynthChannel[]) {
//     for (let index = 0; index < programGroup.length; index++) {
//       const group = programGroup[index];
//       const category = nodes.filter((v) =>
//         group.includes(v.program?.value ?? 0)
//       );

//       if (category.length > 0) {
//         this.nodes.set(INSTRUMENT_TYPE_BY_INDEX[index], category);
//       }
//     }
//   }

//   addNode(newNode: SynthChannel) {
//     const instrumentTypeIndex = programGroup.findIndex((group) =>
//       group.includes(newNode.program?.value ?? 0)
//     );

//     if (instrumentTypeIndex !== -1) {
//       const instrumentType = INSTRUMENT_TYPE_BY_INDEX[instrumentTypeIndex];

//       const existingNodes = this.nodes.get(instrumentType) || [];

//       const updatedNodes = existingNodes.filter(
//         (node) => node.channel !== newNode.channel
//       );

//       updatedNodes.push(newNode);

//       this.nodes.set(instrumentType, updatedNodes);
//     }
//   }

//   setExpression(type: InstrumentType, value: number) {
//     const nodes = this.nodes.get(type) || [];

//     nodes.forEach((node) => {
//       if (node.expression && node.channel) {
//         node.expression.setValue(value);
//         this.engine.setController({
//           channel: node.channel,
//           controllerNumber: EXPRESSION,
//           controllerValue: value,
//         });
//       }
//     });
//   }

//   getNodesByType(type: InstrumentType): SynthChannel[] {
//     return this.nodes.get(type) || [];
//   }

//   clear() {
//     this.nodes.clear();
//   }

//   printNodeGrouping() {
//     console.log("Current Node Grouping:");
//     this.nodes.forEach((nodes, type) => {
//       console.log(
//         `${type}: ${nodes
//           .map((n) => `Channel ${n.channel} (Program ${n.program?.value})`)
//           .join(", ")}`
//       );
//     });
//   }
// }
