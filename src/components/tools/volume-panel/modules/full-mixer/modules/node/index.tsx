import { SynthChannel } from "@/features/engine/modules/instrumentals/channel";
import {
  INSTRUMENT_TYPE_BY_INDEX,
  InstrumentalNode,
} from "@/features/engine/modules/instrumentals/instrumental";
import React from "react";
import InstrumentalVolumeNode from "./volume-node";

interface MixerNodesProps {
  instrumental: InstrumentalNode;
}

const MixerNodes: React.FC<MixerNodesProps> = ({ instrumental }) => {
  return (
    <div className="flex p-2 divide-x border ">
      {INSTRUMENT_TYPE_BY_INDEX.map((value, index) => {
        return (
          <React.Fragment key={`card-inst-${index}`}>
            <InstrumentalVolumeNode
              indexKey={index}
              instrumental={instrumental}
              type={value}
            ></InstrumentalVolumeNode>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default MixerNodes;
