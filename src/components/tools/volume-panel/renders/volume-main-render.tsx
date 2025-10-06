import React, { useEffect, useId, useRef } from "react";
import { useSynthesizerEngine } from "@/features/engine/synth-store";

interface MainVolumeRenderProps {
  hide: boolean;
}

const MainVolumeRender: React.FC<MainVolumeRenderProps> = ({ hide }) => {
  const componentId = useId();
  const engine = useSynthesizerEngine((state) => state.engine);
  const staticCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const dynamicCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const percentToDb = (percent: number): number => {
    if (percent === 0) return -60;
    return Math.round(20 * Math.log10(percent / 100));
  };

  // ---------------- STATIC LAYER ----------------
  const drawStatic = () => {
    const canvas = staticCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);

    const dbMarks = [-60, -40, -20, -10, -6, -3, 0];
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 0.5;

    dbMarks.forEach((db) => {
      const percent = db === -60 ? 0 : Math.pow(10, db / 20) * 100;
      const x = (percent / 100) * rect.width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();
    });

    const minorMarks = [-50, -30, -15, -9, -4.5, -1.5];
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    minorMarks.forEach((db) => {
      const percent = Math.pow(10, db / 20) * 100;
      const x = (percent / 100) * rect.width;
      ctx.fillRect(x - 0.25, rect.height - 6, 0.5, 6);
    });

    ctx.font = "7px monospace";
    ctx.textAlign = "center";
    dbMarks.forEach((db) => {
      const percent = db === -60 ? 0 : Math.pow(10, db / 20) * 100;
      const x = (percent / 100) * rect.width;
      ctx.fillStyle =
        db === 0 ? "rgba(239, 68, 68, 0.8)" : "rgba(255,255,255,0.6)";
      ctx.fillRect(x - 0.5, rect.height - 12, 1, 12);
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fillText(`${db}`, x, rect.height - 14);
    });
  };

  // ---------------- DYNAMIC LAYER ----------------
  const drawDynamic = () => {
    if (!engine) return;
    const canvas = dynamicCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);

    const gainPercent = engine.globalEqualizer?.getVolumeLevel() ?? 0;
    const currentDb = percentToDb(gainPercent);

    const barWidth = (gainPercent / 100) * rect.width;
    const barHeight = rect.height; // สูงเต็ม canvas

    const gradient = ctx.createLinearGradient(0, 0, barWidth, 0);
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

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, barWidth, barHeight); // bar สูงเต็ม

    // peak marker
    if (barWidth > 0) {
      ctx.fillStyle =
        currentDb >= -3 ? "rgba(239, 68, 68, 0.8)" : "rgba(255,255,255,0.7)";
      ctx.fillRect(barWidth - 1, 0, 2, barHeight);
    }

    // overlay dB
    const labelHeight = 12;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(2, rect.height - labelHeight - 2, 35, labelHeight);
    ctx.fillStyle =
      currentDb >= -3 ? "rgba(239, 68, 68, 1)" : "rgba(255,255,255,0.9)";
    ctx.font = "9px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`${currentDb}dB`, 4, rect.height - 4);
  };

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    if (hide) return;

    drawStatic();
    drawDynamic();

    if (!engine) return;
    engine.timerUpdated.add(["TIMING", "CHANGE"], 0, drawDynamic, componentId);
    return () => {
      engine.timerUpdated.remove(["TIMING", "CHANGE"], 0, componentId);
    };
  }, [engine, hide]);

  useEffect(() => {
    if (!hide) {
      drawStatic();
      drawDynamic();
    }
  }, [hide, engine]);

  if (hide) return null;

  return (
    <div className="absolute top-0 left-0 w-full" style={{ height: 35 }}>
      <canvas
        ref={staticCanvasRef}
        className="absolute top-0 left-0 w-full h-full"
      />
      <canvas
        ref={dynamicCanvasRef}
        className="absolute top-0 left-0 w-full h-full"
      />
    </div>
  );
};

export default MainVolumeRender;
