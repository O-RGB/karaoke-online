import { InstrumentalNode } from "@/features/engine/modules/instrumentals-node/modules/instrumental";
import React, { useEffect, useState } from "react";

interface LimitBarRenderProps {
  category: number;
  instrumental?: InstrumentalNode;
  program: number;
}

const LimitBarRender: React.FC<LimitBarRenderProps> = ({
  category,
  instrumental,
  program,
}) => {
  const [expression, setExpression] = useState<number>(0);
  const [velocity, setVelocity] = useState<number>(0);

  useEffect(() => {
    if (!instrumental) return;
    instrumental?.setCallBackState(["EXPRESSION", "CHANGE"], category, (v) => {
      setExpression(v.value);
    });
    instrumental?.setCallBackState(["VELOCITY", "CHANGE"], category, (v) => {
      setVelocity(v.value);
    });

    return () => {
      instrumental?.removeCallback(["EXPRESSION", "CHANGE"], category, (v) => {
        setExpression(v.value);
      });
      instrumental?.removeCallback(["VELOCITY", "CHANGE"], category, (v) => {
        setVelocity(v.value);
      });
    };
  }, [category, instrumental, program]);

  const expressionPercent = (expression / 127) * 100;
  const velocityPercent = (velocity / 127) * 100;

  if (!instrumental) return;

  return (
    <>
      <div
        style={{ height: `${expressionPercent}%` }}
        className="absolute w-full h-full border-t-2 border-t-white/50 bottom-0 -z-10"
      ></div>
      <div
        style={{ height: `${velocityPercent}%` }}
        className="absolute w-full h-full border-t-2 border-t-white/50 border-dotted bottom-0 -z-10"
      ></div>
    </>
  );
};

export default LimitBarRender;
