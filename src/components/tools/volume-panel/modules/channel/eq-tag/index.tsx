import { InstrumentalNode } from "@/features/engine/modules/instrumentals/instrumental";
import React, { useEffect, useId, useState } from "react";

interface EqTagProps {
  instrumental?: InstrumentalNode;
  category: number;
  channel: number;
}

const EqTag: React.FC<EqTagProps> = ({ instrumental, category, channel }) => {
  const componentId = useId();
  const [eqEnabled, setEqEnabled] = useState<boolean>(false);

  useEffect(() => {
    if (!instrumental) return;

    instrumental.equalizer[category].on(
      ["EQUALIZER", "CHANGE"],
      (v) => setEqEnabled(v.value.enabled),
      componentId
    );

    return () => {
      instrumental.equalizer[category].off(
        ["EQUALIZER", "CHANGE"],
        componentId
      );
    };
  }, [category, instrumental]);

  if (eqEnabled)
    return (
      <div className="absolute top-3.5 left-0.5 text-[8px] text-white">EQ</div>
    );
};

export default EqTag;
