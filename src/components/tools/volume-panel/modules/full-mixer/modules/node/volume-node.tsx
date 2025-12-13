import React, { useEffect, useId, useRef, useState } from "react";
import SliderCommon from "@/components/common/input-data/slider";
import { lowercaseToReadable } from "@/lib/general";
import { Instrumental } from "@/features/engine/modules/instrumentals-group/inst";
import { InstsKeysMap } from "@/features/engine/modules/instrumentals-group/types";

interface InstrumentalVolumeNodeProps {
  indexKey: number;
  type: InstsKeysMap;
  instrumental: Instrumental;
}

const InstrumentalVolumeNode: React.FC<InstrumentalVolumeNodeProps> = ({
  indexKey,
  type,
  instrumental,
}) => {
  const componentId = useId();
  const [expression, setGain] = useState<number>(instrumental.defaultGain);
  const text = lowercaseToReadable(type);

  const gainLevelRef = useRef(0);
  const displayRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(Date.now());

  const DECAY_RATE = 0.97;
  const MIN_GAIN = 0.01;

  const updateDisplay = () => {
    const now = Date.now();
    const deltaTime = (now - lastUpdateTimeRef.current) / 16.67;
    lastUpdateTimeRef.current = now;

    gainLevelRef.current *= Math.pow(DECAY_RATE, deltaTime);

    if (gainLevelRef.current < MIN_GAIN) {
      gainLevelRef.current = 0;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }

    if (displayRef.current) {
      const gainPercent = (gainLevelRef.current / 127) * 100;

      displayRef.current.style.height = `${gainPercent}%`;
    }

    if (gainLevelRef.current > MIN_GAIN) {
      animationFrameRef.current = requestAnimationFrame(updateDisplay);
    }
  };

  const startAnimation = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    lastUpdateTimeRef.current = Date.now();
    animationFrameRef.current = requestAnimationFrame(updateDisplay);
  };

  const handleNoteEvent = (v: any) => {
    if (v.value?.velocity === 0) return;
    const velocity = v.value?.velocity ?? v.velocity ?? 0;

    if (velocity > gainLevelRef.current || gainLevelRef.current < 20) {
      gainLevelRef.current = velocity;
    } else {
      gainLevelRef.current = Math.min(
        127,
        gainLevelRef.current + velocity * 0.3
      );
    }

    if (!animationFrameRef.current && velocity > 0) {
      startAnimation();
    }
  };

  const onValueChange = (value: number) => {
    instrumental.setGain(value);
    setGain(value);
  };

  useEffect(() => {
    instrumental.inst?.on([type, "CHANGE"], handleNoteEvent, componentId);
    instrumental.gain?.on(
      ["GAIN", "CHANGE"],
      (v) => {
        setGain(v.value);
      },
      componentId
    );

    return () => {
      instrumental.inst?.off([type, "CHANGE"], componentId);
      instrumental.gain?.off(["GAIN", "CHANGE"], componentId);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [
    indexKey,
    instrumental,
    type,
    componentId,
    instrumental.inst,
    instrumental.gain,
  ]);

  return (
    <div className="relative flex flex-col gap-2 min-w-11 w-min-w-11 max-w-min-w-11 overflow-hidden border-b pb-2">
      <div className="px-0.5">
        <div className="text-[9px] text-center break-all text-nowrap">
          {text}
        </div>
      </div>

      <div className="relative bg-black">
        {/* Gain Level Meter - อยู่ด้านหลัง */}
        <div className="absolute inset-0 flex flex-col-reverse pointer-events-none">
          <div className="h-32 w-full rounded-sm overflow-hidden flex flex-col-reverse">
            <div
              ref={displayRef}
              className="w-full bg-white/40"
              style={{ height: "0%" }}
            />
          </div>
        </div>

        {/* Volume Slider - อยู่ด้านหน้า */}
        <div className="relative h-32 flex py-4 z-10">
          <SliderCommon
            max={127}
            value={expression}
            vertical
            className="m-auto"
            color="#ffffff"
            step={5}
            onChange={onValueChange}
          />
        </div>
      </div>
    </div>
  );
};

export default InstrumentalVolumeNode;
