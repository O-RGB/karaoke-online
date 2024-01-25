import { Modal } from "antd";
import React, { PropsWithChildren, useEffect, useState } from "react";
import useData from "../../../hooks/useData";
import usePlayer from "../../../hooks/usePlayer";
import Midi from "../../../interfaces/midi";
import SoundFont from "../../../interfaces/soundfont";
import { getCDNPathOrNull } from "../../../utils/constants.utils";
import Player from "../../player";
import { useDisclosure } from "@chakra-ui/react";
import useSong from "../../../hooks/useSong";

interface ReadMidiFileAndSoundProps {
  rounded?: string;
  bgOverLay?: string;
  blur?: string;
  textColor?: string;
  borderColor?: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  test?: CursorFile[];
}

interface CursorFile {
  value: number;
}

function CurResultModal({ isOpen, onClose, test }: ModalProps) {
  return (
    <Modal
      footer={<></>}
      open={isOpen}
      onCancel={onClose}
      title={"Result Cur File"}
    >
      <div className="grid grid-cols-12">
        {test?.map((data, index) => {
          return <div key={`cur-${index}`}>{data.value}</div>;
        })}
      </div>
    </Modal>
  );
}
function CurModal({ isOpen, onClose }: ModalProps) {
  const [isCurResultOpen, setIsCurResultOpen] = useState(false);
  const [curResult, setCurResult] = useState<CursorFile[]>([]);
  const loadCursor = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const cursorData: CursorFile[] = [];
      const view = new DataView(data);

      let offset = 0;
      while (offset < view.byteLength) {
        const tmpByte1 = view.getUint8(offset);
        const tmpByte2 = view.getUint8(offset + 1);

        if (tmpByte2 === 0xff) {
          break;
        }

        const value = tmpByte1 + tmpByte2 * 256;
        console.log(value);

        cursorData.push({ value });
        offset += 2;
      }
      setCurResult(cursorData);
      setIsCurResultOpen(true);
      return cursorData;
    } catch (error) {
      console.error("Error loading cursor:", error);
    }
  };

  return (
    <>
      <CurResultModal
        test={curResult}
        isOpen={isCurResultOpen}
        onClose={() => setIsCurResultOpen(false)}
      />
      <Modal
        footer={<></>}
        open={isOpen}
        onCancel={onClose}
        title={"Select SoundFont"}
      >
        <div className="flex flex-col gap-2">
          <div>Click here to upload a .Cur file</div>
          <div
            className="h-20 border rounded-lg flex justify-center items-center cursor-pointer"
            onClick={async () => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ".cur";
              input.onchange = async (_) => {
                const file = input.files ? input.files[0] : null;
                if (file) {
                  loadCursor(file);
                }
                input.remove();
                onClose();
              };
              input.click();
            }}
          >
            เลือกไฟล์
          </div>
          <div
            className="h-20 border rounded-lg flex justify-center items-center cursor-pointer"
            onClick={async () => {
              fetch("/00001.cur")
                .then((row: any) => row.blob())
                .then((blob) => {
                  const file = new File([blob], "sound-test.cur", {
                    type: blob.type,
                  });

                  loadCursor(file);

                  onClose();
                });
            }}
          >
            ใช้ไฟล์ทดสอบ
          </div>
        </div>
      </Modal>
    </>
  );
}

function LyrModal({ isOpen, onClose }: ModalProps) {
  const { soundfonts } = useData();
  const song = useSong();
  return (
    <Modal
      footer={<></>}
      open={isOpen}
      onCancel={onClose}
      title={"Select SoundFont"}
    >
      <div className="flex flex-col gap-2">
        <div>Click here to upload a .lyr file</div>
        <div
          className="h-20 border rounded-lg flex justify-center items-center cursor-pointer"
          onClick={async () => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".lyr";
            input.onchange = async (_) => {
              const file = input.files ? input.files[0] : null;
              if (file) {
                const reader = new FileReader();

                reader.onload = (e: any) => {
                  const contentArrayBuffer = e.target.result;
                  const decoder = new TextDecoder("windows-874");
                  const contentUtf8 = decoder.decode(contentArrayBuffer);
                  const lines = contentUtf8.split("\r\n"); // หรือ '\r\n' ตามที่เหมาะสม

                  console.log(lines);
                  song.setLyrics(lines);
                };

                // เริ่มการอ่านไฟล์เป็นข้อความ
                reader.readAsArrayBuffer(file);
              }
              input.remove();
              onClose();
            };
            input.click();
          }}
        >
          เลือกไฟล์
        </div>
        <div
          className="h-20 border rounded-lg flex justify-center items-center cursor-pointer"
          onClick={async () => {
            fetch("/00001.lyr")
              .then((row: any) => row.blob())
              .then((blob) => {
                console.log(blob);
                const file = new File([blob], "sound-test.lyr", {
                  type: blob.type,
                });
                const reader = new FileReader();

                reader.onload = (e: any) => {
                  const contentArrayBuffer = e.target.result;
                  const decoder = new TextDecoder("windows-874");
                  const contentUtf8 = decoder.decode(contentArrayBuffer);
                  const lines = contentUtf8.split("\r\n"); // หรือ '\r\n' ตามที่เหมาะสม

                  console.log(lines);
                  song.setLyrics(lines);
                };

                // เริ่มการอ่านไฟล์เป็นข้อความ
                reader.readAsArrayBuffer(file);

                onClose();
              });
          }}
        >
          ใช้ไฟล์ทดสอบ
        </div>
      </div>
    </Modal>
  );
}
function FontModal({ isOpen, onClose }: ModalProps) {
  const player = usePlayer();
  const { soundfonts } = useData();

  return (
    <Modal
      footer={<></>}
      open={isOpen}
      onCancel={onClose}
      title={"Select SoundFont"}
    >
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
              }
              input.remove();
              onClose();
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
                onClose();
              });
          }}
        >
          ใช้ไฟล์ทดสอบ
        </div>
      </div>
    </Modal>
  );
}

function MidiModal({ isOpen, onClose }: ModalProps) {
  const player = usePlayer();
  const { midis } = useData();

  return (
    <Modal
      footer={<></>}
      open={isOpen}
      onCancel={onClose}
      title={"Select Midi"}
    >
      <div className="flex flex-col gap-2 ">
        <div>Click here to upload a .mid or .midi file</div>
        <div
          className=" h-20 border rounded-lg flex justify-center items-center cursor-pointer"
          onClick={async () => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".mid,.midi";
            input.onchange = async (_) => {
              const file = input.files ? input.files[0] : null;
              if (file) {
                await player.loadMidi(file);
              }
              input.remove();
              onClose();
            };
            input.click();
          }}
        >
          เลือกไฟล์
        </div>
        <div
          className="h-20 border rounded-lg flex justify-center items-center cursor-pointer"
          onClick={async () => {
            fetch("/nyk2244.mid")
              .then((row: any) => row.blob())
              .then((blob) => {
                console.log(blob);
                const file = new File([blob], "midi-test.mid", {
                  type: blob.type,
                });
                player.loadMidi(file);
                onClose();
              });
          }}
        >
          ใช้ไฟล์ทดสอบ
        </div>
      </div>
    </Modal>
  );
}

const ReadMidiFileAndSound: React.FC<ReadMidiFileAndSoundProps> = ({
  rounded,
  bgOverLay,
  blur,
  textColor,
  borderColor,
}) => {
  const player = usePlayer();
  const [auxUpdate, setAuxUpdate] = useState(0);
  const midiModal = useDisclosure();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function forceUpdate() {
    setAuxUpdate(auxUpdate + 1);
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLyrOpen, setIsLyrOpen] = useState(false);
  const [isCurOpen, setIsCurOpen] = useState(false);

  useEffect(() => {
    if (!midiModal.isOpen && !isModalOpen) {
      forceUpdate();
    }
  }, [midiModal.isOpen, isModalOpen]);
  return (
    <>
      <FontModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <MidiModal isOpen={midiModal.isOpen} onClose={midiModal.onClose} />
      <LyrModal isOpen={isLyrOpen} onClose={() => setIsLyrOpen(false)} />
      <CurModal isOpen={isCurOpen} onClose={() => setIsCurOpen(false)} />

      <div
        className={`${rounded} ${bgOverLay} ${blur} ${textColor} ${borderColor} p-2 w-[16.5rem] md:w-64 border`}
      >
        สำหรับทดสอบการอ่านไฟล์ .mid และ sf2 เพื่อเล่นเสียงเพลง
        <div className="">
          <Player />
        </div>
        <hr />
        <div className="p-2 flex flex-col gap-2 ">
          <div
            onClick={() => setIsModalOpen(true)}
            className="flex gap-2 items-start cursor-pointer"
          >
            <div className="w-10 h-10 border">
              {player.soundFont != null && (
                <img
                  src={
                    getCDNPathOrNull(player.soundFont?.icon) ||
                    "/default_sf_cover.png"
                  }
                  className="border"
                  alt={"SoundFont Cover"}
                />
              )}
            </div>
            <div>เลือก SoundFont</div>
          </div>
          <div
            onClick={midiModal.onOpen}
            className="flex gap-2 items-center cursor-pointer"
          >
            <div className="w-10 h-10 border">
              {player.midi != null && (
                <img
                  src={
                    getCDNPathOrNull(player.midi?.midi.icon) ||
                    "/default_midi_cover.png"
                  }
                  className="border"
                  alt={"SoundFont Cover"}
                />
              )}
            </div>
            <div>เลือก Midi ไฟล์</div>
          </div>
          <div
            onClick={() => setIsLyrOpen(true)}
            className="flex gap-2 items-center cursor-pointer"
          >
            <div className="w-10 h-10 border">
              {player.midi != null && (
                <img
                  src={
                    getCDNPathOrNull(player.midi?.midi.icon) ||
                    "/default_midi_cover.png"
                  }
                  className="border"
                  alt={"Lyr Cover"}
                />
              )}
            </div>
            <div>เลือก Lyr ไฟล์</div>
          </div>
          <div
            onClick={() => setIsCurOpen(true)}
            className="flex gap-2 items-center cursor-pointer"
          >
            <div className="w-10 h-10 border"></div>
            <div>เลือก Cur ไฟล์</div>
          </div>
        </div>
        <a
          href="https://github.com/O-RGB/extreme-karaoke-online"
          className=" underline"
        >
          GitHup
        </a>
      </div>
    </>
  );
};

export default ReadMidiFileAndSound;
