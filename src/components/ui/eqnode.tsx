import React, { useEffect, useState, useRef } from "react";
import { ChannelEqualizer } from "@/features/engine/lib/gain";
import SliderCommon from "../common/input-data/slider";

interface EQNodeProps {
  channel: number | undefined;
  eq: ChannelEqualizer | undefined;
}

const EQNode: React.FC<EQNodeProps> = ({ channel, eq }) => {
  const [initialized, setInitialized] = useState(false);
  const [eqEnabled, setEqEnabled] = useState(true);
  const [gains, setGains] = useState([0, 0, 0]);
  const [boostEnabled, setBoostEnabled] = useState(false);
  const [boostLevel, setBoostLevel] = useState(0);
  const [compressorEnabled, setCompressorEnabled] = useState(false);
  const [compressorSettings, setCompressorSettings] = useState({
    threshold: -20,
    knee: 10,
    ratio: 4,
    attack: 0.005,
    release: 0.25,
  });
  const [activeTab, setActiveTab] = useState("eq");
  const [inputVolume, setInputVolume] = useState(1);
  const [outputVolume, setOutputVolume] = useState(1);
  const [volumeCompensation, setVolumeCompensation] = useState(1);

  const [xxx, setV] = useState<number>();

  // Initialize equalizer state when component mounts
  useEffect(() => {
    if (eq && !initialized) {
      setEqEnabled(eq.isEQEnabled());
      setGains([...eq.gains]);
      setBoostEnabled(eq.isBoostActive());
      setBoostLevel(eq.getBoostLevel());
      setInitialized(true);

      setInterval(() => {
        setV(eq.getVolumeLevel());
      }, 100);
    }
  }, [eq, initialized]);

  // EQ Controls
  const handleEQToggle = () => {
    if (eq) {
      const newState = !eqEnabled;
      setEqEnabled(newState);
      eq.toggleEQ(newState);
    }
  };

  const handleGainChange = (index: number, value: number) => {
    if (eq) {
      const newGains = [...gains];
      newGains[index] = value;
      setGains(newGains);
      eq.updateBandGain(index, value);
    }
  };

  const handleResetEQ = () => {
    if (eq) {
      eq.resetEQ();
      setGains([0, 0, 0]);
    }
  };

  // Boost Controls
  const handleBoostToggle = () => {
    if (eq) {
      const newState = !boostEnabled;
      setBoostEnabled(newState);
      eq.toggleBoost(newState);
    }
  };

  const handleBoostChange = (value: number) => {
    if (eq) {
      setBoostLevel(value);
      eq.setBoostLevel(value);
    }
  };

  // Compressor Controls
  const handleCompressorToggle = () => {
    if (eq) {
      const newState = !compressorEnabled;
      setCompressorEnabled(newState);
      eq.toggleCompressor(newState);
    }
  };

  const updateCompressorSetting = (setting: string, value: number) => {
    if (eq) {
      const newSettings = { ...compressorSettings, [setting]: value };
      setCompressorSettings(newSettings);
      eq.setCompressorSettings({ [setting]: value });
    }
  };

  // Volume Controls
  const handleInputVolumeChange = (value: number) => {
    if (eq) {
      setInputVolume(value);
      eq.setInputVolume(value);
    }
  };

  const handleOutputVolumeChange = (value: number) => {
    if (eq) {
      setOutputVolume(value);
      eq.setOutputVolume(value);
    }
  };

  // Volume Compensation Control
  const handleVolumeCompensationChange = (value: number) => {
    if (eq) {
      setVolumeCompensation(value);
      eq.setVolumeCompensation(value);
    }
  };

  // Frequency labels
  const frequencyLabels = ["100 Hz", "1 kHz", "10 kHz"];

  if (!eq) {
    return <div className="text-center p-4">Equalizer not available</div>;
  }

  return (
    <div className="bg-gray-900 text-white rounded-lg shadow-lg p-4 w-full max-w-3xl">
      {/* Header with master power and visualizer */}
      <div className="flex flex-col space-y-4 mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Audio Equalizer</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm">{eqEnabled ? "ON" : "OFF"}</span>
            <button
              onClick={handleEQToggle}
              className={`w-12 h-6 rounded-full relative flex items-center transition-colors duration-300 ${
                eqEnabled ? "bg-blue-500" : "bg-gray-600"
              }`}
            >
              <span
                className={`w-5 h-5 bg-white rounded-full absolute transform transition-transform duration-300 ${
                  eqEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              ></span>
            </button>
          </div>
        </div>

        {/* Audio Visualizer */}
        <div className="relative w-full h-24 bg-gray-800 text-white rounded overflow-hidden">
          <div
            className="absolute h-full bg-blue-500/50"
            style={{ width: `${xxx}%` }}
          ></div>
        </div>
      </div>

      {/* Main tabs navigation */}
      <div className="mb-4">
        <div className="flex border-b border-gray-700">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "eq"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-400"
            }`}
            onClick={() => setActiveTab("eq")}
          >
            Equalizer
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "boost"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-400"
            }`}
            onClick={() => setActiveTab("boost")}
          >
            Boost
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "compressor"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-400"
            }`}
            onClick={() => setActiveTab("compressor")}
          >
            Compressor
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "volume"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-400"
            }`}
            onClick={() => setActiveTab("volume")}
          >
            Volume
          </button>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "eq" && (
        <div>
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-medium">EQ Bands</h3>
            <button
              onClick={handleResetEQ}
              className="flex items-center bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-sm"
            >
              <span className="mr-1">Reset</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                ></path>
              </svg>
            </button>
          </div>

          <div className="flex justify-between space-x-4">
            {gains.map((gain, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="mb-2 text-center">
                  <span className="text-sm font-medium">
                    {gain.toFixed(1)} dB
                  </span>
                </div>
                <div className="h-44 mb-2 w-full flex justify-center">
                  <SliderCommon
                    vertical
                    min={-12}
                    max={12}
                    step={0.1}
                    value={gain}
                    onChange={(value) => handleGainChange(index, value)}
                    className="w-40 h-10"
                  />
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium">
                    {frequencyLabels[index]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "boost" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium">Audio Boost</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm">{boostEnabled ? "ON" : "OFF"}</span>
              <button
                onClick={handleBoostToggle}
                className={`w-12 h-6 rounded-full relative flex items-center transition-colors duration-300 ${
                  boostEnabled ? "bg-blue-500" : "bg-gray-600"
                }`}
              >
                <span
                  className={`w-5 h-5 bg-white rounded-full absolute transform transition-transform duration-300 ${
                    boostEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                ></span>
              </button>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm">Boost Level: {boostLevel}%</span>
              <span className="text-sm">{(boostLevel / 100).toFixed(2)}x</span>
            </div>
            <SliderCommon
              min={0}
              max={500}
              value={boostLevel}
              onChange={handleBoostChange}
              className="w-full"
            />
          </div>

          <div className="bg-gray-800 p-4 rounded">
            <p className="text-sm text-gray-400">
              Boost increases the gain of the audio signal, which can make
              quieter sounds more audible. Use with caution as high boost levels
              may introduce distortion.
            </p>
          </div>
        </div>
      )}

      {activeTab === "compressor" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium">Compressor</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm">
                {compressorEnabled ? "ON" : "OFF"}
              </span>
              <button
                onClick={handleCompressorToggle}
                className={`w-12 h-6 rounded-full relative flex items-center transition-colors duration-300 ${
                  compressorEnabled ? "bg-blue-500" : "bg-gray-600"
                }`}
              >
                <span
                  className={`w-5 h-5 bg-white rounded-full absolute transform transition-transform duration-300 ${
                    compressorEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                ></span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Threshold ({compressorSettings.threshold} dB)
              </label>
              <SliderCommon
                min={-60}
                max={0}
                value={compressorSettings.threshold}
                onChange={(value) =>
                  updateCompressorSetting("threshold", value)
                }
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Knee ({compressorSettings.knee} dB)
              </label>
              <SliderCommon
                min={0}
                max={40}
                value={compressorSettings.knee}
                onChange={(value) => updateCompressorSetting("knee", value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Ratio ({compressorSettings.ratio}:1)
              </label>
              <SliderCommon
                min={1}
                max={20}
                value={compressorSettings.ratio}
                onChange={(value) => updateCompressorSetting("ratio", value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Attack ({compressorSettings.attack.toFixed(3)} s)
              </label>
              <SliderCommon
                min={0}
                max={1}
                step={0.001}
                value={compressorSettings.attack}
                onChange={(value) => updateCompressorSetting("attack", value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Release ({compressorSettings.release.toFixed(2)} s)
              </label>
              <SliderCommon
                min={0}
                max={1}
                step={0.01}
                value={compressorSettings.release}
                onChange={(value) => updateCompressorSetting("release", value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded mt-4">
            <p className="text-sm text-gray-400">
              Compressor reduces the volume of loud sounds or amplifies quiet
              sounds by narrowing an audio signal's dynamic range.
            </p>
          </div>
        </div>
      )}

      {activeTab === "volume" && (
        <div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Input Volume: {Math.round(inputVolume * 100)}%
              </label>
              <SliderCommon
                min={0}
                max={1}
                step={0.01}
                value={inputVolume}
                onChange={handleInputVolumeChange}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Output Volume: {Math.round(outputVolume * 100)}%
              </label>
              <SliderCommon
                min={0}
                max={1}
                step={0.01}
                value={outputVolume}
                onChange={handleOutputVolumeChange}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Volume Compensation: {Math.round(volumeCompensation * 100)}%
              </label>
              <SliderCommon
                min={0.1}
                max={1}
                step={0.01}
                value={volumeCompensation}
                onChange={handleVolumeCompensationChange}
                className="w-full"
              />
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded mt-4">
            <p className="text-sm text-gray-400">
              Adjust input volume to control the signal level entering the
              equalizer. Output volume controls the final signal level after all
              processing. Volume compensation helps prevent distortion when EQ
              gains are high.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EQNode;
