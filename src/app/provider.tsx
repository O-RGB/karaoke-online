import { AppControlProvider } from "@/context/app-control-context";
import { LyricsDisplayProvider } from "@/context/lyrics-context";
import { NotificationProvider } from "@/context/notification-context";
import { PlayerProvider } from "@/context/player-context";
import { WallpaperProvider } from "@/context/wallpaper.context";
import React from "react";

interface ToolsProviderProps {
  children: React.ReactNode;
}

const ToolsProvider: React.FC<ToolsProviderProps> = ({ children }) => {
  return (
    <WallpaperProvider>
      <AppControlProvider>
        <NotificationProvider>
          <PlayerProvider>
            <LyricsDisplayProvider>{children}</LyricsDisplayProvider>
          </PlayerProvider>
        </NotificationProvider>
      </AppControlProvider>
    </WallpaperProvider>
  );
};

export default ToolsProvider;
