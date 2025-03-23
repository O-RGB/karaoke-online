import SliderCommon from "@/components/common/input-data/slider";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import React, { useEffect } from "react";
import MixerNode from "./mixer-node";
import {
  PIANO,
  ORGAN,
  ACCORDION,
  SYNTH,
  BASS,
  GUITAR_CLEAN,
  GUITAR_NYLON,
  GUITAR_JAZZ,
  GUITAR_OVERDRIVE,
  GUITAR_DISTORTION,
  STRINGS,
  VIOLIN,
  BRASS,
  TRUMPET,
  SYNTH_BASS,
  REED,
  SAX,
  PIPE,
  KICK,
  SNARE,
  STICK,
  TOM_LOW,
  TOM_MID,
  TOM_HIGH,
  HI_HAT,
  COWBELL,
} from "@/config/value";

interface MixerModalProps {}

const CATEGORY_MAP: Record<string, number[]> = {
  Pianos: PIANO,
  Organs: ORGAN,
  Accordions: ACCORDION,
  Synths: SYNTH,
  Basses: BASS,
  CleanGuitars: GUITAR_CLEAN,
  NylonGuitars: GUITAR_NYLON,
  JazzGuitars: GUITAR_JAZZ,
  OverdriveGuitars: GUITAR_OVERDRIVE,
  DistortionGuitars: GUITAR_DISTORTION,
  Strings: STRINGS,
  Violins: VIOLIN,
  Brass: BRASS,
  Trumpets: TRUMPET,
  SynthBasses: SYNTH_BASS,
  Reeds: REED,
  Saxophones: SAX,
  Pipes: PIPE,
  KickDrums: KICK,
  SnareDrums: SNARE,
  StickDrums: STICK,
  LowToms: TOM_LOW,
  MidToms: TOM_MID,
  HighToms: TOM_HIGH,
  HiHats: HI_HAT,
  Cowbells: COWBELL,
};

const MixerModal: React.FC<MixerModalProps> = ({}) => {
  return (
    <div className="flex items-center">
      {Object.entries(CATEGORY_MAP).map((value, index) => {
        const [category, programs] = value;
        return (
          <MixerNode
            category={category}
            programs={programs}
            key={`mixer-${index}`}
            onSliderChange={(value) => {}}
            title={`Main`}
          ></MixerNode>
        );
      })}
    </div>
  );
};

export default MixerModal;
