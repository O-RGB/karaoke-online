import { SynthChannel } from "@/features/engine/modules/instrumentals/channel";
import React, { useEffect } from "react";
import ChannelRender from "../modules/channel";
import {
  IControllerChange,
  IProgramChange,
} from "@/features/engine/types/synth.type";

interface VolumeGainRenderProps {
  nodes?: SynthChannel[];
  hide: boolean;
  perset?: IPersetSoundfont[] | undefined;
  grid?: string;
  hideElement?: string;
  animation?: string;
  onLockChange: (event: IControllerChange<boolean>) => void;
  onMutedVolume: (event: IControllerChange<boolean>) => void;
  onPersetChange: (value: IProgramChange) => void;
  onControllerChange: (value: IControllerChange) => void;
}

const VolumeGainRender: React.FC<VolumeGainRenderProps> = ({
  nodes,
  perset,
  hide,
  grid,
  animation,
  hideElement,
  onControllerChange,
  onLockChange,
  onMutedVolume,
  onPersetChange,
}) => {
  useEffect(() => {}, [hide, nodes]);

  if (!hide && !nodes) return <></>;

  return (
    <>
      {/* <div
        className={`${grid} ${hideElement} ${animation} w-full gap-y-9 lg:gap-y-0 gap-0.5 absolute -top-[3px] left-0 py-[26px] p-2`}
      >
          {nodes?.map((data, ch) => {
          return (
            <div key={`gain-render-${ch}`} className="relative w-full">
              <ChannelVolumeRender
                channel={ch}
                max={127}
                className="z-10 w-full absolute bottom-0 left-0 h-full"
              ></ChannelVolumeRender>
            </div>
          );
        })}  
        {nodes?.map((data, ch) => {
          return (
            <div key={`gain-render-${ch}`} className="relative w-full">
              {new Array(127).fill(0).map((s) => {
                return <>t</>;
              })}
            </div>
          );
        })}
      </div> */}
      <div
        className={`${grid} ${hideElement} ${animation} ${
          hide ?? "pointer-events-none !cursor-none"
        } w-full gap-0.5 h-full`}
      >
        {nodes?.map((_, ch) => {
          return (
            <div
              key={`vol-panel-${ch}`}
              className="flex flex-col relative h-full"
            >
              <ChannelRender
                node={_}
                onLockChange={onLockChange}
                onMutedVolume={onMutedVolume}
                isShow={hide}
                channel={ch}
                onProgramChange={onPersetChange}
                onChange={onControllerChange}
                perset={perset}
              ></ChannelRender>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default VolumeGainRender;
