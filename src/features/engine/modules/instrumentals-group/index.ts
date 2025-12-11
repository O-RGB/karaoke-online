import { INoteChange } from "../../types/synth.type";
import { Instrumental } from "./inst";

export class InstrumentalsControl {
  public instrumentals: Map<number, Instrumental[]> = new Map();
  //   getInstrumentFamily = (program: number) => {
  //     if (program <= 7) return "Piano";
  //     if (program <= 15) return "Chromatic Percussion";
  //     if (program <= 23) return "Organ";
  //     if (program <= 31) return "Guitar";
  //     if (program <= 39) return "Bass";
  //     if (program <= 47) return "Strings";
  //     if (program <= 55) return "Ensemble";
  //     if (program <= 63) return "Brass";
  //     if (program <= 71) return "Reed";
  //     if (program <= 79) return "Pipe";
  //     if (program <= 87) return "Synth Lead";
  //     if (program <= 95) return "Synth Pad";
  //     if (program <= 103) return "Synth Effect";
  //     if (program <= 111) return "Ethnic";
  //     if (program <= 119) return "Percussive";
  //     return "Sound Effects";
  //   };

  //   getDrumName = (note: number) => {
  //     switch (note) {
  //       case 35:
  //       case 36:
  //         return "Kick";
  //       case 38:
  //         return "Snare";
  //       case 37:
  //         return "Side Stick";
  //       case 42:
  //       case 44:
  //       case 46:
  //         return "Hi-Hat";
  //       case 41:
  //       case 43:
  //       case 45:
  //       case 47:
  //       case 48:
  //         return "Tom";
  //       case 49:
  //       case 57:
  //         return "Crash Cymbal";
  //       case 51:
  //       case 52:
  //       case 53:
  //       case 59:
  //         return "Ride Cymbal";
  //       case 56:
  //         return "Cowbell";
  //       default:
  //         return "Percussion";
  //     }
  //   };

  constructor(start: number, end: number, name: string) {}

  noteOn(event: INoteChange) {}
}
