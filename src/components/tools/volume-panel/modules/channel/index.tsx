import React, { useEffect } from "react";
import MuteVolumeButton from "./mute-volume-button";
import { MAIN_VOLUME } from "@/features/engine/types/node.type";
import VolumeNodePreset from "../node-preset/volume-node-preset";
import {
  IControllerChange,
  IProgramChange,
} from "@/features/engine/types/synth.type";
import { SynthChannel } from "@/features/engine/modules/instrumentals/channel";
import ChannelLimit from "./limit";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import VolumeNodesPanel from "../node-preset/volume-nodes-panel";

interface ChannelRenderProps {
  channel: number;
  node: SynthChannel;
  isShow?: boolean;
  perset?: IPersetSoundfont[] | undefined;
  onMutedVolume?: (event: IControllerChange<boolean>) => void;
  onChange?: (value: IControllerChange) => void;
  onProgramChange?: (value: IProgramChange) => void;
  onLockChange?: (event: IControllerChange<boolean>) => void;
}

const ChannelRender: React.FC<ChannelRenderProps> = ({
  channel,
  isShow = true,
  perset,
  onMutedVolume,
  onProgramChange,
  onLockChange,
  onChange,
  node,
}) => {
  const instrumental = useSynthesizerEngine(
    (state) => state.engine?.instrumental
  );
  useEffect(() => {}, [isShow, node]);

  if (!node) return <></>;

  return (
    <>
      {channel !== 8 && channel !== 9 && (
        <ChannelLimit
          channel={channel}
          instrumental={instrumental}
          node={node}
        ></ChannelLimit>
      )}
      <MuteVolumeButton
        disabled={isShow}
        controllerNumber={MAIN_VOLUME}
        channel={channel}
        onMuted={onMutedVolume}
        node={node}
      ></MuteVolumeButton>
      <div className="flex items-center justify-center h-full py-1.5 w-full border-x border-white/20">
        <VolumeNodePreset
          node={node}
          vertical={true}
          onLock={onLockChange}
          onChange={onChange}
          controllerNumber={MAIN_VOLUME}
          channel={channel}
          disabled={isShow}
          nodeType={"VOLUME"}
        ></VolumeNodePreset>
      </div>
      <VolumeNodesPanel
        disabled={isShow}
        node={node}
        channel={channel}
        onContrllerChange={onChange}
        onLockChange={onLockChange}
        onProgramChange={onProgramChange}
        perset={perset}
      ></VolumeNodesPanel>
    </>
  );
};

export default ChannelRender;
