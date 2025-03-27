// import SliderCommon from "@/components/common/input-data/slider";
// import { useSynthesizerEngine } from "@/features/engine/synth-store";
// import React, { useEffect, useRef } from "react";
// import MixerNode from "./mixer-node";
// import {
//   PIANO,
//   ORGAN,
//   ACCORDION,
//   SYNTH,
//   BASS,
//   GUITAR_CLEAN,
//   GUITAR_NYLON,
//   GUITAR_JAZZ,
//   GUITAR_OVERDRIVE,
//   GUITAR_DISTORTION,
//   STRINGS,
//   VIOLIN,
//   BRASS,
//   TRUMPET,
//   SYNTH_BASS,
//   REED,
//   SAX,
//   PIPE,
//   KICK,
//   SNARE,
//   STICK,
//   TOM_LOW,
//   TOM_MID,
//   TOM_HIGH,
//   HI_HAT,
//   COWBELL,
// } from "@/config/value";
// import useConfigStore from "@/features/config/config-store";
// import { MixerConfig } from "@/features/config/types/config.type";

// interface MixerModalProps {}
// const CATEGORY_MAP: Record<string, number[]> = {
//   Piano: PIANO,
//   Organ: ORGAN,
//   Accord: ACCORDION,
//   Synth: SYNTH,
//   Bass: BASS,
//   "G.Clean": GUITAR_CLEAN,
//   "G.Nylon": GUITAR_NYLON,
//   "G.Jazz": GUITAR_JAZZ,
//   "G.Over": GUITAR_OVERDRIVE,
//   "G.Dist": GUITAR_DISTORTION,
//   String: STRINGS,
//   Violin: VIOLIN,
//   Bras: BRASS,
//   // Trumpet: TRUMPET,
//   // SynthBasse: SYNTH_BASS,
//   // Reed: REED,
//   // Saxophones: SAX,
//   // Pipes: PIPE,
//   // KickDrums: KICK,
//   // SnareDrums: SNARE,
//   // StickDrums: STICK,
//   // LowToms: TOM_LOW,
//   // MidToms: TOM_MID,
//   // HighToms: TOM_HIGH,
//   // HiHats: HI_HAT,
//   // Cowbells: COWBELL,
// };

// const MixerModal: React.FC<MixerModalProps> = ({}) => {
//   const controllerItem = useSynthesizerEngine(
//     (state) => state.engine?.controllerItem
//   );

//   const engine = useSynthesizerEngine((state) => state.engine);
//   const config = useConfigStore((state) => state.config);
//   const setConfig = useConfigStore((state) => state.setConfig);

//   const tempArray = useRef<MixerConfig[]>([]);

//   const handleSliderChange = (
//     category: string,
//     programs: number[],
//     value: number
//   ) => {
//     const lastIndex = tempArray.current.findIndex(
//       (item) => item.name === category
//     );

//     if (lastIndex !== -1) {
//       if (tempArray.current[lastIndex].value !== value) {
//         tempArray.current[lastIndex].value = value;
//       }
//     } else {
//       tempArray.current.push({ name: category, program: programs, value });
//     }
//   };

//   const handleSave = () => {
//     // อัปเดต config และล้าง tempArray หลังบันทึก
//     setConfig({ sound: { mixer: tempArray.current } });
//   };

//   return (
//     <div className="flex items-center">
//       {Object.entries(CATEGORY_MAP).map((value, index) => {
//         const [category, programs] = value;
//         return (
//           <MixerNode
//             engine={engine}
//             controllerItem={controllerItem}
//             category={category}
//             programs={programs}
//             key={`mixer-${index}`}
//             onSliderChange={(change) =>
//               handleSliderChange(category, programs, change)
//             }
//             title={`Main`}
//           ></MixerNode>
//         );
//       })}
//       <button onClick={handleSave} className="mt-4 p-2 bg-blue-500 text-white">
//         Save Settings
//       </button>
//     </div>
//   );
// };

// export default MixerModal;

// // let mixerConfig: MixerConfig[] = [];
// //               if (config.sound?.mixer) {
// //                 mixerConfig = config.sound.mixer ?? [];
// //               }

// //               const search = mixerConfig.findIndex((x) => x.name === category);
// //               if (search !== -1) {
// //                 mixerConfig[search] = {
// //                   name: category,
// //                   program: programs,
// //                   value: change,
// //                 };
// //               } else {
// //                 mixerConfig.push({
// //                   name: category,
// //                   program: programs,
// //                   value: change,
// //                 });
// //               }
// //               setConfig({ sound: { mixer: mixerConfig } });
