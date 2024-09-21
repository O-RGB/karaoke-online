"use client";

import React, { useLayoutEffect } from "react";
import { useSynth } from "@/hooks/spessasynth-hook";
import VolumePanel from "../tools/volume-panel";
import PlayerPanel from "../tools/player-panel";
import SearchSong from "../tools/search-song";
import { useAppControl } from "@/hooks/app-control-hook";
import LyricsPanel from "../tools/lyrics-panel";
import HostRemote from "../remote/host";
import SuperHostRemote from "../remote/super-host";
import WallcomeModal from "../modal/wallcome";
import SoundfontManager from "../tools/sound-font-manager";
import ClockPanel from "../tools/clock-panel";
import ContextModal from "../modal/context-modal";
import AppendSongModal from "../modal/append-song";
import { usePlayer } from "@/hooks/player-hook";
import TempoPanel from "../tools/tempo-panel";
import StatusPanel from "../tools/status-panel";

interface KaraokePageProps {}

const KaraokePage: React.FC<KaraokePageProps> = ({}) => {
  const { audioGain, setupSpessasynth, synth, player, instrument, analysers } =
    useSynth();
  const {
    setTracklistFile,
    loadAndPlaySong,
    setMusicLibraryFile,
    setSongPlaying,
    tracklist,
    musicLibrary,
    notification,
    lyrics,
    cursorIndices,
    cursorTicks,
  } = useAppControl();

  const { tempo, tick, displayLyrics } = usePlayer();

  useLayoutEffect(() => {
    setupSpessasynth();
  }, []);

  if (!synth || !player) {
    return <></>;
  }

  const modalMap: ModalComponents = {
    SOUNDFONT_MODEL: <SoundfontManager synth={synth}></SoundfontManager>,
    JOIN: <HostRemote></HostRemote>,
    SUPER_JOIN: <SuperHostRemote></SuperHostRemote>,
    MUSIC_LOADED: <SuperHostRemote></SuperHostRemote>,
    MUSIC_STORE: <SuperHostRemote></SuperHostRemote>,
    ADD_MUSIC: <AppendSongModal></AppendSongModal>,
  };

  return (
    <ContextModal modal={modalMap}>
      <WallcomeModal
        setTracklistFile={setTracklistFile}
        setMusicLibraryFile={setMusicLibraryFile}
        musicLibrary={musicLibrary}
      ></WallcomeModal>
      <StatusPanel text={notification}></StatusPanel>
      <VolumePanel
        synth={synth}
        analysers={analysers}
        instrument={instrument}
      ></VolumePanel>
      <TempoPanel
        tempo={tempo}
        tick={tick}
        timeDivision={player.midiData.timeDivision}
      ></TempoPanel>
      <ClockPanel></ClockPanel>
      <SearchSong
        tracklist={tracklist}
        onClickSong={loadAndPlaySong}
      ></SearchSong>
      <LyricsPanel
        cursorIndices={cursorIndices}
        cursorTicks={cursorTicks}
        lyrics={lyrics}
        tick={tick}
        player={player}
        setSongPlaying={setSongPlaying}
      ></LyricsPanel>
      <PlayerPanel
        lyrics={lyrics}
        modalMap={modalMap}
        player={player}
      ></PlayerPanel>
    </ContextModal>
  );
};

export default KaraokePage;
