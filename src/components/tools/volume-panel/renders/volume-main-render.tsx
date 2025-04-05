import React, { useEffect, useRef } from "react";
import useMixerStoreNew from "@/features/player/event-player/modules/event-mixer-store";

interface MainVolumeRenderProps {
  hide: boolean;
}

const MainVolumeRender: React.FC<MainVolumeRenderProps> = ({ hide }) => {
  const gain = useMixerStoreNew((state) => state.gainMain);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = `rgba(255, 255, 255, ${hide ? 0.4 : 0})`;
        context.fillRect(0, 0, (gain / 100) * canvas.width, canvas.height);
      }
    }
  }, [gain, hide]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={25}
      className="absolute top-0 left-0 w-full"
    ></canvas>
  );
};

export default MainVolumeRender;
