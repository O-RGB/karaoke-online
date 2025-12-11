import SliderCommon from "@/components/common/input-data/slider";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import React, { useEffect, useId, useState } from "react";

interface TimerBarProps {}

const TimerBar: React.FC<TimerBarProps> = ({}) => {
  const componnetId = useId();
  const engine = useSynthesizerEngine((state) => state.engine);
  const musicQuere = useSynthesizerEngine(
    (state) => state.engine?.player?.musicQuere
  );

  const [timing, setTiming] = useState<number>(0);
  const [tempTiming, setTempTiming] = useState<number>(0);
  const [dragging, setDragging] = useState<boolean>(false);

  const onTimingUpdated = (tick: number) => {
    if (!dragging) {
      setTiming(tick);
    }
  };

  const onTimeChange = (value: number) => {
    setTempTiming(value);
  };

  const onPressStart = () => {
    setDragging(true);
  };

  const onPressEnd = () => {
    setDragging(false);
    setTiming(tempTiming);
    engine?.player?.setCurrentTiming?.(tempTiming);
  };

  useEffect(() => {
    if (engine) {
      engine?.timerUpdated.on(
        ["TIMING", "CHANGE"],
        0,
        onTimingUpdated,
        componnetId
      );
    }

    return () => {
      engine?.timerUpdated.off(["TIMING", "CHANGE"], 0, componnetId);
    };
  }, [engine, dragging]);

  return (
    <div className="w-full flex items-center relative pl-3 px-2">
      <SliderCommon
        tabIndex={-1}
        color="#ffffff"
        value={dragging ? tempTiming : timing}
        min={0}
        max={musicQuere?.duration}
        style={{ width: "100%" }}
        onPressStart={onPressStart}
        onPressEnd={onPressEnd}
        onChange={onTimeChange}
      />
    </div>
  );
};

export default TimerBar;
