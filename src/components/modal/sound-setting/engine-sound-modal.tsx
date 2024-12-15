import Label from "@/components/common/display/label";
import Select from "@/components/common/input-data/select/select";
import useConfigStore from "@/stores/config/config-store";
import { EngineType } from "@/stores/engine/synth-store";
import React from "react";

interface EngineSoundModalProps {}

// "spessa" | "jsSynth";
const EngineSoundModal: React.FC<EngineSoundModalProps> = ({}) => {
  const setConfig = useConfigStore((state) => state.setConfig);
  const config = useConfigStore((state) => state.config);

  const onEngineChange = (value: EngineType) => {
    setConfig({ system: { engine: value } });

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

      {/* {config.system?.engine === "spessa" ? (
        <>
          <Label>Spessasynth</Label>
          Spessasynth คือ Lib
          ใหม่ที่กำลังพัฒนาแต่ยังทำงานได้ไม่ดีในอุปกรณ์มือถือ
        </>
      ) : (
        <>
          <Label>Spessasynth</Label>
          Spessasynth คือ Lib
          ใหม่ที่กำลังพัฒนาแต่ยังทำงานได้ไม่ดีในอุปกรณ์มือถือ
        </>
      )} */}
    </>
  );
};

export default EngineSoundModal;
