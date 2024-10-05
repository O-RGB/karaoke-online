"use client";

import React, { useEffect } from "react";
import { useSynth } from "@/hooks/spessasynth-hook";
import VolumePanel from "../tools/volume-panel/volume-panel";
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
import { usePlayer } from "@/hooks/player-hook";
import TempoPanel from "../tools/tempo-panel";
import StatusPanel from "../tools/status-panel";
import OptionsPanel from "../tools/options-panel";
import WallpaperModal from "../modal/wallpaper-modal";
import LyricsModal from "../modal/lyrics-modal";
import { useNotification } from "@/hooks/notification-hook";
import MusicStoreModal from "../modal/music-store-modal";
import MidiSettingModal from "../modal/midi-setting-modal";
import SongListModal from "../modal/song-list.modal";
import { useDragDrop } from "@/hooks/drag-drop-hook";
import { onSelectTestMusic } from "@/lib/karaoke/read";
import { LoadDatabase } from "@/utils/database/model";
import { getTracklistToJson } from "@/lib/storage/tracklist";

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
    setTracklistFile,
    addTracklist,
    setMusicLibraryFile,
    musicLibrary,
  } = useAppControl();

  const { tempo, tick } = usePlayer();
  const { notification } = useNotification();

  const startup = async () => {
    await setupSpessasynth();
    await LoadDatabase();
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
  };

  return (
    <>
      <ContextModal modal={modalMap}>
        {/* <div className="fixed top-44">
          <LargeJsonEditor></LargeJsonEditor>
        </div> */}
        {/* <WallcomeModal
          setTracklistFile={setTracklistFile}
          setMusicLibraryFile={setMusicLibraryFile}
          musicLibrary={musicLibrary}
        ></WallcomeModal> */}
        <OptionsPanel className="hidden flex-col gap-2 lg:flex fixed top-[40%] right-5"></OptionsPanel>
        <StatusPanel text={notification}></StatusPanel>
        <VolumePanel
          perset={perset}
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
