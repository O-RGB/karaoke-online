import { useSynthesizerEngine } from "@/features/engine/synth-store";
import React, { useEffect, useState } from "react";
import SwitchRadio from "../../../../common/input-data/switch/switch-radio";
import SliderCommon from "../../../../common/input-data/slider";

interface GlobalEqProps {}

interface EqPreset {
  id: string;
  name: string;
  gains: number[];
}
const defaultPresets: EqPreset[] = [
  {
    id: "flat",
    name: "Flat",
    gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },

  {
    id: "bass-boost",
    name: "Bass Boost",
    // ลด low ไม่ให้ดันพร้อมกันแรงเกิน
    gains: [6, 5, 4, 2, 1, 0, 0, 0, -1, -2],
  },

  {
    id: "vocal-enhance",
    name: "Vocal Enhance",
    // ดัน mid ให้เด่น แต่ไม่ spike
    gains: [-3, -4, -1, 2, 6, 7, 5, 2, 0, -3],
  },

  {
    id: "treble-boost",
    name: "Treble Boost",
    // ปลายใส แต่ไม่บาดหู
    gains: [-2, -2, -1, -1, -2, 0, 4, 6, 7, 8],
  },

  {
    id: "v-shape",
    name: "V-Shape",
    // ยังคง V แต่ไม่กิน headroom
    gains: [6, 5, 3, 0, -5, -5, 0, 3, 5, 6],
  },

  {
    id: "club",
    name: "Club",
    // เน้น low-mid อุ่น ๆ
    gains: [4, 4, 2, 2, 2, 1, 1, 0, 0, 0],
  },

  {
    id: "rock",
    name: "Rock",
    // กีตาร์ชัด แต่ไม่แตก
    gains: [5, 4, 2, -3, -4, -2, 2, 5, 6, 6],
  },
];

const GlobalEqualizer: React.FC<GlobalEqProps> = () => {
  const equalizer = useSynthesizerEngine(
    (state) => state.engine?.globalEqualizer
  );
  const [gains, setGains] = useState<number[]>(
    equalizer?.gains || new Array(10).fill(0)
  );
  const [isEnabled, setIsEnabled] = useState<boolean>(
    equalizer?.isEnabled || false
  );
  const [selectedPreset, setSelectedPreset] = useState<string>("flat");

  useEffect(() => {
    if (!equalizer) return;

    setGains([...equalizer.gains]);
    setIsEnabled(equalizer.isEnabled);
  }, [equalizer]);

  const handleGainChange = (index: number, value: number) => {
    if (!equalizer) return;

    const newGains = [...gains];
    newGains[index] = value;
    setGains(newGains);
    equalizer.setBandGain(index, value);

    setSelectedPreset("");
  };

  const handleToggleEQ = (enabled: boolean) => {
    if (!equalizer) return;

    setIsEnabled(enabled);
    equalizer.toggleEQ(enabled);
  };

  const applyPreset = (preset: EqPreset) => {
    if (!equalizer) return;

    setGains([...preset.gains]);
    preset.gains.forEach((gain, index) => {
      equalizer.setBandGain(index, gain);
    });
    setSelectedPreset(preset.id);
  };

  if (!equalizer) {
    return (
      <div className="p-4 text-center text-gray-500">
        Equalizer not available
      </div>
    );
  }

  const frequencyLabels = [
    "32Hz",
    "64Hz",
    "125Hz",
    "250Hz",
    "500Hz",
    "1kHz",
    "2kHz",
    "4kHz",
    "8kHz",
    "16kHz",
  ];

  return (
    <div className="w-full bg-gray-50 rounded-lg">
      <div className="gap-4">
        <div className=" w-full bg-white border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm font-medium text-gray-700">EQ Status</div>
            <SwitchRadio
              value={isEnabled}
              onChange={handleToggleEQ}
              options={[
                { label: "On", value: true, children: "On" },
                { label: "Off", value: false, children: "Off" },
              ]}
            />
          </div>

          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {defaultPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={`w-fit p-1 text-left rounded transition-all text-xs ${
                    selectedPreset === preset.id
                      ? "bg-blue-100 text-blue-800 font-medium border-l-4 border-blue-600"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="relative">
            <div className="absolute -left-6 top-5 h-40 text-right flex flex-col justify-between text-[8px] text-gray-500">
              <div>+20dB</div>
              <div>+10dB</div>
              <div>0dB</div>
              <div>-10dB</div>
              <div>-20dB</div>
            </div>

            <div className="ml-2">
              <div className="grid grid-cols-10 gap-1 mb-1">
                {frequencyLabels.map((label, i) => (
                  <div
                    key={i}
                    className="text-center text-[8px] font-medium text-gray-600"
                  >
                    {label}
                  </div>
                ))}
              </div>
              <div className="relative h-40 mb-2 border border-gray-200 rounded bg-white">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="border-t border-gray-200"></div>
                  <div className="border-t border-gray-200"></div>
                  <div className="border-t border-gray-300 border-dashed"></div>
                  <div className="border-t border-gray-200"></div>
                  <div className="border-t border-gray-200"></div>
                </div>

                <div className="absolute inset-0 grid grid-cols-10 gap-0 pointer-events-none">
                  {[...Array(9)].map((_, i) => (
                    <div
                      key={i}
                      className="border-r border-gray-100 h-full"
                    ></div>
                  ))}
                </div>

                <div className="grid grid-cols-10 gap-1 h-full px-2 py-1">
                  {gains.map((gain, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center h-full"
                    >
                      <div className="h-full w-full relative">
                        <SliderCommon
                          disabled={!isEnabled}
                          vertical
                          value={[gain]}
                          min={-20}
                          max={20}
                          step={0.5}
                          onChange={(value) => handleGainChange(index, value)}
                          className={`h-full ${!isEnabled ? "opacity-50" : ""}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-10 gap-1">
                {gains.map((gain, index) => (
                  <div key={index} className="text-center text-[10px]">
                    {gain > 0 ? "+" : ""}
                    {gain.toFixed(1)}
                  </div>
                ))}
              </div>
              ​
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalEqualizer;
