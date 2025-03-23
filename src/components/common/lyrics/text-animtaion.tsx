// // components/TextAnimation.tsx

// import {
//   animateBounceIn,
//   animateCharactersOut,
//   animateFadeFromBottom,
//   animateRainbowIn,
//   animateRotateIn,
//   animateScaleIn,
//   animateTypewriter,
//   animateWaveIn,
//   panRight,
//   zoomIn,
// } from "@/lib/animations/text-animations";
// import { useEffect, useRef, useState } from "react";
// import BackgroundTransition from "./bg-animation";

// interface TextAnimationProps {
//   show?: boolean;
//   text: string;
//   split?: boolean;
//   color?: string;
// }

// const TextAnimation: React.FC<TextAnimationProps> = ({
//   show,
//   text,
//   color,
//   split = false,
// }) => {
//   const textRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     if (textRef.current) {
//       if (show === true) {
//         // Reset transform ก่อนเริ่ม animation ใหม่
//         textRef.current.style.transform = "none";

//         // รอเล็กน้อยเพื่อให้การ reset เสร็จสมบูรณ์
//         setTimeout(() => {
//           // เริ่ม animation ใหม่
//           animateWaveIn(textRef);
//           zoomIn(textRef);
//         }, 50); // ใช้ 50ms เพื่อให้ reset เสร็จก่อน
//       } else if (show === false) {
//         animateCharactersOut(textRef);
//       }
//     }
//   }, [show]);

//   return (
//     <>
//       <BackgroundTransition
//         transitionType="fadeInZoomTransition"
//         targetColor={color}
//       ></BackgroundTransition>
//       <div className="text-4xl font-bold text-white" ref={textRef}>
//         {split ? (
//           <span className="inline-block opacity-0">{text}</span>
//         ) : (
//           text.split("").map((char, index) => (
//             <span key={index} className="inline-block opacity-0">
//               {char}
//             </span>
//           ))
//         )}
//       </div>
//     </>
//   );
// };

// export default TextAnimation;
