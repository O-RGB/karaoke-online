import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { Analytics } from "@vercel/analytics/react";
import { SynthesizerProvider } from "./context/synthesizer";

import Splash from "./components/splash";
import { DataProvider } from "./context/data";
import { PlayerProvider } from "./context/player";
import Layout from "./layout";

import Wallpaper from "./components/wallpaper";
import FooterPlayer from "./components/overlay/footer";
import Overlay from "./components/overlay";

import AllowSound from "./components/overlay/allow-sound";
import { SongPlayingProvider } from "./context/song-playing";
import { LoadFileProvider } from "./context/test-load-file";
import { DesktopProvider } from "./context/desktop";
import { ConfigProvider } from "./context/config/config-provider";

function App() {
  return (
    <AllowSound>
      <ConfigProvider>
        <LoadFileProvider>
          <SongPlayingProvider>
            <SynthesizerProvider>
              <DataProvider>
                <PlayerProvider>
                  <DesktopProvider>
                    <Overlay>
                      <Wallpaper></Wallpaper>
                    </Overlay>
                  </DesktopProvider>
                </PlayerProvider>
              </DataProvider>
            </SynthesizerProvider>
          </SongPlayingProvider>
        </LoadFileProvider>
      </ConfigProvider>
    </AllowSound>
  );
}

export default App;
