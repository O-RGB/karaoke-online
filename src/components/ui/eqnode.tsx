import React, { useEffect, useId, useState } from "react";
import SliderCommon from "../common/input-data/slider";
import SwitchRadio from "../common/input-data/switch/switch-radio";
import Tabs from "../common/tabs";
import Button from "../common/button/button";
import { BiReset } from "react-icons/bi";
import { EQConfig } from "@/features/engine/modules/equalizer/types/equalizer.type";
import { InstrumentalNode } from "@/features/engine/modules/instrumentals/instrumental";
import { SynthChannel } from "@/features/engine/modules/instrumentals/channel";
import useConfigStore from "@/features/config/config-store";

interface EQNodeProps {
  instrumental?: InstrumentalNode;
  indexKey: number;
  node: SynthChannel[];
  name: string;
  eqConfig: EQConfig;
  onEnabled?: () => void;
  onDisabled?: () => void;
}

const EQNode: React.FC<EQNodeProps> = ({
  instrumental,
  indexKey,
  node,
  name,
  eqConfig,
  onEnabled,
  onDisabled,
}) => {
  const VolumeMeter: React.FC<{ level: number | undefined }> = ({ level }) => (
    <div className="relative w-full h-12 bg-gray-900 rounded-lg overflow-hidden border border-gray-200">
      <div
        className="absolute h-full bg-white/50 transition-all duration-100"
        style={{ width: `${level || 0}%` }}
      ></div>
    </div>
  );

  const render =
    useConfigStore((state) => state.config.refreshRate?.render) ?? 100;

  const componnetId = useId();
  const [volumeLevel, setVolumeLevel] = useState<number>(0);

  // const [eqConfig, setEqConfig] = useState<EQConfig>({
  //   enabled: false,
  //   gains: [0, 0, 0],
  //   boostLevel: 100,
  //   inputVolume: 1,
  //   outputVolume: 1,
  //   volumeCompensation: 1,
  // });

  const frequencyLabels = ["100 Hz", "1 kHz", "10 kHz"];

  useEffect(() => {
    // if (!instrumental) return;

    // instrumental.equalizer[indexKey].linkEvent(
    //   ["EQUALIZER", "CHANGE"],
    //   (e) => setEqConfig(e.value),
    //   componnetId
    // );

    // const intervalId = setInterval(() => {
    //   const volumes = node.map((n) => n.getGain());
    //   const totalGain = volumes.reduce((acc, volume) => acc + volume, 0);
    //   const averageGain = totalGain / volumes.length;
    //   setVolumeLevel(averageGain);
    // }, render);

    return () => {
      //   instrumental.equalizer[indexKey].unlinkEvent(
      //     ["EQUALIZER", "CHANGE"],
      //     componnetId
      //   );
      // clearInterval(intervalId);
    };
  }, [eqConfig]);

  const handleEQToggle = () => {
    if (instrumental) {
      const newState = !eqConfig.enabled;
      const newBoostLevel = newState ? 100 : 0;

      if (newState) {
        onEnabled?.();
      } else {
        onDisabled?.();
      }

      instrumental.updateEQ(
        indexKey,
        {
          ...eqConfig,
          enabled: newState,
          boostLevel: newBoostLevel,
        },
        indexKey
      );
    }
  };

  const handleGainChange = (index: number, value: number) => {
    if (instrumental) {
      const newGains = [...eqConfig.gains];
      newGains[index] = value;
      instrumental.updateEQ(
        indexKey,
        {
          ...eqConfig,
          gains: newGains,
        },
        indexKey
      );
    }
  };

  const handleResetEQ = () => {
    if (instrumental) {
      instrumental.updateEQ(
        indexKey,
        {
          ...eqConfig,
          gains: [0, 0, 0],
        },
        indexKey
      );
    }
  };

  const handleBoostChange = (value: number) => {
    if (instrumental) {
      instrumental.updateEQ(
        indexKey,
        {
          ...eqConfig,
          boostLevel: value,
        },
        indexKey
      );
    }
  };

  const handleInputVolumeChange = (value: number) => {
    if (instrumental) {
      instrumental.updateEQ(
        indexKey,
        {
          ...eqConfig,
          inputVolume: value,
        },
        indexKey
      );
    }
  };

  const handleOutputVolumeChange = (value: number) => {
    if (instrumental) {
      instrumental.updateEQ(
        indexKey,
        {
          ...eqConfig,
          outputVolume: value,
        },
        indexKey
      );
    }
  };

  const handleVolumeCompensationChange = (value: number) => {
    if (instrumental) {
      instrumental.updateEQ(
        indexKey,
        {
          ...eqConfig,
          volumeCompensation: value,
        },
        indexKey
      );
    }
  };

  return (
    <div className="bg-white text-gray-800 p-3 w-full ">
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">{name} Equalizer</h2>
          <SwitchRadio
            value={eqConfig.enabled}
            onChange={handleEQToggle}
            options={[
              {
                children: "ON",
                value: true,
                label: "ON",
              },
              {
                children: "OFF",
                value: false,
                label: "OFF",
              },
            ]}
          ></SwitchRadio>
        </div>

        <div className="mt-2">
          <p className="text-sm text-gray-600 mb-1 ">Input Level</p>
          <VolumeMeter level={volumeLevel} />
        </div>
      </div>

      <div className="flex border-gray-200">
        <Tabs
          tabs={[
            {
              content: (
                <div>
                  <div className="flex justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-800">
                      Equalizer Settings
                    </h3>
                    <Button
                      disabled={!eqConfig.enabled}
                      onClick={handleResetEQ}
                      icon={<BiReset></BiReset>}
                    >
                      Reset
                    </Button>
                  </div>

                  <div className="mb-8">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Boost Level: {eqConfig.boostLevel}%
                      </span>
                      <span className="text-sm text-gray-600">
                        {(eqConfig.boostLevel / 100).toFixed(2)}x
                      </span>
                    </div>
                    <SliderCommon
                      disabled={!eqConfig.enabled}
                      min={0}
                      max={500}
                      value={eqConfig.boostLevel}
                      onChange={handleBoostChange}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Controls the strength of the equalizer effect
                    </p>
                  </div>

                  <div className="flex justify-between space-x-4">
                    {eqConfig.gains.map((gain, index) => (
                      <div className="flex flex-col items-center flex-1">
                        <div className="mb-2 text-center">
                          <span className="text-sm font-medium text-gray-700">
                            {gain.toFixed(1)} dB
                          </span>
                        </div>
                        <div className="h-32 mb-2 w-full flex justify-center">
                          <SliderCommon
                            disabled={!eqConfig.enabled}
                            vertical
                            min={-12}
                            max={12}
                            step={0.1}
                            value={gain}
                            onChange={(v) => handleGainChange(index, v)}
                            className="w-40 h-10"
                          />
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-600">
                            {frequencyLabels[index]}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ),
              label: "Equalizer",
            },
            {
              content: (
                <div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        Input Volume: {Math.round(eqConfig.inputVolume * 100)}%
                      </label>
                      <SliderCommon
                        disabled={!eqConfig.enabled}
                        min={0}
                        max={1}
                        step={0.01}
                        value={eqConfig.inputVolume}
                        onChange={handleInputVolumeChange}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Controls the signal level entering the equalizer
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        Output Volume: {Math.round(eqConfig.outputVolume * 100)}
                        %
                      </label>
                      <SliderCommon
                        disabled={!eqConfig.enabled}
                        min={0}
                        max={1}
                        step={0.01}
                        value={eqConfig.outputVolume}
                        onChange={handleOutputVolumeChange}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Controls the final signal level after processing
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        Volume Compensation:{" "}
                        {Math.round(eqConfig.volumeCompensation * 100)}%
                      </label>
                      <SliderCommon
                        disabled={!eqConfig.enabled}
                        min={0.1}
                        max={1}
                        step={0.01}
                        value={eqConfig.volumeCompensation}
                        onChange={handleVolumeCompensationChange}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Helps prevent distortion when EQ gains are high
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg mt-6 border border-gray-200">
                    <p className="text-sm text-gray-600">
                      These settings control the overall volume levels
                      throughout the processing chain. Proper adjustment can
                      help maintain optimal audio quality and prevent
                      distortion.
                    </p>
                  </div>
                </div>
              ),
              label: "Volume",
            },
          ]}
        ></Tabs>
      </div>
    </div>
  );
};

export default EQNode;
