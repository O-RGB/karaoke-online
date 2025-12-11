"use client";
import React, { useEffect, useRef } from "react";

interface VelocityMeterProps {
  velocity: number;
}

const DECAY_RATE = 0.9;
const MIN_VELOCITY = 0.01;

const VelocityMeter: React.FC<VelocityMeterProps> = ({ velocity }) => {
  const velocityRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  const displayRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLDivElement>(null);

  const updateDisplay = () => {
    velocityRef.current *= DECAY_RATE;

    if (velocityRef.current < MIN_VELOCITY) {
      velocityRef.current = 0;
    }

    const rawPercent = (velocityRef.current / 127) * 100;
    const gainPercent = Math.min(
      100,
      Math.max(0, Math.pow(rawPercent / 100, 0.8) * 100)
    );

    if (displayRef.current) {
      displayRef.current.style.height = `${gainPercent}%`;
      displayRef.current.style.boxShadow =
        velocityRef.current > 20 ? "0 0 8px rgba(72,187,120,0.6)" : "none";
    }

    if (valueRef.current) {
      valueRef.current.textContent = Math.round(velocityRef.current).toString();
    }

    if (velocityRef.current > 0) {
      frameRef.current = requestAnimationFrame(updateDisplay);
    }
  };
  useEffect(() => {
    // อัปเดตค่าใหม่เสมอ
    velocityRef.current = Math.max(velocityRef.current, velocity);

    // ถ้ายังไม่มี animation ให้เริ่มใหม่
    if (!frameRef.current) {
      frameRef.current = requestAnimationFrame(updateDisplay);
    }

    // ไม่ต้อง return cleanup ที่นี่
  }, [velocity]);

  // เพิ่ม cleanup เฉพาะตอน unmount
  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-2 w-5 text-xs">
      <div className="h-24 w-3 bg-gray-300 rounded-full overflow-hidden flex flex-col-reverse">
        <div
          ref={displayRef}
          className="w-full bg-green-500"
          style={{ height: "0%" }}
        />
      </div>
      <div ref={valueRef} className="text-[10px] text-gray-400">
        0
      </div>
    </div>
  );
};

export default VelocityMeter;
