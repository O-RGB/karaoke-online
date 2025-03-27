// import Button from "@/components/common/button/button";
// import SliderCommon from "@/components/common/input-data/slider";
// import VolumeMeterIntervel from "@/components/common/volume/volume-meter-interver";
// import { MainNodeController, NodeController } from "@/features/engine/lib/node";
// import { useSynthesizerEngine } from "@/features/engine/synth-store";
// import { INodeCallBack, MAIN_VOLUME } from "@/features/engine/types/node.type";
// import { BaseSynthEngine } from "@/features/engine/types/synth.type";
// import React, { useEffect, useState } from "react";
// import { FaLock, FaUnlock } from "react-icons/fa";

// interface MixerNodeProps {
//   onSliderChange: (value: number) => void;
//   title: string;
//   iconSrc?: React.ReactNode;
//   category: string;
//   programs: number[];
//   controllerItem: MainNodeController | undefined;
//   engine: BaseSynthEngine | undefined;
// }

// const MixerNode: React.FC<MixerNodeProps> = ({
//   onSliderChange,
//   title,
//   iconSrc,
//   category,
//   programs,
//   controllerItem,
//   engine,
// }) => {
//   const [channelRef, setChannelRef] = useState<NodeController>();
//   const [value, setValue] = useState<number>(0);
//   const [lock, setLock] = useState<boolean>(false);

//   const onValueChange = (value: INodeCallBack) => {
//     setValue(value.value);
//   };
//   const onLcokChange = (value: INodeCallBack) => {
//     setLock(value.value);
//   };

//   useEffect(() => {
//     if (controllerItem) {
//       const channel = controllerItem.searchProgram(programs);
//       setChannelRef(channel);
//       if (channel) {
//         setValue(channel.value);
//         setLock(channel.isLocked);
//         controllerItem.addEventCallBack(
//           "VOLUME",
//           "CHANGE",
//           channel.channel,
//           onValueChange
//         );
//         controllerItem.addEventCallBack(
//           "VOLUME",
//           "LOCK",
//           channel.channel,
//           onLcokChange
//         );
//       }
//     }
//   }, [controllerItem]);

//   useEffect(() => {}, [controllerItem]);

//   return (
//     <>
//       <div className="border w-fit">
//         <div className="flex items-center justify-center">
//           <span className="text-[10px]">{category}</span>
//           {iconSrc}
//         </div>
//         <div className="relative border p-2 px-3 flex justify-center">
//           <div className="absolute left-0 top-0 w-32">
//             {/* {channelRef && (
//               <VolumeMeterIntervel
//                 node={channelRef}
//                 max={127}
//               ></VolumeMeterIntervel>
//             )} */}
//           </div>
//           <div className="h-[150px]">
//             <SliderCommon
//               vertical={true}
//               value={value}
//               onChange={(value) => {
//                 onSliderChange(value);
//                 if (channelRef) {
//                   engine?.setController(channelRef.channel, MAIN_VOLUME, value);
//                 } else {
//                   setValue(value);
//                 }
//               }}
//               color={lock ? "red" : undefined}
//               className="z-20"
//               max={127}
//               onPressStart={() => {
//                 controllerItem?.setUserHolding(true);
//               }}
//               onPressEnd={() => {
//                 controllerItem?.setUserHolding(false);
//               }}
//             ></SliderCommon>
//           </div>
//         </div>
//         <Button
//           onClick={() => {
//             if (!channelRef) return;
//             engine?.lockController(channelRef?.channel, MAIN_VOLUME, !lock);
//           }}
//           icon={lock ? <FaLock></FaLock> : <FaUnlock></FaUnlock>}
//         ></Button>
//       </div>
//     </>
//   );
// };

// export default MixerNode;
