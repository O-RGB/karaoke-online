import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
} from "react";
import RangeBar from "../input-data/range-bar";
import { getIconInstruments } from "@/lib/spssasynth/icons-instruments";
import { FaDrum } from "react-icons/fa";
import { PiMicrophoneStageFill } from "react-icons/pi";
import { BiSolidVolumeFull, BiSolidVolumeMute } from "react-icons/bi";
import ButtonDropdown from "../button/button-dropdown";

interface VolumeMeterProps {
  value?: number;
  height: string;
  level: number;
  channel: number;
  instruments: number;
  isLock: boolean;
  perset?: IPersetSoundfont[];
  onChange?: (channel: number, value: number) => void;
  onLock?: (channel: number) => void;
  onUnLock?: (channel: number) => void;
  onMouseUp?: () => void;
  onTouchEnd?: () => void;
  onPersetChange?: (channel: number, value: number) => void;
}

const VolumeMeter: React.FC<VolumeMeterProps> = ({
  value = 100,
  height = "6rem",
  level,
  channel,
  instruments,
  isLock,
  perset,
  onChange,
  onLock,
  onUnLock,
  onMouseUp,
  onTouchEnd,
  onPersetChange,
}) => {
  const maxLevel = 100;

  const [filledBars, setFilledBars] = useState<number>(0);
  const [volume, setVolume] = useState<number>(value);

  const onVolumeMeterChange = useCallback(
    (newValue: number = 0) => {
      onChange?.(channel - 1, newValue);
      setVolume(newValue);
    },
    [onChange, channel]
  );

  const onLockVolume = useCallback(() => {
    onLock?.(channel);
  }, [onLock, channel]);

  // useEffect(() => {
  //   setFilledBars(Math.round((level / 150) * maxLevel));
  // }, [level]);

  useEffect(() => {
    setVolume(value);
  }, [value]);

  const persetOptions = useMemo(
    () =>
      perset?.map((data) => ({
        label: `${data.program} : ${data.presetName}`,
        value: data.program.toString(),
      })),
    [perset]
  );

  const channelIcon = useMemo(() => {
    if (channel === 10) return <FaDrum />;
    if (channel === 9) return <PiMicrophoneStageFill />;
    return getIconInstruments(instruments ?? 0)?.icon;
  }, [channel, instruments]);

  return (
    <>

      <div
        className="absolute z-10 left-0 bottom-0 w-full bg-white/50 duration-75 transition-all"
        style={{
          height: isLock ? "" : `${level}%`,
        }}
      />
    </>
  );

  return (
    <div className="flex flex-col items-center justify-center w-full lg:w-[34px]">
      {/* <div
        onClick={onLockVolume}
        className={`${
          isLock ? "bg-red-500 hover:bg-red-500/50" : "hover:bg-white/30"
        } w-full text-center text-white font-bold text-[10px] flex items-center justify-center gap-[2px] rounded-t-md duration-300 cursor-pointer border-t border-x border-white/20`}
      >
        <span className="pt-0.5">
          {isLock ? <BiSolidVolumeMute /> : <BiSolidVolumeFull />}
        </span>
        <span>{channel}</span>
      </div> */}
      <div className="relative w-full lg:max-w-20">
        <div
          style={{ height }}
          className="relative flex gap-1 p-1 w-full justify-center"
        >
          {/* <div
            style={{ height }}
            className="absolute z-20 left-0 bottom-0 w-full grid opacity-30 overflow-hidden"
          >
            <div className="bg-white/90 w-full"></div>
            <div className="bg-white/60 w-full"></div>
            <div className="bg-white/30 w-full"></div>
          </div> */}
          <div
            className="absolute z-10 left-0 bottom-0 w-full bg-white/50 duration-75 transition-all"
            style={{
              height: isLock ? "" : `${level}%`,
            }}
          />
          {/* <div className="relative z-20 flex items-center justify-center h-full lg:w-7">
            <RangeBar
              value={volume}
              max={127}
              min={0}
              onRangeChange={onVolumeMeterChange}
              inputProps={{
                tabIndex: -1,
                disabled: isLock,
                onMouseUp,
                onTouchEnd,
              }}
            />
          </div> */}
        </div>
      </div>
      {/* <ButtonDropdown
        value={`${instruments ?? 0}`}
        onChange={(value) => {
          onPersetChange?.(channel, parseInt(value));
        }}
        options={persetOptions}
      >
        <div className="w-full lg:min-w-7 border-b border-x border-white/20 cursor-pointer group-hover:bg-white/20 duration-300">
          <div className="w-full blur-overlay text-center text-white font-bold text-[10px] p-1 flex gap-0.5 justify-center items-center h-5">
            <span>{channelIcon}</span>
            <span className="text-[8px] pb-[1px] font-bold text-white/70">
              {`${instruments ?? 0}`.padStart(3, "0")}
            </span>
          </div>
        </div>
      </ButtonDropdown> */}
    </div>
  );
};

export default React.memo(VolumeMeter);
