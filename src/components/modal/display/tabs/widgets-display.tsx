import SwitchRadio from "@/components/common/input-data/switch/switch-radio";
import Label from "@/components/common/display/label";
import useConfigStore from "@/stores/config/config-store";
import React, { useEffect, useState } from "react";
import {
  WidgetsConfig,
  WidgetsSettingConfig,
} from "@/stores/config/types/config.type";

interface WidgetsDisplayProps {}

const WidgetsDisplay: React.FC<WidgetsDisplayProps> = ({}) => {
  const { config, setConfig } = useConfigStore();
  const defaultConfig: WidgetsSettingConfig = {
    show: true,
  };
  const [widgets, setWidgets] = useState<WidgetsConfig>({
    clock: defaultConfig,
    mix: defaultConfig,
    tempo: defaultConfig,
  });

  const onSetWidgets = (widget: 0 | 1 | 2, show: boolean) => {
    if (widget === 0) {
      setConfig({
        widgets: {
          mix: { show },
        },
      });
      setWidgets((e) => ({ ...e, mix: { show } }));
    } else if (widget === 1) {
      setConfig({
        widgets: {
          tempo: { show },
        },
      });
      setWidgets((e) => ({ ...e, tempo: { show } }));
    } else if (widget === 2) {
      setConfig({
        widgets: {
          clock: { show },
        },
      });

      setWidgets((e) => ({ ...e, clock: { show } }));
    }
  };

  useEffect(() => {
    if (config.widgets) {
      setWidgets(config.widgets);
    }
  }, [config]);

  return (
    <>
      <div className="flex flex-col gap-3">
        <div>
          <Label>มิกเซอร์</Label>
          <div className="flex justify-between gap-3 items-center">
            <div>
              <SwitchRadio<boolean>
                onChange={(value) => onSetWidgets(0, value)}
                value={widgets.mix?.show}
                options={[
                  {
                    value: true,
                    children: "เปิด",
                  },
                  {
                    value: false,
                    children: "ปิด",
                  },
                ]}
              ></SwitchRadio>
            </div>
          </div>
        </div>
        <div>
          <Label>เทมโป</Label>
          <div className="flex justify-between gap-3 items-center">
            <div>
              <SwitchRadio<boolean>
                onChange={(value) => onSetWidgets(1, value)}
                value={widgets.tempo?.show}
                options={[
                  {
                    value: true,
                    children: "เปิด",
                  },
                  {
                    value: false,
                    children: "ปิด",
                  },
                ]}
              ></SwitchRadio>
            </div>
          </div>
        </div>
        <div>
          <Label>นาฬิกา</Label>
          <div className="flex justify-between gap-3 items-center">
            <div>
              <SwitchRadio<boolean>
                onChange={(value) => onSetWidgets(2, value)}
                value={widgets.clock?.show}
                options={[
                  {
                    value: true,
                    children: "เปิด",
                  },
                  {
                    value: false,
                    children: "ปิด",
                  },
                ]}
              ></SwitchRadio>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WidgetsDisplay;
