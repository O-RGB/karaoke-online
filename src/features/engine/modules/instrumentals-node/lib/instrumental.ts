// import { BaseSynthEngine } from "@/features/engine/types/synth.type";
// import { InstNode } from "./inst-node";
// import { PROGRAM_CATEGORY } from "@/config/value";
// import { EXPRESSION } from "@/features/engine/types/node.type";
// import { InstrumentType } from "../types/inst.category.type";
// export const INSTRUMENT_TYPE_BY_INDEX: InstrumentType[] = [
//   "piano", // 0
//   "chromatic_percussion", // 1
//   "organ", // 2
//   "guitar_clean", // 3
//   "guitar_nylon", // 4
//   "guitar_jazz", // 5
//   "guitar_overdriven", // 6
//   "guitar_distortion", // 7
//   "bass", // 8
//   "string", // 9
//   "ensemble", // 10
//   "brass", // 11
//   "reed", // 12
//   "pipe", // 13
//   "synth_lead", // 14
//   "synth_pad", // 15
//   "synth_effect", // 16
//   "ethnic", // 17
//   "percussive", // 18
//   "sound_effects", // 19
// ];

// const programGroup = PROGRAM_CATEGORY;
// export class InstrumentalNode {
//   public nodes: Map<InstrumentType, InstNode[]> = new Map<
//     InstrumentType,
//     InstNode[]
//   >();

//   private engine: BaseSynthEngine;

//   constructor(engine: BaseSynthEngine, nodes: InstNode[]) {
//     this.setup(nodes);
//     this.engine = engine;
//   }

//   setup(nodes: InstNode[]) {
//     this.nodes.clear();
//     for (let index = 0; index < programGroup.length; index++) {
//       const group = programGroup[index];
//       const category = nodes.filter((v) => group.includes(v.program));
//       this.nodes.set(INSTRUMENT_TYPE_BY_INDEX[index], category);
//     }
//   }

//   setExpression(type: InstrumentType, value: number) {
//     this.nodes.get(type)?.map((ls) => {
//       ls.setExpression(value);
//       this.engine?.setController(ls.channel, EXPRESSION, value);
//     });
//   }

//   setActiveNode(channel: number) {}
// }
