import React, { useEffect, useState } from "react";
import InstrumentsButton from "../instruments-button";
import VolumeAction from "../volume-action";
import { IChannelEvent } from "../types/channel-type";
import { useSynthesizerEngine } from "@/stores/engine/synth-store";
import {
  INodeCallBack,
  MAIN_VOLUME,
} from "@/stores/player/event-player/types/node.type";
import SliderCommon from "@/components/common/input-data/slider";
import MixNodeController from "../mix-controller/node-controller";
import {
  IControllerChange,
  ILockController,
  IProgramChange,
} from "@/stores/engine/types/synth.type";

interface ChannelRenderProps {
  isShow: boolean;
  channel: number;
  perset?: IPersetSoundfont[] | undefined;
  onMutedVolume?: (channel: number, muted: boolean) => void;
  onChange?: (value: IControllerChange) => void;
  onProgramChange?: (value: IProgramChange) => void;
  onLockChange?: (value: ILockController) => void;
}

const ChannelRender: React.FC<ChannelRenderProps> = ({
  isShow = true,
  channel,
  perset,
  onMutedVolume,
  onProgramChange,
  onLockChange,
  onChange,
}) => {
  useEffect(() => {}, [isShow]);

  return (
    <>
      <VolumeAction
        disabled={isShow}
        channel={channel}
        onMuted={onMutedVolume}
      ></VolumeAction>
      <div className="flex items-center justify-center h-full py-1.5 w-full border-x border-white/20">
        <MixNodeController
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
