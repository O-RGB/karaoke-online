import { INoteChange } from "@/features/engine/types/synth.type";
import { SynthControl } from "../../instrumentals/node";

/**
 * NoteEventManager (version with init defaults)
 *
 * - fixedVelocity: -1 = disabled
 * - gain: default 127 (1.0x)
 * - expression: default 127 (1.0x)
 * - transpose: default 0
 */
export class NoteEventManager {
  public note: SynthControl<number, INoteChange> | undefined = undefined;
  public channel: number | undefined;

  public fixedVelocity?: SynthControl<null, number>;
  public gain?: SynthControl<null, number>;
  public expression?: SynthControl<null, number>;
  public transpose?: SynthControl<null, number>;

  constructor(midiNote: INoteChange) {
    this.note = new SynthControl(
      undefined,
      midiNote.midiNote,
      midiNote.channel,
      midiNote
    );
    this.channel = midiNote.channel;

    this.fixedVelocity = new SynthControl(
      undefined,
      null,
      midiNote.channel,
      -1
    );

    this.gain = new SynthControl(undefined, null, midiNote.channel, 127);
    this.expression = new SynthControl(undefined, null, midiNote.channel, 127);

    this.transpose = new SynthControl(undefined, null, midiNote.channel, 0);
  }

  public setFixedVelocity(value: number | -1): void {
    const v = value === -1 ? -1 : Math.max(0, Math.min(127, Math.round(value)));
    this.fixedVelocity?.setValue(v);
  }

  public setGain(value: number): void {
    this.gain?.setValue(Math.max(0, Math.round(value)));
  }

  public setExpression(value: number): void {
    this.expression?.setValue(Math.max(0, Math.min(127, Math.round(value))));
  }

  public setTranspose(value: number): void {
    this.transpose?.setValue(Math.round(value));
  }

  public eventOn(note: INoteChange): INoteChange {
    let finalMidiNote = note.midiNote;
    let finalVelocity = note.velocity ?? 100;

    const trans = this.transpose?.value ?? 0;
    finalMidiNote = Math.max(0, Math.min(127, finalMidiNote + trans));

    const fixed = this.fixedVelocity?.value ?? -1;
    if (fixed !== -1) {
      finalVelocity = Math.max(0, Math.min(127, Math.round(fixed)));
    } else {
      const g = this.gain?.value ?? 127;
      const expr = this.expression?.value ?? 127;

      finalVelocity = finalVelocity * (g / 127) * (expr / 127);
    }

    finalVelocity = Math.max(0, Math.min(127, Math.round(finalVelocity)));

    const finalNote: INoteChange = {
      ...note,
      midiNote: finalMidiNote,
      velocity: finalVelocity,
    };

    this.note?.setValue(finalNote);
    return finalNote;
  }

  public eventOff(note: INoteChange): INoteChange {
    let finalMidiNote = note.midiNote;

    const trans = this.transpose?.value ?? 0;
    finalMidiNote = Math.max(0, Math.min(127, finalMidiNote + trans));

    const finalNote: INoteChange = {
      ...note,
      midiNote: finalMidiNote,
    };

    this.note?.setValue(finalNote);
    return finalNote;
  }
}
