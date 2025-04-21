import Tags from "@/components/common/display/tags";
import instrumental from "@/components/modal/sound-setting/instrumental";
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

    instrumental.setCallBackEQ(
      ["EQUALIZER", "CHANGE"],
      category,
      (v) => {
        setEqEnabled(v.value.enabled);
      },
      componentId
    );

    return () => {
      instrumental.removeCallbackEQ(
        ["EQUALIZER", "CHANGE"],
        category,
        componentId
      );
    };
  }, [category, instrumental]);

  if (eqEnabled)
    return (
      <div className="absolute top-3.5 left-0.5 text-[8px] text-white">
        EQ
        {/* <Tags
          children={"EQ"}
          color="yellow"
          className="!p-[1px] !rounded-sm !text-[8px]"
        ></Tags> */}
      </div>
    );
};

export default EqTag;
