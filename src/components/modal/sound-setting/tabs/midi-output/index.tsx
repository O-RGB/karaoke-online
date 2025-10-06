import React, { useEffect, useState } from "react";
import Label from "../../../../common/display/label";
import Select from "../../../../common/input-data/select/select";
import { useSynthesizerEngine } from "@/features/engine/synth-store";

interface MidiSettingModalProps {}

const MidiSettingModal: React.FC<MidiSettingModalProps> = () => {
  const defaultOutput = { label: "Next Karaoke", value: "Next Karaoke" };
  const engine = useSynthesizerEngine((state) => state.engine);
  const [midiAccess, setMidiAccess] = useState<MIDIAccess | null>(null);
  const [inputs, setInputs] = useState<MIDIInput[]>([]);
  const [outputs, setOutputs] = useState<MIDIOutput[]>([]);

  const initMidi = async () => {
    if (navigator.requestMIDIAccess) {
      try {
        const access = await navigator.requestMIDIAccess();
        setMidiAccess(access);

        const inputDevices = Array.from(access.inputs.values());
        const outputDevices = Array.from(access.outputs.values());

        setInputs(inputDevices);
        setOutputs(outputDevices);
      } catch (error) {
        console.error("Error accessing MIDI devices:", error);
      }
    } else {
      console.log("Web MIDI API is not supported in this browser.");
    }
  };

  const onChangeMidiOutPut = (id: string) => {
    try {
      if (id === defaultOutput.label) {
        engine?.player?.resetMidiOutput();
      } else {
        const find = outputs.find((v) => v.name === id);
        if (find) {
          engine?.player?.setMidiOutput(find);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    initMidi();
  }, []);

  return (
    <div>
      <Label
        textSize={15}
        textColor="text-gray-800"
        headClass="bg-blue-500"
        description="ส่งเสียงออกทั้งหมดไปที่ Device อื่น"
      >
        มิดี้ ขาออก
      </Label>
      <Select
        disabled={midiAccess === null}
        onChange={onChangeMidiOutPut}
        options={[
          defaultOutput,
          ...inputs.map((v) => ({
            label: v.name ?? "null",
            value: v.name ?? "null",
          })),
        ]}
      ></Select>
      {midiAccess === null && <Label>ยังไม่ได้รับอนุญาต MIDI Access</Label>}
    </div>
  );
};

export default MidiSettingModal;
