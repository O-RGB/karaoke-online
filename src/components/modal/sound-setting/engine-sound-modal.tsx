import Label from "@/components/common/display/label";
import Select from "@/components/common/input-data/select/select";
import useConfigStore from "@/features/config/config-store";
import { EngineType } from "@/features/engine/synth-store";
import React from "react";
import { FaMusic, FaCogs } from "react-icons/fa";

interface EngineSoundModalProps {}

const EngineSoundModal: React.FC<EngineSoundModalProps> = ({}) => {
  const setConfig = useConfigStore((state) => state.setConfig);
  const config = useConfigStore((state) => state.config);

  const onEngineChange = (value: EngineType) => {
    setConfig({
      system: {
        engine: value,
        timingModeType: value === "jsSynth" ? "Tick" : "Time",
      },
    });

    window.location.reload();
  };

  return (
    <>
      <Label>ตัวเล่นเพลง</Label>
      <Select
        defaultValue={config.system?.engine}
        onChange={onEngineChange}
        options={[
          {
            value: "spessa",
            label: "SpessaSynth Engine",
          },
          {
            value: "jsSynth",
            label: "js-synthesizer Engine",
          },
        ]}
      ></Select>
      <div className="mt-4 space-y-4">
        {/* SpessaSynth Engine */}
        <div
          className={`p-4 border rounded-md shadow-md ${
            config.system?.engine === "spessa"
              ? "border-blue-500 bg-blue-50"
              : ""
          }`}
        >
          <h3 className="flex items-center text-base font-semibold">
            <FaMusic className="mr-2 text-blue-500" />
            SpessaSynth Engine
          </h3>
          <p className="text-sm">
            SpessaSynth เป็นไลบรารีสำหรับการสังเคราะห์เสียงแบบเรียลไทม์ ใช้
            SoundFont2 และเขียนด้วย JavaScript
          </p>
          <ul className="list-disc pl-5 mt-2 text-sm">
            <li>เล่นไฟล์ MIDI ด้วยไฟล์ SF2/SF3/DLS</li>
            <li>รองรับการแปลงไฟล์ DLS เป็น SF2 และกลับกัน</li>
            <li>สามารถเขียนไฟล์ MIDI และ SF2/SF3 ได้</li>
          </ul>
          <p className="text-xs text-gray-500 mt-2">
            *ยังไม่เหมาะสำหรับการใช้งานบนอุปกรณ์มือถือ
          </p>
          <p className="text-xs text-blue-600 mt-2">
            สถานะ: กำลังพัฒนา
          </p>
        </div>

        {/* js-synthesizer Engine */}
        <div
          className={`p-4 border rounded-md shadow-md ${
            config.system?.engine === "jsSynth"
              ? "border-green-500 bg-green-50"
              : ""
          }`}
        >
          <h3 className="flex items-center text-base font-semibold">
            <FaCogs className="mr-2 text-green-500" />
            js-synthesizer Engine (Demo เท่านั้น)
          </h3>
          <p className="text-sm">
            js-synthesizer เป็นไลบรารีที่สร้างข้อมูลเสียงโดยใช้ WebAssembly
            เวอร์ชันของ FluidSynth
          </p>
          <ul className="list-disc pl-5 mt-2 text-sm">
            <li>ประสิทธิภาพสูงด้วยการใช้ WebAssembly</li>
            <li>ทำงานร่วมกับ Web Audio API</li>
            <li>เหมาะสำหรับการพัฒนาแอปพลิเคชันเสียงบนเว็บ</li>
          </ul>
          <p className="text-xs text-gray-500 mt-2">
            *ไม่ทราบว่ายังพัฒนาต่อหรือไม่ เนื่องจากไม่มีการอัปเดตใน GitHub
          </p>
          <p className="text-xs text-green-500 mt-2">
            *ใช้ในมือถือได้ดี
          </p>
          <p className="text-xs text-red-600 mt-2">
            สถานะ: ไม่ชัดเจน
          </p>
        </div>
      </div>
    </>
  );
};

export default EngineSoundModal;
