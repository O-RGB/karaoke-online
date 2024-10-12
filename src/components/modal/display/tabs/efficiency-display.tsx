import SwitchRadio from "@/components/common/input-data/switch/switch-radio";
import Label from "@/components/common/label";
import useConfigStore from "@/components/stores/config-store";
import { REFRESH_RATE } from "@/config/value";
import { appendLocalConfig, setLocalConfig } from "@/lib/local-storege/config";
import React, { useEffect, useState } from "react";

interface EfficiencyDisplayProps {}

const EfficiencyDisplay: React.FC<EfficiencyDisplayProps> = ({}) => {
  const setConfig = useConfigStore((state) => state.setConfig);
  const config = useConfigStore((state) => state.config);
  const [refreshRate, setRefreshReate] = useState<RefreshRate>("MIDDLE");

  const onRefreshChange = (value: RefreshRate) => {
    const refreshRate = { render: REFRESH_RATE[value], type: value };
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

  console.log("efficiency render...");
  return (
    <div className="flex flex-col gap-3 divide-y">
      <div className="flex justify-between">
        <div>
          <Label>Refresh rate</Label>
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
        <div className="bg-black p-2 text-xl text-yellow-300 flex justify-center items-center">
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
  );
};

export default EfficiencyDisplay;
