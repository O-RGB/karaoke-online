"use client";

import { DEFAULT_CONFIG } from "@/config/value";
import { appendLocalConfig, setLocalConfig } from "@/lib/local-storege/config";
import { NextFont } from "next/dist/compiled/@next/font";
import {
  Inter,
  Krub,
  Lora,
  Noto_Sans_Thai_Looped,
  Roboto,
} from "next/font/google";
import React from "react";
import { createContext, FC, useState } from "react";

const notoSansThaiLooped = Noto_Sans_Thai_Looped({
  weight: "400",
  subsets: ["latin", "thai", "latin-ext"],
});

const inter = Inter({
  weight: "400",
  subsets: ["latin"],
});

const krub = Krub({
  weight: "400",
  subsets: ["latin"],
});

const roboto = Roboto({
  weight: "400",
  subsets: ["latin"],
});

const lora = Lora({
  weight: "400",
  subsets: ["latin"],
});

type SystemFont = "notoSansThaiLooped" | "inter" | "roboto" | "lora" | "krub";

type LyricsDisplayContextType = {
  lyricsDisplay: LyricsOptions | undefined;
  Color: string;
  ColorBorder: string;
  ActiveColor: string;
  ActiveBorderColor: string;
  Font: NextFont | undefined;
  FontName: SystemFont;
  setLyricsOptions: (mode: LyricsOptions) => void;
  setLyricsColorBorder: (color: string) => void;
  setLyricsColor: (color: string) => void;
  setLyricsActiveColor: (color: string) => void;
  setLyricsActiveBorderColor: (color: string) => void;
  setFontChange: (set: SystemFont) => void;
  setConfigLyrics: (config: Partial<LyricsConfig>) => void;
  reset: () => void;
};

type LyricsDisplayProviderProps = {
  children: React.ReactNode;
};

export const LyricsDisplayContext = createContext<LyricsDisplayContextType>({
  lyricsDisplay: undefined,
  // Non Active
  Color: "#fcfe17",
  ColorBorder: "#0000FF",
  // Active
  ActiveColor: "#000",
  ActiveBorderColor: "#ffffff",
  Font: undefined,
  FontName: "notoSansThaiLooped",
  setLyricsOptions: () => undefined,
  setLyricsColor: () => undefined,
  setLyricsColorBorder: () => undefined,
  setLyricsActiveColor: () => undefined,
  setLyricsActiveBorderColor: () => undefined,
  setFontChange: () => undefined,
  setConfigLyrics: () => undefined,
  reset: () => undefined,
});

export const LyricsDisplayProvider: FC<LyricsDisplayProviderProps> = ({
  children,
}) => {
  const [lyricsDisplay, setDisplayLyrics] = useState<LyricsOptions>("default");

  const [Color, setColor] = useState<string>("#fcfe17");
  const [ColorBorder, setColorBorder] = useState<string>("#0000FF");

  // Active
  const [ActiveColor, setActiveColor] = useState<string>("#000000");
  const [ActiveBorderColor, setActiveBorderColor] = useState<string>("#ffffff");

  const [Font, setFont] = useState<NextFont>(notoSansThaiLooped);
  const [FontName, setFontName] = useState<LyricsFont>("notoSansThaiLooped");

  const reset = () => {
    setConfigLyrics(DEFAULT_CONFIG.lyrics);
    appendLocalConfig({ lyrics: DEFAULT_CONFIG.lyrics });
  };

  const setConfigLyrics = (config: Partial<LyricsConfig>) => {
    if (config?.color?.color) {
      setColor(config.color.color);
    }

    if (config?.color?.colorBorder) {
      setColorBorder(config.color.colorBorder);
    }

    if (config?.active?.color) {
      setActiveColor(config.active.color);
    }
    if (config?.active?.colorBorder) {
      setActiveBorderColor(config.active.colorBorder);
    }

    if (config.font) {
      setFontChange(config.font);
    }
    if (config.font) {
      setFontName(config.font);
    }
    if (config.lyricsMode) {
      setDisplayLyrics(config.lyricsMode);
    }
  };

  const setLyricsOptions = (mode: LyricsOptions) => {
    setDisplayLyrics(mode);
    appendLocalConfig({ lyrics: { lyricsMode: mode } });
  };

  const setLyricsColor = (color: string) => {
    setColor(color);
    appendLocalConfig({ lyrics: { color: { color } } });
  };

  const setLyricsColorBorder = (color: string) => {
    setColorBorder(color);
    appendLocalConfig({ lyrics: { color: { colorBorder: color } } });
  };

  const setLyricsActiveColor = (color: string) => {
    setActiveColor(color);
    appendLocalConfig({ lyrics: { active: { color: color } } });
  };
  const setLyricsActiveBorderColor = (color: string) => {
    setActiveBorderColor(color);
    appendLocalConfig({ lyrics: { active: { colorBorder: color } } });
  };

  const setFontChange = (set: SystemFont) => {
    let font = notoSansThaiLooped;
    let fontName: SystemFont = "notoSansThaiLooped";
    switch (set) {
      case "inter":
        font = inter;
        fontName = "inter";
        break;
      case "lora":
        font = lora;
        fontName = "lora";
        break;
      case "notoSansThaiLooped":
        font = notoSansThaiLooped;
        fontName = "notoSansThaiLooped";
        break;
      case "roboto":
        font = roboto;
        fontName = "roboto";
        break;
      case "krub":
        font = krub;
        fontName = "krub";
        break;

      default:
        font = notoSansThaiLooped;
        fontName = "notoSansThaiLooped";
        break;
    }
    setFont(font);
    setFontName(fontName);
  };

  return (
    <LyricsDisplayContext.Provider
      value={{
        lyricsDisplay,
        Color,
        ColorBorder,
        ActiveColor,
        ActiveBorderColor,
        Font,
        FontName,
        setLyricsOptions,
        setLyricsColor,
        setLyricsActiveColor,
        setLyricsColorBorder,
        setLyricsActiveBorderColor,
        setFontChange,
        setConfigLyrics,
        reset,
      }}
    >
      <>{children}</>
    </LyricsDisplayContext.Provider>
  );
};
