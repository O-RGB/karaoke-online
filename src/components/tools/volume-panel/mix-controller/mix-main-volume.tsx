import RangeBarClone from "@/components/common/input-data/range-bar-clone";
import useMixerStore from "@/stores/mixer-store";
import React from "react";

interface MixMainVolume {
  onMouseUp?: () => void;
  onTouchEnd?: () => void;
  onChange?: (value: number) => void;
  disabled: boolean;
  channel: number;
}

const MixMainVolume: React.FC<MixMainVolume> = ({
  channel,
  disabled,
  onChange,
  onMouseUp,
  onTouchEnd,
}) => {
  const volume = useMixerStore((state) => state.volume[channel]);
  return (
    <RangeBarClone
      value={disabled ? 0 : volume}
      className="z-20"
      disabled={disabled}
      max={127}
      onMouseUp={onMouseUp}
      onTouchEnd={onTouchEnd}
      onChange={onChange}
    ></RangeBarClone>
  );
};

export default MixMainVolume;
