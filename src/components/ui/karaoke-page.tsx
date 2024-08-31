"use client";

import React, { useLayoutEffect } from "react";
import { useSynth } from "@/hooks/spessasynth-hooks";
import VolumePanel from "../tools/volume-panel";
import PlayerPanel from "../tools/player-panel";
import SearchSong from "../tools/search-song";
import { useMixer } from "@/hooks/mixer-hooks";
import LyricsPanel from "../tools/lyrics-panel";
import HostRemote from "../remote/host";
import SuperHostRemote from "../remote/super-host";
import WallcomeModal from "../modal/wallcome";

interface KaraokePageProps {}

const KaraokePage: React.FC<KaraokePageProps> = ({}) => {
  const { audioGain, setupSpessasynth, synth, player, instrument } = useSynth();
  const {
    setTracklistFile,
    loadAndPlaySong,
    setMusicLibraryFile,
    lyrics,
    tracklist,
    musicLibrary,
  } = useMixer();

  useLayoutEffect(() => {
    setupSpessasynth();
  }, []);

  if (!synth || !player) {
    return <></>;
  }

  return (
    <div className="">
      <WallcomeModal
        setTracklistFile={setTracklistFile}
        setMusicLibraryFile={setMusicLibraryFile}
        musicLibrary={musicLibrary}
      ></WallcomeModal>

      <VolumePanel
        synth={synth}
        audioGain={audioGain}
        instrument={instrument}
      ></VolumePanel>
      {/* <div className="fixed top-2.5 right-2.5">
        <SoundfontManager synth={synth}></SoundfontManager>
      </div> */}

      <SearchSong
        tracklist={tracklist}
        onClickSong={loadAndPlaySong}
      ></SearchSong>

      <LyricsPanel lyrics={lyrics}></LyricsPanel>
      <PlayerPanel player={player}></PlayerPanel>

      {/* <HostRemote></HostRemote>
      <SuperHostRemote></SuperHostRemote> */}
    </div>
  );
};

export default KaraokePage;
