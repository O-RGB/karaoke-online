import ButtonDropdown from "@/components/common/button/button-dropdown";
import { getIconInstruments } from "@/lib/spssasynth/icons-instruments";
import { channel } from "diagnostics_channel";
import React, { useEffect, useMemo } from "react";
import { FaDrum } from "react-icons/fa";
import { PiMicrophoneStageFill } from "react-icons/pi";

interface InstrumentsButtonProps {
  instrument: number;
  channel: number;
  perset?: IPersetSoundfont[];
  onPersetChange?: (channel: number, value: number) => void;
  className?: string;
}

const InstrumentsButton: React.FC<InstrumentsButtonProps> = ({
  instrument,
  onPersetChange,
  channel,
  perset,
  className,
}) => {
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
    return getIconInstruments(instrument ?? 0)?.icon;
  }, [channel, instrument]);

  return (
    <>
      <ButtonDropdown
        className={className}
        value={`${instrument ?? 0}`}
        onChange={(value) => {
          onPersetChange?.(channel, parseInt(value));
        }}
        options={persetOptions}
      >
        <div className="w-full border-b border-x border-white/20 cursor-pointer group-hover:bg-white/20 duration-300">
          <div className="w-full blur-overlay text-center text-white font-bold text-[10px] p-1 flex gap-0.5 justify-center items-center h-5">
            <span className="w-2.5">{channelIcon}</span>
            <span className="text-[8px] pb-[1px] font-bold text-white/70">
              {`${instrument ?? 0}`.padStart(3, "0")}
            </span>
          </div>
        </div>
      </ButtonDropdown>
    </>
  );
};

export default InstrumentsButton;
