import React, { useEffect, useId, useState } from "react";
import { MAIN_VOLUME } from "@/features/engine/types/node.type";
import { SynthChannel } from "@/features/engine/modules/instrumentals/channel";
import {
  IControllerChange,
  IProgramChange,
} from "@/features/engine/types/synth.type";
import MuteVolumeButton from "./mute-volume-button";
import VolumeNodePreset from "../node-preset/volume-node-preset";
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
  const componnetId = useId();

  const [active, setActive] = useState<boolean>(false);

  useEffect(() => {
    node.isActive?.on(
      ["ACTIVE", "CHANGE"],
      (event) => {
        const value = event.value;
        setActive(value);
      },
      componnetId
    );

    return () => {
      node.isActive?.off(["ACTIVE", "CHANGE"], componnetId);
    };
  }, [isShow, node]);

  if (!node) return <></>;

  return (
    <>
      <MuteVolumeButton
        disabled={isShow}
        controllerNumber={MAIN_VOLUME}
        channel={channel}
        onMuted={onMutedVolume}
        node={node}
      ></MuteVolumeButton>
      <div
        style={{
          opacity: active ? 1 : 0.2,
        }}
        className="flex items-center justify-center h-full py-1.5 w-full border-x border-white/20 opacity-30 hover:opacity-100 z-20 duration-300"
      >
        <VolumeNodePreset
          synthNode={node.volume}
          vertical={true}
          onLock={onLockChange}
          onChange={onChange}
          controllerNumber={MAIN_VOLUME}
          channel={channel}
          disabled={isShow}
          nodeType={"VOLUME"}
          className=""
        ></VolumeNodePreset>
      </div>
      <VolumeNodesPanel
        disabled={!active || isShow}
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

// เพิ่ม React.memo ที่นี่ เพื่อป้องกันการ Re-render หาก Props ไม่เปลี่ยน
export default React.memo(ChannelRender);
