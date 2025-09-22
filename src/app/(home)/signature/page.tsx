"use client";

import { generateMidiSignature } from "@/lib/karaoke/songs/midi/midi-signature";
import React, { useState } from "react";

export default function Home() {
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    try {
      setError("");
      setSignature("");
      const sig = await generateMidiSignature(file);
      setSignature(sig);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <input
        type="file"
        accept=".mid,.midi"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {signature && <p>Signature (base64url, 16 chars): {signature}</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
    </div>
  );
}
