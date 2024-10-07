// import React, { useEffect, useState } from "react";

import { useEffect, useRef } from "react";

interface VolumeMeterVProps {
  level: number;
  max: number;
  className: string;
}

const VolumeMeterV: React.FC<VolumeMeterVProps> = ({
  level,
  className,
  max = 100,
}) => {
  //   const [filledBars, setFilledBars] = useState<number>(0);

  //   useEffect(() => {
  //     setFilledBars(Math.round((level / 150) * max));
  //   }, [level]);

  //   return (
  //     <div className={className}>
  //       <div className="flex flex-col w-full h-full opacity-30">
  //         <div className="bg-white/90 w-full h-full"></div>
  //         <div className="bg-white/60 w-full h-full"></div>
  //         <div className="bg-white/30 w-full h-full"></div>
  //       </div>

  //       <div
  //         className={`bg-white/30 absolute bottom-0 w-full`}
  //         style={{
  //           height: `${(filledBars / max) * 100}%`,
  //         }}
  //       ></div>
  //     </div>
  //   );
  // };

  // export default VolumeMeterV;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    let animationFrameId: number;

    if (ctx && canvas) {
      const render = () => {
        // ลบการวาดก่อนหน้า
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // คำนวณความสูงของแถบความคืบหน้า
        const height = (level / 150) * canvas.height;

        // วาดแถบความคืบหน้า
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.fillRect(0, canvas.height - height, canvas.width, height);

        // // วาดพื้นหลัง (คุณสามารถเพิ่มหลายๆ เลเยอร์ได้ที่นี่)
        // ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        // ctx.fillRect(0, 0, canvas.width, canvas.height * 0.66);
        // ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        // ctx.fillRect(
        //   0,
        //   canvas.height * 0.66,
        //   canvas.width,
        //   canvas.height * 0.33
        // );

        // เรียกการ render ใหม่ในเฟรมถัดไป
        animationFrameId = requestAnimationFrame(render);
      };

      // เริ่มการ render
      render();
    }

    // ล้างการ animation เมื่อ component ถูกทำลาย
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [level, max]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      // width={300} // กำหนดขนาด canvas
      // height={500}
    ></canvas>
  );
};

export default VolumeMeterV;
