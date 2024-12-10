import RangeBarClone from "@/components/common/input-data/range-bar-clone";
import useMixerStoreNew from "@/stores/player/event-player/modules/event-mixer-store";
import React, { useEffect } from "react";

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
  const volume = useMixerStoreNew((state) => state.volumes[channel]);

  if (channel === 3) {
    console.log(volume);
  }

  useEffect(() => {}, [volume]);
  return (
    <RangeBarClone
      value={volume}
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
