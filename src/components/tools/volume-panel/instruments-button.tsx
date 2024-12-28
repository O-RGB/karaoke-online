import ButtonDropdown from "@/components/common/button/button-dropdown";
import { getIconInstruments } from "@/lib/spssasynth/icons-instruments";
import React, { useEffect, useMemo, useState } from "react";
import { FaDrum, FaUnlock } from "react-icons/fa";
import { PiMicrophoneStageFill } from "react-icons/pi";
import { Menu, MenuButton } from "@szhsin/react-menu";
import Label from "@/components/common/display/label";
import { useSynthesizerEngine } from "@/stores/engine/synth-store";
import Button from "@/components/common/button/button";
import MixNodeController from "./mix-controller/node-controller";
import {
  CHORUSDEPTH,
  INodeCallBack,
  MAIN_VOLUME,
  PAN,
  REVERB,
} from "@/stores/engine/types/node.type";
import {
  IControllerChange,
  ILockController,
  IProgramChange,
} from "@/stores/engine/types/synth.type";
import { DataConnection } from "peerjs";
import { RemoteSendMessage } from "@/stores/remote/types/remote.type";

interface InstrumentsButtonProps {
  channel: number;
  perset?: IPersetSoundfont[];
  volRender?: React.ReactNode;
  disabled?: boolean;
  onContrllerChange?: (value: IControllerChange) => void;
  onProgramChange?: (value: IProgramChange) => void;
  onLockChange?: (value: ILockController) => void;
}

const InstrumentsButton: React.FC<InstrumentsButtonProps> = ({
  onContrllerChange,
  onProgramChange,
  onLockChange,
  channel,
  perset,
  disabled,
}) => {
  const bassLocked = useSynthesizerEngine((state) => state.engine?.bassLocked);
  const bassDetect = useSynthesizerEngine((state) => state.engine?.bassDetect);

  const controllerItem = useSynthesizerEngine(
    (state) => state.engine?.controllerItem
  );

  const [program, setProgram] = useState<number>(0);

  const onValueChange = (event: INodeCallBack) => {
    setProgram(event.value);
  };

  useEffect(() => {
    if (controllerItem) {
      controllerItem.addEventCallBack(
        "VOLUME",
        "PROGARM",
        channel,
        onValueChange
      );
    }
  }, [controllerItem]);

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
    return getIconInstruments(program ?? 0)?.icon;
  }, [channel, program]);

  useEffect(() => {}, [program, bassLocked, bassDetect]);

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
      ? persetOptions[program ?? 0].label
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
                  {`${program ?? 0}`.padStart(3, "0")}
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
        <MixNodeController
          vertical={false}
          onLock={onLockChange}
          onChange={onContrllerChange}
          controllerNumber={MAIN_VOLUME}
          channel={channel}
          disabled={disabled}
          nodeType={"VOLUME"}
          label="ระดับเสียง"
        ></MixNodeController>
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
            value={`${program ?? 0}`}
            onChange={(value) => {
              onProgramChange?.({
                channel: channel,
                program: parseInt(value),
              });
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
        <MixNodeController
          onLock={onLockChange}
          onChange={onContrllerChange}
          controllerNumber={PAN}
          channel={channel}
          disabled={disabled}
          nodeType={"PAN"}
          label="ซ้ายขวา"
        ></MixNodeController>
        <MixNodeController
          onLock={onLockChange}
          onChange={onContrllerChange}
          controllerNumber={REVERB}
          channel={channel}
          disabled={disabled}
          nodeType={"REVERB"}
          label="เสียงก้อง"
        ></MixNodeController>
        <MixNodeController
          onLock={onLockChange}
          onChange={onContrllerChange}
          controllerNumber={CHORUSDEPTH}
          channel={channel}
          disabled={disabled}
          nodeType={"CHORUSDEPTH"}
          label="ประสาน"
        ></MixNodeController>
      </div>
    </Menu>
  );
};

export default InstrumentsButton;
