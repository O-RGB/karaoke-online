"use client";

import React, { useLayoutEffect, useState } from "react";
import UpdateFile from "../common/upload";

import { useSynth } from "@/app/hooks/spessasynth-hooks";
import VolumePanel from "../tools/volume-panel";
import SoundfontManager from "../tools/sound-font-manager";
import { MIDI } from "spessasynth_lib";
import PlayerPanel from "../tools/player-panel";
import HostRemote from "../remote/host-connect";

import { addSongList, onSearchList } from "@/lib/trie-search";
import TrieSearch from "trie-search";

interface KaraokePageProps {}

const KaraokePage: React.FC<KaraokePageProps> = ({}) => {
  const { gainNode, setupSpessasynth, synth, player, AudioPlay } = useSynth();
  const [songList, setSongList] = useState<TrieSearch<any>>();

  useLayoutEffect(() => {
    setupSpessasynth();
  }, []);

  if (!synth || !player) {
    return <></>;
  }

  const setSongListjson = async (file: File) => {
    console.log(file);
    const trie = await addSongList(file);
    setSongList(trie);
  };

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

      <UpdateFile
        className="text-white flex flex-col gap-2 border p-2 rounded-md"
        label="Upload your SongList"
        onSelectFile={setSongListjson}
        accept=".json"
      ></UpdateFile>

      <input
        type="text"
        onChange={(e) => {
          if (songList) {
            const value = e.target.value;
            const se = onSearchList(value, songList);
            console.log(se);
          }
        }}
      />
    </div>
  );
};

export default KaraokePage;
