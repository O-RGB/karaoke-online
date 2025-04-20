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
        const event = nodes.note?.eventNo[i];
        if (!event) return <></>;
        return (
          <React.Fragment key={`key-min-${i}`}>
            <KeyMin event={event} channel={channel}></KeyMin>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default KeyRender;
