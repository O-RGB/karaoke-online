"use client";

import React, { useEffect, useState } from "react";
import VolumePanel from "../tools/volume-panel";
import PlayerPanel from "../tools/player-panel";
import SearchSong from "../tools/search-song/search-song";
import ClientHostRemote from "../remote/client/client-host";
import SoundfontManager from "../modal/soundfont";
import ClockPanel from "../tools/clock-panel";
import ContextModal from "../modal/context-modal";
import TempoPanel from "../tools/tempo-panel";
import StatusPanel from "../tools/status/status-panel";
import DisplaySettingModal from "../modal/display";
import useNotificationStore from "@/features/notification-store";
import WallpaperRender from "./wallpaper-render/wallpaper-render";
import useConfigStore from "@/features/config/config-store";
import QueueSong from "../tools/queue-song/queue-song";
import useKeyboardStore from "@/features/keyboard-state";
import NextSongPanel from "../tools/next-song-panel";
import SongInfo from "../tools/song-info";
import SoundSettingModal from "../modal/sound-setting";
import RemoteEvent from "./remote-event";
import DonateModal from "../modal/donate-modal";
import AutoModal from "../modal/auto-modal";
import LyricsPlayer from "../../features/lyrics";
import Processing2Modal from "../common/alert/processing/processing-update";
import AppendSongModal from "../modal/append-song";
import useSongsStore from "@/features/songs/store/songs.store";
import DataStoresModal from "../modal/datastores";
import Loading from "../tools/loading";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import { DatabaseService } from "@/utils/indexedDB/service";
import { SongsSystem } from "@/features/songs";
import { SoundfontSystemManager } from "@/features/soundfont";
import { useOrientation } from "@/hooks/orientation-hook";

interface KaraokePageProps {}

const KaraokePage: React.FC<KaraokePageProps> = ({}) => {
  const setup = useSynthesizerEngine((state) => state.setup);

  const setSongsManager = useSongsStore((state) => state.setSongsManager);
  const setSoundfontManaer = useSongsStore((state) => state.setSoundfontManaer);
  const initializeKeyboardListeners = useKeyboardStore(
    (state) => state.initializeKeyboardListeners
  );

  const handle = useFullScreenHandle();
  const notification = useNotificationStore((state) => state.notification);
  const config = useConfigStore((state) => state.config);
  const [onPrepare, setPrepare] = useState<boolean>(false);

  useEffect(() => {
    const zoomLevel = config.system?.zoom || 1;
    document.documentElement.style.setProperty(
      "--ui-zoom-scale",
      zoomLevel.toString()
    );
  }, [config.system?.zoom]);

  const startup = async () => {
    setPrepare(true);
    const db = new DatabaseService();
    await db.initialize();

    const soundMode = config.system?.soundMode ?? "PYTHON_API_SYSTEM";
    const engine = await setup(config.system?.engine);
    initializeKeyboardListeners();

    const soundSystem = new SongsSystem(config.system);
    setSongsManager(soundSystem);
    soundSystem.init(soundMode);
    const soundfontSystem = new SoundfontSystemManager(engine, soundMode);
    setSoundfontManaer(soundfontSystem);

    setTimeout(() => {
      setPrepare(false);
    }, 1000);
  };

  useEffect(() => {
    startup();
  }, []);

  const modalMap: ModalComponents = {
    SOUNDFONT_MODEL: <SoundfontManager />,
    SUPER_JOIN: <ClientHostRemote />,
    MUSIC_STORE: <DataStoresModal />,
    ADD_MUSIC: <AppendSongModal />,
    DISPLAY: <DisplaySettingModal />,
    SOUND_SETTING: <SoundSettingModal />,
    DONATE: <DonateModal />,
  };

  return (
    <FullScreen handle={handle}>
      <div>
        <Loading isLoad={onPrepare} />
        <Processing2Modal />
        <WallpaperRender />
        <RemoteEvent />
        <AutoModal auto title={""} />
        <div id="modal-container">
          <ContextModal
            modal={modalMap}
            className="fixed z-0 left-0 top-0 w-full h-full"
          >
            <div
              id="zoom-container"
              className={`relative karaoke-layout text-white`}
            >
              <QueueSong />
              <header
                style={{
                  paddingTop: "max(1rem, env(safe-area-inset-top))",
                  paddingLeft: "max(1rem, env(safe-area-inset-left))",
                  paddingRight: "max(1rem, env(safe-area-inset-right))",
                }}
                className="relative z-30 flex flex-col md:flex-col-reverse gap-2 md:gap-6 items-start pointer-events-none"
              >
                <div className="w-full pointer-events-auto">
                  <SearchSong />
                </div>
                <div className="flex w-full gap-2 items-start justify-between pointer-events-auto">
                  <VolumePanel />
                  <div className="hidden lg:block">
                    <div className="flex gap-2">
                      <ClockPanel />
                      <TempoPanel />
                    </div>
                  </div>
                </div>
              </header>

              <main className="relative flex flex-grow justify-center">
                <LyricsPlayer className="absolute w-full h-full flex items-center justify-center" />
                <NextSongPanel className="absolute w-full h-full flex justify-center" />
                <SongInfo />
              </main>

              <footer className="relative z-40">
                <PlayerPanel
                  isFullScreen={handle.active}
                  modalMap={modalMap}
                  onFullScreen={() => {
                    if (!handle.active) {
                      handle.enter();
                    } else {
                      handle.exit();
                    }
                  }}
                />
              </footer>
            </div>

            <StatusPanel notification={notification} />
          </ContextModal>
        </div>
      </div>
    </FullScreen>
  );
};

export default KaraokePage;
