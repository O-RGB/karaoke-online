// import React from "react";
// import Button from "@/components/common/button/button";
// import InstrumentalButtonRender from "./node";
// import InstrumentalSetting from "@/components/modal/sound-setting/tabs/instrumental/instrumental-setting";
// import { INSTRUMENT_TYPE_BY_INDEX } from "@/features/engine/modules/instrumentals/instrumental";
// import { useSynthesizerEngine } from "@/features/engine/synth-store";
// import { Menu, MenuButton } from "@szhsin/react-menu";
// import "@szhsin/react-menu/dist/index.css";
// import "@szhsin/react-menu/dist/transitions/zoom.css";

// interface InstrumentalPanelProps {
//   className?: string;
// }

// const InstrumentalPanel: React.FC<InstrumentalPanelProps> = ({ className }) => {
//   const instrumental = useSynthesizerEngine(
//     (state) => state.engine?.instrumental
//   );

//   if (!instrumental) return;
//   return (
//     <div className={`${className}`}>
//       {INSTRUMENT_TYPE_BY_INDEX.map((data, key) => {
//         return (
//           <div
//             key={`instrumental-item-${key}-${data}`}
//             className="relative w-full h-full"
//           >
//             <Menu
//               transition
//               boundingBoxPadding="10 10 10 10"
//               menuButton={(open) => {
//                 return (
//                   <MenuButton>
//                     <Button
//                       className="flex items-center justify-center !p-1.5 !rounded-[3px]"
//                       size="xs"
//                       blur={{
//                         border: true,
//                         backgroundColor: "primary",
//                       }}
//                       icon={
//                         <img
//                           src={`/icon/instrument/${data}.png`}
//                           className="object-contain filter brightness-0 invert"
//                         ></img>
//                       }
//                     >
//                       <InstrumentalButtonRender
//                         type={data}
//                         indexKey={key}
//                         instrumental={instrumental}
//                       ></InstrumentalButtonRender>
//                     </Button>
//                   </MenuButton>
//                 );
//               }}
//             >
//               <div className="p-2 px-4">
//                 <InstrumentalSetting
//                   color={"#00c951"}
//                   instrumental={instrumental}
//                   selectedIndex={key}
//                   selectedType={data}
//                   valueKey="EXPRESSION"
//                 ></InstrumentalSetting>
//                 <InstrumentalSetting
//                   color={"#fd9a00"}
//                   instrumental={instrumental}
//                   selectedIndex={key}
//                   selectedType={data}
//                   valueKey="VELOCITY"
//                 ></InstrumentalSetting>
//               </div>
//             </Menu>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default InstrumentalPanel;
