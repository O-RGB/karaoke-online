import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { Analytics } from "@vercel/analytics/react";
import { SynthesizerProvider } from "./context/synthesizer";

import Splash from "./components/splash";
import { DataProvider } from "./context/data";
import { PlayerProvider } from "./context/player";
import Layout from "./layout";
import Home from "./pages/home";

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
    <Home>
      <DataProvider>
        <SynthesizerProvider>
          <PlayerProvider>
            <Layout />
          </PlayerProvider>
        </SynthesizerProvider>
      </DataProvider>
    </Home>
  );
}

export default App;
