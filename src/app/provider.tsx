import { AppControlProvider } from "@/context/app-control-context";
import { DragDropProvider } from "@/context/drag-drop-context";
import { KeyUpProvider } from "@/context/keyup-context";
import { LyricsDisplayProvider } from "@/context/lyrics-context";
import { MixerProvider } from "@/context/mixer-context";
import { NotificationProvider } from "@/context/notification-context";
import { OrientationProvider } from "@/context/orientation-context";
import { PlayerProvider } from "@/context/player-context";
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
          <NotificationProvider>
            <MixerProvider>
              <PlayerProvider>
                <KeyUpProvider>
                  <DragDropProvider>
                    <LyricsDisplayProvider>{children}</LyricsDisplayProvider>
                  </DragDropProvider>
                </KeyUpProvider>
              </PlayerProvider>
            </MixerProvider>
          </NotificationProvider>
        </WallpaperProvider>
      </OrientationProvider>
    </AppControlProvider>
  );
};

export default ToolsProvider;
