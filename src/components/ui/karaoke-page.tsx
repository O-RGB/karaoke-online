"use client";

import React, { useEffect, useLayoutEffect, useState } from "react";
import UpdateFile from "../common/upload";

import { useSynth } from "@/app/hooks/spessasynth-hooks";
import VolumePanel from "../tools/volume-panel";
import SoundfontManager from "../tools/sound-font-manager";
import { MIDI } from "spessasynth_lib";
import PlayerPanel from "../tools/player-panel";
import HostRemote from "../remote/host-connect";
import { useRemote } from "@/app/hooks/peer-hooks";

interface KaraokePageProps {}

const KaraokePage: React.FC<KaraokePageProps> = ({}) => {
  const { gainNode, setupSpessasynth, synth, player, AudioPlay } = useSynth();

  useLayoutEffect(() => {
    setupSpessasynth();
  }, []);

  if (!synth || !player) {
    return <></>;
  }

  return (
    <div className="min-h-dvh flex flex-col gap-2 justify-center items-center bg-slate-800">
      <div className="text-white text-2xl ">Karaoke Demo</div>
      <div
        className="p-2 border text-white"
        onClick={() => {
          AudioPlay("/test.wav");
        }}
      >
        Open Audio
      </div>
      <SoundfontManager synth={synth}></SoundfontManager>
      <UpdateFile
        className="text-white flex flex-col gap-2 border p-2 rounded-md"
        label="Upload your Midi"
        onSelectFile={async (file) => {
          const midiFileArrayBuffer = await file.arrayBuffer();
          const parsedMidi = new MIDI(midiFileArrayBuffer, file.name);
          player.loadNewSongList([parsedMidi]);
        }}
        accept=".mid,.midi"
      ></UpdateFile>
      <VolumePanel synth={synth} gainNode={gainNode}></VolumePanel>
      <PlayerPanel player={player}></PlayerPanel>
      <HostRemote></HostRemote>

      {/* <Button onClick={() => startConnection(true)}>Start Connection</Button>
      <Button onClick={() => startConnection(false)}>Join</Button>
      <div className="p-2 border">
        HOST KEY
        <br />
        {hostKey}
      </div>
      {hostKey && <input type="text" />} */}
    </div>
  );
};

export default KaraokePage;
