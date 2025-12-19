import { useSynthesizerEngine } from "@/features/engine/synth-store";
import React, { useEffect, useState } from "react";
import SwitchRadio from "../../../../common/input-data/switch/switch-radio";
import SliderCommon from "../../../../common/input-data/slider";
// React Icons
import {
  FiChevronDown,
  FiChevronUp,
  FiRotateCcw,
  FiActivity,
  FiCpu,
  FiLayers,
  FiVolume2,
  FiCloud,
} from "react-icons/fi";
import {
  CompressorParams,
  ReverbParams,
  LimiterParams,
} from "@/features/engine/modules/equalizer/global-equalizer";
import { usePeerHostStore } from "@/features/remote/store/peer-js-store";

// --- Configuration ---
interface EqPreset {
  id: string;
  name: string;
  gains: number[];
}
const defaultPresets: EqPreset[] = [
  { id: "flat", name: "Flat", gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { id: "punch", name: "Punchy", gains: [2, 1, 0, -1, -2, 0, 1, 2, 3, 2] },
  { id: "warm", name: "Warm", gains: [1, 2, 1, 0, 0, -1, -1, -2, -2, -3] },
  { id: "bright", name: "Bright", gains: [-1, -1, 0, 0, 1, 2, 3, 4, 3, 2] },
];

// --- Sub Components ---

const RackSlider = ({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  vertical = false,
  className = "",
}: any) => {
  const handleChange = (val: number | number[]) =>
    onChange(Array.isArray(val) ? val[0] : val);

  if (vertical) {
    return (
      <div className="flex flex-col items-center h-full w-full group">
        <div className={`relative w-full ${className}`}>
          <SliderCommon
            vertical
            value={[value]}
            min={min}
            max={max}
            step={step}
            onChange={handleChange}
            className="h-full"
          />
        </div>
      </div>
    );
  }

  // ปรับลด margin และขนาดตัวอักษรให้แน่นขึ้น (Compact View)
  return (
    <div className="flex flex-col gap-0.5 mb-1.5 w-full">
      <div className="flex justify-between items-end text-[10px] text-gray-500 px-0.5">
        <span className="font-medium truncate pr-2">{label}</span>
        <span className="font-mono text-blue-600 whitespace-nowrap">
          {value.toFixed(step < 0.1 ? 2 : 1)}
          {unit}
        </span>
      </div>
      <SliderCommon
        value={[value]}
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
        className="h-1.5" // ลดความสูงของราง Slider
      />
    </div>
  );
};

const SectionPanel = ({
  title,
  icon: Icon,
  isOpen,
  onToggle,
  onReset,
  children,
}: any) => {
  return (
    // เปลี่ยนเป็น Card Style แยกชิ้นกันชัดเจน
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-2 last:mb-0">
      <div
        className={`flex justify-between items-center py-2 px-3 cursor-pointer select-none group transition-colors ${
          isOpen
            ? "bg-gray-50 border-b border-gray-100"
            : "bg-white hover:bg-gray-50"
        }`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-2 text-gray-700">
          <span
            className={`transition-colors ${
              isOpen ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <Icon size={14} />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-all"
            title="Reset Default"
          >
            <FiRotateCcw size={12} />
          </button>
          <span className="text-gray-400">
            {isOpen ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
          </span>
        </div>
      </div>

      {isOpen && (
        // ลด padding เนื้อหาภายใน
        <div className="p-3 animate-in slide-in-from-top-1 duration-200 bg-white">
          {children}
        </div>
      )}
    </div>
  );
};

// --- Main Component ---

const GlobalEqualizer: React.FC = () => {
  const equalizer = useSynthesizerEngine(
    (state) => state.engine?.globalEqualizer
  );

  const client = usePeerHostStore((state) => state.requestToClient);
  const addRoute = usePeerHostStore((state) => state.addRoute);

  // UI States
  const [activeSections, setActiveSections] = useState<Record<string, boolean>>(
    {
      eq: true,
      tone: true, // เปิดไว้ให้เห็นภาพรวม
      dynamics: false,
      space: false,
      master: true,
    }
  );
  const toggleSection = (key: string) =>
    setActiveSections((prev) => ({ ...prev, [key]: !prev[key] }));

  // Value States
  const [gains, setGains] = useState<number[]>(new Array(10).fill(0));
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [selectedPreset, setSelectedPreset] = useState<string>("flat");

  const [saturation, setSaturation] = useState(0);
  const [pan, setPan] = useState(0);
  const [comp, setComp] = useState<CompressorParams>({
    threshold: -24,
    ratio: 1,
    knee: 30,
    attack: 0.03,
    release: 0.1,
  });
  const [reverb, setReverb] = useState<ReverbParams>({
    mix: 0,
    duration: 2.5,
    decay: 2.0,
  });
  const [limiter, setLimiter] = useState<LimiterParams>({
    threshold: -0.3,
    release: 0.1,
  });
  const [masterVol, setMasterVol] = useState(1);

  useEffect(() => {
    if (!equalizer) return;
    setGains([...equalizer.gains]);
    setIsEnabled(equalizer.isEnabled);
    setSaturation(equalizer.saturationAmount);
    setPan(equalizer.panValue);
    setComp({ ...equalizer.compParams });
    setReverb({ ...equalizer.reverbParams });
    setLimiter({ ...equalizer.limiterParams });
    setMasterVol(equalizer.masterVolume);
  }, [equalizer]);

  if (!equalizer)
    return (
      <div className="text-gray-400 text-xs p-4 text-center">
        Engine Initializing...
      </div>
    );

  // --- Handlers ---
  const handleGainChange = (i: number, val: number) => {
    const newGains = [...gains];
    newGains[i] = val;
    setGains(newGains);

    client(
      null,
      "system/eq",
      {
        eq: newGains,
      },
      { role: "master" }
    );
    equalizer.setBandGain(i, val);
    setSelectedPreset("");
  };
  const applyPreset = (p: EqPreset) => {
    setGains([...p.gains]);
    equalizer.applyPreset(p);
    setSelectedPreset(p.id);
  };

  // Updates (Keep Logic Same)
  const updateComp = (key: keyof CompressorParams, val: number) => {
    setComp({ ...comp, [key]: val });
    equalizer.setCompressor({ [key]: val });
  };
  const updateReverb = (key: keyof ReverbParams, val: number) => {
    setReverb({ ...reverb, [key]: val });
    equalizer.setReverb({ [key]: val });
  };
  const updateLimiter = (key: keyof LimiterParams, val: number) => {
    setLimiter({ ...limiter, [key]: val });
    equalizer.setLimiter({ [key]: val });
  };

  // Resets
  const resetEQ = () => applyPreset(defaultPresets[0]);
  const resetTone = () => {
    setSaturation(0);
    setPan(0);
    equalizer.setSaturation(0);
    equalizer.setPan(0);
  };
  const resetDynamics = () => {
    const def = {
      threshold: -24,
      ratio: 1,
      knee: 30,
      attack: 0.03,
      release: 0.1,
    };
    setComp(def);
    equalizer.setCompressor(def);
  };
  const resetSpace = () => {
    const def = { mix: 0, duration: 2.5, decay: 2.0 };
    setReverb(def);
    equalizer.setReverb(def);
  };
  const resetMaster = () => {
    const def = { threshold: -0.3, release: 0.1 };
    setLimiter(def);
    equalizer.setLimiter(def);
    setMasterVol(1.0);
    equalizer.setMasterGain(1.0);
  };

  const frequencyLabels = [
    "32",
    "64",
    "125",
    "250",
    "500",
    "1k",
    "2k",
    "4k",
    "8k",
    "16k",
  ];

  useEffect(() => {
    addRoute("system/eq", (payload) => {
      const { eq: nextGains, presetId: preset } = payload;
      setGains(nextGains);
      applyPreset({
        gains: nextGains,
        id: preset,
        name: "remote",
      });
    });
    addRoute("system/open-eq", (payload) => {
      const { enabled } = payload;
      setIsEnabled(enabled);
      equalizer.toggleEQ(enabled);
    });
  }, []);

  return (
    // เปลี่ยน Background หลักเป็นสีเทา เพื่อให้ Card สีขาวเด่นขึ้น (Grouping)
    <div className="w-full   min-h-full">
      {/* Header */}
      <div className="bg-white  top-0 z-20 pb-2">
        <div className="flex justify-between items-center  ">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full transition-colors ${
                isEnabled
                  ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]"
                  : "bg-gray-300"
              }`}
            ></div>
            <span className="text-xs font-bold text-gray-700 tracking-tight">
              MASTERING
            </span>
          </div>
          <div className="scale-90 origin-right">
            <SwitchRadio
              value={isEnabled}
              onChange={(v) => {
                setIsEnabled(v);
                equalizer.toggleEQ(v);
              }}
              options={[
                { label: "ON", value: true },
                { label: "OFF", value: false },
              ]}
            />
          </div>
        </div>
      </div>

      <div
        className={`transition-all duration-300 mx-auto ${
          !isEnabled ? "opacity-60 pointer-events-none grayscale" : ""
        }`}
      >
        {/* 1. Graphic EQ */}
        <SectionPanel
          title="Graphic EQ"
          icon={FiActivity}
          isOpen={activeSections.eq}
          onToggle={() => toggleSection("eq")}
          onReset={resetEQ}
        >
          {/* Presets - Scroll แนวนอนถ้าที่แคบ หรือ wrap */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {defaultPresets.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  client(
                    null,
                    "system/eq",
                    {
                      eq: p.gains,
                    },
                    { role: "master" }
                  );
                  applyPreset(p);
                }}
                className={`text-[10px] px-2 py-0.5 rounded border transition-all ${
                  selectedPreset === p.id
                    ? "bg-gray-800 text-white border-gray-800"
                    : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* EQ Sliders - ลดความสูงเหลือ h-32 */}
          <div className="bg-white h-32 relative pt-2 pb-5">
            <div className="absolute inset-x-0 top-2 bottom-5 flex flex-col justify-between pointer-events-none opacity-10">
              <div className="border-t border-gray-500"></div>
              <div className="border-t border-gray-500"></div>
              <div className="border-t border-gray-500"></div>
            </div>

            <div className="grid grid-cols-10 gap-1 h-full relative z-10">
              {gains.map((g, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center h-full group"
                >
                  <RackSlider
                    vertical
                    value={g}
                    min={-12}
                    max={12}
                    step={0.5}
                    onChange={(v: number) => handleGainChange(i, v)}
                    className="h-full"
                  />
                  <span className="text-[8px] text-gray-400 absolute bottom-0">
                    {frequencyLabels[i]}
                  </span>
                  {/* Tooltip */}
                  <div className="absolute -top-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="text-[9px] font-bold text-white bg-gray-800 px-1 py-0.5 rounded shadow-sm">
                      {g > 0 ? "+" : ""}
                      {g}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionPanel>

        {/* 2. Pre-Amp / Stereo */}
        <SectionPanel
          title="Pre-Amp / Stereo"
          icon={FiCpu}
          isOpen={activeSections.tone}
          onToggle={() => toggleSection("tone")}
          onReset={resetTone}
        >
          {/* ใช้ Grid 2 columns ในหน้าจอเล็กได้เลยสำหรับส่วนนี้ */}
          <div className="grid grid-cols-2 gap-3">
            <RackSlider
              label="Saturation"
              value={saturation}
              min={0}
              max={100}
              step={1}
              unit="%"
              onChange={(v: number) => {
                setSaturation(v);
                equalizer.setSaturation(v);
              }}
            />
            <RackSlider
              label="Stereo Pan"
              value={pan}
              min={-1}
              max={1}
              step={0.05}
              unit=""
              onChange={(v: number) => {
                setPan(v);
                equalizer.setPan(v);
              }}
            />
          </div>
        </SectionPanel>

        {/* 3. Dynamics */}
        <SectionPanel
          title="Glue Compressor"
          icon={FiLayers}
          isOpen={activeSections.dynamics}
          onToggle={() => toggleSection("dynamics")}
          onReset={resetDynamics}
        >
          <div className="space-y-2">
            {/* Threshold & Ratio แถวเดียวกัน */}
            <div className="grid grid-cols-2 gap-3">
              <RackSlider
                label="Threshold"
                value={comp.threshold}
                min={-60}
                max={0}
                step={1}
                unit="dB"
                onChange={(v: number) => updateComp("threshold", v)}
              />
              <RackSlider
                label="Ratio"
                value={comp.ratio}
                min={1}
                max={20}
                step={0.5}
                unit=":1"
                onChange={(v: number) => updateComp("ratio", v)}
              />
            </div>
            {/* Attack & Release แถวเดียวกัน */}
            <div className="grid grid-cols-2 gap-3">
              <RackSlider
                label="Attack"
                value={comp.attack * 1000}
                min={0}
                max={100}
                step={1}
                unit="ms"
                onChange={(v: number) => updateComp("attack", v / 1000)}
              />
              <RackSlider
                label="Release"
                value={comp.release * 1000}
                min={10}
                max={1000}
                step={10}
                unit="ms"
                onChange={(v: number) => updateComp("release", v / 1000)}
              />
            </div>
          </div>
        </SectionPanel>

        {/* 4. Ambience */}
        <SectionPanel
          title="Ambience"
          icon={FiCloud}
          isOpen={activeSections.space}
          onToggle={() => toggleSection("space")}
          onReset={resetSpace}
        >
          <div className="space-y-2">
            <RackSlider
              label="Wet Mix"
              value={reverb.mix * 100}
              min={0}
              max={100}
              step={1}
              unit="%"
              onChange={(v: number) => updateReverb("mix", v / 100)}
            />
            <div className="grid grid-cols-2 gap-3">
              <RackSlider
                label="Size"
                value={reverb.duration}
                min={0.1}
                max={5}
                step={0.1}
                unit="s"
                onChange={(v: number) => updateReverb("duration", v)}
              />
              <RackSlider
                label="Decay"
                value={reverb.decay}
                min={0.1}
                max={10}
                step={0.1}
                unit=""
                onChange={(v: number) => updateReverb("decay", v)}
              />
            </div>
          </div>
        </SectionPanel>

        {/* 5. Master Limiter */}
        <SectionPanel
          title="Final Limiter"
          icon={FiVolume2}
          isOpen={activeSections.master}
          onToggle={() => toggleSection("master")}
          onReset={resetMaster}
        >
          <div className="flex gap-2">
            {/* Vertical Controls Zone */}
            <div className="flex-1 flex gap-2 h-28 bg-gray-50 rounded border border-gray-100">
              <div className="flex-1 flex flex-col justify-end">
                <div className="h-full relative px-1">
                  <RackSlider
                    vertical
                    value={limiter.threshold}
                    min={-6}
                    max={0}
                    step={0.1}
                    onChange={(v: number) => updateLimiter("threshold", v)}
                    className="h-full"
                  />
                </div>
                <span className="text-[9px] text-gray-500 mt-1 text-center font-medium truncate">
                  CEIL
                </span>
              </div>
              <div className="flex-1 flex flex-col justify-end">
                <div className="h-full relative px-1">
                  <RackSlider
                    vertical
                    value={masterVol}
                    min={0}
                    max={1.5}
                    step={0.01}
                    onChange={(v: number) => {
                      setMasterVol(v);
                      equalizer.setMasterGain(v);
                    }}
                    className="h-full"
                  />
                </div>
                <span className="text-[9px] text-blue-600 mt-1 text-center font-bold truncate">
                  OUT
                </span>
              </div>
            </div>

            {/* Side Options */}
            <div className="flex-1 flex flex-col justify-center space-y-2">
              <div className="text-[10px] text-gray-400 leading-tight">
                Output Level: <br />
                <span className="text-sm font-mono text-gray-800">
                  {(masterVol * 100).toFixed(0)}%
                </span>
              </div>
              <hr className="border-gray-100" />
              <RackSlider
                label="Release"
                value={limiter.release}
                min={0.01}
                max={0.5}
                step={0.01}
                unit="s"
                onChange={(v: number) => updateLimiter("release", v)}
              />
            </div>
          </div>
        </SectionPanel>
      </div>
    </div>
  );
};

export default GlobalEqualizer;
