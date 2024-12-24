import ButtonDropdown from "@/components/common/button/button-dropdown";
import { getIconInstruments } from "@/lib/spssasynth/icons-instruments";
import React, { useEffect, useMemo } from "react";
import { FaDrum, FaLock, FaUnlock } from "react-icons/fa";
import { PiMicrophoneStageFill } from "react-icons/pi";
import { Menu, MenuButton } from "@szhsin/react-menu";
import Label from "@/components/common/display/label";
import MixPanVolume from "./mix-controller/mix-pan-volume";
import MixReverbVolume from "./mix-controller/mix-reverb-volume";
import MixChorusDepthVolume from "./mix-controller/mix-chorus-depth.volume";
import useMixerStoreNew from "@/stores/player/event-player/modules/event-mixer-store";
import { useSynthesizerEngine } from "@/stores/engine/synth-store";
import Button from "@/components/common/button/button";
import MixMainVolume from "./mix-controller/mix-main-volume";

interface InstrumentsButtonProps {
  channel: number;
  perset?: IPersetSoundfont[];
  // onMainChange?: (channel: number, value: number) => void;
  onMainlock?: (channel: number, isLocked: boolean) => void;

  volRender?: React.ReactNode;
  onPersetChange?: (channel: number, value: number) => void;
  onPresetlock?: (channel: number, isLocked: boolean) => void;
  onPenChange: (channel: number, value: number) => void;
  onPenlock?: (channel: number, isLocked: boolean) => void;
  onReverbChange: (channel: number, value: number) => void;
  onReverblock?: (channel: number, isLocked: boolean) => void;
  onChorusDepthChange: (channel: number, value: number) => void;
  onChorusDepthlock?: (channel: number, isLocked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

const InstrumentsButton: React.FC<InstrumentsButtonProps> = ({
  // onMainChange,
  onMainlock,
  volRender,
  onPersetChange,
  onPresetlock,
  onPenChange,
  onPenlock,
  onReverbChange,
  onReverblock,
  onChorusDepthChange,
  onChorusDepthlock,
  channel,
  perset,
  className,
  disabled,
}) => {
  const programList = useMixerStoreNew((state) => state.programList);
  const instrument = programList[channel];
  const bassLocked = useSynthesizerEngine((state) => state.engine?.bassLocked);
  const bassDetect = useSynthesizerEngine((state) => state.engine?.bassDetect);
  const volLock = useMixerStoreNew((state) => state.volLocked[channel]);

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

  useEffect(() => {}, [instrument, bassLocked, bassDetect]);

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

  const bassIsLocked: boolean = bassLocked
    ? bassDetect?.channel === channel
    : false;

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
      <div className=" px-2 relative z-50 flex flex-col gap-1 min-w-60">
        <div className="text-xs w-full pb-2 border-b">Channel {channel}</div>
        <div className="flex gap-1 justify-center items-center">
          <LabelTag name="ความดัง"></LabelTag>
          <div className="pr-0.5">
            <Button
              onClick={() => onMainlock?.(channel, !volLock)}
              icon={
                volLock ? (
                  <FaLock className="text-[8px] text-red-500"></FaLock>
                ) : (
                  <FaUnlock className="text-[8px] text-gray-500"></FaUnlock>
                )
              }
              className="!p-1.5 shadow-none border-none"
            ></Button>
          </div>
          {volRender}
          {/* <MixMainVolume
            channel={channel}
            vertical={false}
            onChange={(v) => onMainChange?.(channel, v)}
          ></MixMainVolume> */}
        </div>
        <div className="flex gap-1">
          <LabelTag name="เสียง"></LabelTag>
          <div className="pr-0.5">
            <Button
              icon={<FaUnlock className="text-[8px] text-gray-500"></FaUnlock>}
              className="!p-1.5 shadow-none border-none"
            ></Button>
          </div>
          <ButtonDropdown
            disabled={bassIsLocked}
            className={"w-full"}
            value={`${instrument ?? 0}`}
            onChange={(value) => {
              onPersetChange?.(channel + 1, parseInt(value));
            }}
            options={persetOptions}
          >
            <div
              className={`${
                bassIsLocked ? "bg-yellow-400 text-red-600" : ""
              } w-full rounded-md overflow-hidden border border-black/10 cursor-pointer group-hover:bg-gray-200 duration-300`}
            >
              <div className="w-full font-bold text-[10px] p-2 flex gap-0.5 justify-between items-center h-6">
                <div className="flex gap-2 items-center">
                  <span>
                    {bassIsLocked ? <FaUnlock className=""></FaUnlock> : <></>}
                  </span>
                  <span>{channelIcon}</span>
                </div>
                <span>{fullname}</span>
              </div>
            </div>
          </ButtonDropdown>
        </div>
        <div className="flex gap-1 justify-center items-center">
          <LabelTag name="ซ้ายขวา"></LabelTag>
          <div className="pr-0.5">
            <Button
              icon={<FaUnlock className="text-[8px] text-gray-500"></FaUnlock>}
              className="!p-1.5 shadow-none border-none"
            ></Button>
          </div>
          <MixPanVolume
            onPenChange={(value) => onPenChange(channel + 1, value)}
            channel={channel}
            disabled={disabled}
          ></MixPanVolume>
        </div>
        <div className="flex gap-1 justify-center items-center">
          <LabelTag name="เสียงก้อง"></LabelTag>
          <div className="pr-0.5">
            <Button
              icon={<FaUnlock className="text-[8px] text-gray-500"></FaUnlock>}
              className="!p-1.5 shadow-none border-none"
            ></Button>
          </div>
          <MixReverbVolume
            onReverbChange={(value) => onReverbChange(channel + 1, value)}
            channel={channel}
            disabled={disabled}
          ></MixReverbVolume>
        </div>
        <div className="flex gap-1 justify-center items-center">
          <LabelTag name="ประสาน"></LabelTag>
          <div className="pr-0.5">
            <Button
              icon={<FaUnlock className="text-[8px] text-gray-500"></FaUnlock>}
              className="!p-1.5 shadow-none border-none"
            ></Button>
          </div>
          <MixChorusDepthVolume
            onChorusDepthChange={(value) =>
              onChorusDepthChange(channel + 1, value)
            }
            channel={channel}
            disabled={disabled}
          ></MixChorusDepthVolume>
        </div>
      </div>
    </Menu>
  );
};

export default InstrumentsButton;
