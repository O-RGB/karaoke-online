import { Modal } from "antd";
import React, { PropsWithChildren, useEffect, useState } from "react";
import useData from "../../../hooks/useData";
import usePlayer from "../../../hooks/usePlayer";
import Midi from "../../../interfaces/midi";
import SoundFont from "../../../interfaces/soundfont";
import { getCDNPathOrNull } from "../../../utils/constants.utils";
import Player from "../../player";
import { useDisclosure } from "@chakra-ui/react";

interface ReadMidiFileAndSoundProps {
  rounded?: string;
  bgOverLay?: string;
  blur?: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GenericModalProps extends ModalProps, PropsWithChildren {
  title: string;
}

// function GenericModal({ isOpen, onClose, title, children }: GenericModalProps) {
//   return (
//     <Modal isOpen={isOpen} onClose={onClose}>
//       <ModalOverlay />
//       <ModalContent>
//         <ModalHeader>{title}</ModalHeader>
//         <ModalCloseButton />
//         <ModalBody overflowY={"scroll"} maxHeight={"400px"}>
//           {children}
//         </ModalBody>
//         <ModalFooter></ModalFooter>
//       </ModalContent>
//     </Modal>
//   );
// }

interface ModalSelectItemProps {
  value: SoundFont | Midi;
  onClick: () => void;
}

function ModalSelectItem({ value, onClick }: ModalSelectItemProps) {
  const asMidi = value as Midi;
  const icon = getCDNPathOrNull(value.icon);

  return (
    <div onClick={onClick}>
      <div> {value.name}</div>
      <div> {asMidi.author || "Unknown"}</div>
    </div>
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

      {/* <hr style={{ marginBottom: "20px" }} />
  
        {midis.map((midi, index) => (
          <ModalSelectItem
            value={midi}
            key={index}
            onClick={async () => {
              await player.loadMidi(midi);
              onClose();
            }}
          />
        ))} */}
    </Modal>
  );
}

const ReadMidiFileAndSound: React.FC<ReadMidiFileAndSoundProps> = ({
  rounded,
  bgOverLay,
  blur,
}) => {
  const player = usePlayer();
  const [auxUpdate, setAuxUpdate] = useState(0);
  const midiModal = useDisclosure();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function forceUpdate() {
    setAuxUpdate(auxUpdate + 1);
  }

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (!midiModal.isOpen && !isModalOpen) {
      forceUpdate();
    }
  }, [midiModal.isOpen, isModalOpen]);
  return (
    <>
      <FontModal isOpen={isModalOpen} onClose={handleCancel} />
      <MidiModal isOpen={midiModal.isOpen} onClose={midiModal.onClose} />

      <div
        className={`${rounded} ${bgOverLay} ${blur} p-2 w-[16.5rem] md:w-64 border`}
      >
        สำหรับทดสอบการอ่านไฟล์ .mid และ sf2 เมื่อเล่นเสียงเพลง
        <div className="">
          <Player />
        </div>
        <hr />
        <div className="p-2 flex flex-col gap-2 ">
          <div
            onClick={showModal}
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
