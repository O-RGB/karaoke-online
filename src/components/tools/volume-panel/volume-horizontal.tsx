import React, { useEffect, useRef } from "react";
import useGainStore from "@/stores/gain.store";

interface VolumeHorizontalProps {
  hide: boolean;
}

const VolumeHorizontal: React.FC<VolumeHorizontalProps> = ({ hide }) => {
  const gain = useGainStore((state) => state.gainMain);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        // Clear the canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Set styles
        context.fillStyle = `rgba(255, 255, 255, ${hide ? 0.4 : 0})`;

        // Draw the gain bar
        context.fillRect(0, 0, (gain / 100) * canvas.width, canvas.height);
      }
    }
  }, [gain, hide]);

  return (
    <canvas
      ref={canvasRef}
      width={300} // Set your canvas width
      height={15} // Set your canvas height
      className="absolute top-0 left-0 w-full"
    ></canvas>
  );
};

export default VolumeHorizontal;
