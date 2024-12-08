import ButtonDropdown from "@/components/common/button/button-dropdown";
import useEventStore from "@/stores/player/event.store";
import { getIconInstruments } from "@/lib/spssasynth/icons-instruments";
import { channel } from "diagnostics_channel";
import React, { useEffect, useMemo, useState } from "react";
import { FaDrum } from "react-icons/fa";
import { PiMicrophoneStageFill } from "react-icons/pi";
import { Menu, MenuButton } from "@szhsin/react-menu";
import Label from "@/components/common/display/label";
import RangeBarClone from "@/components/common/input-data/range-bar-clone";
import MixPanVolume from "./mix-controller/mix-pan-volume";
import MixReverbVolume from "./mix-controller/mix-reverb-volume";
import MixChorusDepthVolume from "./mix-controller/mix-chorus-depth.volume";

interface InstrumentsButtonProps {
  // instrument: number;
  channel: number;
  perset?: IPersetSoundfont[];
  onPersetChange?: (channel: number, value: number) => void;
  onPenChange: (channel: number, value: number) => void;
  onReverbChange: (channel: number, value: number) => void;
  onChorusDepthChange: (channel: number, value: number) => void;
  className?: string;
  disabled?: boolean;
  onMouseUp?: () => void;
  onTouchEnd?: () => void;
}

const InstrumentsButton: React.FC<InstrumentsButtonProps> = ({
  // instrument,
  onPersetChange,
  onPenChange,
  onReverbChange,
  onChorusDepthChange,
  channel,
  perset,
  className,
  disabled,
  onMouseUp,
  onTouchEnd,
}) => {
  const instruments = useEventStore((state) => state.instrument);
  const instrument = instruments[channel];

  const persetOptions = useMemo(
    () =>
      perset?.map((data) => ({
        label: `${data.program} : ${data.presetName}`,
        value: data.program.toString(),
      })),
    [perset]
  );

  const channelIcon = useMemo(() => {
    if (channel === 9) return <FaDrum />;
    if (channel === 8) return <PiMicrophoneStageFill />;
    return getIconInstruments(instrument ?? 0)?.icon;
  }, [channel, instrument]);

  useEffect(() => {}, [instrument]);

  function LabelTag({ name }: { name: string }) {
    return (
      <div className="min-w-16 rounded-md pr-2 flex items-center text-nowrap">
        <Label className="flex justify-between w-full">
          <span className="text-gray-600">{name}</span> <span>:</span>
        </Label>
      </div>
    );
  }

  const fullname = persetOptions
    ? persetOptions.length > 0
      ? persetOptions[instrument ?? 0].label
      : "None"
    : "None";

  return (
    <Menu
      transition
      boundingBoxPadding="10 10 10 10"
      menuButton={(open) => {
        return (
          <MenuButton disabled={disabled}>
            <div
              className={`${
                disabled ? "cursor-auto" : "cursor-pointer"
              } w-full lg:w-9 border-b border-x border-white/20  hover:bg-white/20 duration-300`}
            >
              <div className="w-full blur-overlay text-center text-white font-bold text-[10px] p-1 flex gap-0.5 justify-center items-center h-5">
                <span className="w-2.5">{channelIcon}</span>
                <span className="text-[8px] pb-[1px] font-bold text-white/70">
                  {`${instrument ?? 0}`.padStart(3, "0")}
                </span>
              </div>
            </div>
          </MenuButton>
        );
      }}
    >
      <div className=" px-2 relative z-50 flex flex-col gap-1 min-w-56">
        <div className="flex gap-1">
          <LabelTag name="เสียง"></LabelTag>
          <ButtonDropdown
            className={"w-full"}
            value={`${instrument ?? 0}`}
            onChange={(value) => {
              onPersetChange?.(channel + 1, parseInt(value));
            }}
            options={persetOptions}
          >
            <div className="w-full rounded-md overflow-hidden border border-black/10 cursor-pointer group-hover:bg-gray-200 duration-300">
              <div className="w-full font-bold text-[10px] p-2 flex gap-0.5 justify-between items-center h-6">
                <span className="w-2.5">{channelIcon}</span>
                <span>{fullname}</span>
              </div>
            </div>
          </ButtonDropdown>
        </div>
        <div className="flex gap-1 justify-center items-center">
          <LabelTag name="ซ้ายขวา"></LabelTag>
          <MixPanVolume
            onPenChange={(value) => onPenChange(channel + 1, value)}
            channel={channel}
            disabled={disabled}
            onMouseUp={onMouseUp}
            onTouchEnd={onTouchEnd}
          ></MixPanVolume>
        </div>
        <div className="flex gap-1 justify-center items-center">
          <LabelTag name="เสียงก้อง"></LabelTag>
          <MixReverbVolume
            onReverbChange={(value) => onReverbChange(channel + 1, value)}
            channel={channel}
            disabled={disabled}
            onMouseUp={onMouseUp}
            onTouchEnd={onTouchEnd}
          ></MixReverbVolume>
        </div>
        <div className="flex gap-1 justify-center items-center">
          <LabelTag name="ประสาน"></LabelTag>
          <MixChorusDepthVolume
            onChorusDepthChange={(value) =>
              onChorusDepthChange(channel + 1, value)
            }
            channel={channel}
            disabled={disabled}
            onMouseUp={onMouseUp}
            onTouchEnd={onTouchEnd}
          ></MixChorusDepthVolume>
        </div>
      </div>
    </Menu>
  );
};

export default InstrumentsButton;
