import { useSynthesizerEngine } from "@/features/engine/synth-store";
import { BaseSynthEngine } from "@/features/engine/types/synth.type";
import React, { useState, useEffect } from "react";

interface EQTESTProps {}

const EQTEST: React.FC<EQTESTProps> = () => {
  const engine: BaseSynthEngine | undefined = useSynthesizerEngine(
    (state) => state.engine
  );

  const [selectedChannel, setSelectedChannel] = useState(0);
  const [channelEQEnabled, setChannelEQEnabled] = useState(false);
  const [eqSettings, setEqSettings] = useState<
    { frequency: number; gain: number }[]
  >([]);

  // สมมติว่ามี 16 channels (MIDI standard)
  const channelCount = 16;

  useEffect(() => {
    if (engine) {
      // Initialize with current EQ settings
      const isEnabled = engine.isChannelEQEnabled?.(selectedChannel);
      setChannelEQEnabled(isEnabled ?? false);

      const settings = engine.getChannelEQSettings?.(selectedChannel);
      if (settings) {
        setEqSettings(settings);
      }
    }
  }, [engine, selectedChannel]);

  const handleToggleEQ = () => {
    if (engine) {
      const newState = !channelEQEnabled;
      engine.toggleChannelEqualizer?.(selectedChannel, newState);
      setChannelEQEnabled(newState);
    }
  };

  const handleToggleAllEQ = (enabled: boolean) => {
    if (engine) {
      engine.toggleAllEqualizers?.(enabled);
      setChannelEQEnabled(enabled);
    }
  };

  const handleResetEQ = () => {
    if (engine) {
      engine.resetChannelEQ?.(selectedChannel);
      const settings = engine.getChannelEQSettings?.(selectedChannel);
      if (settings) {
        setEqSettings(settings);
      }
    }
  };

  const handleSliderChange = (bandIndex: number, value: number) => {
    if (engine) {
      engine.updateChannelEQBand?.(selectedChannel, bandIndex, value);
      const settings = engine.getChannelEQSettings?.(selectedChannel);
      if (settings) {
        setEqSettings(settings);
      }
    }
  };

  const bandLabels = ["Low", "Mid", "High"];

  return (
    <div className="fixed top-44 left-12 p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-3 text-gray-800">EQ Control</h2>

      <div className="mb-4">
        <div className="flex flex-wrap gap-1 mb-2">
          {Array.from({ length: channelCount }, (_, i) => (
            <button
              key={i}
              className={`px-2 py-1 text-xs rounded ${
                selectedChannel === i
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setSelectedChannel(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="flex gap-1 text-sm mb-3">
          <button
            className={`px-2 py-1 rounded ${
              channelEQEnabled ? "bg-green-500 text-white" : "bg-gray-300"
            }`}
            onClick={handleToggleEQ}
          >
            {channelEQEnabled ? "EQ On" : "EQ Off"}
          </button>

          <button
            className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
            onClick={() => handleToggleAllEQ(true)}
          >
            All On
          </button>

          <button
            className="px-2 py-1 bg-gray-500 text-white rounded text-sm"
            onClick={() => handleToggleAllEQ(false)}
          >
            All Off
          </button>

          <button
            className="px-2 py-1 bg-red-500 text-white rounded text-sm"
            onClick={handleResetEQ}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="flex justify-around gap-2 bg-white p-3 rounded">
        {eqSettings.map((band, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="text-sm font-medium">{bandLabels[index]}</div>
            <div className="text-xs text-gray-500">{band.frequency} Hz</div>
            <div className="h-32 flex items-center justify-center my-2">
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={band.gain}
                onChange={(e) =>
                  handleSliderChange(index, parseFloat(e.target.value))
                }
                className="h-24 w-8"
                style={{
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                }}
              />
            </div>
            <div className="text-xs font-medium">{band.gain.toFixed(1)} dB</div>
          </div>
        ))}
      </div>

      {!engine && (
        <div className="mt-3 p-2 bg-red-100 text-red-700 rounded text-sm">
          Audio engine not initialized
        </div>
      )}
    </div>
  );
};

export default EQTEST;
