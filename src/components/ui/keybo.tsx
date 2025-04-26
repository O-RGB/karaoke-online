import { SynthChannel } from "@/features/engine/modules/instrumentals/channel";
import React, { useEffect, useId } from "react";
import KeyMin from "./key";

interface KeyRenderProps {
  nodes: SynthChannel;
  channel: number;
}

const KeyRender: React.FC<KeyRenderProps> = ({ nodes, channel }) => {
  return (
    <div className="border p-1 text-nowrap w-full flex">
      {nodes.note?.notes?.map((re, i) => {
        const note = nodes.note?.notes[i];
        if (!note) return <></>;
        return (
          <React.Fragment key={`key-min-${i}`}>
            <KeyMin synthNode={note} ></KeyMin>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default KeyRender;
