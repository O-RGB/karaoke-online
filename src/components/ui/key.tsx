import { EventManager } from "@/features/engine/modules/instrumentals/events";
import { SynthNode } from "@/features/engine/modules/instrumentals/node";
import {
  INoteState,
  TEventType,
} from "@/features/engine/modules/instrumentals/types/node.type";
import { INoteChange } from "@/features/engine/types/synth.type";
import React, { useEffect, useId, useState } from "react";

interface KeyMinProps {
  synthNode: SynthNode<INoteState, INoteChange>
}

const KeyMin: React.FC<KeyMinProps> = ({ synthNode }) => {
  const componentId = useId();
  const [on, setOn] = useState<boolean>(false);

  useEffect(() => {
    if (synthNode) {
      synthNode.linkEvent(
        ["NOTE_ON", "CHANGE"],
        (v) => setOn(v.value),
        componentId
      );
    }

    return () => {
      synthNode.unlinkEvent(["NOTE_ON", "CHANGE"], componentId)
    }
  }, [synthNode]);

  return (
    <div className={`w-3 text-sm ${!on ? "text-white/40" : "text-white"}`}>
      {on ? 1 : 0}
    </div>
  );
};

export default KeyMin;
