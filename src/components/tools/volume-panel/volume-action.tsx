import { useSynthesizerEngine } from "@/features/engine/synth-store";
import { INodeCallBack } from "@/features/engine/types/node.type";
import { channel } from "diagnostics_channel";
import React, { useCallback, useEffect, useState } from "react";
import { BiSolidVolumeMute, BiSolidVolumeFull } from "react-icons/bi";

interface VolumeActionProps {
  channel: number;
  onMuted?: (channel: number, muted: boolean) => void;
  className?: string;
  disabled?: boolean;
}

const VolumeAction: React.FC<VolumeActionProps> = ({
  channel,
  onMuted,
  className,
  disabled,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const onMutedVolume = (value: INodeCallBack) => {
    setIsMuted(value.value);
  };

  const controllerItem = useSynthesizerEngine(
    (state) => state.engine?.controllerItem
  );

  useEffect(() => {
    if (controllerItem) {
      controllerItem.addEventCallBack("VOLUME", "MUTE", channel, onMutedVolume);
    }
  }, [controllerItem]);

  const buttonStyle = `text-center text-white font-bold text-[10px]  
        flex items-center justify-center gap-[2px] rounded-t-md
        duration-300  border-t border-x border-white/20`;

  return (
    <div
      onClick={
        disabled
          ? undefined
          : () => {
              onMuted?.(channel, !isMuted);
            }
      }
      className={`${className} ${buttonStyle} ${
        disabled
          ? "cursor-auto"
          : `${
              isMuted ? "bg-red-500 hover:bg-red-500/50" : "hover:bg-white/30"
            } cursor-pointer`
      } `}
    >
      <span className=" ">
        {isMuted ? <BiSolidVolumeMute /> : <BiSolidVolumeFull />}
      </span>
      <span>{channel + 1}</span>
    </div>
  );
};

export default VolumeAction;
