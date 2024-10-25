import useMixerStore from "@/stores/mixer-store";
import { useEffect, useRef } from "react";

interface VolumeMeterVProps {
  level: number;
  channel: number;
  max: number;
  className: string;
}

const VolumeMeterV: React.FC<VolumeMeterVProps> = ({
  level,
  className,
  channel,
  max = 100,
}) => {
  level = useMixerStore((state) => state.gain[channel]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) {
      return;
    }

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
