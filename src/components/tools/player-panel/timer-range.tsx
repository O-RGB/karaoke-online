import SliderCommon from "@/components/common/input-data/slider";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import React, { useEffect, useId, useState } from "react";

interface TimerBarProps {}

const TimerBar: React.FC<TimerBarProps> = React.memo(({}) => {
  const componnetId = useId();
  const engine = useSynthesizerEngine((state) => state.engine);
  const [sec, setSec] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [tempTiming, setTempTiming] = useState<number>(0);
  const [dragging, setDragging] = useState<boolean>(false);

  const onTimingUpdated = (tick: number) => {
    if (!dragging) {
      setSec(tick);
    }
  };

  const onDurationUpdated = (sec: number) => {
    setDuration(sec);
  };

  const onTimeChange = (value: number) => {
    console.log(value);
    setTempTiming(value);
  };

  const onPressStart = () => {
    setDragging(true);
  };

  const onPressEnd = () => {
    setDragging(false);
    setSec(tempTiming);
    engine?.timer?.seekTimer(tempTiming);
  };

  useEffect(() => {
    if (engine) {
      engine?.secondsUpdated.on(
        ["SECONDS", "CHANGE"],
        0,
        onTimingUpdated,
        componnetId
      );
      engine?.durationUpdated.on(
        ["DURATION", "CHANGE"],
        0,
        onDurationUpdated,
        componnetId
      );
    }

    return () => {
      engine?.secondsUpdated.off(["SECONDS", "CHANGE"], 0, componnetId);
      engine?.durationUpdated.off(["DURATION", "CHANGE"], 0, componnetId);
    };
  }, [engine, dragging]);

  return (
    <div className="w-full flex items-center relative pl-3 px-2">
      <SliderCommon
        tabIndex={-1}
        color="#ffffff"
        value={dragging ? tempTiming : sec}
        min={0}
        max={duration}
        style={{ width: "100%" }}
        onPressStart={onPressStart}
        onPressEnd={onPressEnd}
        onChange={onTimeChange}
      />
    </div>
  );
});

TimerBar.displayName = "TimerBar";

export default TimerBar;
