import React, { useEffect, useId, useState, useMemo } from "react";
import { RxMixerVertical } from "react-icons/rx";
import { FiRotateCcw } from "react-icons/fi";
import { FaSave, FaTrash } from "react-icons/fa";

import Button from "@/components/common/button/button";
import ButtonCommon from "@/components/common/button/button";
import WinboxModal from "@/components/common/modal";
import SelectCommon, {
  SelectOption,
} from "@/components/common/data-input/select";

import { useSynthesizerEngine } from "@/features/engine/synth-store";
import useConfigStore from "@/features/config/config-store";
import { SynthChannel } from "@/features/engine/modules/instrumentals/channel";
import { DRUM_CHANNEL } from "@/config/value";

import DrumProgramChange from "./modules/drum-program";
import MixerNodes from "./modules/node";

interface FullMixerProps {
  nodes: SynthChannel[];
}

const FullMixer: React.FC<FullMixerProps> = ({ nodes }) => {
  const componentId = useId();

  const instPreset =
    useConfigStore((state) => state.config.sound?.instPreset) ?? [];
  const setConfig = useConfigStore((state) => state.setConfig);
  const instrumental = useSynthesizerEngine(
    (state) => state.engine?.instrumentals
  );

  const [program, setProgram] = useState<number>(0);
  const [selectPreset, setSelectPreset] = useState<string>("0");
  const [open, setOpen] = useState<boolean>(false);

  const presetOptions: SelectOption[] = useMemo(() => {
    return instPreset.map((preset) => ({
      label: preset.label,
      value: preset.value,
    }));
  }, [instPreset]);

  const isDefaultPreset = selectPreset === "0";

  const handleOpenMixer = () => {
    setOpen(!open);
  };

  const handleLoadPreset = (valueStr: string) => {
    const value = parseInt(valueStr, 10);
    instrumental?.loadConfig(instPreset, value);
    setSelectPreset(valueStr);
  };

  const handleReset = () => {
    handleLoadPreset("0");
  };

  const handleSave = () => {
    const name = window.prompt(
      "กรุณาตั้งชื่อ Preset ของคุณ:",
      `User Preset #${instPreset.length + 1}`
    );
    if (!name || name.trim() === "") return;

    const newId =
      instPreset.length > 0
        ? Math.max(...instPreset.map((p) => p.value)) + 1
        : 1;

    const currentPresetData = instrumental?.getPreset(0, name);
    if (!currentPresetData) return;

    const newPresetList = [
      ...instPreset,
      { ...currentPresetData, value: newId },
    ];
    setConfig({ sound: { instPreset: newPresetList } });

    setSelectPreset(String(newId));
  };

  const handleDelete = () => {
    if (isDefaultPreset) return;

    const confirmDelete = window.confirm("คุณต้องการลบ Preset นี้ใช่หรือไม่?");
    if (!confirmDelete) return;

    const currentId = parseInt(selectPreset, 10);
    const newPresetList = instPreset.filter((p) => p.value !== currentId);

    setConfig({ sound: { instPreset: newPresetList } });
    handleReset();
  };

  useEffect(() => {
    if (!nodes || nodes.length < DRUM_CHANNEL) return;
    const drumNode = nodes[DRUM_CHANNEL];

    const handleProgramChange = (value: { value: number }) => {
      setProgram(value.value);
    };

    drumNode.program?.on(
      ["PROGARM", "CHANGE"],
      handleProgramChange,
      componentId
    );
    return () => {
      drumNode.program?.off?.(["PROGARM", "CHANGE"], componentId);
    };
  }, [nodes, componentId]);

  return (
    <>
      <WinboxModal
        onClose={() => setOpen(false)}
        title="Mixer Controls"
        height={290}
        isOpen={open}
      >
        <div className="flex gap-2 relative px-2 pt-2 items-center">
          <div className="flex-1">
            <SelectCommon
              value={selectPreset}
              className="!text-xs w-full"
              options={[...presetOptions]}
              onChange={(e) => handleLoadPreset(e.target.value)}
            />
          </div>

          {/* Logic ปุ่ม: ถ้าเลือก 0 แสดง Save, ถ้าเลือก Preset อื่น แสดง Delete */}
          {isDefaultPreset ? (
            <ButtonCommon
              className="!p-1 !px-2 !text-xs !gap-1.5 rounded"
              size="xs"
              onClick={handleSave}
              color="primary"
              icon={<FaSave />}
            >
              Save
            </ButtonCommon>
          ) : (
            <ButtonCommon
              className="!p-1 !px-2 !text-xs !gap-1.5 rounded"
              size="xs"
              onClick={handleDelete}
              color="danger"
              icon={<FaTrash />}
            >
              Delete
            </ButtonCommon>
          )}

          <ButtonCommon
            className="!p-1 !px-2 !text-xs !gap-1.5 rounded"
            size="xs"
            color="gray"
            onClick={handleReset}
            icon={<FiRotateCcw />}
          >
            Reset
          </ButtonCommon>
        </div>

        <div className="overflow-auto w-full h-[calc(100%-40px)] p-1">
          {instrumental && <MixerNodes instrumental={instrumental} />}
          <DrumProgramChange program={program} />
        </div>
      </WinboxModal>

      <Button
        size="xs"
        blur={{ border: true }}
        onClick={handleOpenMixer}
        icon={<RxMixerVertical />}
      >
        เครื่องดนตรี
      </Button>
    </>
  );
};

export default FullMixer;
