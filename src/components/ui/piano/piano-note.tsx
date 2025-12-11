import { EventEmitter } from "@/features/engine/modules/instrumentals/events";
import React, { useEffect, useId, useState } from "react";
import { IPianoKey } from "./piano.type";
import { KeyboardNode } from "@/features/engine/modules/instrumentals/keyboard-node";
import { INoteChange } from "@/features/engine/types/synth.type";
import {
  INoteState,
  TEventType,
} from "@/features/engine/modules/instrumentals/types/node.type";
import { SynthControl } from "@/features/engine/modules/instrumentals/node";

interface PianoNoteProps {
  synthNode: SynthControl<INoteState, INoteChange>
  channel: number;
  index: number;
  keyStyle: IPianoKey;
}

const PianoNote: React.FC<PianoNoteProps> = ({
  index,
  keyStyle,
  synthNode,
  channel,
}) => {
  const componentId = useId();
  const [on, setOn] = useState<INoteChange>({
    channel,
    midiNote: index,
    velocity: 0,
  });

  useEffect(() => {
    if (synthNode) {
      synthNode.on(
        ["NOTE_ON", "CHANGE"],
        (v) => setOn(v.value),
        componentId
      );
    }

    return () => {
      synthNode.off(["NOTE_ON", "CHANGE"], componentId);
    };
  }, [synthNode]);

  return (
    <div
      key={`key-${index}`}
      className={`absolute top-0 flex items-end justify-center border-l border-gray-400 ${on.velocity > 0 ? "bg-blue-500" : keyStyle.bgColor
        }`}
      style={{
        left: `${keyStyle.left}px`,
        width: `${keyStyle.width}px`,
        height: keyStyle.height,
        zIndex: keyStyle.zIndex,
      }}
    >
      <span className={`mb-2 text-xs font-bold ${keyStyle.textColor}`}></span>
    </div>
  );
};

export default PianoNote;
