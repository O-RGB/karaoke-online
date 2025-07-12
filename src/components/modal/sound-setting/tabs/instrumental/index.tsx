import InstrumentalCard from "./instrumental-card";
import InstrumentalSetting from "./instrumental-setting";
import React, { useState } from "react";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import { INSTRUMENT_TYPE_BY_INDEX } from "@/features/engine/modules/instrumentals/instrumental";
import { InstrumentType } from "@/features/engine/modules/instrumentals/types/node.type";

interface InstrumentalModalProps {}

const InstrumentalModal: React.FC<InstrumentalModalProps> = ({}) => {
  const [selectType, setSelectType] = useState<InstrumentType>();
  const [selectIndex, setSelectIndex] = useState<number>(0);

  const instrumental = useSynthesizerEngine(
    (state) => state.engine?.instrumental
  );

  const onClickType = (type: InstrumentType, indexKey: number) => {
    setSelectType(type);
    setSelectIndex(indexKey);
  };

  return (
    <div className="relative h-full flex flex-col">
      <div className="flex flex-col gap-2 w-full p-4">
        {selectType && (
          <>
            <InstrumentalSetting
              color={"#00c951"}
              instrumental={instrumental}
              selectedIndex={selectIndex}
              selectedType={selectType}
              valueKey="EXPRESSION"
            ></InstrumentalSetting>
            <InstrumentalSetting
              color={"#fd9a00"}
              instrumental={instrumental}
              selectedIndex={selectIndex}
              selectedType={selectType}
              valueKey="VELOCITY"
            ></InstrumentalSetting>
          </>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 overflow-auto">
        {INSTRUMENT_TYPE_BY_INDEX.map((value, index) => {
          return (
            <React.Fragment key={`card-inst-${index}`}>
              <InstrumentalCard
                instrumental={instrumental}
                index={index}
                type={value}
                selected={selectType}
                onClick={onClickType}
              ></InstrumentalCard>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default InstrumentalModal;
