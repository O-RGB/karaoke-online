import { useSynthesizerEngine } from "@/features/engine/synth-store";
import { BaseSynthEngine } from "@/features/engine/types/synth.type";
import React, { useState, useEffect } from "react";
import EQNode from "./eqnode";

interface EQTESTProps {}

const EQTEST: React.FC<EQTESTProps> = () => {
  const engine: BaseSynthEngine | undefined = useSynthesizerEngine(
    (state) => state.engine
  );

  useEffect(() => {
    engine?.nodes?.map((x) => {
      x.equalizer;
    });
  }, []);

  return (
    <div className="fixed top-56 grid grid-cols-6 gap-2">
      {engine?.nodes?.map((x, i) => {
        const eq = x.equalizer;
        return (
          <div className="w-64" key={`eq-node-${i}`}>
            <EQNode channel={x.channel} eq={eq}></EQNode>
          </div>
        );
      })}
    </div>
  );
};

export default EQTEST;
