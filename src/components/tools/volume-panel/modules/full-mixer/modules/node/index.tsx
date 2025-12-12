import React from "react";
import InstrumentalVolumeNode from "./volume-node";
import { InstrumentalsControl } from "@/features/engine/modules/instrumentals-group";
import VolumeGainNode from "./volume-gain";
import { INSTS_KEYS_MAP } from "@/features/engine/modules/instrumentals-group/types";

interface MixerNodesProps {
  instrumental: InstrumentalsControl;
}

const MixerNodes: React.FC<MixerNodesProps> = ({ instrumental }) => {
  return (
    <div className="flex pt-2 divide-x">
      <VolumeGainNode></VolumeGainNode>
      {INSTS_KEYS_MAP.map((value, index) => {
        const inst = instrumental.get(value);
        if (!inst) return <>{value}</>;
        return (
          <React.Fragment key={`card-inst-${index}`}>
            <InstrumentalVolumeNode
              indexKey={index}
              instrumental={inst}
              type={value}
            ></InstrumentalVolumeNode>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default MixerNodes;
