export async function generateMidiSignature(file: File): Promise<string> {
  const QUANT_MS = 10;

  function base64UrlFromBytes(bytes: Uint8Array) {
    let binary = "";
    for (let i = 0; i < bytes.length; i++)
      binary += String.fromCharCode(bytes[i]);
    return btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  function parseMIDI(buffer: ArrayBuffer) {
    const view = new DataView(buffer);
    let pos = 0;

    const header = new TextDecoder().decode(buffer.slice(0, 4));
    if (header !== "MThd") throw new Error("Not a valid MIDI file");

    pos += 4;
    const headerLength = view.getUint32(pos);
    pos += 4;
    pos += 2; // format
    const numTracks = view.getUint16(pos);
    pos += 2;
    const division = view.getUint16(pos);
    pos += 2;

    const ticksPerSecond =
      division & 0x8000
        ? ((division & 0x7f00) >> 8) * (division & 0xff)
        : (division * 120) / 60;

    const events: { time: number; midi: number; type: "noteOn" | "noteOff" }[] =
      [];

    for (let track = 0; track < numTracks; track++) {
      if (pos >= buffer.byteLength - 8) break;
      const trackHeader = new TextDecoder().decode(buffer.slice(pos, pos + 4));
      if (trackHeader !== "MTrk") {
        pos += 4;
        const chunkSize = view.getUint32(pos);
        pos += 4 + chunkSize;
        continue;
      }
      pos += 4;
      const trackLength = view.getUint32(pos);
      pos += 4;
      const trackEnd = pos + trackLength;

      let currentTime = 0;
      let runningStatus = 0;

      while (pos < trackEnd && pos < buffer.byteLength) {
        // delta time
        let deltaTime = 0;
        let byte: number;
        do {
          byte = view.getUint8(pos++);
          deltaTime = (deltaTime << 7) | (byte & 0x7f);
        } while (byte & 0x80);

        currentTime += deltaTime;
        if (pos >= buffer.byteLength) break;

        let status = view.getUint8(pos);
        if (status < 0x80) {
          status = runningStatus;
          pos--;
        } else {
          pos++;
          runningStatus = status;
        }

        const timeInSeconds = currentTime / ticksPerSecond;
        const eventType = status & 0xf0;

        if (eventType === 0x90 || eventType === 0x80) {
          if (pos + 1 >= buffer.byteLength) break;
          const note = view.getUint8(pos++);
          const velocity = view.getUint8(pos++);
          const isNoteOn = eventType === 0x90 && velocity > 0;
          events.push({
            time: timeInSeconds,
            midi: note,
            type: isNoteOn ? "noteOn" : "noteOff",
          });
        } else if (eventType >= 0x80 && eventType <= 0xe0) {
          let dataBytes = 2;
          if (eventType === 0xc0 || eventType === 0xd0) dataBytes = 1;
          pos += dataBytes;
        } else if (status === 0xf0) {
          while (pos < buffer.byteLength && view.getUint8(pos) !== 0xf7) pos++;
          if (pos < buffer.byteLength) pos++;
        } else if (status === 0xff) {
          const metaType = view.getUint8(pos++);
          let length = 0;
          do {
            byte = view.getUint8(pos++);
            length = (length << 7) | (byte & 0x7f);
          } while (byte & 0x80);
          pos += length;
        } else {
          pos++;
        }
      }
    }
    return { events };
  }

  const ab = await file.arrayBuffer();
  const midi = parseMIDI(ab);
  const midiEvents = midi.events;

  if (!midiEvents.length) throw new Error("No note events found");

  const events = midiEvents.map((ev) => {
    const timeMs = Math.round((ev.time * 1000) / QUANT_MS) * QUANT_MS;
    const isOn = ev.type === "noteOn" ? 1 : 0;
    return [timeMs, ev.midi, isOn] as const;
  });

  events.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);

  const serialized = events.map((e) => `${e[0]}|${e[1]}|${e[2]}`).join(";");
  const data = new TextEncoder().encode(serialized);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const truncated = new Uint8Array(hash).slice(0, 12); // 96 bits

  return base64UrlFromBytes(truncated); // 16 chars
}
