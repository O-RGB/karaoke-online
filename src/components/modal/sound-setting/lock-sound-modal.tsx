import ToggleCheckBox from "@/components/common/input-data/checkbox";
import Select from "@/components/common/input-data/select/select";
import Label from "@/components/common/display/label";
import volumeSynth from "@/features/volume/volume-features";
import useConfigStore from "@/stores/config/config-store";
import React, { useEffect, useState } from "react";
import { useSynthesizerEngine } from "@/stores/engine/synth-store";
import useMixerStoreNew from "@/stores/player/event-player/modules/event-mixer-store";

interface LockSoundModalProps {}

const LockSoundModal: React.FC<LockSoundModalProps> = ({}) => {
  const setConfig = useConfigStore((state) => state.setConfig);
  const config = useConfigStore((state) => state.config);
  const lockBased = config.sound?.lockBase;
  const [onLockBase, setLockBase] = useState<boolean>(false);

  // const preset = useSynthesizerEngine((state) => state.engine?.preset);
  const instrument = useMixerStoreNew.getState().instrument;

  const engine = useSynthesizerEngine((state) => state.engine);
  // const volumeSetting = synth ? volumeSynth(synth) : null;

  const updateLocked = (program: number) => {
    engine?.setBassLocked(program, true);
    // volumeSetting?.updateLockedPreset(1, false);
    // volumeSetting?.updatePreset(1, program);
    // volumeSetting?.updateLockedPreset(1, true);
    // engine?.lockController()
  };

  const onBaseLock = (value: boolean) => {
    setLockBase(value);
    engine?.setBassLocked(0, value);

    // if (!value) {
    //   setConfig({ sound: { lockBase: undefined } });
    //   volumeSetting?.updateLockedPreset(1, false);
    // } else {
    //   setConfig({ sound: { lockBase: 32 } });
    //   updateLocked(32);
    //   volumeSetting?.updateLockedPreset(1, true);
    // }
  };

  const onBaseChange = (program: string) => {
    updateLocked(+program);
    setConfig({ sound: { lockBase: +program } });
  };
  useEffect(() => {
    if (lockBased !== undefined) {
      setLockBase(true);
    }
  }, [instrument, lockBased]);

  return (
    <>
      <Label>ล็อกเสียงเบส</Label>
      <div className="flex gap-2 items-center border rounded-md p-2">
        <ToggleCheckBox
          defaultChecked={lockBased !== undefined}
          className="m-2"
          onChange={onBaseLock}
        ></ToggleCheckBox>
        <Select
          value={lockBased}
          disabled={!onLockBase}
          defaultValue={`${lockBased}`}
          className="!w-full"
          onChange={onBaseChange}
          options={instrument?.map((data) => ({
            label: `${data.program} - ${data.presetName}`,
            value: data.program,
          }))}
        ></Select>
      </div>
    </>
  );
};

export default LockSoundModal;
