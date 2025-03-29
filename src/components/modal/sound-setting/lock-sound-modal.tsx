import ToggleCheckBox from "@/components/common/input-data/checkbox";
import Select from "@/components/common/input-data/select/select";
import Label from "@/components/common/display/label";
import useConfigStore from "@/features/config/config-store";
import React, { useEffect, useState } from "react";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import useMixerStoreNew from "@/features/player/event-player/modules/event-mixer-store";
import { SoundSetting } from "@/features/config/types/config.type";

interface LockSoundModalProps {}

const LockSoundModal: React.FC<LockSoundModalProps> = ({}) => {
  const setConfig = useConfigStore((state) => state.setConfig);
  const config = useConfigStore((state) => state.config);
  const lockBased = config.sound?.lockBase;
  const [onLockBase, setLockBase] = useState<boolean>(false);
  const instrument = useMixerStoreNew.getState().instrument;
  const engine = useSynthesizerEngine((state) => state.engine);

  const updateLocked = (program: number) => {
    engine?.bassConfig?.setLockBass(program);
    engine?.setBassLock(program);
  };

  const onBaseLock = (value: boolean) => {
    setLockBase(value);
    engine?.bassConfig?.setActive(value);
    let sound: Partial<SoundSetting> = config.sound ?? {};
    if (!value) {
      delete sound.lockBase;
      engine?.setBassLock(0);
    }
    setConfig({ sound });
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
