import { MAX_CHANNEL } from "@/config/value";
import { INoteChange, INoteModifier } from "@/features/engine/types/synth.type";
import { EventManager } from "../events";
import { SynthNode } from "../node";
import { INoteState, TEventType } from "../types/node.type";
import { KeyModifierManager } from "spessasynth_lib/@types/synthetizer/key_modifier_manager";

export class KeyboardNode {
  public notes: SynthNode<INoteState, INoteChange>[] = [];
  public notesOff: SynthNode<INoteState, INoteChange>[] = [];

  private activeNotes: Map<number, INoteChange> = new Map();

  public keyModifierManager: KeyModifierManager | undefined = undefined;

  constructor(channel: number, keyModifierManager: KeyModifierManager) {
    this.keyModifierManager = keyModifierManager;
    this.notes = MAX_CHANNEL.map((_, midiNote) => { 
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
    if (!this.notes) return;
    this.notes[note.midiNote].setValue(note);
    this.activeNotes.set(note.midiNote, note);
  }

  setOff(note: INoteChange) {
    setTimeout(() => {
      if (!this.notes) return;
      this.notes[note.midiNote].setValue(note);
      this.activeNotes.delete(note.midiNote);
    }, 30);
  }

  setModifier(edit: INoteChange) {
    if (!this.keyModifierManager) return;
    this.keyModifierManager.addModifier(edit.channel, edit.midiNote, {
      velocity: edit.velocity,
      patch: undefined,
    });
  }

  reset() {
    if (!this.notes) return;
    this.activeNotes.forEach((_, noteIndex) => {
      this.notes![noteIndex].reset();
    });
    this.activeNotes.clear();
  }
}
