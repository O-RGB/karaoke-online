import { DRUM_NOTES_LIST } from "@/config/value";
import { DrumNotesType } from "@/features/engine/modules/instrumentals/types/node.type";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import React from "react";
import DrumNode from "./node";
import { lowercaseToReadable } from "@/lib/general";

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
  if (!engine?.nodes) return <></>;
  const nodes = engine.nodes;

  if (nodes.length < 10) return <></>;
  const drum = nodes[9].note;
  if (!drum) return <></>;

  return (
    <>
      <div className="flex flex-wrap gap-1">
        {DRUM_NOTES_LIST.map((keyNote, _) => {
          const name = DrumNoteMap[keyNote];
          return (
            <div className="p-1 border" key={`drum-note-${keyNote}`}>
              <DrumNode note={drum} keyNote={keyNote}></DrumNode>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default DrumPanel;
