import { useSynthesizerEngine } from "@/features/engine/synth-store";
import React from "react";
import Piano from "./piano/piano";

interface KeyboardRenderProps {}

const KeyboardRender: React.FC<KeyboardRenderProps> = ({}) => {
  const engine = useSynthesizerEngine((state) => state.engine);
  if (!engine?.nodes) return <></>;
  const nodes = engine.nodes;

  return (
    <div className="fixed top-32 left-6 text-sm flex flex-col gap-2 text-white">
      {nodes.map((node, channel) => {
        if (channel === 9) {
          return (
            <div className="w-[1600px]">
              <Piano {...{ node, channel }}></Piano>
            </div>
          );
        }
      })}
    </div>
  );
};

export default KeyboardRender;
