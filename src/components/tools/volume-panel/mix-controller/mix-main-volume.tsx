import RangeBarClone from "@/components/common/input-data/range-bar-clone";
import SliderCommon from "@/components/common/input-data/slider";
import useMixerStoreNew from "@/stores/player/event-player/modules/event-mixer-store";
import React, { useEffect } from "react";

interface MixMainVolume {
  onChange?: (value: number) => void;
  disabled?: boolean;
  channel: number;
  vertical?: boolean;
}

const MixMainVolume: React.FC<MixMainVolume> = ({
  channel,
  onChange,
  disabled = false,
  vertical = true,
}) => {
  const volume = useMixerStoreNew((state) => state.volumes[channel]);

  useEffect(() => {}, [volume]);
  return (
    <SliderCommon
      vertical={vertical}
      value={volume}
      className="z-20"
      disabled={disabled}
      max={127}
      onChange={onChange}
    ></SliderCommon>
  );
};

export default MixMainVolume;
