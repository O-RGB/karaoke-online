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
import { Dropdown, MenuProps } from "antd";
import AllowSound from "./components/overlay/allow-sound";
import { SongProvider } from "./context/song";


function App() {
  return (
    <AllowSound>
      <SongProvider>
        <SynthesizerProvider>
          <DataProvider>
            <PlayerProvider>
              <Overlay>
                <Wallpaper></Wallpaper>
              </Overlay>
            </PlayerProvider>
          </DataProvider>
        </SynthesizerProvider>
      </SongProvider>
    </AllowSound>
  );
}

export default App;
