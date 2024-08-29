"use client";

import React, { useEffect, useLayoutEffect } from "react";
import { useSynth } from "@/app/hooks/spessasynth-hooks";
import VolumePanel from "../tools/volume-panel";
import SoundfontManager from "../tools/sound-font-manager";
import { MIDI } from "spessasynth_lib";
import PlayerPanel from "../tools/player-panel";
import SearchSong from "../tools/search-song";
import { useMixer } from "@/app/hooks/mixer-hooks";
import FolderReader from "../tools/folder-reader";
import { loadSuperZipAndExtractSong } from "@/lib/zip";
import LyricsPanel from "../tools/lyrics-panel";
import HostRemote from "../remote/host-connect";

interface KaraokePageProps {}

const KaraokePage: React.FC<KaraokePageProps> = ({}) => {
  const { gainNode, setupSpessasynth, synth, player } = useSynth();
  const {
    setSongListFile,
    setSongStoreHandle,
    onSelectKaraokeFolder,
    lyrics,
    songList,
  } = useMixer();

  useLayoutEffect(() => {
    setupSpessasynth();
  }, []);

  if (!synth || !player) {
    return <></>;
  }

  return (
    <div className="">
      {/* <div className="text-white text-2xl ">Karaoke Demo</div>
      <div
        className="p-2 border text-white"
        onClick={() => {
          AudioPlay("/test.wav");
        }}
      >
        Open Audio
      </div> */}

      <VolumePanel synth={synth} gainNode={gainNode}></VolumePanel>
      <div className="fixed top-2.5 right-2.5">
        <FolderReader
          setSongListFile={setSongListFile}
          onSelectFileSystem={setSongStoreHandle}
        ></FolderReader>
        <SoundfontManager synth={synth}></SoundfontManager>
      </div>

      <SearchSong
        songList={songList}
        onClickSong={onSelectKaraokeFolder}
      ></SearchSong>

      {/* User
      <HostRemote></HostRemote>
      Super User
      <SuperHostRemote></SuperHostRemote> */}

      <LyricsPanel lyrics={lyrics}></LyricsPanel>

      <PlayerPanel player={player}></PlayerPanel>

      <HostRemote></HostRemote>
      {/* <LoadSongInZip
        songStore={songStore}
        onLoadSong={onLoadSong}
        onSelectSong={songEvent}
      ></LoadSongInZip> */}
      {/* <FetchFileComponent></FetchFileComponent>
      <FileUploadComponent></FileUploadComponent>
      <div className="p-2 border">
        <KaraokePlayer></KaraokePlayer>
      </div> */}
    </div>
  );
};

export default KaraokePage;
