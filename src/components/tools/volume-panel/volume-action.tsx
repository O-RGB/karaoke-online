import { channel } from "diagnostics_channel";
import React, { useCallback } from "react";
import { BiSolidVolumeMute, BiSolidVolumeFull } from "react-icons/bi";

interface VolumeActionProps {
  channel: number;
  isLock: boolean;
  onLock?: (channel: number) => void;
  onUnLock?: (channel: number) => void;
}

const VolumeAction: React.FC<VolumeActionProps> = ({
  channel,
  isLock,
  onLock,
  onUnLock,
}) => {
  const onLockVolume = useCallback(() => {
    onLock?.(channel);
  }, [onLock, channel]);

  return (
    <div
      onClick={onLockVolume}
      className={`
        ${isLock ? "bg-red-500 hover:bg-red-500/50" : "hover:bg-white/30"} 
        w-full text-center text-white font-bold text-[10px] 
        flex items-center justify-center gap-[2px] rounded-t-md
        duration-300 cursor-pointer border-t border-x border-white/20`}
    >
      <span className="pt-0.5">
        {isLock ? <BiSolidVolumeMute /> : <BiSolidVolumeFull />}
      </span>
      <span>{channel}</span>
    </div>
  );
};

export default VolumeAction;
