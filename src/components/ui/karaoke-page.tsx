"use client";

import React, { useLayoutEffect } from "react";
import { useSynth } from "@/hooks/spessasynth-hooks";
import VolumePanel from "../tools/volume-panel";
import SoundfontManager from "../tools/sound-font-manager";
import PlayerPanel from "../tools/player-panel";
import SearchSong from "../tools/search-song";
import { useMixer } from "@/hooks/mixer-hooks";
import LyricsPanel from "../tools/lyrics-panel";
import HostRemote from "../remote/host";
import SuperHostRemote from "../remote/super-host";
import { loadFileSystem, loadFileZip, storageIsEmpty } from "@/lib/storage";
import WallcomeModal from "../modal/wallcome";
import SongStorageProcessor from "../modal/song-storage-processor";

interface KaraokePageProps {}

const KaraokePage: React.FC<KaraokePageProps> = ({}) => {
  const { audioGain, setupSpessasynth, synth, player } = useSynth();
  const {
    setTracklistFile,
    loadAndPlaySong,
    setMusicLibraryFile,
    lyrics,
    tracklist,
  } = useMixer();

  useLayoutEffect(() => {
    setupSpessasynth();
  }, []);

  const onLoadFileSystem = async () => {
    const fileSystem = await loadFileSystem();
    if (fileSystem) {
      setTracklistFile(fileSystem.tracklist);
      setMusicLibraryFile(fileSystem.musicLibrary);
      return true;
    }
    return false;
  };

  const onLoadFileZip = async (fileList: FileList) => {
    const fileSystem = await loadFileZip(fileList);
    console.log(fileSystem)
    if (fileSystem) {
      setTracklistFile(fileSystem.tracklist);
      setMusicLibraryFile(fileSystem.musicLibrary);
      return true;
    }
    return false;
  };

  if (!synth || !player) {
    return <></>;
  }

  return (
    <div className="">
      <WallcomeModal
        onLoadFileSystem={onLoadFileSystem}
        onLoadZip={onLoadFileZip}
      ></WallcomeModal>
      <SongStorageProcessor></SongStorageProcessor>
      {/* <div
        onClick={async () => {
          console.log(await storageIsEmpty());
          // const file = await getSongBySuperKey("103.zip");
          // if (file) {
          //   const unzip = await ExtractFile(file);

          //   console.log(unzip);
          // }
        }}
        className="fixed z-50 top-7 left-7 p-2 rounded-lg bg-white"
      >
        test
      </div> */}
      <VolumePanel synth={synth} audioGain={audioGain}></VolumePanel>
      <div className="fixed top-2.5 right-2.5">
        <SoundfontManager synth={synth}></SoundfontManager>
      </div>

      <SearchSong
        tracklist={tracklist}
        onClickSong={loadAndPlaySong}
      ></SearchSong>

      <LyricsPanel lyrics={lyrics}></LyricsPanel>
      <PlayerPanel player={player}></PlayerPanel>

      <HostRemote></HostRemote>
      <SuperHostRemote></SuperHostRemote>
    </div>
  );
};

export default KaraokePage;
