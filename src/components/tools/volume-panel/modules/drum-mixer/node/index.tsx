import { DRUM_CHANNEL, DRUM_NOTES_LIST } from "@/config/value";
import { SynthChannel } from "@/features/engine/modules/instrumentals/channel";
import { KeyboardNode } from "@/features/engine/modules/instrumentals/keyboard-node";
import { DrumNotesType } from "@/features/engine/modules/instrumentals/types/node.type";
import { INoteChange } from "@/features/engine/types/synth.type";
import { channel } from "diagnostics_channel";
import React, { useEffect, useId, useState } from "react";

interface DrumNodeProps {
  note: KeyboardNode;
  keyNote: number;
}

const DrumNode: React.FC<DrumNodeProps> = ({ note, keyNote }) => {
  const channel = DRUM_CHANNEL;
  const componentId = useId();
  const [on, setOn] = useState<INoteChange>({
    channel,
    midiNote: keyNote,
    velocity: 0,
  });

  useEffect(() => {
    const noteByIndex = note.event[keyNote];
    if (noteByIndex) {
      noteByIndex.add(
        ["NOTE_ON", "CHANGE"],
        channel,
        (v) => setOn(v.value),
        componentId
      );
    }

    return () => {
      noteByIndex.remove(["NOTE_ON", "CHANGE"], channel, componentId);
    };
  }, [note.event[keyNote]]);

  return <div className="flex flex-col gap-1">{on.velocity}</div>;
};

export default DrumNode;
