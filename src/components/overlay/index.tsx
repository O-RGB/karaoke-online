import React, { useEffect, useRef, useState } from "react";
import TimeHeader from "./header/time";
import FooterPlayer from "./footer";
import Tempo from "./header/tempo";
import { Dropdown, Input, MenuProps, Modal } from "antd";
import SearchSong from "./search";
import LyricsBox from "./lyrics";
import ReadMidiFileAndSound from "./test";
import ImportFolders from "./import/folders";
import useSongPlaying from "../../hooks/useSong";
import useTestLoad from "../../hooks/useTestLoad";
import usePlayer from "../../hooks/usePlayer";
import Fuse, { FuseResult } from "fuse.js";
import useDesktop from "../../hooks/useDesktop";
import MobileInput from "./mobile-input";
import { PiVinylRecordFill } from "react-icons/pi";
import { BsImageFill } from "react-icons/bs";
import { FaGithub } from "react-icons/fa";
import SoundSetting from "./sound-setting";
import QueueLists from "./queue";
import { FullScreen, useFullScreenHandle } from "react-full-screen";

interface OverlayProps {
  children: React.ReactNode;
}

const Overlay: React.FC<OverlayProps> = ({ children }) => {
  const rounded = "rounded-xl";
  const bgOverLay = "bg-black/30";
  const blur = "backdrop-blur-md";
  const textColor = "text-white";
  const borderColor = "border-white/30 ";

  const items: MenuProps["items"] = [
    {
      label: "ซาวด์ฟอนต์",
      icon: <PiVinylRecordFill></PiVinylRecordFill>,
      key: "1",
      onClick: () => setIsModalOpen(true),
    },
    {
      label: "ตั้งค่าเนื้อเพลง",
      icon: <BsImageFill></BsImageFill>,
      disabled: true,
      key: "2",
    },
    {
      label: "ภาพพื้นหลัง",
      icon: <BsImageFill></BsImageFill>,
      disabled: true,
      key: "3",
    },
    {
      label: "GitHub",
      icon: <FaGithub></FaGithub>,
      key: "4",
      onClick: () => {
        window.open("https://github.com/O-RGB/extreme-karaoke-online");
      },
    },
  ];
  const [isModalOpen, setIsModalOpen] = useState(false);

  const SoundFountSetting = (
    <div className="flex flex-col gap-2">
      <div>Click here to upload a .sf2 file</div>
      <div
        className="h-20 border rounded-lg flex justify-center items-center cursor-pointer"
        onClick={async () => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".sf2";
          input.onchange = async (_) => {
            const file = input.files ? input.files[0] : null;
            if (file) {
              await player.loadSoundFont(file);
              setIsModalOpen(false);
            }
            input.remove();
          };
          input.click();
        }}
      >
        เลือกไฟล์
      </div>
      <div
        className="h-20 border rounded-lg flex justify-center items-center cursor-pointer"
        onClick={async () => {
          fetch("/gm.sf2")
            .then((row: any) => row.blob())
            .then((blob) => {
              console.log(blob);
              const file = new File([blob], "sound-test.sf2", {
                type: blob.type,
              });
              player.loadSoundFont(file);
              setIsModalOpen(false);
            });
        }}
      >
        ใช้ไฟล์ทดสอบ
      </div>
    </div>
  );

  const [result, setResult] = useState<SearchNCN[] | undefined>(undefined);

  const TestLoadFolder = useTestLoad();
  const player = usePlayer();

  const [searchIndex, setSearchIndex] = useState<number>(0);
  const [search, setSearch] = useState<string | undefined>(undefined);

  const [queueIndex, setQueueIndex] = useState<number>(0);
  const [queue, setQueue] = useState<number[] | undefined>([1, 2]);

  const onArrowInput = (
    onArrows: "Left" | "Right" | "Up" | "Down" | "Reset" | undefined
  ) => {
    if (desktop.SearchBox) {
      if (onArrows == "Left") {
        desktop.setQueueBox(false);
        desktop.setSearchBox(true);
        setSearchIndex((value) => {
          let test = value - 1;
          if (test <= 0) {
            return 0;
          } else {
            return test;
          }
        });
      } else if (onArrows == "Right") {
        desktop.setQueueBox(false);
        desktop.setSearchBox(true);
        setSearchIndex((value) => {
          let test = value + 1;
          if (test > (result ? result.length : 0) - 1) {
            return (result ? result.length : 0) - 1;
          } else {
            return test;
          }
        });
      }
    }

    if (onArrows == "Down") {
      setResult(undefined);
      desktop.setQueueBox(true);
      desktop.setSearchBox(false);
      setQueueIndex((value) => {
        let test = value + 1;
        if (test > (queue ? queue.length : 0) - 1) {
          return (queue ? queue.length : 0) - 1;
        } else {
          return test;
        }
      });
    } else if (onArrows == "Up") {
      setResult(undefined);
      desktop.setQueueBox(true);
      desktop.setSearchBox(false);
      setQueueIndex((value) => {
        let test = value - 1;
        if (test <= 0) {
          return 0;
        } else {
          return test;
        }
      });
    }
  };

  const setSoundFont = () => {
    fetch("/gm.sf2")
      .then((row: any) => row.blob())
      .then((blob) => {
        console.log(blob);
        const file = new File([blob], "sound-test.sf2", {
          type: blob.type,
        });
        player.loadSoundFont(file);
      });
  };

  const desktop = useDesktop();
  const timeoutIdRef: any = useRef<number | null>(null);

  const handleKeyPress = (event: any) => {
    let reset = () => {
      desktop.setQueueBox(false);
      desktop.setSearchBox(false);
      setResult(undefined);
      setSearch(undefined);
      onArrowInput(undefined);
      setSearchIndex(0);
      setQueueIndex(0);
    };

    if (timeoutIdRef.current !== null) {
      clearTimeout(timeoutIdRef.current);
    }
    if (event.key.length == 1) {
      desktop.setSearchBox(true);
      desktop.setQueueBox(false);
      setSearch((value) => {
        let newValue = value == undefined ? event.key : value + event.key;
        let search = TestLoadFolder.Trie?.search(newValue);
        setResult(search);
        return newValue;
      });
    } else if (event.key == "Backspace") {
      desktop.setSearchBox(true);
      setSearch((value) => {
        let newValue = value?.slice(0, value.length - 1);
        if (newValue) {
          let search = TestLoadFolder.Trie?.search(newValue);
          setResult(search);
        }
        return newValue;
      });
    }
    if (event.key == "Enter" && desktop.SearchBox) {
      if (desktop.SearchBox && TestLoadFolder.songLoading == false) {
        if (result) {
          if (result[searchIndex]?.path) {
            let path = result[searchIndex]?.path;
            let filename = result[searchIndex]?.filename;
            let type = result[searchIndex]?.type;
            TestLoadFolder.readNCNByPath(filename, path, type).then(
              (getSong: any) => {
                if (getSong) {
                  if (getSong.lyr && getSong.mid) {
                    player.loadLyrics(getSong.lyr);
                    player.loadMidi(getSong.mid).then((data) => {
                      if (data) {
                        desktop.setSearchBox(false);
                        setTimeout(() => {
                          player.setPlaying(true);
                        }, 1000);
                      }
                      reset();
                    });
                  }
                }
              }
            );
          }
        }
      }
    } else if (event.key === "ArrowLeft") {
      onArrowInput("Left");
    } else if (event.key === "ArrowRight") {
      onArrowInput("Right");
    } else if (event.key === "ArrowUp") {
      onArrowInput("Up");
    } else if (event.key === "ArrowDown") {
      onArrowInput("Down");
    }

    timeoutIdRef.current = setTimeout(() => {
      reset();
    }, 5000);
  };

  useEffect(() => {
    if (!player.soundFont) {
      setSoundFont();
    }
  }, []);

  useEffect(() => {
    if (TestLoadFolder.SongList) {
      window.addEventListener("keydown", handleKeyPress);
      return () => {
        window.removeEventListener("keydown", handleKeyPress);
      };
    }
  }, [
    desktop.QueueBox,
    search,
    searchIndex,
    queueIndex,
    TestLoadFolder.SongList,
  ]);

  const handle = useFullScreenHandle();

  return (
    <>
      <Modal
        footer={<></>}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
        }}
        title={"Select SoundFont"}
      >
        {SoundFountSetting}
      </Modal>
      {/* <FullScreen handle={handle} className="z-10"> */}
      <Dropdown menu={{ items }} trigger={["contextMenu"]}>
        <div className="relative w-full h-full overflow-hidden z-50">
          <div className="fixed top-0 left-0 z-50  w-full h-[30%]">
            <div
              className={`absolute  ${
                !desktop.SearchInputMobile
                  ? "top-16 md:top-24"
                  : "top-[6.5rem] md:top-[8.5rem]"
              }  left-2 right-2 z-50 duration-300`}
            >
              <SearchSong
                searchIndex={searchIndex}
                result={result}
                bgOverLay={bgOverLay}
                blur={blur}
                rounded={rounded}
                textColor={textColor}
                input={search}
                open={desktop.SearchBox}
                borderColor={borderColor}
                loading={TestLoadFolder.songLoading}
              ></SearchSong>
            </div>

            <div
              className={`absolute right-2 ${
                !desktop.SearchInputMobile ? "top-2" : "top-12"
              } flex gap-2 duration-300`}
            >
              <TimeHeader
                bgOverLay={bgOverLay}
                blur={blur}
                rounded={rounded}
                textColor={textColor}
                borderColor={borderColor}
              ></TimeHeader>
              <Tempo
                bgOverLay={bgOverLay}
                blur={blur}
                rounded={rounded}
                textColor={textColor}
                borderColor={borderColor}
              ></Tempo>
            </div>
          </div>

          <div
            className={`fixed left-2  -translate-x-full xl:translate-x-0 opacity-0 xl:opacity-100 flex gap-2 duration-300  ${
              desktop.SearchBox ? "z-[30]" : "z-[60]"
            } ${!desktop.SearchInputMobile ? "top-2" : "top-12"}  right-2`}
          >
            <SoundSetting
              bgOverLay={bgOverLay}
              blur={blur}
              rounded={rounded}
              textColor={textColor}
              borderColor={borderColor}
            ></SoundSetting>
          </div>

          <div
            className={`fixed top-16 md:top-24 left-2 right-2  ${
              !desktop.QueueBox ? "" : "z-[60]"
            } duration-300`}
          >
            <QueueLists
              select={queueIndex}
              bgOverLay={bgOverLay}
              blur={blur}
              rounded={rounded}
              textColor={textColor}
              open={desktop.QueueBox}
              borderColor={borderColor}
            ></QueueLists>
          </div>

          <div
            className={`fixed top-2 left-2 right-2 z-[60] ${
              !desktop.SearchInputMobile ? "-translate-y-12" : "translate-y-0"
            } duration-300`}
          >
            <MobileInput
              bgOverLay={bgOverLay}
              blur={blur}
              rounded={rounded}
              textColor={textColor}
              borderColor={borderColor}
              search={search}
            ></MobileInput>
          </div>

          <div
            className={`fixed w-full h-full flex justify-center items-center z-50`}
          >
            {!TestLoadFolder.SongList && (
              <ImportFolders
                bgOverLay={bgOverLay}
                blur={blur}
                rounded={rounded}
                textColor={textColor}
                borderColor={borderColor}
              ></ImportFolders>
            )}
          </div>

          {/* <div
            className={`fixed top-16 md:top-24 right-2 ${
              desktop.SearchBox ? "z-40" : "z-50"
            }  duration-300`}
          >
            <ReadMidiFileAndSound
              bgOverLay={bgOverLay}
              blur={blur}
              rounded={rounded}
              textColor={textColor}
              borderColor={borderColor}
            ></ReadMidiFileAndSound>
          </div> */}

          {player.lyrics && (
            <div className="fixed bottom-10 md:bottom-14 right-2 left-2 z-50 duration-300">
              <LyricsBox
                bgOverLay={bgOverLay}
                blur={blur}
                rounded={rounded}
                textColor={textColor}
                borderColor={borderColor}
              ></LyricsBox>
            </div>
          )}

          <div className="relative z-0">{children}</div>

          <div className="fixed bottom-0 z-50 w-full ">
            <FooterPlayer
              bgOverLay={bgOverLay}
              blur={blur}
              rounded={rounded}
              textColor={textColor}
              borderColor={borderColor}
              items={items}
              fullScreen={handle}
            ></FooterPlayer>
          </div>
        </div>
      </Dropdown>
      {/* </FullScreen> */}
    </>
  );
};

export default Overlay;
