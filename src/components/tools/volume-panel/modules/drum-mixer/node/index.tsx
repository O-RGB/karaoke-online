"use client";
import { useEffect, useId, useRef, useState } from "react";
import { DRUM_CHANNEL } from "@/config/value";
import { KeyboardNode } from "@/features/engine/modules/instrumentals/keyboard-node";
import {
  INoteState,
  TEventType,
} from "@/features/engine/modules/instrumentals/types/node.type";
import { INoteChange } from "@/features/engine/types/synth.type";

interface DrumNodeProps {
  note: KeyboardNode;
  keyNote: number;
  onNoteChange?: (event: TEventType<INoteState, INoteChange>) => void;
}

const DrumNode: React.FC<DrumNodeProps> = ({ note, keyNote, onNoteChange }) => {
  const componentId = useId();
  const channel = DRUM_CHANNEL;

  const velocityRef = useRef(0);
  const displayRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLDivElement>(null);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [outputs, setOutputs] = useState<MIDIOutput[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const DECAY_RATE = 0.9;
  const MIN_VELOCITY = 0.01;
  const ANIMATION_INTERVAL = 50;

  // useEffect(() => {
  //   midiService.init().then(() => {
  //     setOutputs(midiService.outputs);
  //     setSelectedId(midiService.selectedOutput?.id || null);
  //   });
  //   midiService.onOutputsChanged(setOutputs);
  // }, []);

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

  const handleNoteEvent = (v: any) => {
    const newVelocity = v.value.velocity;

    if (newVelocity > 0) {
      velocityRef.current = newVelocity;
      // midiService.sendNoteOn(keyNote, newVelocity, channel);
      onNoteChange?.(v);

      if (!animationIntervalRef.current) {
        startAnimation();
      }
    } else {
      // midiService.sendNoteOff(keyNote, channel);
      onNoteChange?.(v);
    }
  };

  useEffect(() => {
    const noteByIndex = note.notesOn[keyNote];
    if (!noteByIndex) return;

    noteByIndex.linkEvent(["NOTE_ON", "CHANGE"], handleNoteEvent, componentId);

    return () => {
      noteByIndex.unlinkEvent(["NOTE_ON", "CHANGE"], componentId);

      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
    };
  }, [note, keyNote, channel, componentId]);

  // const handleOutputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   midiService.setOutputById(e.target.value);
  //   setSelectedId(e.target.value);
  // };

  return (
    <div className="flex flex-col items-center gap-2 w-5 text-xs">
      {/* MIDI Output Selector */}
      {/* <select
        value={selectedId ?? ""}
        onChange={handleOutputChange}
        className="text-xs p-1 rounded border bg-white text-gray-800"
      >
        {outputs.map((out) => (
          <option key={out.id} value={out.id}>
            {out.name}
          </option>
        ))}
        {outputs.length === 0 && <option>No MIDI Output</option>}
      </select> */}

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
    </div>
  );
};

export default DrumNode;
