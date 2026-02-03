import React, { useEffect, useRef } from "react";
import { useSynthesizerEngine } from "@/features/engine/synth-store";

interface MainVolumeRenderProps {
  hide: boolean;
  stop?: boolean;
}

const DB_MARKS = [-30, -18, -12, -6, -3, 0];
const MINOR_MARKS = [-24, -15, -9, -4.5, -1.5];

const percentToDb = (percent: number): number => {
  if (percent <= 0) return -60;
  return 20 * Math.log10(percent / 100);
};

const MainVolumeRender: React.FC<MainVolumeRenderProps> = ({
  hide,
  stop = false,
}) => {
  const engine = useSynthesizerEngine((state) => state.engine);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ใช้ Ref เก็บค่า Props เพื่อให้ Animation Loop อ่านค่าล่าสุดได้โดยไม่ต้องใส่ใน Dependency Array
  const propsRef = useRef({ hide, stop });
  const animRef = useRef<number>(0);

  // อัปเดต Ref เมื่อ Props เปลี่ยน
  useEffect(() => {
    propsRef.current = { hide, stop };
  }, [hide, stop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // ฟังก์ชันจัดการขนาด Canvas (รองรับ High DPI)
    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // ถ้า container ซ่อนอยู่ (width=0) ไม่ต้อง resize
      if (rect.width === 0 || rect.height === 0) return;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      // ปรับขนาด style ให้ตรงกับ CSS pixels
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
    };

    handleResize();

    // ใช้ ResizeObserver เพื่อปรับขนาด Canvas อัตโนมัติเมื่อหน้าจอเปลี่ยน
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  // Main Animation Loop
  useEffect(() => {
    const render = () => {
      const { hide: isHidden, stop: isStopped } = propsRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      // เงื่อนไขการหยุดวาด: Stop, Hidden, หรือไม่มี Context
      if (!engine || isStopped || isHidden || !canvas || !ctx) {
        // ถ้าหยุด ให้เคลียร์ canvas
        if (ctx && canvas) {
          ctx.clearRect(
            0,
            0,
            canvas.width / window.devicePixelRatio,
            canvas.height / window.devicePixelRatio
          );
        }

        // ถ้ายังไม่ถูกสั่ง Stop (แต่แค่ซ่อน) เรายัง keep loop ไว้ได้ หรือจะหยุดก็ได้
        // ในที่นี้ถ้า stop=true คือหยุด loop เลย แต่ถ้า hide เราจะแค่ skip draw เพื่อรอการกลับมา
        if (isStopped) {
          animRef.current = 0;
          return;
        }

        animRef.current = requestAnimationFrame(render);
        return;
      }

      // 1. Get Value
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      const gainPercent = engine.globalEqualizer?.getVolumeLevel() ?? 0;
      const currentDb = percentToDb(gainPercent);

      // 2. Clear
      ctx.clearRect(0, 0, width, height);

      // 3. Draw Background Marks (Scale Lines)
      ctx.lineWidth = 1;

      // Major Marks
      DB_MARKS.forEach((db) => {
        const p = db === -60 ? 0 : Math.pow(10, db / 20);
        const x = p * width;

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.strokeStyle =
          db === 0 ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.1)";
        ctx.stroke();
      });

      // Minor Marks
      MINOR_MARKS.forEach((db) => {
        const p = Math.pow(10, db / 20);
        const x = p * width;

        ctx.beginPath();
        ctx.moveTo(x, height - 6);
        ctx.lineTo(x, height);
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.stroke();
      });

      // 4. Draw Main Bar (Gradient)
      const barWidth = (gainPercent / 100) * width;
      if (barWidth > 0) {
        const gradient = ctx.createLinearGradient(0, 0, barWidth, 0);

        // Gradient Logic ตามโค้ดเดิม
        if (currentDb >= -6) {
          gradient.addColorStop(0, "rgba(34,197,94,0.4)"); // Green
          gradient.addColorStop(0.5, "rgba(251,191,36,0.4)"); // Yellow
          gradient.addColorStop(1, "rgba(239,68,68,0.5)"); // Red
        } else if (currentDb >= -20) {
          gradient.addColorStop(0, "rgba(34,197,94,0.4)");
          gradient.addColorStop(1, "rgba(251,191,36,0.4)");
        } else {
          gradient.addColorStop(0, "rgba(34,197,94,0.3)");
          gradient.addColorStop(1, "rgba(34,197,94,0.4)");
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, barWidth, height);

        // Peak Marker (เส้นขีดที่ปลาย)
        ctx.fillStyle =
          currentDb >= -3 ? "rgba(239,68,68,0.8)" : "rgba(255,255,255,0.7)";
        ctx.fillRect(barWidth - 1, 0, 2, height);
      }

      // 5. Draw Text (dB Label)
      const text = `${Math.round(currentDb)}dB`;
      ctx.font = "9px monospace";
      ctx.textBaseline = "bottom";

      // Draw Text Background
      const textWidth = ctx.measureText(text).width;
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(2, height - 12, textWidth + 2, 12); // ปรับตำแหน่ง bg เล็กน้อย

      // Draw Text Color
      ctx.fillStyle =
        currentDb >= -3 ? "rgba(239,68,68,1)" : "rgba(255,255,255,0.9)";
      ctx.fillText(text, 3, height - 2);

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [engine]); // Dependency น้อยที่สุดเพื่อไม่ให้ Loop ถูก Reset

  // เปลี่ยนจากการ return null เป็นการซ่อนด้วย CSS แทน
  // เพื่อให้ Component ไม่ถูก Unmount และ loop สามารถ resume ได้ทันที
  return (
    <div
      ref={containerRef}
      className={`absolute top-0 left-0 w-full ${
        hide ? "invisible pointer-events-none" : "visible"
      }`}
      style={{ height: 35 }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default React.memo(MainVolumeRender);
