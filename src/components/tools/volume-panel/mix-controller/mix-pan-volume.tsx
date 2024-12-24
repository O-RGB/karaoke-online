import RangeBarClone from "@/components/common/input-data/range-bar-clone";
import SliderCommon from "@/components/common/input-data/slider";
import useMixerStoreNew from "@/stores/player/event-player/modules/event-mixer-store";
import React from "react";

interface MixPanVolumeProps {
  disabled?: boolean;
  channel: number;
  onPenChange: (value: number) => void;
}

const MixPanVolume: React.FC<MixPanVolumeProps> = ({
  disabled,
  channel,
  onPenChange,
}) => {
  const pan = useMixerStoreNew((state) => state.pan[channel]);
  return (
    <>
      <SliderCommon
        disabled={disabled}
        value={disabled ? 0 : pan}
        onChange={onPenChange}
        className="z-20"
        max={127}
        vertical={false}
      ></SliderCommon>
    </>
  );
};

export default MixPanVolume;
