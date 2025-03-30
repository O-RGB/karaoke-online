import { SynthChannel } from "@/features/engine/modules/instrumentals/channel";
import React, { useEffect, useState } from "react";

interface NodeRenderTestProps {
  index: number;
  node: SynthChannel;
}

const NodeRenderTest: React.FC<NodeRenderTestProps> = ({ index, node }) => {
  const [change, setChange] = useState<number>(100);
  const [program, setProgram] = useState<number>(100);
  const [lock, setLock] = useState<number>(100);
  const [mute, setMute] = useState<number>(100);
  const [expression, setExpression] = useState<number>(100);
  const [pan, setPan] = useState<number>(100);
  const [chorus, setChorus] = useState<number>(100);
  const [reverb, setReverb] = useState<number>(100);
  const [transpose, setTranspose] = useState<number>(100);
  const [active, setActive] = useState<number>(100);
  const [drum, setDrum] = useState<number>(100);

  useEffect(() => {
    if (node) {
      node.setCallBack(["VOLUME", "CHANGE"], index, (value) =>
        setChange(value.value)
      );
      //   node.setCallBack("CHANGE", (value) => setChange(value.value));
      //   node.setCallBack("PROGARM", (value) => setProgram(value.value));
      //   node.setCallBack("LOCK", (value) => setLock(value.value));
      //   node.setCallBack("MUTE", (value) => setMute(value.value));
      //   node.setCallBack("EXPRESSION", (value) => setExpression(value.value));
      //   node.setCallBack("PAN", (value) => setPan(value.value));
      //   node.setCallBack("CHORUS", (value) => setChorus(value.value));
      //   node.setCallBack("REVERB", (value) => setReverb(value.value));
      //   node.setCallBack("TRANSPOSE", (value) => setTranspose(value.value));
      //   node.setCallBack("ACTIVE", (value) => setActive(value.value));
      //   node.setCallBack("DRUM", (value) => setDrum(value.value));
    }
  }, [node]);

  return (
    <div className="flex flex-col text-[10px] border">
      <div className="text-nowrap">
        CHG: {index}: {change}
      </div>
      {/* <div className="text-nowrap">
        PRG: {index}: {program}
      </div>
      <div className="text-nowrap">
        LCK: {index}: {lock}
      </div>
      <div className="text-nowrap">
        MUT: {index}: {mute}
      </div>
      <div className="text-nowrap">
        EXP: {index}: {expression}
      </div>
      <div className="text-nowrap">
        PAN: {index}: {pan}
      </div>
      <div className="text-nowrap">
        CHR: {index}: {chorus}
      </div>
      <div className="text-nowrap">
        REV: {index}: {reverb}
      </div>
      <div className="text-nowrap">
        TRP: {index}: {transpose}
      </div>
      <div className="text-nowrap">
        ACT: {index}: {active}
      </div>
      <div className="text-nowrap">
        DRM: {index}: {drum}
      </div> */}
    </div>
  );
};

export default NodeRenderTest;
