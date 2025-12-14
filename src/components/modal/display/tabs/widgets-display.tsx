import SwitchRadio from "@/components/common/input-data/switch/switch-radio";
import Label from "@/components/common/display/label";
import useConfigStore from "@/features/config/config-store";
import React, { useEffect, useState } from "react";
import {
  WidgetsConfig,
  WidgetsSettingConfig,
} from "@/features/config/types/config.type";
import NumberButton from "@/components/common/input-data/number-button";
import Button from "@/components/common/button/button";
import { BsZoomIn } from "react-icons/bs";

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
    inst: defaultConfig,
  });

  const [zoomLevel, setZoomLevel] = useState(config.system?.zoom || 1);

  const onSetWidgets = (widget: 0 | 1 | 2 | 3, show: boolean) => {
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
    } else if (widget === 3) {
      setConfig({
        widgets: {
          inst: { show },
        },
      });

      setWidgets((e) => ({ ...e, inst: { show } }));
    }
  };

  const handleZoomChange = (newZoomValue: number) => {
    const clampedZoom = Math.max(0.5, Math.min(2, newZoomValue / 100));
    const finalZoom = parseFloat(clampedZoom.toFixed(2));

    setZoomLevel(finalZoom);
    setConfig({ system: { ...config.system, zoom: finalZoom } });
  };

  useEffect(() => {
    if (config.widgets) {
      setWidgets(config.widgets);
    }

    setZoomLevel(config.system?.zoom || 1);
  }, [config]);

  return (
    <>
      <div className="flex flex-col gap-3">
        <div>
          <Label>การซูมหน้าจอ</Label>
          <div className="flex justify-between gap-3 items-center">
            <div className="flex items-center gap-2 text-black">
              <NumberButton
                holdable
                blur={false}
                value={Math.round(zoomLevel * 100)}
                onChange={handleZoomChange}
                className="!text-black"
                suffix="%"
                color="text-black"
                icon={<BsZoomIn />}
              />
            </div>
            <Button
              color="gray"
              onClick={() => handleZoomChange(100)}
              className="h-9"
            >
              รีเซ็ต
            </Button>
          </div>
        </div>

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
