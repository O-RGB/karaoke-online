type MIDIOutputCallback = (outputs: MIDIOutput[]) => void;

class MidiService {
  midiAccess: MIDIAccess | null = null;
  outputs: MIDIOutput[] = [];
  selectedOutput: MIDIOutput | null = null;
  listeners: MIDIOutputCallback[] = [];

  async init() {
    if (this.midiAccess) return;

    this.midiAccess = await navigator.requestMIDIAccess();
    this.updateOutputs();

    this.midiAccess.onstatechange = () => {
      this.updateOutputs();
    };
  }

  updateOutputs() {
    this.outputs = Array.from(this.midiAccess?.outputs.values() || []);
    if (!this.selectedOutput && this.outputs.length > 0) {
      this.selectedOutput = this.outputs[0];
    }
    this.listeners.forEach((cb) => cb(this.outputs));
  }

  onOutputsChanged(cb: MIDIOutputCallback) {
    this.listeners.push(cb);
  }

  setOutputById(id: string) {
    const found = this.outputs.find((o) => o.id === id);
    if (found) {
      this.selectedOutput = found;
    }
  }

  sendNoteOn(note: number, velocity: number, channel = 0) {
    if (!this.selectedOutput) return;
    this.selectedOutput.send([0x90 + channel, note, velocity]);
  }

  sendNoteOff(note: number, channel = 0) {
    if (!this.selectedOutput) return;
    this.selectedOutput.send([0x80 + channel, note, 0]);
  }
}

export const midiService = new MidiService();
