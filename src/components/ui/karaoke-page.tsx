"use client";

import React, { ReactNode, useLayoutEffect } from "react";
import { useSynth } from "@/hooks/spessasynth-hooks";
import VolumePanel from "../tools/volume-panel";
import PlayerPanel from "../tools/player-panel";
import SearchSong from "../tools/search-song";
import { useMixer } from "@/hooks/mixer-hooks";
import LyricsPanel from "../tools/lyrics-panel";
import HostRemote from "../remote/host";
import SuperHostRemote from "../remote/super-host";
import WallcomeModal from "../modal/wallcome";
import SoundfontManager from "../tools/sound-font-manager";
import ClockPanel from "../tools/clock-panel";
import ContextModal from "../modal/context-modal";

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

  const modalMap = new Map<ModalType, ReactNode>([
    ["SOUNDFONT_MODEL", <SoundfontManager synth={synth}></SoundfontManager>],
    ["JOIN", <HostRemote></HostRemote>],
    ["SUPER_JOIN", <SuperHostRemote></SuperHostRemote>],
    ["SUPER_JOIN", <SuperHostRemote></SuperHostRemote>],
    ["MUSIC_LOADED", <SuperHostRemote></SuperHostRemote>],
    ["MUSIC_STORE", <SuperHostRemote></SuperHostRemote>],
  ]);

  return (
    <ContextModal modal={modalMap}>
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
      <ClockPanel></ClockPanel>
      <SearchSong
        tracklist={tracklist}
        onClickSong={loadAndPlaySong}
      ></SearchSong>

      <LyricsPanel lyrics={lyrics}></LyricsPanel>
      <PlayerPanel modalMap={modalMap} player={player}></PlayerPanel>
    </ContextModal>
  );
};

export default KaraokePage;
