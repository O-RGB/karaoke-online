import React, { useEffect, useState } from "react";
import Label from "../common/label";
import Select from "../common/input-data/select/select";
import { useSpessasynthStore } from "../../stores/spessasynth-store";

interface MidiSettingModalProps {}

const MidiSettingModal: React.FC<MidiSettingModalProps> = () => {
  const defaultOutput = { label: "Next Karaoke", value: "Next Karaoke" };
  const { player } = useSpessasynthStore();
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
        player?.resetMIDIOut();
      } else {
        const find = outputs.find((v) => v.name === id);
        if (find) {
          player?.connectMidiOutput(find);
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
    <>
      <Label>มิดี้ ขาออก</Label>
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
    </>
  );
};

export default MidiSettingModal;
