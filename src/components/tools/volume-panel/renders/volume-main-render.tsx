import React, { useEffect, useId, useRef } from "react";
import { useSynthesizerEngine } from "@/features/engine/synth-store";

interface MainVolumeRenderProps {
  hide: boolean;
}

const MainVolumeRender: React.FC<MainVolumeRenderProps> = ({ hide }) => {
  const componentId = useId();
  const engine = useSynthesizerEngine((state) => state.engine);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const onTimingUpdated = () => {
    if (!engine) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    context.scale(dpr, dpr);

    const gainPercent = engine.globalEqualizer?.getVolumeLevel() ?? 0;
    context.clearRect(0, 0, rect.width, rect.height);
    context.fillStyle = `rgba(255,255,255,0.3)`;
    context.fillRect(0, 0, (gainPercent / 100) * rect.width, rect.height);
  };

  useEffect(() => {
    if (!engine) return;
    engine.timerUpdated.add(
      ["TIMING", "CHANGE"],
      0,
      onTimingUpdated,
      componentId
    );
    return () => {
      engine.timerUpdated.remove(["TIMING", "CHANGE"], 0, componentId);
    };
  }, [engine]);

  if (hide) return null;

  return (
    <canvas
      ref={canvasRef}
      width={"100%"}
      height={"100%"}
      className="absolute top-0 left-0 w-full h-full"
    />
  );
};

export default MainVolumeRender;
