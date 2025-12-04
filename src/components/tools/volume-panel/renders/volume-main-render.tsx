import React, { useEffect, useId, useRef, useState } from "react";
import { useSynthesizerEngine } from "@/features/engine/synth-store";

interface MainVolumeRenderProps {
  hide: boolean;
}

const DB_MARKS = [-60, -40, -20, -10, -6, -3, 0];
const MINOR_MARKS = [-50, -30, -15, -9, -4.5, -1.5];

const percentToDb = (percent: number): number => {
  if (percent === 0) return -60;
  return Math.round(20 * Math.log10(percent / 100));
};

const MainVolumeRender: React.FC<MainVolumeRenderProps> = ({ hide }) => {
  const engine = useSynthesizerEngine((state) => state.engine);
  const componentId = useId();

  const barRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [gainPercent, setGainPercent] = useState(0);
  const currentDb = percentToDb(gainPercent);

  // update value from engine
  useEffect(() => {
    if (!engine) return;

    const update = () => {
      setGainPercent(engine.globalEqualizer?.getVolumeLevel() ?? 0);
    };

    update(); // initial

    engine.timerUpdated.add(["TIMING", "CHANGE"], 0, update, componentId);
    return () => {
      engine.timerUpdated.remove(["TIMING", "CHANGE"], 0, componentId);
    };
  }, [engine]);

  if (hide) return null;

  return (
    <div
      ref={containerRef}
      className="absolute top-0 left-0 w-full"
      style={{ height: 35 }}
    >
      {/* dB scale lines */}
      {DB_MARKS.map((db) => {
        const percent = db === -60 ? 0 : Math.pow(10, db / 20) * 100;
        return (
          <div
            key={db}
            className="absolute top-0 h-full border-r"
            style={{
              left: `${percent}%`,
              borderColor:
                db === 0 ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.1)",
            }}
          />
        );
      })}

      {/* minor marks */}
      {MINOR_MARKS.map((db) => {
        const percent = Math.pow(10, db / 20) * 100;
        return (
          <div
            key={db}
            className="absolute"
            style={{
              left: `${percent}%`,
              bottom: 0,
              width: 1,
              height: 6,
              background: "rgba(255,255,255,0.3)",
            }}
          />
        );
      })}

      {/* main bar (HTML) */}
      <div
        ref={barRef}
        className="absolute top-0 left-0 h-full transition-[width] duration-[30ms] ease-linear"
        style={{
          width: `${gainPercent}%`,
          background:
            currentDb >= -6
              ? "linear-gradient(to right, rgba(34,197,94,0.4), rgba(251,191,36,0.4), rgba(239,68,68,0.5))"
              : currentDb >= -20
              ? "linear-gradient(to right, rgba(34,197,94,0.4), rgba(251,191,36,0.4))"
              : "linear-gradient(to right, rgba(34,197,94,0.3), rgba(34,197,94,0.4))",
        }}
      />

      {/* peak marker */}
      {gainPercent > 0 && (
        <div
          className="absolute top-0 h-full"
          style={{
            left: `calc(${gainPercent}% - 1px)`,
            width: 2,
            background:
              currentDb >= -3 ? "rgba(239,68,68,0.8)" : "rgba(255,255,255,0.7)",
          }}
        />
      )}

      {/* dB label */}
      <div
        className="absolute px-1 text-[9px] font-mono"
        style={{
          bottom: 2,
          left: 2,
          background: "rgba(0,0,0,0.6)",
          color:
            currentDb >= -3 ? "rgba(239,68,68,1)" : "rgba(255,255,255,0.9)",
        }}
      >
        {currentDb}dB
      </div>
    </div>
  );
};

export default MainVolumeRender;
