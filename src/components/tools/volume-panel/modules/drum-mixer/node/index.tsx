"use client";
import { useEffect, useId, useRef, useState } from "react";
import { TEventType } from "@/features/engine/modules/instrumentals/types/node.type";
import { INoteChange } from "@/features/engine/types/synth.type";
import { NoteEventManager } from "@/features/engine/modules/notes-modifier-manager/note";
import SliderCommon from "@/components/common/input-data/slider";

interface DrumNodeProps {
  noteEvent: NoteEventManager;
  keyNote: number;
  onNoteChange?: (event: TEventType<any, INoteChange>) => void;
}

const DrumNode: React.FC<DrumNodeProps> = ({ noteEvent, keyNote }) => {
  const componentId = useId();

  const velocityRef = useRef(0);
  const displayRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLDivElement>(null);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [gain, setGain] = useState<number>(100);

  const DECAY_RATE = 0.9;
  const MIN_VELOCITY = 0.01;
  const ANIMATION_INTERVAL = 50;

  const updateDisplay = () => {
    velocityRef.current *= DECAY_RATE;

    if (velocityRef.current < MIN_VELOCITY) {
      velocityRef.current = 0;
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
    }

    if (displayRef.current) {
      const rawPercent = (velocityRef.current / 127) * 100;
      const gainPercent = Math.min(
        100,
        Math.max(0, Math.pow(rawPercent / 100, 0.8) * 100)
      );
      displayRef.current.style.height = `${gainPercent}%`;
      displayRef.current.style.boxShadow =
        velocityRef.current > 20 ? "0 0 8px rgba(72, 187, 120, 0.6)" : "none";
    }

    if (valueRef.current) {
      valueRef.current.textContent = Math.round(velocityRef.current).toString();
    }
  };

  const startAnimation = () => {
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
    }
    animationIntervalRef.current = setInterval(
      updateDisplay,
      ANIMATION_INTERVAL
    );
  };

  const handleSetGain = (value: number) => {
    noteEvent.setGain(value);
    setGain(value);
  };

  const handleNoteEvent = (v: TEventType<INoteChange>) => {
    const newVelocity = v.value.velocity ?? 0;

    if (newVelocity > 0) {
      velocityRef.current = newVelocity;

      if (!animationIntervalRef.current) {
        startAnimation();
      }
    }
  };

  useEffect(() => {
    const ev = noteEvent;
    if (!ev) return;

    ev.gain?.on(
      [null, "CHANGE"],
      (event) => {
        setGain(event.value);
      },
      componentId
    );

    ev.note?.on([keyNote, "CHANGE"], handleNoteEvent, componentId);

    return () => {
      ev.note?.off([keyNote, "CHANGE"], componentId);
      ev.gain?.off([null, "CHANGE"], componentId);

      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
    };
  }, [noteEvent, keyNote, componentId]);

  return (
    <div className="flex flex-col items-center gap-2 w-5 text-xs relative">
      {/* Volume Meter */}
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

      {/* Gain Slider */}
      <div className="h-24 w-full absolute top-0 left-1 right-0">
        <SliderCommon
          min={0}
          step={0.5}
          className="h-full"
          max={128}
          value={gain}
          vertical
          onChange={handleSetGain}
        />
      </div>
    </div>
  );
};

export default DrumNode;
