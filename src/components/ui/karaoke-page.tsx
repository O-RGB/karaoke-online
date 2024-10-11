"use client";

import React, { useEffect } from "react";
import { useSynth } from "@/hooks/spessasynth-hook";
import VolumePanel from "../tools/volume-panel";
import PlayerPanel from "../tools/player-panel";
import SearchSong from "../tools/search-song/search-song";
import { useAppControl } from "@/hooks/app-control-hook";
import LyricsPanel from "../tools/lyrics-panel";
import HostRemote from "../remote/host";
import SuperHostRemote from "../remote/super-host";

import SoundfontManager from "../modal/sound-font-manager";
import ClockPanel from "../tools/clock-panel";
import ContextModal from "../modal/context-modal";
import AppendSongModal from "../modal/append-song";
import TempoPanel from "../tools/tempo-panel";
import StatusPanel from "../tools/status/status-panel";
import OptionsPanel from "../tools/options-panel";
import WallpaperModal from "../modal/wallpaper-modal";
import LyricsModal from "../modal/lyrics-modal";
import { useNotification } from "@/hooks/notification-hook";
import MusicStoreModal from "../modal/music-store-modal";
import MidiSettingModal from "../modal/midi-setting-modal";
import SongListModal from "../modal/song-list.modal";
import { useDragDrop } from "@/hooks/drag-drop-hook";
import { onSelectTestMusic } from "@/lib/karaoke/read";
import { getTracklistToJson } from "@/lib/storage/tracklist";
import DriveSetting from "../modal/drive-setting-modal";
import { initDatabase } from "@/utils/database/db";
import { getLocalSystemMode } from "@/lib/local-storage";
import TicksRender from "./ticks-render/ticks-render";
import LyricsRender from "./lyrics-render/lyrics-render";
import GainRender from "./gain-render/gain-render";
import VolumeEvnet from "./event-render/volume-event";
import InstrumentsEvent from "./event-render/instruments-event";

interface KaraokePageProps {}

const KaraokePage: React.FC<KaraokePageProps> = ({}) => {
  const { perset, synth, player, instrument, analysers, setupSpessasynth } =
    useSynth();
  const { filesDragging } = useDragDrop();
  const {
    loadAndPlaySong,
    setSongPlaying,
    tracklist,
    lyrics,
    cursorIndices,
    cursorTicks,
    isVolumeHeld,
    addTracklist,
    setSystemDriveMode,
    midiPlaying,
    hideVolume,
  } = useAppControl();

  // const { tempo, tick } = usePlayer();
  const { notification } = useNotification();

  const startup = async () => {
    // Config
    const systemConfig = getLocalSystemMode();
    setSystemDriveMode(systemConfig === "DRIVE");

    // Setup
    setupSpessasynth();
    initDatabase();

    // Database
    const tl = await getTracklistToJson();
    addTracklist(tl);
  };

  useEffect(() => {
    startup();
  }, []);

  const decodeFile = async (files: FileList) => {
    const song = await onSelectTestMusic(undefined, files);
    if (song) {
      setSongPlaying(song);
    }
  };

  useEffect(() => {
    if (filesDragging) {
      decodeFile(filesDragging);
    }
  }, [filesDragging]);

  if (!synth || !player) {
    return <></>;
  }

  const modalMap: ModalComponents = {
    SOUNDFONT_MODEL: <SoundfontManager></SoundfontManager>,
    JOIN: <HostRemote></HostRemote>,
    SUPER_JOIN: <SuperHostRemote></SuperHostRemote>,
    MUSIC_STORE: <MusicStoreModal></MusicStoreModal>,
    ADD_MUSIC: <AppendSongModal></AppendSongModal>,
    WALLPAPER: <WallpaperModal></WallpaperModal>,
    LYRICS: <LyricsModal></LyricsModal>,
    MIDI_SETTING: <MidiSettingModal></MidiSettingModal>,
    SONG_LIST: <SongListModal></SongListModal>,
    DRIVE_SETTING: <DriveSetting></DriveSetting>,
  };

  return (
    <>
      {/* Process */}
      <TicksRender
        synth={synth}
        player={player}
        midiPlaying={midiPlaying}
      ></TicksRender>
      <LyricsRender
        cursorIndices={cursorIndices}
        cursorTicks={cursorTicks}
        lyrics={lyrics}
      ></LyricsRender>

      <GainRender
        hideVolume={hideVolume}
        player={player}
        analysers={analysers}
      ></GainRender>
      <VolumeEvnet isVolumeHeld={isVolumeHeld} synth={synth}></VolumeEvnet>
      <InstrumentsEvent synth={synth}></InstrumentsEvent>
      {/* Contact */}
      <ContextModal modal={modalMap}>
        <OptionsPanel className="hidden flex-col gap-2 lg:flex fixed top-[40%] right-5"></OptionsPanel>
        <StatusPanel notification={notification}></StatusPanel>
        <VolumePanel
          synth={synth}
          perset={perset}
          analysers={analysers}
          instrument={instrument}
        ></VolumePanel>
        <TempoPanel timeDivision={midiPlaying?.timeDivision}></TempoPanel>
        <ClockPanel></ClockPanel>
        <SearchSong
          tracklist={tracklist}
          onClickSong={loadAndPlaySong}
        ></SearchSong>
        <LyricsPanel
          cursorIndices={cursorIndices}
          cursorTicks={cursorTicks}
          lyrics={lyrics}
        ></LyricsPanel>
        <PlayerPanel
          lyrics={lyrics}
          modalMap={modalMap}
          player={player}
        ></PlayerPanel>
      </ContextModal>
    </>
  );
};

export default KaraokePage;
