import React, { useEffect, useId, useRef, useState } from "react";
import SliderCommon from "@/components/common/input-data/slider";
import { lowercaseToReadable } from "@/lib/general";
import { Instrumental } from "@/features/engine/modules/instrumentals-group/inst";
import { InstsKeysMap } from "@/features/engine/modules/instrumentals-group/types";
import { usePeerHostStore } from "@/features/remote/store/peer-js-store";

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
  const clientMaster = usePeerHostStore((state) => state.sendToMaster);
  const componentId = useId();

  const [gain, setGain] = useState<number>(
    instrumental.gain.value ?? instrumental.defaultGain
  );
  const [isMuted, setIsMuted] = useState<boolean>(
    instrumental.mute.value ?? false
  );
  const [isSolo, setIsSolo] = useState<boolean>(
    instrumental.solo.value ?? false
  );
  const [isLocked, setIsLocked] = useState<boolean>(
    instrumental.lock.value ?? false
  );

  const text = lowercaseToReadable(type);

  const gainLevelRef = useRef(0);
  const displayRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const DECAY_RATE = 0.95;
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
    clientMaster("system/instrumental", { gain: value, key: type });
  };

  const toggleMute = () => {
    instrumental.setMute(!isMuted);
    clientMaster("system/instrumental", { mute: !isMuted, key: type });
  };

  const toggleSolo = () => {
    instrumental.setSolo(!isSolo);
    clientMaster("system/instrumental", { solo: !isSolo, key: type });
  };

  const toggleLock = () => {
    instrumental.setLock(!isLocked);
    clientMaster("system/instrumental", { lock: !isLocked, key: type });
  };

  useEffect(() => {
    instrumental.inst?.on([type, "CHANGE"], handleNoteEvent, componentId);

    instrumental.gain.on(
      ["GAIN", "CHANGE"],
      (v) => setGain(v.value),
      componentId
    );

    instrumental.mute.on(
      ["MUTE", "CHANGE"],
      (v) => setIsMuted(v.value),
      componentId
    );

    instrumental.solo.on(
      ["SOLO", "CHANGE"],
      (v) => setIsSolo(v.value),
      componentId
    );

    instrumental.lock.on(
      ["LOCK", "CHANGE"],
      (v) => setIsLocked(v.value),
      componentId
    );

    return () => {
      instrumental.inst?.off([type, "CHANGE"], componentId);
      instrumental.gain.off(["GAIN", "CHANGE"], componentId);
      instrumental.mute.off(["MUTE", "CHANGE"], componentId);
      instrumental.solo.off(["SOLO", "CHANGE"], componentId);
      instrumental.lock.off(["LOCK", "CHANGE"], componentId);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [indexKey, instrumental, type, componentId]);

  const getThemeColor = () => {
    if (isMuted) return "#ef4444";
    if (isLocked) return "#06b6d4";
    if (isSolo) return "#eab308";
    return "#ffffff";
  };

  const getMeterColorClass = () => {
    if (isMuted) return "bg-red-500/40";
    if (isLocked) return "bg-cyan-500/50";
    if (isSolo) return "bg-yellow-500/50";
    return "bg-white/40";
  };

  return (
    <div className="relative flex flex-col min-w-11 w-min-w-11 max-w-min-w-11 overflow-hidden border-b pb-2">
      <div className="border-b-[0.01rem]" onClick={toggleMute}>
        <div
          className={`cursor-pointer py-1 text-[9px] text-center break-all text-nowrap font-medium text-gray-400 ${
            isMuted
              ? "bg-red-500 text-white"
              : "bg-gray-800 text-gray-400 hover:text-gray-200"
          }}`}
        >
          {text}
        </div>
      </div>
      <div className="border-b-[0.01rem]">
        <div className="flex justify-center ">
          <button
            onClick={toggleSolo}
            className={`border-r-[0.01rem] w-full h-6 flex items-center justify-center text-[7px] font-bold transition-all select-none ${
              isSolo
                ? "bg-yellow-500 text-black"
                : "bg-gray-800 text-gray-400 hover:text-gray-200"
            }`}
            title="Solo"
          >
            S
          </button>

          <button
            onClick={toggleLock}
            className={`w-full h-6 flex items-center justify-center text-[7px] font-bold transition-all select-none ${
              isLocked
                ? "bg-cyan-500 text-black"
                : "bg-gray-800 text-gray-400 hover:text-gray-200"
            }`}
            title="Lock Velocity"
          >
            L
          </button>
        </div>
      </div>

      <div className="relative bg-black rounded-sm overflow-hidden py-2">
        <div className="absolute inset-0 flex flex-col-reverse pointer-events-none">
          <div className="h-32 w-full flex flex-col-reverse">
            <div
              ref={displayRef}
              className={`w-full transition-colors duration-300 ${getMeterColorClass()}`}
              style={{ height: "0%" }}
            />
          </div>
        </div>

        <div className="relative h-32 flex py-2 z-10">
          <SliderCommon
            max={127}
            value={gain}
            vertical
            className="m-auto"
            color={getThemeColor()}
            step={1}
            onChange={onValueChange}
          />
        </div>
      </div>
    </div>
  );
};

export default InstrumentalVolumeNode;
