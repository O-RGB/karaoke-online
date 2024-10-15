import RangeBarClone from "@/components/common/input-data/range-bar-clone";
import useVolumeStore from "@/stores/volume-store";
import React from "react";

interface MixMainVolume {
  onMouseUp?: () => void;
  onTouchEnd?: () => void;
  onChange?: (value: number) => void;
  hideVolume: boolean;
  channel: number;
}

const MixMainVolume: React.FC<MixMainVolume> = ({
  channel,
  hideVolume,
  onChange,
  onMouseUp,
  onTouchEnd,
}) => {
  const volume = useVolumeStore((state) => state.volume[channel]);
  return (
    <RangeBarClone
      value={hideVolume ? 0 : volume}
      className="z-20"
      disabled={hideVolume}
      max={127}
      onMouseUp={onMouseUp}
      onTouchEnd={onTouchEnd}
      onChange={onChange}
    ></RangeBarClone>
  );
};

export default MixMainVolume;
