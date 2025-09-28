import React, { useEffect, useId, useRef } from "react";
import { useSynthesizerEngine } from "@/features/engine/synth-store";

interface MainVolumeRenderProps {
  hide: boolean;
}

const MainVolumeRender: React.FC<MainVolumeRenderProps> = ({ hide }) => {
  const componentId = useId();
  const engine = useSynthesizerEngine((state) => state.engine);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const percentToDb = (percent: number): number => {
    if (percent === 0) return -60;
    return Math.round(20 * Math.log10(percent / 100));
  };

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
    const currentDb = percentToDb(gainPercent);

    context.clearRect(0, 0, rect.width, rect.height);

    context.strokeStyle = "rgba(255,255,255,0.1)";
    context.lineWidth = 0.5;
    const dbMarks = [-60, -40, -20, -10, -6, -3, 0];
    dbMarks.forEach((db) => {
      let percent;
      if (db === -60) {
        percent = 0;
      } else {
        percent = Math.pow(10, db / 20) * 100;
      }
      const x = (percent / 100) * rect.width;
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, rect.height);
      context.stroke();
    });

    const barWidth = (gainPercent / 100) * rect.width;
    const gradient = context.createLinearGradient(0, 0, barWidth, 0);

    if (currentDb >= -6) {
      gradient.addColorStop(0, "rgba(34, 197, 94, 0.4)");
      gradient.addColorStop(0.7, "rgba(251, 191, 36, 0.4)");
      gradient.addColorStop(1, "rgba(239, 68, 68, 0.5)");
    } else if (currentDb >= -20) {
      gradient.addColorStop(0, "rgba(34, 197, 94, 0.4)");
      gradient.addColorStop(1, "rgba(251, 191, 36, 0.4)");
    } else {
      gradient.addColorStop(0, "rgba(34, 197, 94, 0.3)");
      gradient.addColorStop(1, "rgba(34, 197, 94, 0.4)");
    }

    context.fillStyle = gradient;
    context.fillRect(0, 0, barWidth, rect.height);

    if (barWidth > 0) {
      context.fillStyle =
        currentDb >= -3 ? "rgba(239, 68, 68, 0.8)" : "rgba(255,255,255,0.7)";
      context.fillRect(barWidth - 1, 0, 2, rect.height);
    }

    context.fillStyle = "rgba(255,255,255,0.8)";
    context.font = "7px monospace";
    context.textAlign = "center";

    const barHeight = rect.height;

    dbMarks.forEach((db) => {
      let percent;
      if (db === -60) {
        percent = 0;
      } else {
        percent = Math.pow(10, db / 20) * 100;
      }

      const x = (percent / 100) * rect.width;

      context.fillStyle =
        db === 0 ? "rgba(239, 68, 68, 0.8)" : "rgba(255,255,255,0.6)";
      context.fillRect(x - 0.5, barHeight - 12, 1, 12);

      context.fillText(`${db}`, x, barHeight - 14);
    });

    context.fillStyle = "rgba(255,255,255,0.3)";
    const minorMarks = [-50, -30, -15, -9, -4.5, -1.5];
    minorMarks.forEach((db) => {
      const percent = Math.pow(10, db / 20) * 100;
      const x = (percent / 100) * rect.width;
      context.fillRect(x - 0.25, barHeight - 6, 0.5, 6);
    });

    context.fillStyle = "rgba(0,0,0,0.6)";
    context.fillRect(2, 2, 35, 12);
    context.fillStyle =
      currentDb >= -3 ? "rgba(239, 68, 68, 1)" : "rgba(255,255,255,0.9)";
    context.font = "9px monospace";
    context.textAlign = "left";
    context.fillText(`${currentDb}dB`, 4, 11);
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
