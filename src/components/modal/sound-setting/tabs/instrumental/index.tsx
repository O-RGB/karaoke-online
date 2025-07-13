import InstrumentalCard from "./instrumental-card";
import InstrumentalSetting from "./instrumental-setting";
import React, { useEffect, useState } from "react";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import { INSTRUMENT_TYPE_BY_INDEX } from "@/features/engine/modules/instrumentals/instrumental";
import { InstrumentType } from "@/features/engine/modules/instrumentals/types/node.type";
import { SliderCommonProps } from "@/components/common/input-data/slider";

interface InstrumentalModalProps {
  sliderProps?: SliderCommonProps;
  showList?: boolean;
  selected?: InstrumentType;
  selectedIndex?: number;
  focusClassName?: string;
  listClassName?: string;
}

const InstrumentalModal: React.FC<InstrumentalModalProps> = ({
  sliderProps,
  showList,
  selected,
  selectedIndex,
  focusClassName,
  listClassName,
}) => {
  const [selectType, setSelectType] = useState<InstrumentType>();
  const [selectIndex, setSelectIndex] = useState<number>(0);

  const instrumental = useSynthesizerEngine(
    (state) => state.engine?.instrumental
  );

  const onClickType = (type: InstrumentType, indexKey: number) => {
    setSelectType(type);
    setSelectIndex(indexKey);
  };

  useEffect(() => {
    setSelectType(selected);
    setSelectIndex(selectedIndex ?? 0);
  }, [selected, selectedIndex]);

  return (
    <div className="relative h-full flex flex-col">
      <div className={`flex flex-col gap-2 w-full p-4 ${focusClassName}`}>
        {selectType && (
          <>
            <InstrumentalSetting
              sliderProps={sliderProps}
              color={"#00c951"}
              instrumental={instrumental}
              selectedIndex={selectIndex}
              selectedType={selectType}
              valueKey="EXPRESSION"
            ></InstrumentalSetting>
            <InstrumentalSetting
              sliderProps={sliderProps}
              color={"#fd9a00"}
              instrumental={instrumental}
              selectedIndex={selectIndex}
              selectedType={selectType}
              valueKey="VELOCITY"
            ></InstrumentalSetting>
          </>
        )}
      </div>
      {showList && (
        <div
          className={`flex flex-1 flex-col gap-0.5 overflow-auto ${listClassName}`}
        >
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
      )}
    </div>
  );
};

export default InstrumentalModal;
