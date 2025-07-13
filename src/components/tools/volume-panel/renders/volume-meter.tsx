import { SynthChannel } from "@/features/engine/modules/instrumentals/channel";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import useRuntimePlayer from "@/features/player/player/modules/runtime-player";
import { useEffect, useRef, useState } from "react";

interface ChannelVolumeRenderProps {
  channel?: number;
  max?: number;
  className?: string;
  node?: SynthChannel[];
  decreaseRate?: number;
}

const ChannelVolumeRender: React.FC<ChannelVolumeRenderProps> = ({
  className,
  channel,
  max = 100,
  node,
  decreaseRate = 2,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentTick = useRuntimePlayer((state) => state.currentTick);
  const isPaused = useRuntimePlayer((state) => state.isPaused);
  const engine = useSynthesizerEngine((state) => state.engine);
  const [peakLevel, setPeakLevel] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);

  useEffect(() => {
    if (isPaused) return;
    if (!engine?.nodes) return;

    let level = 0;
    if (node) {
      const volumes = node.map((n) => n.getGain());
      const totalGain = volumes.reduce((acc, volume) => acc + volume, 0);
      const averageGain = totalGain / volumes.length;
      level = averageGain;
    } else if (channel) {
      level = engine.nodes[channel]?.getGain(true);
    }

    const heightPercentage = (level / 150) * 100;
    setCurrentLevel(Math.min(heightPercentage, 100));

    if (heightPercentage > peakLevel) {
      setPeakLevel(Math.min(heightPercentage, 100));
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const height = (level / 150) * canvas.height;
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fillRect(0, canvas.height - height, canvas.width, height);

    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.66);
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.fillRect(0, canvas.height * 0.66, canvas.width, canvas.height * 0.33);
  }, [max, currentTick, engine?.nodes, isPaused]);

  useEffect(() => {
    if (peakLevel > currentLevel) {
      const timeout = setTimeout(() => {
        setPeakLevel((prev) => Math.max(currentLevel, prev - decreaseRate));
      }, 50);

      return () => clearTimeout(timeout);
    }
  }, [peakLevel, currentLevel, decreaseRate]);

  return (
    <div className="absolute w-full h-full">
      <canvas ref={canvasRef} className={className}></canvas>
      <div
        className="absolute left-0 w-full h-0.5 bg-white/20 "
        style={{
          bottom: `${peakLevel}%`,
          transition: peakLevel > currentLevel ? "bottom 0.1s linear" : "none",
        }}
      ></div>
    </div>
  );
};

export default ChannelVolumeRender;
