import Button from "@/components/common/button/button";
import { INSTRUMENT_TYPE_BY_INDEX } from "@/features/engine/modules/instrumentals/instrumental";
import { useOrientation } from "@/hooks/orientation-hook";
import React from "react";
import VolumeOptions from "../volume-panel/modules/options-button/volume-pitch";
import { IControllerChange } from "@/features/engine/types/synth.type";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import InstrumentalButtonRender from "./node";
import { Menu, MenuButton } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/zoom.css";
import InstrumentalSetting from "@/components/modal/sound-setting/tabs/instrumental/instrumental-setting";

interface InstrumentalPanelProps {
  className?: string;
}

const InstrumentalPanel: React.FC<InstrumentalPanelProps> = ({ className }) => {
  const instrumental = useSynthesizerEngine(
    (state) => state.engine?.instrumental
  );

  if (!instrumental) return;
  return (
    <div className={`${className}`}>
      {INSTRUMENT_TYPE_BY_INDEX.map((data, key) => {
        return (
          <div
            key={`instrumental-item-${key}-${data}`}
            className="relative w-full h-full"
          >
            <Menu
              transition
              boundingBoxPadding="10 10 10 10"
              menuButton={(open) => {
                return (
                  <MenuButton>
                    <Button
                      className="w-full h-full"
                      // className="!w-10 !h-10"
                      padding="p-0.5"
                      blur
                      icon={
                        <img
                          src={`/icon/instrument/${data}.png`}
                          className="object-contain"
                        ></img>
                      }
                    >
                      <InstrumentalButtonRender
                        type={data}
                        indexKey={key}
                        instrumental={instrumental}
                      ></InstrumentalButtonRender>
                    </Button>
                  </MenuButton>
                );
              }}
            >
              <div className="p-2 px-4">
                <InstrumentalSetting
                  color={"#00c951"}
                  instrumental={instrumental}
                  selectedIndex={key}
                  selectedType={data}
                  valueKey="EXPRESSION"
                ></InstrumentalSetting>
                <InstrumentalSetting
                  color={"#fd9a00"}
                  instrumental={instrumental}
                  selectedIndex={key}
                  selectedType={data}
                  valueKey="VELOCITY"
                ></InstrumentalSetting>
              </div>
            </Menu>
          </div>
        );
      })}
    </div>
  );
};

export default InstrumentalPanel;
