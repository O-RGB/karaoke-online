
// import { IProgramChange } from "../types/synth.type";
// import { ControllerItemList } from "../types/node.type";

// const CATEGORY_MAP: Record<string, number[]> = {
//   Pianos: PIANOS,
//   "Chromatic Percussions": CHROMATIC_PERCUSSIONS,
//   Organs: ORGANS,
//   Guitars: GUITARS,
//   Basses: BASSES,
//   Strings: STRINGS,
//   Ensembles: ENSEMBLES,
//   Brass: BRASS,
//   Reeds: REEDS,
//   Pipes: PIPES,
//   "Synth Leads": SYNTH_LEADS,
//   "Synth Pads": SYNTH_PADS,
//   "Synth Effects": SYNTH_EFFECTS,
//   Ethnic: ETHNIC,
//   Percussive: PERCUSSIVE,
//   "Sound Effects": SOUND_EFFECTS,
// };

// export class RefMixerNode {
//   public program: number = 0;
//   public channel: number = 0;
//   public dataController: ControllerItemList[] = [];

//   constructor(dataController: ControllerItemList[]) {
//     this.dataController = dataController;
//   }

//   public programChange(program: IProgramChange) {
//     this.program = program.program;
//     this.channel = program.channel;
//   }

//   public getCategory(): string {
//     const category = Object.entries(CATEGORY_MAP).find(([_, programs]) =>
//       programs.includes(this.program)
//     );
//     return category ? category[0] : "Unknown";
//   }
// }
