import { EventManager } from "@/features/engine/modules/instrumentals/events";
import {
  INoteState,
  TEventType,
} from "@/features/engine/modules/instrumentals/types/node.type";
import { INoteChange } from "@/features/engine/types/synth.type";
import React, { useEffect, useId, useState } from "react";

interface KeyMinProps {
  event: EventManager<INoteState, TEventType<INoteChange>>;
  channel: number;
}

const KeyMin: React.FC<KeyMinProps> = ({ event, channel }) => {
  const componentId = useId();
  const [on, setOn] = useState<boolean>(false);

  useEffect(() => {
    if (event) {
      event.add(
        ["NOTE_ON", "CHANGE"],
        channel,
        (v) => {
          setOn(v.value);
        },
        componentId
      );
    }
  }, [event]);

  return (
    <div className={`w-3 text-sm ${!on ? "text-white/40" : "text-white"}`}>
      {on ? 1 : 0}
    </div>
  );
};

export default KeyMin;
