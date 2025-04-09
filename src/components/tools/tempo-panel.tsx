import React, { useEffect, useState } from "react";
import useConfigStore from "../../features/config/config-store";
import useRuntimePlayer from "@/features/player/player/modules/runtime-player";
import { useSynthesizerEngine } from "@/features/engine/synth-store";

interface TempoPanelProps {}

const TempoPanel: React.FC<TempoPanelProps> = ({}) => {
  const timeDivision = useRuntimePlayer((state) => state.timeDivision);
  const config = useConfigStore((state) => state.config);
  const widgetConfig = config.widgets;
  let isShow = widgetConfig?.tempo?.show;
  const windowMatches = window.matchMedia("(min-width: 1024px)").matches;
  isShow = isShow ? windowMatches : false;

  const tick = useRuntimePlayer((state) => state.currentTick);
  const tempo = useRuntimePlayer((state) => state.currentTempo);

  const [currentBeatInBar, setCurrentBeatInBar] = useState(1);

  useEffect(() => {
    if (isShow) {
      if (tick > 0 && timeDivision > 0) {
        const currentTickInBar = tick % (timeDivision * 4);
        const beatInBar = Math.floor(currentTickInBar / timeDivision) + 1;
        setCurrentBeatInBar(beatInBar);
      }
    }
  }, [timeDivision, isShow ? tick : undefined]);

  if (isShow === false) {
    return <></>;
  }
  return (
    <div className="fixed z-30 right-5 lg:top-6 blur-overlay blur-border border rounded-md p-2 w-44 hidden lg:block text-white">
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
