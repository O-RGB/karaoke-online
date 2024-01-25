import { Heading, Image, Text, useDisclosure } from "@chakra-ui/react";
import { PropsWithChildren, useEffect, useState } from "react";
import { Branding } from "./components/branding/branding";

import Container from "./components/container";
import Player from "./components/player";
import Side from "./components/side";
import useData from "./hooks/useData";
import useMobile from "./hooks/useMobile";
import usePlayer from "./hooks/usePlayer";
import Midi from "./interfaces/midi";
import SoundFont from "./interfaces/soundfont";
import { getCDNPathOrNull } from "./utils/constants.utils";
import { Modal } from "antd";
import Splash from "./components/splash";

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
    <Modal open={isOpen} onCancel={onClose} title={"Select SoundFont"}>
      <div className="flex flex-col gap-2">
        <div>Click here to upload a .sf2 file</div>
        <div
          className="w-20 h-20 border rounded-lg flex justify-center items-center cursor-pointer"
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
          CLick
        </div>
      </div>
    </Modal>
  );
}

function MidiModal({ isOpen, onClose }: ModalProps) {
  const player = usePlayer();
  const { midis } = useData();

  return (
    <Modal open={isOpen} onCancel={onClose} title={"Select Midi"}>
      <div className="flex flex-col gap-2 ">
        <div>Click here to upload a .mid or .midi file</div>
        <div className="flex gap-2">
          <div
            className="w-20 h-20 border rounded-lg flex justify-center items-center cursor-pointer"
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
          ></div>
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

export default function Layout() {
  const isMobile = useMobile();
  // const fontModal = useDisclosure();
  const midiModal = useDisclosure();
  const player = usePlayer();
  const [auxUpdate, setAuxUpdate] = useState(0);

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
      <div className="rounded-xl  p-2  bg-white/50  w-fit sm:w-[500px] backdrop-blur-sm border ">
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
      </div>
    </>
  );
}
