import RangeBarClone from "@/components/common/input-data/range-bar-clone";
import SliderCommon from "@/components/common/input-data/slider";
import useMixerStoreNew from "@/stores/player/event-player/modules/event-mixer-store";
import React from "react";

interface MixChorusDepthVolumeProps {
  disabled?: boolean;
  channel: number;
  onChorusDepthChange: (channel: number) => void;
}

const MixChorusDepthVolume: React.FC<MixChorusDepthVolumeProps> = ({
  disabled,
  channel,
  onChorusDepthChange,
}) => {
  const chorusDepth = useMixerStoreNew((state) => state.chorusDepth[channel]);
  return (
    <>
      <SliderCommon
        disabled={disabled}
        value={disabled ? 0 : chorusDepth}
        onChange={onChorusDepthChange}
        className="z-20"
        max={127}
        vertical={false}
      ></SliderCommon>
    </>
  );
};

export default MixChorusDepthVolume;
