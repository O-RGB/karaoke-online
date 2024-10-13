import { AppControlProvider } from "@/context/app-control-context";
import { LyricsDisplayProvider } from "@/context/lyrics-context";
import { OrientationProvider } from "@/context/orientation-context";
import { WallpaperProvider } from "@/context/wallpaper.context";
import React from "react";

interface ToolsProviderProps {
  children: React.ReactNode;
}

const ToolsProvider: React.FC<ToolsProviderProps> = ({ children }) => {
  return (
    <AppControlProvider>
      <OrientationProvider>
        <WallpaperProvider>
          <LyricsDisplayProvider>{children}</LyricsDisplayProvider>
        </WallpaperProvider>
      </OrientationProvider>
    </AppControlProvider>
  );
};

export default ToolsProvider;
