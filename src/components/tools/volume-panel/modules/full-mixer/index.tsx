import React, { useEffect, useId, useState, useMemo } from "react";
import { RxMixerVertical } from "react-icons/rx";
import { FiRotateCcw } from "react-icons/fi";
import { FaSave, FaTrash, FaPlus } from "react-icons/fa";

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
import { InstrumentsPresets } from "@/features/config/types/config.type";

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
    return instPreset
      .sort((a, b) => a.value - b.value)
      .map((preset) => ({
        label: `${preset.value === 0 ? "[Def] " : ""}${preset.label}`,
        value: preset.value,
      }));
  }, [instPreset]);

  const currentPresetId = parseInt(selectPreset, 10);
  const isDefaultPreset = currentPresetId === 0;

  const handleOpenMixer = () => {
    setOpen(!open);
  };

  const handleLoadPreset = (valueStr: string) => {
    const value = parseInt(valueStr, 10);
    instrumental?.loadConfig(instPreset, value);
    setSelectPreset(valueStr);
  };

  const handleReset = () => {
    if (instrumental) {
      instrumental.loadConfig(instPreset, currentPresetId);
    }
  };

  const handleCreateNew = () => {
    const defaultName = isDefaultPreset
      ? `My Preset ${instPreset.length}`
      : `${instPreset.find((p) => p.value === currentPresetId)?.label} (Copy)`;

    const name = window.prompt("ชื่อ Preset ใหม่:", defaultName);
    if (!name || name.trim() === "") return;

    const newId =
      instPreset.length > 0
        ? Math.max(...instPreset.map((p) => p.value)) + 1
        : 1;

    const currentSettings = instrumental?.getPreset(newId, name);
    if (!currentSettings) return;

    const newPresetList = [...instPreset, currentSettings];
    setConfig({ sound: { instPreset: newPresetList } });
    setSelectPreset(String(newId));
  };

  const handleUpdate = () => {
    if (isDefaultPreset) return;
    const confirmUpdate = window.confirm(`บันทึกทับ Preset เดิม?`);
    if (!confirmUpdate) return;

    const oldPreset = instPreset.find((p) => p.value === currentPresetId);
    if (!oldPreset) return;

    const updatedSettings = instrumental?.getPreset(
      currentPresetId,
      oldPreset.label
    );
    if (!updatedSettings) return;

    const newPresetList = instPreset.map((p) =>
      p.value === currentPresetId ? updatedSettings : p
    );

    setConfig({ sound: { instPreset: newPresetList } });
  };

  const handleDelete = () => {
    if (isDefaultPreset) return;
    const confirmDelete = window.confirm("ลบ Preset นี้?");
    if (!confirmDelete) return;

    const newPresetList = instPreset.filter((p) => p.value !== currentPresetId);
    setConfig({ sound: { instPreset: newPresetList } });
    handleLoadPreset("0");
  };

  useEffect(() => {
    if (!nodes || nodes.length <= DRUM_CHANNEL) return;
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
        height={320}
        isOpen={open}
      >
        <div className="flex items-center gap-1 p-2 bg-gray-50 border-b h-[45px]">
          <div className="flex-1 min-w-0 pr-1 pb-0.5">
            <SelectCommon
              value={selectPreset}
              className="!text-[9px] w-full "
              options={[...presetOptions]}
              onChange={(e) => handleLoadPreset(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {!isDefaultPreset && (
              <ButtonCommon
                className="!p-1.5 !px-2 !text-xs rounded-md"
                size="xs"
                onClick={handleUpdate}
                color="primary"
                title="Save changes"
              >
                <FaSave />
              </ButtonCommon>
            )}

            <ButtonCommon
              className="!p-1.5 !px-2 !text-xs rounded-md"
              size="xs"
              onClick={handleCreateNew}
              color="success"
              title="Save as New"
            >
              <FaPlus />
            </ButtonCommon>

            {!isDefaultPreset && (
              <ButtonCommon
                className="!p-1.5 !px-2 !text-xs rounded-md"
                size="xs"
                onClick={handleDelete}
                color="danger"
                title="Delete"
              >
                <FaTrash />
              </ButtonCommon>
            )}

            <div className="w-[1px] h-4 bg-gray-300 mx-0.5"></div>

            <ButtonCommon
              className="!p-1.5 !px-2 !text-xs rounded-md"
              size="xs"
              color="gray"
              onClick={handleReset}
              title="Reset"
            >
              <FiRotateCcw />
            </ButtonCommon>
          </div>
        </div>

        <div className="overflow-auto w-full h-[calc(100%-45px)] p-1">
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
