import { MAX_CHANNEL } from "@/config/value";
import { INoteChange } from "@/features/engine/types/synth.type";
import { SynthNode } from "../node";

export class KeyboardNode {
  public notesOn: SynthNode<"NOTE_ON", INoteChange>[] = [];
  public notesOff: SynthNode<"NOTE_OFF", INoteChange>[] = [];
  private activeNotes: Map<number, INoteChange> = new Map();

  constructor(channel: number) {
    this.notesOn = MAX_CHANNEL.map((_, midiNote) => {
      return new SynthNode(undefined, "NOTE_ON", channel, {
        channel,
        midiNote,
        velocity: 0,
      });
    });
    this.notesOff = MAX_CHANNEL.map((_, midiNote) => {
      return new SynthNode(undefined, "NOTE_OFF", channel, {
        channel,
        midiNote,
        velocity: 0,
      });
    });
  }

  setOn(note: INoteChange) {
    if (!this.notesOn) return;
    this.notesOn[note.midiNote].setValue(note);
    this.activeNotes.set(note.midiNote, note);
  }

  setOff(note: INoteChange) {
    if (!this.notesOff) return;
    this.notesOff[note.midiNote].setValue(note);
    this.activeNotes.delete(note.midiNote);
  }

  setModifier(edit: INoteChange) {
    // if (!this.keyModifierManager) return;
    // this.keyModifierManager.addModifier(edit.channel, edit.midiNote, {
    //   velocity: edit.velocity,
    //   patch: undefined,
    // });
  }

  reset() {
    if (!this.notesOn) return;
    this.activeNotes.forEach((_, noteIndex) => {
      this.notesOn![noteIndex].reset();
    });
    this.activeNotes.clear();
  }
}
