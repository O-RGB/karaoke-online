import {
  CHORUSDEPTH,
  MAIN_VOLUME,
  PAN,
  REVERB,
} from "@/features/engine/types/node.type";
import {
  IControllerChange,
  IProgramChange,
} from "@/features/engine/types/synth.type";
import ButtonDropdown from "@/components/common/button/button-dropdown";
import Label from "@/components/common/display/label";
import Button from "@/components/common/button/button";
import VolumeNodePreset from "./volume-node-preset";
import React, { useCallback, useEffect, useId, useMemo, useState } from "react";
import { getIconInstruments } from "@/lib/spssasynth/icons-instruments";
import { FaDrum, FaUnlock } from "react-icons/fa";
import { PiMicrophoneStageFill } from "react-icons/pi";
import { Menu, MenuButton } from "@szhsin/react-menu";
import { SynthChannel } from "@/features/engine/modules/instrumentals/channel";
import { TEventType } from "@/features/engine/modules/instrumentals/types/node.type";

interface VolumeNodesPanelProps {
  channel: number;
  perset?: IPersetSoundfont[];
  volRender?: React.ReactNode;
  disabled?: boolean;
  node?: SynthChannel;
  onContrllerChange?: (value: IControllerChange) => void;
  onProgramChange?: (value: IProgramChange) => void;
  onLockChange?: (event: IControllerChange<boolean>) => void;
}

const VolumeNodesPanel: React.FC<VolumeNodesPanelProps> = ({
  onContrllerChange,
  onProgramChange,
  onLockChange,
  channel,
  perset = [],
  disabled,
  node,
}) => {
  const componentId = useId();

  const [programOption, setProgramOptions] = useState<IOptions[]>([]);
  const [programSelected, setProgramSelected] = useState<IOptions>();

  const getPreset = useCallback(() => {
    let mappingPerset = perset;
    if (channel === 9) {
      mappingPerset = perset.filter((v) => v.bank === 128);
    }
    const programOptions = mappingPerset.map((data) => ({
      label: `${data.program} : ${data.presetName}`,
      value: data.program.toString(),
    }));
    return programOptions;
  }, [perset, channel]);

  const onValueChange = (event: TEventType<number>) => {
    const search = programOption.find((v) => v.value === `${event.value}`);
    setProgramSelected(search);
  };

  const channelIcon = useMemo(() => {
    if (channel === 9) return <FaDrum />;
    if (channel === 8) return <PiMicrophoneStageFill />;
    return getIconInstruments(Number(programSelected?.value ?? 0))?.icon;
  }, [channel, programSelected?.value]);

  function LabelTag({ name }: { name: string }) {
    return (
      <div className="min-w-16 rounded-md pr-2 flex items-center text-nowrap">
        <Label className="flex justify-between w-full">
          <span className="text-gray-600">{name}</span> <span>:</span>
        </Label>
      </div>
    );
  }

  useEffect(() => {
    if (node) {
      node.program?.linkEvent(
        ["PROGARM", "CHANGE"],
        onValueChange,
        componentId
      );
    }

    return () => {
      node?.program?.unlinkEvent(["PROGARM", "CHANGE"], componentId);
    };
  }, [node, programOption]);

  useEffect(() => {
    setProgramOptions(getPreset());
  }, [node?.program, perset, channel, getPreset]);

  if (!node) return <></>;

  return (
    <Menu
      transition
      boundingBoxPadding="10 10 10 10"
      menuButton={(open) => {
        return (
          <MenuButton disabled={disabled}>
            <div
              className={`${disabled ? "cursor-auto" : "cursor-pointer"
                } w-full lg:w-9 border-b border-x border-white/20  hover:bg-white/20 duration-300`}
            >
              <div className="w-full blur-overlay text-center text-white font-bold text-[10px] p-1 flex gap-0.5 justify-center items-center h-5">
                <span className="w-2.5">{channelIcon}</span>
                <span className="text-[8px] pb-[1px] font-bold text-white/70">
                  {`${programSelected?.value ?? 0}`.padStart(3, "0")}
                </span>
              </div>
            </div>
          </MenuButton>
        );
      }}
    >
      <div className=" px-2 relative z-50 flex flex-col gap-1 min-w-60">
        <div className="text-xs w-full pb-2 border-b">
          Channel {channel + 1}
        </div>

        <VolumeNodePreset
          synthNode={node.volume}
          vertical={false}
          onLock={onLockChange}
          onChange={onContrllerChange}
          controllerNumber={MAIN_VOLUME}
          channel={channel}
          disabled={disabled}
          nodeType={"VOLUME"}
          label="ระดับเสียง"
        ></VolumeNodePreset>

        <div className="flex gap-1">
          <LabelTag name="เสียง"></LabelTag>
          <div className="pr-0.5">
            <Button
              icon={<FaUnlock className="text-[8px] text-gray-500"></FaUnlock>}
              className="!p-1.5 shadow-none border-none"
            ></Button>
          </div>

          <ButtonDropdown
            className={"w-full"}
            value={programSelected?.value}
            onChange={(value) => {
              onProgramChange?.({
                channel: channel,
                program: parseInt(value),
              });
            }}
            options={programOption}
          >
            <div
              className={`${false ? "bg-yellow-400 text-red-600" : ""
                } w-full rounded-md overflow-hidden border border-black/10 cursor-pointer group-hover:bg-gray-200 duration-300`}
            >
              <div className="w-full font-bold text-[10px] p-2 flex gap-0.5 justify-between items-center h-6">
                <div className="flex gap-2 items-center">
                  <span>
                    {false ? <FaUnlock className=""></FaUnlock> : <></>}
                  </span>
                  <span>{channelIcon}</span>
                </div>
                <span>{programSelected?.label}</span>
              </div>
            </div>
          </ButtonDropdown>
        </div>
        <VolumeNodePreset
          synthNode={node.pan}
          onLock={onLockChange}
          onChange={onContrllerChange}
          controllerNumber={PAN}
          channel={channel}
          disabled={disabled}
          nodeType={"PAN"}
          label="ซ้ายขวา"
        ></VolumeNodePreset>
        <VolumeNodePreset
          synthNode={node.reverb}
          onLock={onLockChange}
          onChange={onContrllerChange}
          controllerNumber={REVERB}
          channel={channel}
          disabled={disabled}
          nodeType={"REVERB"}
          label="เสียงก้อง"
        ></VolumeNodePreset>
        <VolumeNodePreset
          synthNode={node.chorus}
          onLock={onLockChange}
          onChange={onContrllerChange}
          controllerNumber={CHORUSDEPTH}
          channel={channel}
          disabled={disabled}
          nodeType={"CHORUS"}
          label="ประสาน"
        ></VolumeNodePreset>
      </div>
    </Menu>
  );
};

export default VolumeNodesPanel;
