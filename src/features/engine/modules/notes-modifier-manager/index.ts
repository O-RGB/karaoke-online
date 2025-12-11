import { CHANNEL_DEFAULT, DRUM_CHANNEL, MAX_CHANNEL } from "@/config/value";
import { INoteChange } from "../../types/synth.type";
import { NoteEventManager } from "./note";

export const KEYNOTE = "NOTE";

export class NotesModifierManager {
  public notes: Map<number, NoteEventManager[]> = new Map();
  public globalTranspose: number = 0;

  init(): void {
    for (let ch = 0; ch < CHANNEL_DEFAULT.length; ch++) {
      const init_note = MAX_CHANNEL.map((_, midiNote) => {
        return new NoteEventManager({
          channel: ch,
          midiNote: midiNote,
          velocity: 0,
        });
      });
      this.notes.set(ch, init_note);
    }
  }

  constructor() {
    this.init();
  }

  public setGlobalTranspose(value: number): void {
    this.globalTranspose = value;
  }

  private applyTranspose(event: INoteChange): INoteChange {
    const isDrum = event.channel === DRUM_CHANNEL;
    const finalNote = Math.max(
      0,
      Math.min(127, event.midiNote + (isDrum ? 0 : this.globalTranspose))
    );

    return {
      ...event,
      midiNote: finalNote,
    };
  }

  noteOn(event: INoteChange): INoteChange {
    const noteList = this.notes.get(event.channel);
    if (!noteList) return event;
    const ev = this.applyTranspose(event);
    const manager = noteList[ev.midiNote];
    const updated = manager.eventOn(ev);
    return updated;
  }

  noteOff(event: INoteChange): INoteChange {
    const noteList = this.notes.get(event.channel);
    if (!noteList) return event;
    const ev = this.applyTranspose(event);
    const manager = noteList[ev.midiNote];
    const updated = manager.eventOff(ev);
    return updated;
  }

  getNote(channel: number): NoteEventManager[] {
    return this.notes.get(channel) ?? [];
  }
}
