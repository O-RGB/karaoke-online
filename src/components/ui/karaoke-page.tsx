"use client";

import React, { useEffect } from "react";
import VolumePanel from "../tools/volume-panel";
import PlayerPanel from "../tools/player-panel";
import SearchSong from "../tools/search-song/search-song";
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
import MidiSettingModal from "../modal/midi-setting-modal";
import SongListModal from "../modal/song-list.modal";
import { getTracklist } from "@/lib/storage/tracklist";
import DriveSetting from "../modal/drive-setting-modal";
import TicksRender from "./ticks-render/ticks-render";
import LyricsRender from "./lyrics-render/lyrics-render";
import GainRender from "./gain-render/gain-render";
import VolumeEvnet from "./event-render/volume-event";
import InstrumentsEvent from "./event-render/instruments-event";
import DisplaySettingModal from "../modal/display";
import { useSpessasynthStore } from "../../stores/spessasynth-store";
import { DragDrop } from "../tools/drag-drop/drag-drop";
import { usePeerStore } from "@/stores/peer-store";
import DataStoresModal from "../modal/datastores";
import useTracklistStore from "@/stores/tracklist-store";
import RemoteRender from "./remote-render/remote-render";
import useNotificationStore from "@/stores/notification-store";
import { useAppControlStore } from "@/stores/player-store";
import WallpaperRender from "./wallpaper-render/wallpaper-render";

interface KaraokePageProps {}

const KaraokePage: React.FC<KaraokePageProps> = ({}) => {
  const { perset, synth, player, analysers, setupSpessasynth } =
    useSpessasynthStore();
  const initializePeers = usePeerStore((state) => state.initializePeers);
  const addTracklist = useTracklistStore((state) => state.addTracklist);
  const {
    loadAndPlaySong,
    setSongPlaying,
    lyrics,
    cursorIndices,
    cursorTicks,
    midiPlaying,
  } = useAppControlStore();

  const notification = useNotificationStore((state) => state.notification);

  const startup = async () => {
    // Config
    // const systemConfig = getLocalSystemMode();

    // Setup
    setupSpessasynth();
    // initializePeers();

    // Database
    const tl = await getTracklist();
    addTracklist(tl);
  };

  useEffect(() => {
    startup();
  }, []);

  if (!synth || !player) {
    return <></>;
  }

  const modalMap: ModalComponents = {
    SOUNDFONT_MODEL: <SoundfontManager></SoundfontManager>,
    JOIN: <HostRemote></HostRemote>,
    SUPER_JOIN: <SuperHostRemote></SuperHostRemote>,
    MUSIC_STORE: <DataStoresModal></DataStoresModal>,
    ADD_MUSIC: <AppendSongModal></AppendSongModal>,
    WALLPAPER: <WallpaperModal></WallpaperModal>,
    DISPLAY: <DisplaySettingModal></DisplaySettingModal>,
    MIDI_SETTING: <MidiSettingModal></MidiSettingModal>,
    SONG_LIST: <SongListModal></SongListModal>,
    DRIVE_SETTING: <DriveSetting></DriveSetting>,
  };

  return (
    <>
      <DragDrop setSongPlaying={setSongPlaying}></DragDrop>
      {/* Process */}
      <WallpaperRender></WallpaperRender>
      <RemoteRender></RemoteRender>

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
      <GainRender player={player} analysers={analysers}></GainRender>
      <VolumeEvnet synth={synth}></VolumeEvnet>
      <InstrumentsEvent synth={synth}></InstrumentsEvent>

      {/* Contact */}
      <ContextModal modal={modalMap}>
        <OptionsPanel className="hidden flex-col gap-2 lg:flex fixed top-[40%] right-5"></OptionsPanel>
        <StatusPanel notification={notification}></StatusPanel>
        <VolumePanel
          synth={synth}
          perset={perset}
          analysers={analysers}
        ></VolumePanel>
        <TempoPanel timeDivision={midiPlaying?.timeDivision}></TempoPanel>
        <ClockPanel></ClockPanel>
        <SearchSong onClickSong={loadAndPlaySong}></SearchSong>
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
