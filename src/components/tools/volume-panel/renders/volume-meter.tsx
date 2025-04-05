import { SynthChannel } from "@/features/engine/modules/instrumentals/channel";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import useRuntimePlayer from "@/features/player/player/modules/runtime-player";
import { useEffect, useRef } from "react";

interface ChannelVolumeRenderProps {
  channel?: number;
  max?: number;
  className?: string;
  node?: SynthChannel[];
}

const ChannelVolumeRender: React.FC<ChannelVolumeRenderProps> = ({
  className,
  channel,
  max = 100,
  node,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentTick = useRuntimePlayer((state) => state.currentTick);
  const isPaused = useRuntimePlayer((state) => state.isPaused);
  const engine = useSynthesizerEngine((state) => state.engine);

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
      level = engine.nodes[channel]?.getGain();
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

  return <canvas ref={canvasRef} className={className}></canvas>;
};

export default ChannelVolumeRender;
