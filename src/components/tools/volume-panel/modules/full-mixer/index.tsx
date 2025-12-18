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
import { DEFAULT_INST_PRESET, DRUM_CHANNEL } from "@/config/value";

import DrumProgramChange from "./modules/drum-program";
import MixerNodes from "./modules/node";

interface FullMixerProps {
  nodes: SynthChannel[];
}

type ActionMode = "create" | "update" | "delete" | null;

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

  const [actionMode, setActionMode] = useState<ActionMode>(null);
  const [tempName, setTempName] = useState<string>("");

  const currentPresetId = Number(selectPreset);
  const isDefaultPreset = currentPresetId === 0;

  const presetOptions: SelectOption[] = useMemo(() => {
    return instPreset
      .filter((p) => p.value !== 0)
      .sort((a, b) => a.value - b.value)
      .map((preset) => ({
        label: preset.label,
        value: preset.value,
      }));
  }, [instPreset]);

  const handleOpenMixer = () => setOpen((v) => !v);

  const handleLoadPreset = (valueStr: string) => {
    const value = Number(valueStr);

    // แก้ไข: เช็คตรงนี้เลย ถ้าเป็น 0 เรียก resetToFactory()
    if (value === 0) {
      instrumental?.resetToFactory();
    } else {
      instrumental?.loadConfig(instPreset, value);
    }

    setSelectPreset(valueStr);
  };

  const handleReset = () => {
    // แก้ไข: เช็คตรงนี้ด้วยเพื่อความชัดเจน
    if (currentPresetId === 0) {
      instrumental?.resetToFactory();
    } else {
      instrumental?.loadConfig(instPreset, currentPresetId);
    }
  };

  const executeCreate = () => {
    if (!tempName.trim()) return;

    const newId =
      instPreset.length > 0
        ? Math.max(...instPreset.map((p) => p.value)) + 1
        : 1;

    const newPreset = instrumental?.getPreset(newId, tempName.trim());
    if (!newPreset) return;

    setConfig({
      sound: {
        instPreset: [...instPreset, newPreset],
      },
    });

    setSelectPreset(String(newId));
    setActionMode(null);
    setTempName("");
  };

  const executeUpdate = () => {
    if (isDefaultPreset) return;

    const oldPreset = instPreset.find((p) => p.value === currentPresetId);
    if (!oldPreset) return;

    const updatedPreset = instrumental?.getPreset(
      currentPresetId,
      oldPreset.label
    );
    if (!updatedPreset) return;

    setConfig({
      sound: {
        instPreset: instPreset.map((p) =>
          p.value === currentPresetId ? updatedPreset : p
        ),
      },
    });
    setActionMode(null);
  };

  const executeDelete = () => {
    if (isDefaultPreset) return;

    setConfig({
      sound: {
        instPreset: instPreset.filter((p) => p.value !== currentPresetId),
      },
    });

    handleLoadPreset("0");
    setActionMode(null);
  };

  const promptCreate = () => {
    const nextNum = instPreset.length > 0 ? instPreset.length : 1;
    setTempName(`My Preset ${nextNum}`);
    setActionMode("create");
  };

  const promptUpdate = () => {
    setActionMode("update");
  };

  const promptDelete = () => {
    setActionMode("delete");
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

  const renderActionOverlay = () => {
    if (!actionMode) return null;

    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 transition-all duration-300">
        <div
          className="w-[85%] max-w-[260px] bg-white rounded-xl shadow-2xl border border-gray-100 p-5 transform transition-all animate-in fade-in zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          {actionMode === "create" && (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  New Preset
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  ตั้งชื่อ Preset ใหม่
                </label>
                <input
                  autoFocus
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && executeCreate()}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all"
                  placeholder="เช่น My Bass Sound..."
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setActionMode(null)}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={executeCreate}
                  disabled={!tempName.trim()}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                >
                  สร้าง
                </button>
              </div>
            </div>
          )}

          {actionMode === "update" && (
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-lg shadow-sm">
                <FaSave />
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-gray-800">บันทึกทับ?</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  ค่าปัจจุบันจะถูกบันทึกลงใน preset <br />
                  <span className="font-semibold text-blue-600 bg-blue-50 px-1 rounded">
                    {instPreset.find((p) => p.value === currentPresetId)?.label}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2 w-full pt-2">
                <button
                  onClick={() => setActionMode(null)}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={executeUpdate}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-blue-200 shadow-md transition-all"
                >
                  ยืนยัน
                </button>
              </div>
            </div>
          )}

          {actionMode === "delete" && (
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-lg shadow-sm">
                <FaTrash />
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-gray-800">ยืนยันการลบ</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  คุณต้องการลบ preset <br />
                  <span className="font-semibold text-red-600 bg-red-50 px-1 rounded">
                    {instPreset.find((p) => p.value === currentPresetId)?.label}
                  </span>
                  <br /> ใช่หรือไม่? (กู้คืนไม่ได้)
                </p>
              </div>

              <div className="flex items-center gap-2 w-full pt-2">
                <button
                  onClick={() => setActionMode(null)}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={executeDelete}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 shadow-red-200 shadow-md transition-all"
                >
                  ลบเลย
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <WinboxModal
        title="Mixer Controls"
        height={330}
        isOpen={open}
        onClose={() => {
          setOpen(false);
          setActionMode(null);
        }}
      >
        <div className="relative w-full h-full flex flex-col">
          {renderActionOverlay()}

          <div className="flex items-center gap-1 p-2 bg-gray-50 border-b h-[45px] flex-shrink-0">
            <div className="flex-1 min-w-0 pr-1 pb-0.5">
              <SelectCommon
                value={selectPreset}
                className="!text-[9px] w-full"
                options={[DEFAULT_INST_PRESET, ...presetOptions]}
                onChange={(e) => handleLoadPreset(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              {!isDefaultPreset && (
                <ButtonCommon
                  size="xs"
                  color="primary"
                  className="!p-1.5 !px-2 !text-xs rounded-md"
                  title="Update Preset"
                  onClick={promptUpdate}
                >
                  <FaSave />
                </ButtonCommon>
              )}

              <ButtonCommon
                size="xs"
                color="success"
                className="!p-1.5 !px-2 !text-xs rounded-md"
                title="Save as New"
                onClick={promptCreate}
              >
                <FaPlus />
              </ButtonCommon>

              {!isDefaultPreset && (
                <ButtonCommon
                  size="xs"
                  color="danger"
                  className="!p-1.5 !px-2 !text-xs rounded-md"
                  title="Delete Preset"
                  onClick={promptDelete}
                >
                  <FaTrash />
                </ButtonCommon>
              )}

              <div className="w-[1px] h-4 bg-gray-300 mx-0.5" />

              <ButtonCommon
                size="xs"
                color="gray"
                className="!p-1.5 !px-2 !text-xs rounded-md"
                title="Reset Changes"
                onClick={handleReset}
              >
                <FiRotateCcw />
              </ButtonCommon>
            </div>
          </div>

          <div className="overflow-auto w-full flex-1 p-1">
            {instrumental && <MixerNodes instrumental={instrumental} />}
            <DrumProgramChange program={program} />
          </div>
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
