import React, { useState } from "react";
import InstrumentalCard from "./instrumental-card";
import InstrumentalSetting from "./instrumental-setting";
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
    <div className="relative flex flex-col-reverse lg:flex-row gap-4 h-full w-full">
      <div className="w-full lg:w-[80%] flex flex-col gap-0.5">
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
      <div className="w-full lg:w-[20%] sticky top-12 lg:top-14 flex h-full bg-white p-2 z-20">
        <div className="flex flex-col gap-2 w-full h-full">
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
      </div>
    </div>
  );
};

export default InstrumentalModal;
