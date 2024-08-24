"use client";
import { loadDefaultSoundFont } from "@/lib/spessasynth";
import React, { useLayoutEffect, useState } from "react";
import UpdateFile from "../common/upload";
import VolumeMeter from "../tools/volume-meter";

interface KaraokePageProps {}

const KaraokePage: React.FC<KaraokePageProps> = ({}) => {
  const loadSoundFont = () => {};

  useLayoutEffect(() => {
    loadDefaultSoundFont();
  }, []);

  return (
    <div className="min-h-dvh flex flex-col gap-2 justify-center items-center bg-slate-800">
      <div className="text-white text-2xl">Karaoke Demo</div>
      <UpdateFile
        className="text-white flex flex-col gap-2 border p-2 rounded-md"
        label="Upload your SoundFont"
        onSelectFile={loadSoundFont}
        accept=".sf2"
      ></UpdateFile>
      <UpdateFile
        className="text-white flex flex-col gap-2 border p-2 rounded-md"
        label="Upload your Midi"
        onSelectFile={loadSoundFont}
        accept=".mid,.midi"
      ></UpdateFile>
      <div className="flex divide-x border">
        <VolumeMeter level={100} channel={1}></VolumeMeter>
        <VolumeMeter level={100} channel={2}></VolumeMeter>
        <VolumeMeter level={100} channel={3}></VolumeMeter>
        <VolumeMeter level={100} channel={4}></VolumeMeter>
        <VolumeMeter level={100} channel={5}></VolumeMeter>
        <VolumeMeter level={100} channel={6}></VolumeMeter>
        <VolumeMeter level={100} channel={7}></VolumeMeter>
        <VolumeMeter level={100} channel={8}></VolumeMeter>
        <VolumeMeter level={100} channel={9}></VolumeMeter>
        <VolumeMeter level={100} channel={10}></VolumeMeter>
        <VolumeMeter level={100} channel={11}></VolumeMeter>
        <VolumeMeter level={100} channel={12}></VolumeMeter>
        <VolumeMeter level={100} channel={13}></VolumeMeter>
        <VolumeMeter level={100} channel={14}></VolumeMeter>
        <VolumeMeter level={100} channel={15}></VolumeMeter>
        <VolumeMeter level={100} channel={16}></VolumeMeter>
      </div>
    </div>
  );
};

export default KaraokePage;
