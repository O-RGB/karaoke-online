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
import SwitchRadio from "../common/input-data/switch/switch-radio";
import { EngineType } from "@/features/engine/synth-store";
import Label from "../common/display/label";

interface AllowSoundProps {
  children?: React.ReactNode;
}

const AllowSound: React.FC<AllowSoundProps> = ({ children }) => {
  const [ended, setEnded] = useState<boolean>(false);
  const [pressed, setPressed] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioLoopRef = useRef<HTMLAudioElement>(null);
  const setConfig = useConfigStore((state) => state.setConfig);
  const config = useConfigStore((state) => state.config);
  const engine = useConfigStore(
    (state) => state.config.system?.engine || "jsSynth"
  );

  const requestMIDIAccess = async () => {
    if (navigator.requestMIDIAccess) {
      try {
        const access = await navigator.requestMIDIAccess();
        return access;
      } catch (error) {
        console.error("Error accessing MIDI devices:", error);
        return null;
      }
    } else {
      console.log("Web MIDI API is not supported in this browser.");
      return null;
    }
  };

  const handleClick = () => {
    if (audioRef.current && audioLoopRef.current) {
      const audio = audioRef.current;
      const audioLoop = audioLoopRef.current;

      setPressed(true);
      audio.volume = 0.5;
      audioLoop.volume = 0.2;
      audio.play();
      audioLoop.play();
      audio.addEventListener("ended", () => {
        setEnded(true);
      });
    }
  };

  const setEngine = (value: EngineType) => {
    setConfig({
      system: {
        engine: value,
        timingModeType: value === "jsSynth" ? "Tick" : "Time",
      },
      widgets: {
        inst: {
          show: value === "jsSynth" ? true : false,
        },
        mix: {
          show: value === "spessa" ? true : false,
        },
      },
    });
  };

  useLayoutEffect(() => {
    requestMIDIAccess();
  }, []);

  return (
    <>
      <LoadConfig></LoadConfig>
      {ended ? (
        children
      ) : (
        <div className="flex min-h-screen w-full bg-gray-50">
          <div className="container mx-auto px-6 py-12 flex flex-col md:flex-row gap-6 items-center justify-between">
            {/* Left side - Text and Button */}
            <div className="w-full md:w-1/2 mb-8 md:mb-0">
              <div className="mb-2">
                <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded-full border border-blue-200">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-1.5"></span>
                  เวอร์ชั่น 1.0.29
                </span>
              </div>

              <h1 className="text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Next Karaoke
                </span>
              </h1>

              <p className="text-lg text-gray-600 mb-6 lg:w-[75%]">
                คาราโอเกะออนไลน์ด้วยเทคโนโลยี MIDI และ SoundFont
                เล่นได้ทันทีผ่านเบราว์เซอร์ ไม่ต้องติดตั้งโปรแกรม
              </p>

              {pressed ? (
                <div className="flex items-center gap-3 text-blue-600 mb-8">
                  <AiOutlineLoading3Quarters className="text-lg animate-spin" />
                  <span>กำลังเริ่มโปรแกรม...</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2 mb-4">
                  <div className="relative w-fit">
                    <div className="absolute -right-0.5 -top-0.5 w-fit">
                      <span className="relative flex h-3 w-3 ">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-600 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                      </span>
                    </div>
                    <Button
                      blur={false}
                      className="w-fit !bg-blue-600 hover:!bg-blue-500 "
                      onClick={handleClick}
                    >
                      <div className="px-2 text-white">เปิดใช้งานโปรแกรม</div>
                    </Button>
                  </div>
                  <div className="p-4 rounded-md bg-white shadow-sm">
                    <div className="flex flex-col gap-2">
                      <div className="space-y-2">
                        <Label className="text-black">Equalizer</Label>
                        <ToggleCheckBox
                          defaultChecked={config.sound?.equalizer ?? false}
                          onChange={(checked) => {
                            setConfig({
                              sound: { ...config.sound, equalizer: checked },
                            });
                          }}
                          label="เปิดใช้งาน (ใช้ CPU)"
                        ></ToggleCheckBox>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-black">Engine</Label>
                        <ToggleCheckBox
                          defaultChecked={engine === "jsSynth"}
                          onChange={(checked) => {
                            setEngine("jsSynth");
                          }}
                          label="JS-Synthesizer"
                        ></ToggleCheckBox>
                        <ToggleCheckBox
                          defaultChecked={engine === "spessa"}
                          onChange={(checked) => {
                            setEngine("spessa");
                          }}
                          label="Spessasynth"
                        ></ToggleCheckBox>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-5">
                <div className="flex items-start">
                  <div className="bg-blue-50 p-3 rounded-lg mr-4 text-blue-500 border border-blue-100">
                    <BsMusicNoteBeamed className="text-lg" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">
                      MIDI + SoundFont
                    </h3>
                    <p className="text-gray-600 lg:w-[75%]">
                      รองรับ MIDI EMK, NCN, และติดตั้ง SoundFont เพิ่มเติมได้
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-purple-50 p-3 rounded-lg mr-4 text-purple-500 border border-purple-100">
                    <MdOutlineCloudUpload className="text-lg" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">
                      เล่นผ่าน Server หรือติดตั้งเพลงเองก็ได้
                    </h3>
                    <p className="text-gray-600 lg:w-[75%]">
                      ติดตั้งเพลงในเครื่องตัวเอง หรือจะใช้เพลงของ Server
                      เล่นยังได้เลย
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-indigo-50 p-3 rounded-lg mr-4 text-indigo-500 border border-indigo-100">
                    <TbDeviceRemote className="text-lg" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">
                      ระบบ Remote Control
                    </h3>
                    <p className="text-gray-600">
                      ควบคุมการเล่นจากอุปกรณ์อื่นได้ง่ายๆ
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-cyan-50 p-3 rounded-lg mr-4 text-cyan-500 border border-cyan-100">
                    <BsLaptop className="text-lg" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">
                      รองรับทุกอุปกรณ์
                    </h3>
                    <p className="text-gray-600 lg:w-[75%]">
                      เล่นบนคอมพิวเตอร์ แท็บเล็ต และมือถือได้ทุกรุ่น (CPU
                      ระดังสูง)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Preview Image */}
            <div className="w-full md:w-1/2 flex justify-center md:justify-start">
              <div className="rounded-lg overflow-hidden shadow-md border border-gray-200 bg-white">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-medium">Next Karaoke</h2>
                      <p className="text-blue-100 text-xs">
                        ระบบคาราโอเกะคุณภาพสูง
                      </p>
                    </div>
                    <span className="bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded">
                      v1.0.29
                    </span>
                  </div>
                </div>
                <div className="p-1">
                  <img
                    src="/update_drums.png"
                    alt="หน้าจอโปรแกรม Next Karaoke"
                    className="w-full h-auto"
                  />
                </div>
                <div className="py-3 px-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span>อัพเดทล่าสุด: เปลี่ยน Preset กลองได้แล้ว</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <audio
        src="/sound/startup.mp3"
        controls={false}
        autoPlay={false}
        ref={audioRef}
      />
      <audio
        loop
        src="/sound/allow-sound.mp3"
        controls={false}
        autoPlay={false}
        ref={audioLoopRef}
      />
    </>
  );
};

export default AllowSound;
