import RangeBarClone from "@/components/common/input-data/range-bar-clone";
import useMixerStore from "@/stores/mixer-store";
import React from "react";

interface MixChorusDepthVolumeProps {
  disabled?: boolean;
  channel: number;
  onChorusDepthChange: (channel: number) => void;
  onMouseUp?: () => void;
  onTouchEnd?: () => void;
}

const MixChorusDepthVolume: React.FC<MixChorusDepthVolumeProps> = ({
  disabled,
  channel,
  onChorusDepthChange,
  onMouseUp,
  onTouchEnd,
}) => {
  const chorusDepth = useMixerStore((state) => state.chorusDepth[channel]);
  return (
    <>
      <RangeBarClone
        disabled={disabled}
        value={disabled ? 0 : chorusDepth}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}
        onChange={onChorusDepthChange}
        className="z-20"
        max={127}
        orientation="horizontal"
      ></RangeBarClone>
    </>
  );
};

export default MixChorusDepthVolume;
