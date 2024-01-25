import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { Analytics } from "@vercel/analytics/react";
import { SynthesizerProvider } from "./context/synthesizer";

import Splash from "./components/splash";
import { DataProvider } from "./context/data";
import { PlayerProvider } from "./context/player";
import Layout from "./layout";

import Wallpaper from "./components/wallpaper";
import FooterPlayer from "./components/overlay/footer";
import Overlay from "./components/overlay/header";

const config = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({ config });

function App() {
  return (
    // <ChakraProvider theme={theme}>
    //   <Splash>

    //   </Splash>
    // </ChakraProvider>

    <Overlay>
      <Wallpaper>
        <Splash>
          <DataProvider>
            <SynthesizerProvider>
              <PlayerProvider>
                <Layout />
              </PlayerProvider>
            </SynthesizerProvider>
          </DataProvider>
        </Splash>
      </Wallpaper>
    </Overlay>
  );
}

export default App;
