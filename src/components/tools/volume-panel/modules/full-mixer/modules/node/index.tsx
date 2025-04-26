import { SynthChannel } from "@/features/engine/modules/instrumentals/channel";
import {
  INSTRUMENT_TYPE_BY_INDEX,
  InstrumentalNode,
} from "@/features/engine/modules/instrumentals/instrumental";
import React, { useEffect, useState } from "react";
import InstrumentalVolumeNode from "./volume-node";
import WinboxModal from "@/components/common/modal";

interface MixerNodesProps {
  instrumental: InstrumentalNode;
}

const MixerNodes: React.FC<MixerNodesProps> = ({ instrumental }) => {

  useEffect(() => {

  }, [])
  return (
    <div className="flex p-2 divide-x border ">
      {INSTRUMENT_TYPE_BY_INDEX.map((value, index) => {
        const group = instrumental.group.get(value);
        const nodes: SynthChannel[] = group ? Array.from(group.values()) : [];

        return (
          <React.Fragment key={`card-inst-${index}`}>
            <InstrumentalVolumeNode
              indexKey={index}
              instrumental={instrumental}
              type={value}
              node={nodes}
            ></InstrumentalVolumeNode>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default MixerNodes;
