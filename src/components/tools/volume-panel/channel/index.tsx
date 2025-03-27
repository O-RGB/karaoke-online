import React, { useEffect } from "react";
import InstrumentsButton from "../instruments-button";
import VolumeAction from "../volume-action";
import { MAIN_VOLUME } from "@/features/engine/types/node.type";
import MixNodeController from "../mix-controller/node-controller";
import {
  IControllerChange,
  ILockController,
  IProgramChange,
} from "@/features/engine/types/synth.type";
import { SynthChannel } from "@/features/engine/modules/instrumentals-node/modules/channel";

interface ChannelRenderProps {
  isShow: boolean;
  channel: number;
  perset?: IPersetSoundfont[] | undefined;
  onMutedVolume?: (event: IControllerChange<boolean>) => void;
  onChange?: (value: IControllerChange) => void;
  onProgramChange?: (value: IProgramChange) => void;
  onLockChange?: (event: IControllerChange<boolean>) => void;
  node: SynthChannel;
}

const ChannelRender: React.FC<ChannelRenderProps> = ({
  isShow = true,
  channel,
  perset,
  onMutedVolume,
  onProgramChange,
  onLockChange,
  onChange,
  node,
}) => {
  useEffect(() => {}, [isShow, node]);

  if (!node) return <></>;

  return (
    <>
      <VolumeAction
        disabled={isShow}
        controllerNumber={MAIN_VOLUME}
        channel={channel}
        onMuted={onMutedVolume}
        node={node}
      ></VolumeAction>
      <div className="flex items-center justify-center h-full py-1.5 w-full border-x border-white/20">
        <MixNodeController
          node={node}
          vertical={true}
          onLock={onLockChange}
          onChange={onChange}
          controllerNumber={MAIN_VOLUME}
          channel={channel}
          disabled={isShow}
          nodeType={"VOLUME"}
        ></MixNodeController>
      </div>
      <InstrumentsButton
        disabled={isShow}
        node={node}
        channel={channel}
        onContrllerChange={onChange}
        onLockChange={onLockChange}
        onProgramChange={onProgramChange}
        perset={perset}
      ></InstrumentsButton>
    </>
  );
};

export default ChannelRender;
