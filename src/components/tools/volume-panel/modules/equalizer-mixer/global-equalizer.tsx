import { useSynthesizerEngine } from "@/features/engine/synth-store";
import React, { useEffect, useState } from "react";
import SwitchRadio from "../../../../common/input-data/switch/switch-radio";
import SliderCommon from "../../../../common/input-data/slider";

interface GlobalEqProps {}

// Define preset type
interface EqPreset {
  id: string;
  name: string;
  gains: number[];
}

const defaultPresets: EqPreset[] = [
  {
    id: "flat",
    name: "Flat",
    gains: [0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: "bass-boost",
    name: "Bass Boost",
    gains: [6, 4, 2, 0, 0, 0, 0, 0],
  },
  {
    id: "vocal-enhance",
    name: "Vocal Enhance",
    gains: [0, 0, 0, 2, 4, 3, 0, 0],
  },
  {
    id: "treble-boost",
    name: "Treble Boost",
    gains: [0, 0, 0, 0, 0, 2, 4, 6],
  },
  {
    id: "v-shape",
    name: "V-Shape",
    gains: [4, 2, 0, -2, -2, 0, 2, 4],
  },
];

const GlobalEqualizer: React.FC<GlobalEqProps> = () => {
  const equalizer = useSynthesizerEngine(
    (state) => state.engine?.globalEqualizer
  );
  const [gains, setGains] = useState<number[]>(
    equalizer?.gains || new Array(8).fill(0)
  );
  const [isEnabled, setIsEnabled] = useState<boolean>(
    equalizer?.isEnabled || false
  );
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

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

    // Clear selected preset if the user manually adjusts
    setSelectedPreset(null);
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
    "60Hz",
    "170Hz",
    "310Hz",
    "600Hz",
    "1kHz",
    "3kHz",
    "6kHz",
    "12kHz",
  ];

  return (
    <div className="w-full bg-gray-50 rounded-lg p-4 ">
      {/* Main container with two sections */}
      <div className="   gap-4">
        {/* Left side - Presets and controls */}
        <div className="p-4 w-full bg-white border-b md:border-b-0 md:border-r border-gray-200">
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
            <div className="text-sm font-medium text-gray-700 mb-2">
              Presets
            </div>
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

        {/* Right side - Equalizer */}
        <div className="p-4 md:col-span-4">
          {/* Main equalizer area */}
          <div className="relative">
            {/* dB scale on left */}
            <div className="absolute -left-6 top-5 h-40 text-right flex flex-col justify-between text-[8px] text-gray-500">
              <div>+12dB</div>
              <div>+6dB</div>
              <div>0dB</div>
              <div>-6dB</div>
              <div>-12dB</div>
            </div>

            {/* Actual EQ visualization */}
            <div className="ml-2">
              {/* Frequency labels */}
              <div className="grid grid-cols-8 gap-1 mb-1">
                {frequencyLabels.map((label, i) => (
                  <div
                    key={i}
                    className="text-center text-[10px] font-medium text-gray-600"
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Sliders area with horizontal lines */}
              <div className="relative h-40   mb-2 border border-gray-200 rounded bg-white">
                {/* Horizontal guide lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="border-t border-gray-200"></div>
                  <div className="border-t border-gray-200"></div>
                  <div className="border-t border-gray-300 border-dashed"></div>
                  <div className="border-t border-gray-200"></div>
                  <div className="border-t border-gray-200"></div>
                </div>

                {/* Vertical frequency dividers */}
                <div className="absolute inset-0 grid grid-cols-8 gap-0 pointer-events-none">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className="border-r border-gray-100 h-full"
                    ></div>
                  ))}
                </div>

                {/* Sliders container */}
                <div className="grid grid-cols-8 gap-1 h-full px-2 py-1">
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
                          min={-12}
                          max={12}
                          step={0.1}
                          onChange={(value) => handleGainChange(index, value)}
                          className={`h-full ${!isEnabled ? "opacity-50" : ""}`}
                        />

                        {/* Custom fill indicator */}
                        <div
                          className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 rounded-t ${
                            gain > 0
                              ? "bg-blue-500"
                              : gain < 0
                              ? "bg-orange-500"
                              : "bg-gray-400"
                          }`}
                          style={{
                            height: `${(Math.abs(gain) / 24) * 100}%`,
                            top:
                              gain > 0 ? `${((12 - gain) / 24) * 100}%` : "50%",
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Value labels */}
              <div className="grid grid-cols-8 gap-1">
                {gains.map((gain, index) => (
                  <div key={index} className="text-center text-[10px]">
                    {gain > 0 ? "+" : ""}
                    {gain.toFixed(1)}
                  </div>
                ))}
              </div>

              {/* Detailed EQ curve visualization */}
              <div className="mt-4 relative h-16 border border-gray-200 rounded bg-white overflow-hidden">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 800 100"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id="curve-gradient"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="rgba(37, 99, 235, 0.5)" />
                      <stop offset="50%" stopColor="rgba(37, 99, 235, 0.05)" />
                      <stop offset="50%" stopColor="rgba(249, 115, 22, 0.05)" />
                      <stop offset="100%" stopColor="rgba(249, 115, 22, 0.5)" />
                    </linearGradient>
                  </defs>

                  {/* Center line */}
                  <line
                    x1="0"
                    y1="50"
                    x2="800"
                    y2="50"
                    stroke="#cbd5e1"
                    strokeWidth="1"
                  />

                  {/* Draw smooth curve using values */}
                  <path
                    d={`
                      M 0,${50 - gains[0] * 2}
                      C ${100 / 3},${50 - gains[0] * 2}
                        ${100 / 3},${50 - gains[1] * 2}
                        ${100},${50 - gains[1] * 2}
                      C ${100 + 100 / 3},${50 - gains[1] * 2}
                        ${200 - 100 / 3},${50 - gains[2] * 2}
                        ${200},${50 - gains[2] * 2}
                      C ${200 + 100 / 3},${50 - gains[2] * 2}
                        ${300 - 100 / 3},${50 - gains[3] * 2}
                        ${300},${50 - gains[3] * 2}
                      C ${300 + 100 / 3},${50 - gains[3] * 2}
                        ${400 - 100 / 3},${50 - gains[4] * 2}
                        ${400},${50 - gains[4] * 2}
                      C ${400 + 100 / 3},${50 - gains[4] * 2}
                        ${500 - 100 / 3},${50 - gains[5] * 2}
                        ${500},${50 - gains[5] * 2}
                      C ${500 + 100 / 3},${50 - gains[5] * 2}
                        ${600 - 100 / 3},${50 - gains[6] * 2}
                        ${600},${50 - gains[6] * 2}
                      C ${600 + 100 / 3},${50 - gains[6] * 2}
                        ${700 - 100 / 3},${50 - gains[7] * 2}
                        ${700},${50 - gains[7] * 2}
                      C ${700 + 100 / 3},${50 - gains[7] * 2}
                        ${800 - 100 / 3},${50 - gains[7] * 2}
                        ${800},${50 - gains[7] * 2}
                    `}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                  />

                  {/* Fill area from curve to center */}
                  <path
                    d={`
                      M 0,${50 - gains[0] * 2}
                      C ${100 / 3},${50 - gains[0] * 2}
                        ${100 / 3},${50 - gains[1] * 2}
                        ${100},${50 - gains[1] * 2}
                      C ${100 + 100 / 3},${50 - gains[1] * 2}
                        ${200 - 100 / 3},${50 - gains[2] * 2}
                        ${200},${50 - gains[2] * 2}
                      C ${200 + 100 / 3},${50 - gains[2] * 2}
                        ${300 - 100 / 3},${50 - gains[3] * 2}
                        ${300},${50 - gains[3] * 2}
                      C ${300 + 100 / 3},${50 - gains[3] * 2}
                        ${400 - 100 / 3},${50 - gains[4] * 2}
                        ${400},${50 - gains[4] * 2}
                      C ${400 + 100 / 3},${50 - gains[4] * 2}
                        ${500 - 100 / 3},${50 - gains[5] * 2}
                        ${500},${50 - gains[5] * 2}
                      C ${500 + 100 / 3},${50 - gains[5] * 2}
                        ${600 - 100 / 3},${50 - gains[6] * 2}
                        ${600},${50 - gains[6] * 2}
                      C ${600 + 100 / 3},${50 - gains[6] * 2}
                        ${700 - 100 / 3},${50 - gains[7] * 2}
                        ${700},${50 - gains[7] * 2}
                      C ${700 + 100 / 3},${50 - gains[7] * 2}
                        ${800 - 100 / 3},${50 - gains[7] * 2}
                        ${800},${50 - gains[7] * 2}
                      L 800,50
                      L 0,50
                      Z
                    `}
                    fill="url(#curve-gradient)"
                    opacity="0.5"
                  />

                  {/* Frequency bands markers */}
                  {[...Array(8)].map((_, i) => (
                    <circle
                      key={i}
                      cx={i * 100 + 50}
                      cy={50 - gains[i] * 2}
                      r="3"
                      fill="#2563eb"
                      stroke="#fff"
                      strokeWidth="1"
                    />
                  ))}
                </svg>
              </div>
            </div>
          </div>

          {/* Selected preset indicator */}
          {selectedPreset && (
            <div className="mt-3 text-center text-xs text-gray-500">
              Active:{" "}
              {defaultPresets.find((p) => p.id === selectedPreset)?.name ||
                "Custom"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalEqualizer;
