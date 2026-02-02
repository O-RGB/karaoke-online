"use client";
import React, { useEffect, useLayoutEffect, useState } from "react";

const SoundfontManager = dynamic(() => import("../modal/soundfont"), {
  ssr: false,
});
const ClientHostRemote = dynamic(() => import("../remote/client/client-host"), {
  ssr: false,
});
const DataStoresModal = dynamic(() => import("../modal/datastores"), {
  ssr: false,
});
const AppendSongModal = dynamic(() => import("../modal/append-song"), {
  ssr: false,
});
const DisplaySettingModal = dynamic(() => import("../modal/display"), {
  ssr: false,
});
const SoundSettingModal = dynamic(() => import("../modal/sound-setting"), {
  ssr: false,
});
const DonateModal = dynamic(() => import("../modal/donate-modal"), {
  ssr: false,
});
const ContextModal = dynamic(() => import("../modal/context-modal"), {
  ssr: false,
});
const VolumePanel = dynamic(() => import("../tools/volume-panel"), {
  ssr: false,
});
const PlayerPanel = dynamic(() => import("../tools/player-panel"), {
  ssr: false,
});
const AutoModal = dynamic(() => import("../modal/auto/auto-modal"), {
  ssr: false,
});

import SearchSong from "../tools/search-song/search-song";
import ClockPanel from "../tools/clock-panel";
import TempoPanel from "../tools/tempo-panel";
import WallpaperRender from "./wallpaper-render/wallpaper-render";
import useConfigStore from "@/features/config/config-store";
import QueueSong from "../tools/queue-song/queue-song";
import useKeyboardStore from "@/features/keyboard-state";
import NextSongPanel from "../tools/next-song-panel";
import SongInfo from "../tools/song-info";
import LyricsPlayer from "../../features/lyrics";
import useSongsStore from "@/features/songs/store/songs.store";
import Loading from "../tools/loading";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import { DatabaseService } from "@/utils/indexedDB/service";
import { SongsSystem } from "@/features/songs";
import { SoundfontSystemManager } from "@/features/soundfont";
import dynamic from "next/dynamic";
import YoutubeEngine from "@/features/engine/modules/youtube";
import GlobalToast from "../common/alert/toast/toast-notification";

interface KaraokePageProps {}

const KaraokePage: React.FC<KaraokePageProps> = ({}) => {
  const setup = useSynthesizerEngine((state) => state.setup);

  const setSongsManager = useSongsStore((state) => state.setSongsManager);
  const setSoundfontManaer = useSongsStore((state) => state.setSoundfontManaer);
  const initializeKeyboardListeners = useKeyboardStore(
    (state) => state.initializeKeyboardListeners
  );

  const handle = useFullScreenHandle();
  const config = useConfigStore((state) => state.config);
  const [onPrepare, setPrepare] = useState<boolean>(false);

  useLayoutEffect(() => {
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
    // DONATE: <DonateModal />,
  };

  console.log("[HOME RERENDER] /src/components/ui/karaoke-page.tsx");

  return (
    <FullScreen handle={handle} className=" w-full h-screen">
      <GlobalToast></GlobalToast>
      <div id="screen-panel" className="w-full">
        <div id="modal-root"></div>
        <Loading isLoad={onPrepare} />
        <WallpaperRender />
        <AutoModal auto title={""} />
        <div id="zoom-container" className="fixed inset-0 w-full z-10">
          <ContextModal
            modal={modalMap}
            className="karaoke-layout w-full h-full"
          >
            <div
              style={{
                paddingTop: "max(1rem, env(safe-area-inset-top))",
                paddingLeft: "max(1rem, env(safe-area-inset-left))",
                paddingRight: "max(1rem, env(safe-area-inset-right))",
              }}
              className={`relative text-white flex flex-col gap-10 w-full`}
            >
              <header className="relative z-30 flex flex-col lg:flex-col-reverse gap-2 landscape:gap-0 lg:gap-2 items-start">
                <div className="w-full lg:pt-2">
                  <SearchSong />
                </div>

                <div className="flex flex-col lg:flex-row w-full gap-2 items-start justify-between">
                  <VolumePanel />
                  <div className="hidden lg:flex gap-2">
                    <ClockPanel />
                    <TempoPanel />
                  </div>
                  <div className="flex gap-2 block lg:hidden">
                    <ClockPanel />
                    <TempoPanel />
                  </div>
                </div>
              </header>

              <main className="relative flex items-center justify-center ">
                <NextSongPanel className="absolute w-full flex justify-center top-3" />
                <SongInfo />
              </main>
            </div>
          </ContextModal>
        </div>
        <QueueSong />
        <YoutubeEngine></YoutubeEngine>
        <div className="fixed bottom-[15dvh] landscape:bottom-[15dvh] left-0 right-0 -z-10">
          <div
            style={{
              paddingTop: "max(1rem, env(safe-area-inset-top))",
              paddingLeft: "max(1rem, env(safe-area-inset-left))",
              paddingRight: "max(1rem, env(safe-area-inset-right))",
            }}
          >
            <LyricsPlayer />
          </div>
        </div>
        <footer className="fixed left-0 right-0 bottom-0 w-full z-10">
          <PlayerPanel
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            isFullScreen={handle.active}
            modalMap={modalMap}
            onFullScreen={() => {
              handle.active ? handle.exit() : handle.enter();
            }}
          />
        </footer>
      </div>
    </FullScreen>
  );
};

export default KaraokePage;
