import Label from "@/components/common/display/label";
import useConfigStore from "@/features/config/config-store";
import React, { useEffect, useState } from "react";
import { ConfigDisplay } from "@/features/config/types/config.type";
import SliderCommon from "@/components/common/input-data/slider";
import { CgPerformance } from "react-icons/cg";
import useRuntimePlayer from "@/features/player/player/modules/runtime-player";

interface EfficiencyDisplayProps {}

const EfficiencyDisplay: React.FC<EfficiencyDisplayProps> = ({}) => {
  const setConfig = useConfigStore((state) => state.setConfig);
  const config = useConfigStore((state) => state.config);
  const play = useRuntimePlayer((state) => state.play);
  const isPaused = useRuntimePlayer((state) => state.isPaused);
  const paused = useRuntimePlayer((state) => state.paused);

  const [refreshRateValue, setRefreshRateValue] = useState<number>(100);

  const onRangeChange = (value: number) => {
    setRefreshRateValue(value);
    setConfig((cf) => {
      return {
        ...cf,
        refreshRate: {
          render: value,
        },
      } as ConfigDisplay;
    });
  };
  useEffect(() => {
    setRefreshRateValue(config.refreshRate?.render ?? 100);
  }, [config]);

  return (
    <div className="flex flex-col gap-3 divide-y">
      <div className="grid grid-cols-2">
        <div className="flex flex-col gap-1">
          <Label className="flex gap-2 items-center">
            <CgPerformance></CgPerformance>
            <div>
              Render every {refreshRateValue}ms (
              {Math.floor(1000 / refreshRateValue)} FPS)
            </div>
          </Label>
          <div className="border rounded-md p-4">
            <SliderCommon
              defaultValue={100}
              min={16}
              max={200}
              color={refreshRateValue < 50 ? "red" : undefined}
              value={refreshRateValue}
              onChange={onRangeChange}
              onPressEnd={() => {
                if (!isPaused) {
                  paused();
                  setTimeout(() => {
                    play();
                  }, 100);
                }
              }}
            ></SliderCommon>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EfficiencyDisplay;
