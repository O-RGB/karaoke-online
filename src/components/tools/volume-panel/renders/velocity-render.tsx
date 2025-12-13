import { SynthChannel } from "@/features/engine/modules/instrumentals/channel";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import { PlayerStatusType } from "@/features/engine/types/synth.type";
// import useRuntimePlayer from "@/features/player/player/modules/runtime-player";
import { useEffect, useId, useRef, useState } from "react";

interface ChannelVolumeBgProps {
  node: SynthChannel[];
  className?: string;
  maxGain?: number;
  decreaseAmount?: number;
}

const ChannelVolumeBg: React.FC<ChannelVolumeBgProps> = ({
  node,
  className,
  maxGain = 10,
  decreaseAmount = 0.05,
}) => {
  const componnetId = useId();
  const engine = useSynthesizerEngine((state) => state.engine);

  const [playerStatus, setPlayerStatus] = useState<PlayerStatusType>("STOP");

  const onPlayerUpdate = (on: PlayerStatusType) => {
    setPlayerStatus(on);
  };

  useEffect(() => {
    if (engine) {
      engine?.playerUpdated.on(
        ["PLAYER", "CHANGE"],
        0,
        onPlayerUpdate,
        componnetId
      );
    }
  }, [engine]);

  const elementRef = useRef<HTMLDivElement | null>(null);

  const animationFrameIdRef = useRef<number>(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (playerStatus === "PAUSE" || !node || node.length === 0) {
      cancelAnimationFrame(animationFrameIdRef.current);
      element.style.opacity = "0";
      return;
    }

    const animate = (lastTime: number = performance.now()) => {
      // const now = performance.now();
      // const deltaTime = (now - lastTime) / 1000;

      // const currentOpacity = parseFloat(element.style.opacity || "0");

      // const volumes = node.map((n) => n.getGain());
      // const totalGain = volumes.reduce((acc, volume) => acc + volume, 0);
      // const averageGain = totalGain / volumes.length;
      // const gainOpacity = Math.min(averageGain / maxGain, 1);

      // const decayedOpacity = Math.max(
      //   0,
      //   currentOpacity - decreaseAmount * deltaTime * 60
      // );

      // const newOpacity = Math.max(gainOpacity, decayedOpacity);

      // element.style.opacity = newOpacity.toString();

      // animationFrameIdRef.current = requestAnimationFrame(() => animate(now));
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [node, playerStatus, maxGain, decreaseAmount]);

  return (
    <div
      ref={elementRef}
      className={`
        absolute w-full h-full 
        bg-white/70 
        ${className}
      `}
      style={{
        opacity: 0,

        willChange: "opacity",
      }}
    ></div>
  );
};

export default ChannelVolumeBg;
