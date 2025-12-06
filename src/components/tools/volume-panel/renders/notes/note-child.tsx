import { SynthNode } from "@/features/engine/modules/instrumentals/node";
import { INoteState } from "@/features/engine/modules/instrumentals/types/node.type";
import { INoteChange } from "@/features/engine/types/synth.type";
import React, { useEffect, useId, useState } from "react";

interface NoteChildProps {
  on: SynthNode<INoteState, INoteChange>[];
  off: SynthNode<INoteState, INoteChange>[];
}

const NoteChild: React.FC<NoteChildProps> = ({ on, off }) => {
  const id = useId();
  const [count, setCount] = useState(0);
  const active = count > 0;

  useEffect(() => {
    const onHandler = () => setCount((n) => n + 1);
    const offHandler = () => setCount((n) => Math.max(n - 1, 0));

    on.forEach((node) => node.linkEvent(["NOTE_ON", "CHANGE"], onHandler, id));
    off.forEach((node) =>
      node.linkEvent(["NOTE_OFF", "CHANGE"], offHandler, id)
    );

    return () => {
      on.forEach((node) => node.unlinkEvent(["NOTE_ON", "CHANGE"], id));
      off.forEach((node) => node.unlinkEvent(["NOTE_OFF", "CHANGE"], id));
    };
  }, [on, off, id]);

  return (
    <div className="w-full h-full bg-white/10 rounded-sm overflow-hidden">
      <div
        className="w-full h-full bg-white/40"
        style={{ opacity: active ? 1 : 0, transitionDuration: "10ms" }}
      />
    </div>
  );
};

export default React.memo(NoteChild);
