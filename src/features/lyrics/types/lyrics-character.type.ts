import { LyricsColorConfig } from "@/features/config/types/config.type";
import { NextFont } from "next/dist/compiled/@next/font";

export interface LyricsCharacterStyle {
  fontSize?: number | string;
  font?: NextFont;
  color?: LyricsColorConfig;
  activeColor?: LyricsColorConfig;
}

export interface LyricsCharacterProps extends LyricsCharacterStyle {
  lyr: string;
  clip: number;
}
