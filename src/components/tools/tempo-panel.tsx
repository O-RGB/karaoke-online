import React, { useEffect, useRef, useState } from "react";

interface TempoPanelProps {
  tempo: number;
  tick: number;
  timeDivision: number;
}

const TempoPanel: React.FC<TempoPanelProps> = ({
  tempo = 0,
  tick,
  timeDivision,
}) => {
  const [currentBeatInBar, setCurrentBeatInBar] = useState(1);
  const [ticksPerBar, setTicksPerBar] = useState(0);

  // ฟังก์ชัน throttle เพื่อลดความถี่การทำงานของ useEffect
  function useThrottle(value: number, limit: number) {
    const [throttledValue, setThrottledValue] = useState(value);
    const lastRan = useRef(Date.now());

    useEffect(() => {
      const handler = setTimeout(() => {
        if (Date.now() - lastRan.current >= limit) {
          setThrottledValue(value);
          lastRan.current = Date.now();
        }
      }, limit - (Date.now() - lastRan.current));

      return () => {
        clearTimeout(handler);
      };
    }, [value, limit]);

    return throttledValue;
  }

  const throttledTick = useThrottle(tick, 100);

  useEffect(() => {
    if (tick > 0) {
      const currentTickInBar = throttledTick % ticksPerBar;
      const beatInBar = Math.floor(currentTickInBar / timeDivision) + 1;
      setCurrentBeatInBar(beatInBar);
    }
  }, [throttledTick, ticksPerBar]);

  useEffect(() => {
    setTicksPerBar(timeDivision * 4);
  }, [timeDivision]);

  return (
    <div className="fixed z-30 right-5 top-[4.2rem] blur-overlay blur-border border rounded-md p-2 w-44 hidden lg:block text-white">
      <div className="flex justify-between items-center mb-1">
        <span className=" text-xl font-bold">{Math.round(tempo)}</span>

        <span className=" text-xl font-bold">{currentBeatInBar}:4</span>
      </div>

      <div className="relative w-full h-1 bg-white/50 mb-2">
        <div className="absolute top-0 left-0 h-full w-full"></div>
      </div>

      <div className="grid grid-cols-4 gap-1">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className={`h-2 ${
              index !== currentBeatInBar - 1 ? "bg-white/30" : "bg-white"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default TempoPanel;
