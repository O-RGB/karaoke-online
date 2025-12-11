import { SynthChannel } from "@/features/engine/modules/instrumentals/channel";
import { EventEmitter } from "@/features/engine/modules/instrumentals/events";
import { SynthControl } from "@/features/engine/modules/instrumentals/node";
import {
  INoteState,
  TEventType,
} from "@/features/engine/modules/instrumentals/types/node.type";
import { INoteChange } from "@/features/engine/types/synth.type";
import React, { useEffect, useId, useRef } from "react";

interface VolumeVelocityRenderProps {
  channel: number;
  node: SynthChannel;
}

const VolumeVelocityRender: React.FC<VolumeVelocityRenderProps> = ({
  channel,
  node,
}) => {
  // ใช้ ref เพียงตัวเดียวสำหรับทั้ง channel
  const velocityRef = useRef<number>(0);
  const displayRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLDivElement>(null);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ค่าพารามิเตอร์จาก DrumNode
  const DECAY_RATE = 0.9;
  const MIN_VELOCITY = 0.01;
  const ANIMATION_INTERVAL = 50;

  const updateDisplay = () => {
    // Apply decay
    velocityRef.current *= DECAY_RATE;

    // Stop animation if below threshold
    if (velocityRef.current < MIN_VELOCITY) {
      velocityRef.current = 0;

      // Stop interval if velocity reaches zero
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
    }

    // Update DOM directly for better performance
    if (displayRef.current) {
      // Apply audio curve transformation for more realistic gain behavior
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
    // Clear existing interval if any
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
    }

    // Start new interval
    animationIntervalRef.current = setInterval(
      updateDisplay,
      ANIMATION_INTERVAL
    );
  };

  // ใช้ onVolumeChange ที่มีอยู่แล้วแต่ปรับให้จัดการกับ velocity ในระดับ channel
  const onVolumeChange = (event: TEventType<INoteChange>) => {
    const newVelocity = event.value.velocity;

    if (newVelocity > 0) {
      // ถ้าได้รับ velocity ใหม่ที่มากกว่าปัจจุบัน ให้ใช้ค่าใหม่
      // หรือถ้า velocity ปัจจุบันต่ำกว่าค่าหนึ่ง ให้ใช้ค่าใหม่
      if (newVelocity > velocityRef.current || velocityRef.current < 10) {
        velocityRef.current = newVelocity;
      }

      // Start animation if not already running
      if (!animationIntervalRef.current) {
        startAnimation();
      }
    }
  };

  const onVolumeOff = (event: TEventType<boolean>) => {
    const noteOf = event.value;
  };

  useEffect(() => {
    // ทำความสะอาด interval เมื่อ component unmount
    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
    };
  }, [node]);

  return (
    <div className="flex flex-col items-center gap-1 w-8">
      <div className="h-24 w-3 bg-gray-300 rounded-full overflow-hidden flex flex-col-reverse">
        {/* Main level indicator */}
        <div
          ref={displayRef}
          className="w-full bg-green-500"
          style={{ height: "0%" }}
        />
      </div>
      <div ref={valueRef} className="text-[10px] text-gray-400">
        0
      </div>

      {/* ใช้ MiniNoteListener สำหรับแต่ละ note แต่ดึงข้อมูลมาใช้สำหรับทั้ง channel */}
      <div className="hidden">
        {node.note?.notesOn?.map((re, i) => {
          const note = node.note?.notesOn[i];
          if (!note) return null;
          return (
            <React.Fragment key={`key-min-${i}`}>
              <MiniNoteListener
                channel={channel}
                synthNode={note}
                onNoteOn={onVolumeChange}
                onNoteOff={(e) => {
                  console.log(e);
                }}
              />
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default VolumeVelocityRender;

interface MiniNoteListenerProps {
  synthNode: SynthControl<INoteState, INoteChange>
  channel: number;
  onNoteOn: (value: TEventType<INoteChange>) => void;
  onNoteOff: (value: TEventType<boolean>) => void;
}

const MiniNoteListener: React.FC<MiniNoteListenerProps> = ({
  synthNode,
  channel,
  onNoteOn,
  onNoteOff,
}) => {
  const componentId = useId();

  useEffect(() => {
    synthNode.on(["NOTE_ON", "CHANGE"], onNoteOn, componentId);
    synthNode.on(["NOTE_ON", "MUTE"], onNoteOff as any, componentId);
    return () => {
      synthNode.off(["NOTE_ON", "CHANGE"], componentId);
      synthNode.off(["NOTE_ON", "MUTE"], componentId);
    };
  }, [synthNode, channel, onNoteOn]);

  return null;
};
