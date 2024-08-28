"use client";

import React, { useLayoutEffect, useState } from "react";
import UpdateFile from "../common/upload";
import { useSynth } from "@/app/hooks/spessasynth-hooks";
import VolumePanel from "../tools/volume-panel";
import SoundfontManager from "../tools/sound-font-manager";
import { MIDI } from "spessasynth_lib";
import PlayerPanel from "../tools/player-panel";
import HostRemote from "../remote/host-connect";
import FetchFileComponent from "../tools/test";
import SearchSong from "../tools/search-song";
import FileUploadComponent from "../tools/worker-test";
import SuperHostRemote from "../remote/super-host.connect";
import { useMixer } from "@/app/hooks/mixer-hooks";

interface KaraokePageProps {}

const KaraokePage: React.FC<KaraokePageProps> = ({}) => {
  const { gainNode, setupSpessasynth, synth, player, AudioPlay } = useSynth();
  const { setSongListFile, setSongEventHandle, songList, songEvent } =
    useMixer();

  useLayoutEffect(() => {
    setupSpessasynth();
  }, []);

  if (!synth || !player) {
    return <></>;
  }

  const onLoadSong = async (files: SongFiles) => {
    console.log(files);
    const midiFileArrayBuffer = await files.mid.arrayBuffer();
    const parsedMidi = new MIDI(midiFileArrayBuffer, files.mid.name);
    player.loadNewSongList([parsedMidi]);
  };

  return (
    <div className="min-h-dvh py-20 px-10 flex flex-col gap-2 justify-center items-center bg-slate-900">
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
      <VolumePanel synth={synth} gainNode={gainNode}></VolumePanel>
      <PlayerPanel player={player}></PlayerPanel>
      User
      <HostRemote></HostRemote>
      Super User
      <SuperHostRemote></SuperHostRemote>
      <UpdateFile
        className="text-white flex flex-col gap-2 border p-2 rounded-md"
        label="Upload your SongList"
        onSelectFile={setSongListFile}
        accept=".json"
      ></UpdateFile>
      <SearchSong
        songList={songList}
        onClickSong={setSongEventHandle}
      ></SearchSong>
      <FetchFileComponent
        onSelectSong={songEvent}
        onLoadSong={onLoadSong}
      ></FetchFileComponent>
      <FileUploadComponent></FileUploadComponent>
      {/* <MyComponent></MyComponent> */}
    </div>
  );
};

export default KaraokePage;
