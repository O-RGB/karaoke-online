import { SynthChannel } from "@/features/engine/modules/instrumentals-node/modules/channel";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import { INodeCallBack } from "@/features/engine/types/node.type";
import { IControllerChange } from "@/features/engine/types/synth.type";
import { channel } from "diagnostics_channel";
import React, { useCallback, useEffect, useState } from "react";
import { BiSolidVolumeMute, BiSolidVolumeFull } from "react-icons/bi";

interface VolumeActionProps {
  channel: number;
  controllerNumber: number;
  onMuted?: (event: IControllerChange<boolean>) => void;
  className?: string;
  disabled?: boolean;
  node: SynthChannel;
}

const VolumeAction: React.FC<VolumeActionProps> = ({
  channel,
  controllerNumber,
  onMuted,
  className,
  disabled,
  node,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    if (node) {
      node.setCallBack(["VOLUME", "MUTE"], channel, (v) => setIsMuted(v.value));
    }
  }, [node]);

  const buttonStyle = `text-center text-white font-bold text-[10px]  
        flex items-center justify-center gap-[2px] rounded-t-md
        duration-300  border-t border-x border-white/20`;

  return (
    <div
      onClick={
        disabled
          ? undefined
          : () => {
              onMuted?.({
                channel,
                controllerNumber,
                controllerValue: !isMuted,
              });
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
      <span>{(node.channel ?? 0) + 1}</span>
    </div>
  );
};

export default VolumeAction;
