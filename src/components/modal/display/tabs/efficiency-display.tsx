import SwitchRadio from "@/components/common/input-data/switch/switch-radio";
import Label from "@/components/common/display/label";
import useConfigStore from "@/stores/config/config-store";
import { REFRESH_RATE } from "@/config/value";
import { appendLocalConfig, setLocalConfig } from "@/lib/local-storege/config";
import React, { useEffect, useState } from "react";
import { ConfigDisplay, RefreshRate } from "@/stores/config/types/config.type";

interface EfficiencyDisplayProps {}

const EfficiencyDisplay: React.FC<EfficiencyDisplayProps> = ({}) => {
  const setConfig = useConfigStore((state) => state.setConfig);
  const config = useConfigStore((state) => state.config);
  const [refreshRate, setRefreshReate] = useState<RefreshRate>("MIDDLE");

  function updateBlurStyles(
    blurAmount: number,
    borderOpacity: number,
    color: string = "transparent"
  ) {
    document.documentElement.style.setProperty(
      "--blur-amount",
      `${blurAmount}px`
    );
    document.documentElement.style.setProperty(
      "--border-opacity",
      `${borderOpacity}`
    );
    document.documentElement.style.setProperty(
      "--background-color",
      `${color}`
    );
  }

  const onRefreshChange = (value: RefreshRate) => {
    const refreshRate = { render: REFRESH_RATE[value], type: value };

    if (refreshRate.type === "LOW") {
      updateBlurStyles(0, 0.5, config.themes?.backgroundColor?.color);
    } else {
      updateBlurStyles(8, 0.5);
    }
    appendLocalConfig({ refreshRate: refreshRate });
    setRefreshReate(value);
    setConfig((cf) => {
      return {
        ...cf,
        refreshRate: refreshRate,
      } as ConfigDisplay;
    });
  };

  useEffect(() => {
    setRefreshReate(config.refreshRate?.type ?? "MIDDLE");
  }, [config]);

  return (
    <div className="flex flex-col gap-3 divide-y">
      <div>
        <Label>Refresh rate</Label>
        <div className="flex justify-between gap-3 items-center">
          <div>
            <SwitchRadio<RefreshRate>
              onChange={onRefreshChange}
              value={refreshRate}
              options={[
                {
                  value: "HIGH",
                  children: "สูง",
                },
                {
                  value: "MIDDLE",
                  children: "กลาง",
                },
                {
                  value: "LOW",
                  children: "ต่ำ",
                },
              ]}
            ></SwitchRadio>
          </div>
          <div>
            <div className="bg-black p-2 text-base lg:text-xl text-yellow-300 flex justify-center items-center">
              FPS:{" "}
              {refreshRate === "HIGH"
                ? "60"
                : refreshRate === "MIDDLE"
                ? "30"
                : refreshRate === "LOW"
                ? "20"
                : ""}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EfficiencyDisplay;
