import { DRUM_CHANNEL } from "@/config/value";
import { KeyboardNode } from "@/features/engine/modules/instrumentals/keyboard-node";
import React, { useEffect, useId, useRef } from "react";

interface DrumNodeProps {
  note: KeyboardNode;
  keyNote: number;
}

const DrumNode: React.FC<DrumNodeProps> = ({ note, keyNote }) => {
  const componentId = useId();
  const channel = DRUM_CHANNEL;

  // Use refs instead of state for values that don't need to trigger re-renders
  const velocityRef = useRef(0);
  const displayRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLDivElement>(null);
  
  // Interval ref
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Improved parameters
  const DECAY_RATE = 0.9;
  const MIN_VELOCITY = 0.01;
  const ANIMATION_INTERVAL = 50; // Increased to 50ms (20fps) to reduce CPU usage

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
    animationIntervalRef.current = setInterval(updateDisplay, ANIMATION_INTERVAL);
  };

  const handleNoteEvent = (v: any) => {
    const newVelocity = v.value.velocity;
    
    if (newVelocity > 0) {
      velocityRef.current = newVelocity;
      
      // Start animation if not already running
      if (!animationIntervalRef.current) {
        startAnimation();
      }
    }
  };

  useEffect(() => {
    const noteByIndex = note.event[keyNote];
    if (!noteByIndex) return;
    
    noteByIndex.add(["NOTE_ON", "CHANGE"], channel, handleNoteEvent, componentId);
    
    return () => {
      noteByIndex.remove(["NOTE_ON", "CHANGE"], channel, componentId);
      
      // Clean up interval
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
    };
  }, [note, keyNote, channel, componentId]);

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
      <div ref={valueRef} className="text-[10px] text-gray-400">0</div>
    </div>
  );
};

export default DrumNode;