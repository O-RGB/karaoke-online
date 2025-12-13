// "use client";

// import { SynthChannel } from "@/features/engine/modules/instrumentals/channel";
// import React, { useEffect, useState } from "react";
// import { IPianoKey } from "./piano.type";
// import PianoNote from "./piano-note";

// interface PianoProps {
//   width?: string | number;
//   height?: string | number;
//   keyCount?: number;
//   node: SynthChannel;
//   channel: number;
// }

// const Piano: React.FC<PianoProps> = ({
//   width = "100%",
//   height = "50px",
//   keyCount = 128,
//   channel,
//   node,
// }) => {
//   const [dimensions, setDimensions] = useState({
//     actualWidth: 0,
//     actualHeight: 0,
//   });
//   const containerRef = React.useRef<HTMLDivElement>(null);

//   const BLACK_KEYS = [1, 3, 6, 8, 10];

//   const isBlackKey = (midiNumber: number) => {
//     const noteInOctave = midiNumber % 12;
//     return BLACK_KEYS.includes(noteInOctave);
//   };

//   const getWhiteKeyCount = (totalKeys: number) => {
//     let count = 0;
//     for (let i = 0; i < totalKeys; i++) {
//       if (!isBlackKey(i)) count++;
//     }
//     return count;
//   };

//   useEffect(() => {
//     const updateDimensions = () => {
//       if (containerRef.current) {
//         const { offsetWidth, offsetHeight } = containerRef.current;
//         setDimensions({
//           actualWidth: offsetWidth,
//           actualHeight: offsetHeight,
//         });
//       }
//     };

//     updateDimensions();
//     window.addEventListener("resize", updateDimensions);
//     return () => window.removeEventListener("resize", updateDimensions);
//   }, [width, height]);

//   const whiteKeyCount = getWhiteKeyCount(keyCount);
//   const whiteKeyWidth = dimensions.actualWidth / whiteKeyCount || 0;
//   const blackKeyWidth = whiteKeyWidth * 0.6;
//   const blackKeyHeight = dimensions.actualHeight * 0.6;

//   // คำนวณตำแหน่งของคีย์
//   const getKeyPosition = (index: number): IPianoKey => {
//     const isBlack = isBlackKey(index);

//     if (isBlack) {
//       // คำนวณคีย์ขาวก่อนหน้านี้
//       let whiteKeysBefore = 0;
//       for (let i = 0; i < index; i++) {
//         if (!isBlackKey(i)) whiteKeysBefore++;
//       }
//       // คำนวณตำแหน่งคีย์ดำโดยใช้จำนวนคีย์ขาวที่อยู่ก่อนหน้า
//       return {
//         left: whiteKeysBefore * whiteKeyWidth - blackKeyWidth / 2,
//         width: blackKeyWidth,
//         height: blackKeyHeight,
//         zIndex: 20,
//         bgColor: "bg-gray-900",
//         textColor: "text-white",
//       };
//     } else {
//       // คำนวณตำแหน่งคีย์ขาว
//       let whiteKeyIndex = 0;
//       for (let i = 0; i < index; i++) {
//         if (!isBlackKey(i)) whiteKeyIndex++;
//       }
//       return {
//         left: whiteKeyIndex * whiteKeyWidth,
//         width: whiteKeyWidth,
//         height: "100%",
//         zIndex: 10,
//         bgColor: "bg-white",
//         textColor: "text-black",
//       };
//     }
//   };

//   const widthStyle = typeof width === "number" ? `${width}px` : width;
//   const heightStyle = typeof height === "number" ? `${height}px` : height;

//   return (
//     <div
//       className="relative overflow-x-auto bg-black"
//       style={{
//         width: widthStyle,
//         height: heightStyle,
//       }}
//       ref={containerRef}
//     >
//       <div className="relative h-full w-full">
//         {dimensions.actualWidth > 0 &&
//           node.note?.notesOn?.map((_, i) => {
//             const notes = node.note?.notesOn[i]
//             if (!notes) return <></>;
//             const keyStyle = getKeyPosition(i);
//             return (
//               <React.Fragment key={`key-${i}`}>
//                 <PianoNote
//                   synthNode={notes}
//                   channel={channel}
//                   index={i}
//                   keyStyle={keyStyle}
//                 ></PianoNote>
//               </React.Fragment>
//             );
//           })}
//       </div>
//     </div>
//   );
// };

// export default Piano;
