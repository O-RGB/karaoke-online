import { InstrumentalNode } from "@/features/engine/modules/instrumentals/instrumental";
import React, { useEffect, useId, useState } from "react";

interface LimitBarRenderProps {
  instrumental?: InstrumentalNode;
  category: number;
  program: number;
}

const LimitBarRender: React.FC<LimitBarRenderProps> = ({
  instrumental,
  category,
  program,
}) => {
  const componentId = useId();
  const [expression, setExpression] = useState<number>(0);
  const [velocity, setVelocity] = useState<number>(0);

  useEffect(() => {
    if (!instrumental) return;
    instrumental.expression[category].linkEvent(
      ["EXPRESSION", "CHANGE"],
      (v) => setExpression(v.value),
      componentId
    );
    instrumental.velocity[category].linkEvent(
      ["VELOCITY", "CHANGE"],
      (v) => setVelocity(v.value),
      componentId
    );

    return () => {
      instrumental.expression[category].unlinkEvent(
        ["EXPRESSION", "CHANGE"],
        componentId
      );
      instrumental.velocity[category].unlinkEvent(
        ["VELOCITY", "CHANGE"],
        componentId
      );
    };
  }, [category, instrumental, program]);

  const expressionPercent = (expression / 127) * 100;
  const velocityPercent = (velocity / 127) * 100;

  if (!instrumental) return;

  return (
    <>
      <div
        style={{ height: `${expressionPercent}%` }}
        className="absolute w-full h-full border-t border-t-white/50 bottom-0 -z-10 "
      >
        <div
          style={{ opacity: (expressionPercent) / 127 }}
          className="absolute w-full h-2 bg-gradient-to-b from-white/40 to-transparent"
        ></div>
      </div>
      <div
        style={{ height: `${velocityPercent}%` }}
        className="absolute w-full h-full border-t border-t-white/50 border-dashed bottom-0 -z-10"
      >
        <div
          style={{ opacity: (velocityPercent) / 127 }}
          className="absolute w-full h-2 bg-gradient-to-b from-white/40 to-transparent"
        ></div>
      </div>
    </>
  );
};

export default LimitBarRender;
