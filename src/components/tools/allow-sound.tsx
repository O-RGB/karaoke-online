"use client";
import React, { useLayoutEffect, useRef, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BsMusicNoteBeamed, BsLaptop } from "react-icons/bs";
import { TbDeviceRemote } from "react-icons/tb";
import { MdOutlineCloudUpload } from "react-icons/md";
import LoadConfig from "../ui/load-conifg/load-config";
import Button from "../common/button/button";
import ToggleCheckBox from "../common/input-data/checkbox";
import useConfigStore from "@/features/config/config-store";
import Label from "../common/display/label";
import { FaPlay } from "react-icons/fa";

interface AllowSoundProps {
  children?: React.ReactNode;
}

/* ================= Feature Card ================= */
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
}) => {
  return (
    <div className="flex items-start gap-3 rounded-lg p-3 transition hover:bg-gray-50 border border-transparent hover:border-gray-100">
      <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-black">{title}</span>
        <span className="text-xs leading-relaxed text-gray-600 mt-0.5">
          {description}
        </span>
      </div>
    </div>
  );
};
/* ================================================= */

const AllowSound: React.FC<AllowSoundProps> = ({ children }) => {
  const [ended, setEnded] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [soundTick, setSoundTick] = useState(true);

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioLoopRef = useRef<HTMLAudioElement>(null);

  const setConfig = useConfigStore((state) => state.setConfig);
  const config = useConfigStore((state) => state.config);

  const requestMIDIAccess = async () => {
    if (!navigator.requestMIDIAccess) return;
    try {
      await navigator.requestMIDIAccess();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClick = () => {
    if (!audioRef.current || !audioLoopRef.current) return;

    setPressed(true);

    if (!soundTick) {
      setEnded(true);
      return;
    }

    audioRef.current.volume = 0.5;
    audioLoopRef.current.volume = 0.2;

    audioRef.current.play();
    audioLoopRef.current.play();

    audioRef.current.addEventListener("ended", () => setEnded(true));
  };

  useLayoutEffect(() => {
    requestMIDIAccess();
  }, []);

  return (
    <>
      <LoadConfig />

      {ended ? (
        children
      ) : (
        <div className="flex min-h-screen w-full bg-[#f8f9fa] items-center justify-center">
          <div className="container mx-auto px-4 py-8 lg:py-12 max-w-6xl">
            {/* Grid 2 Columns for Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              {/* ================= LEFT SIDE (Intro & Actions) ================= */}
              <div className="flex flex-col gap-6">
                {/* Header */}
                <div>
                  <div className="mb-3">
                    <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded-full border border-blue-200">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-1.5" />
                      เวอร์ชั่น 1.0.30
                    </span>
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold mb-3">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Next Karaoke
                    </span>
                  </h1>

                  <p className="text-lg text-gray-600 leading-relaxed">
                    คาราโอเกะออนไลน์ด้วยเทคโนโลยี MIDI และ SoundFont
                    เล่นได้ทันทีผ่านเบราว์เซอร์ ไม่ต้องติดตั้งโปรแกรม
                  </p>
                </div>

                {/* Main Action Area */}
                {pressed ? (
                  <div className="flex items-center gap-3 text-blue-600 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <AiOutlineLoading3Quarters className="animate-spin" />
                    <span>กำลังเริ่มโปรแกรม...</span>
                  </div>
                ) : (
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-5">
                    {/* Start Button */}
                    <div className="relative w-full sm:w-fit">
                      <div className="absolute -right-0.5 -top-0.5 w-fit">
                        <span className="relative flex h-3 w-3 ">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-600 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                        </span>
                      </div>
                      <Button
                        blur={false}
                        className="w-full sm:w-auto !bg-blue-600 hover:!bg-blue-500"
                        onClick={handleClick}
                      >
                        <div className="px-4 text-white flex gap-2 items-center justify-center">
                          <FaPlay className="text-xs"></FaPlay>{" "}
                          เปิดใช้งานโปรแกรม
                        </div>
                      </Button>
                    </div>

                    <div className="h-px bg-gray-100 w-full"></div>

                    {/* Settings */}
                    <div className="space-y-3">
                      <Label className="block text-sm font-semibold text-black">
                        ตั้งค่าโปรแกรม
                      </Label>
                      <div>
                        <Label className="text-black mb-1 block text-xs">
                          Allow Sound
                        </Label>
                        <ToggleCheckBox
                          defaultChecked={soundTick}
                          onChange={setSoundTick}
                          label="เปิดเสียง (กรณีไม่มีเสียงออก)"
                        />
                      </div>

                      <div>
                        <Label className="text-black mb-1 block text-xs">
                          Equalizer
                        </Label>
                        <ToggleCheckBox
                          defaultChecked={config.sound?.equalizer ?? false}
                          onChange={(checked) =>
                            setConfig({
                              sound: {
                                ...config.sound,
                                equalizer: checked,
                              },
                            })
                          }
                          label="เปิดใช้งาน (ใช้ CPU)"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ================= RIGHT SIDE (Apps & Features) ================= */}
              <div className="flex flex-col gap-6">
                {/* APPS (ย้ายมาขวา และเอาขึ้นก่อนเพื่อให้ Mobile เห็นชัด) */}
                <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
                  <Label className="mb-4 block text-sm font-semibold text-black border-b border-gray-100 pb-2">
                    ดูแอปเพิ่มเติมจากพวกเรา
                  </Label>

                  <div className="flex flex-col gap-2">
                    <a
                      href="https://next-amp-player.vercel.app"
                      target="_blank"
                      className="flex items-start gap-3 rounded-lg p-2 transition hover:bg-gray-50"
                    >
                      <img
                        src="https://next-amp-player.vercel.app/assets/logo/logo.png"
                        className="h-11 w-11 rounded-lg shadow-sm"
                      />
                      <div>
                        <div className="text-sm font-bold text-black">
                          NEXTAMP Player online
                        </div>
                        <div className="text-xs text-gray-600 leading-snug mt-1">
                          โปรแกรมเล่นเพลงคุณภาพสูงผ่าน “บราว์เซอร์” พร้อมปรับ
                          Effects โดยเสียงไม่แตก
                        </div>
                      </div>
                    </a>

                    <a
                      href="https://emk-decoder-online.vercel.app"
                      target="_blank"
                      className="flex items-start gap-3 rounded-lg p-2 transition hover:bg-gray-50"
                    >
                      <img
                        src="https://emk-decoder-online.vercel.app/assets/icon.png"
                        className="h-11 w-11 rounded-lg shadow-sm"
                      />
                      <div>
                        <div className="text-sm font-bold text-black">
                          EMK Decoder online
                        </div>
                        <div className="text-xs text-gray-600 leading-snug mt-1">
                          โปรแกรมแปลงไฟล์ .emk เป็น .ncn (.mid, .cur, .lyr) ผ่าน
                          “บราว์เซอร์” รองรับการแปลงทั้ง Folder
                        </div>
                      </div>
                    </a>

                    <a
                      href="https://next-editor-ts.vercel.app"
                      target="_blank"
                      className="flex items-start gap-3 rounded-lg p-2 transition hover:bg-gray-50"
                    >
                      <img
                        src="https://next-editor-ts.vercel.app/image.png"
                        className="h-11 w-11 rounded-lg shadow-sm"
                      />
                      <div>
                        <div className="text-sm font-bold text-black">
                          Next Lyrics
                        </div>
                        <div className="text-xs text-gray-600 leading-snug mt-1">
                          โปรแกรมสร้างเนื้อร้องหรือแก้ไขเนื้อร้องไฟล์ .mid,
                          .mp3, Youtube สำหรับใช้ในโปรแกรม Karaoke Extreme
                        </div>
                      </div>
                    </a>
                  </div>
                </div>

                {/* FEATURES */}
                <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
                  <Label className="mb-4 block text-sm font-semibold text-black border-b border-gray-100 pb-2">
                    ความสามารถของโปรแกรม
                  </Label>

                  <div className="flex flex-col divide-y divide-gray-100">
                    <FeatureCard
                      icon={<BsMusicNoteBeamed />}
                      title="MIDI + SoundFont"
                      description="รองรับ MIDI EMK, NCN และติดตั้ง SoundFont เพิ่มได้"
                    />
                    <FeatureCard
                      icon={<MdOutlineCloudUpload />}
                      title="Server / Local"
                      description="เลือกเล่นเพลงจาก Server หรือเครื่องตัวเอง"
                    />
                    <FeatureCard
                      icon={<TbDeviceRemote />}
                      title="Remote Control"
                      description="ควบคุมการเล่นจากอุปกรณ์อื่นได้"
                    />
                    <FeatureCard
                      icon={<BsLaptop />}
                      title="รองรับทุกอุปกรณ์"
                      description="เล่นได้บนคอม แท็บเล็ต และมือถือ"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <audio ref={audioRef} src="/sound/startup.mp3" />
      <audio ref={audioLoopRef} loop src="/sound/allow-sound.mp3" />
    </>
  );
};

export default AllowSound;
