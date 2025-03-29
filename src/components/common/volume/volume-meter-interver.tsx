// import { NodeController } from "@/features/engine/lib/node";
// import useMixerStoreNew from "@/features/player/event-player/modules/event-mixer-store";
// import useRuntimePlayer from "@/features/player/player/modules/runtime-player";
// import { useEffect, useRef } from "react";

// interface VolumeMeterVProps {
//   node: NodeController;
//   max?: number;
//   className?: string;
// }

// const VolumeMeterIntervel: React.FC<VolumeMeterVProps> = ({
//   node,
//   className,
//   max = 100,
// }) => {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const currentTick = useRuntimePlayer((state) => state.currentTick);

//   useEffect(() => {
//     const gain = node.getGain();
//     // console.log("gain", gain);

//     const canvas = canvasRef.current;
//     const ctx = canvas?.getContext("2d");
//     if (!ctx || !canvas) {
//       return;
//     }

//     // ลบการวาดก่อนหน้า
//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     // คำนวณความสูงของแถบความคืบหน้า
//     const height = (gain / 150) * canvas.height;

//     // วาดแถบความคืบหน้า
//     ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
//     ctx.fillRect(0, canvas.height - height, canvas.width, height);

//     // // วาดพื้นหลัง (คุณสามารถเพิ่มหลายๆ เลเยอร์ได้ที่นี่)
//     // ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
//     // ctx.fillRect(0, 0, canvas.width, canvas.height * 0.66);
//     // ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
//     // ctx.fillRect(
//     //   0,
//     //   canvas.height * 0.66,
//     //   canvas.width,
//     //   canvas.height * 0.33
//     // );

//     // เรียกการ render ใหม่ในเฟรมถัดไป
//   }, [max, currentTick]);

//   return <canvas ref={canvasRef} className={className}></canvas>;
// };

// export default VolumeMeterIntervel;
