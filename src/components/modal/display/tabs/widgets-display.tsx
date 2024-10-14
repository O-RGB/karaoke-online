import SwitchRadio from "@/components/common/input-data/switch/switch-radio";
import Label from "@/components/common/label";
import useConfigStore from "@/stores/config-store";
import { appendLocalConfig, setLocalConfig } from "@/lib/local-storege/config";
import React, { useEffect, useState } from "react";

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
      setConfig(
        (e) =>
          ({
            ...e,
            widgets: {
              ...e.widgets,
              mix: { show },
            },
          } as ConfigDisplay)
      );
      setWidgets((e) => ({ ...e, mix: { show } }));
      appendLocalConfig({ widgets: { mix: { show } } });
    } else if (widget === 1) {
      setConfig(
        (e) =>
          ({
            ...e,
            widgets: { ...e.widgets, tempo: { show } },
          } as ConfigDisplay)
      );
      setWidgets((e) => ({ ...e, tempo: { show } }));
      appendLocalConfig({ widgets: { tempo: { show } } });
    } else if (widget === 2) {
      setConfig(
        (e) =>
          ({
            ...e,
            widgets: { ...e.widgets, clock: { show } },
          } as ConfigDisplay)
      );
      setWidgets((e) => ({ ...e, clock: { show } }));
      appendLocalConfig({ widgets: { clock: { show } } });
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
