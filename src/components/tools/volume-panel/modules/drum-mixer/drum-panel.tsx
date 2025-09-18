import { DRUM_NOTES_LIST } from "@/config/value";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import { midiService } from "./node/output";
import { INoteChange } from "@/features/engine/types/synth.type";
import React, { useEffect, useState } from "react";
import DrumNode from "./node";
import Label from "@/components/common/display/label";
import Select from "@/components/common/input-data/select/select";
import {
  DrumNotesType,
  INoteState,
  TEventType,
} from "@/features/engine/modules/instrumentals/types/node.type";

export const DrumNoteMap: DrumNotesType[] = [
  "acoustic_bass_drum",
  "bass_drum_1",
  "side_stick",
  "acoustic_snare",
  "hand_clap",
  "electric_snare",
  "low_floor_tom",
  "closed_hi_hat",
  "high_floor_tom",
  "pedal_hi_hat",
  "low_tom",
  "open_hi_hat",
  "low_mid_tom",
  "hi_mid_tom",
  "crash_cymbal_1",
  "high_tom",
  "ride_cymbal_1",
  "chinese_cymbal",
  "ride_bell",
  "tambourine",
  "splash_cymbal",
  "cowbell",
  "crash_cymbal_2",
  "vibraslap",
  "ride_cymbal_2",
  "hi_bongo",
  "low_bongo",
  "mute_hi_conga",
  "open_hi_conga",
  "low_conga",
  "high_timbale",
  "low_timbale",
  "high_agogo",
  "low_agogo",
  "cabasa",
  "maracas",
  "short_whistle",
  "long_whistle",
  "short_guiro",
  "long_guiro",
  "claves",
  "hi_wood_block",
  "low_wood_block",
  "mute_cuica",
  "open_cuica",
  "mute_triangle",
  "open_triangle",
];

interface DrumPanelProps {}

const DrumPanel: React.FC<DrumPanelProps> = ({}) => {
  const engine = useSynthesizerEngine((state) => state.engine);

  const [outputs, setOutputs] = useState<MIDIOutput[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    midiService.init().then(() => {
      setOutputs(midiService.outputs);
      setSelectedId(midiService.selectedOutput?.id || null);
    });
    midiService.onOutputsChanged(setOutputs);
  }, []);

  if (!engine?.nodes) return <></>;
  const nodes = engine.nodes;

  if (nodes.length < 10) return <></>;
  const drum = nodes[9].note;
  if (!drum) return <></>;

  const handleOutputChange = (value: string) => {
    midiService.setOutputById(value);
    setSelectedId(value);
  };

  const handleNoteEvent = (v: TEventType<INoteState, INoteChange>) => {
    const newVelocity = v.value.velocity;
    const midiNote = v.value.midiNote;
    const channel = v.value.channel;

    if (newVelocity > 0) {
      midiService.sendNoteOn(midiNote, newVelocity, channel);
    } else {
      midiService.sendNoteOff(midiNote, channel);
    }
  };

  return (
    <div className="p-2 flex flex-col gap-2">
      {/* MIDI Output Selector */}
      <div className="flex flex-col gap-2">
        <Label>Drum Midi Output</Label>
        <Select
          value={selectedId ?? ""}
          onChange={handleOutputChange}
          className="text-xs p-1 rounded border bg-white text-gray-800"
          options={
            outputs.length === 0
              ? [{ value: "", label: "No MIDI Output" }]
              : [
                  { value: "", label: "Next Karaoke" },
                  ...outputs.map((out) => ({
                    value: out.id,
                    label: out.name ?? "",
                  })),
                ]
          }
        ></Select>
      </div>
      <div className="flex flex-wrap gap-1">
        {DRUM_NOTES_LIST.map((keyNote, _) => {
          const name = DrumNoteMap[keyNote];
          return (
            <div className="p-1 border" key={`drum-note-${keyNote}`}>
              <DrumNode
                onNoteChange={handleNoteEvent}
                note={drum}
                keyNote={keyNote}
              ></DrumNode>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DrumPanel;
