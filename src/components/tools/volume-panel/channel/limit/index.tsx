import { SynthChannel } from "@/features/engine/modules/instrumentals/channel";
import {
  findProgramCategory,
  InstrumentalNode,
} from "@/features/engine/modules/instrumentals/instrumental";
import { TEventType } from "@/features/engine/modules/instrumentals/types/node.type";
import React, { useEffect, useState } from "react";
import LimitBarRender from "./bar-render";

interface ChannelLimitProps {
  instrumental?: InstrumentalNode;
  node: SynthChannel;
  channel: number;
}

const ChannelLimit: React.FC<ChannelLimitProps> = ({
  instrumental,
  channel,
  node,
}) => {
  const [category, setCategory] = useState<number>(0);
  const [program, setProgram] = useState<number | undefined>(undefined);

  const onProgramChange = (value: TEventType<number>) => {
    setProgram(undefined);
    setTimeout(() => {
      const category = findProgramCategory(value.value);
      setProgram(value.value);
      if (category?.index) setCategory(category?.index);
    }, 50);
  };

  useEffect(() => {
    node.setCallBackState(["PROGARM", "CHANGE"], channel, onProgramChange);
  }, [node]);

  if (!node || program === undefined) return;

  return (
    <div className="absolute w-full h-[85%] bottom-5">
      <LimitBarRender
        program={program}
        category={category}
        instrumental={instrumental}
      ></LimitBarRender>
    </div>
  );
};

export default ChannelLimit;
