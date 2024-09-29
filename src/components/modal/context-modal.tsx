"use client";
import React, { ReactNode, useState } from "react";
import { MdOutlinePiano, MdOutlineTextFields } from "react-icons/md";
import ContextMenuCommon from "../common/context-menu/context-menu";
import Modal from "../common/modal";
import { TbDeviceMobileShare, TbMusicPlus } from "react-icons/tb";
import { VscSettings } from "react-icons/vsc";
import { BsDatabase } from "react-icons/bs";
import { BiFolder } from "react-icons/bi";
import { FaImage } from "react-icons/fa";
import { ImDatabase } from "react-icons/im";
import { SiMidi } from "react-icons/si";
import { LuListMusic } from "react-icons/lu";

interface ContextModalProps {
  children?: ReactNode;
  modal?: ModalComponents;
  className?: string | undefined;
  leftClick?: boolean;
}

const ContextModal: React.FC<ContextModalProps> = ({
  children,
  modal,
  leftClick = false,
  className = "fixed z-0 left-0 top-0 w-screen h-screen",
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [RenderModal, setRenderModal] = useState<React.ReactNode>();
  const [title, setTitle] = useState<ReactNode>();
  const handleSelectContext = (name: ModalType, title: ReactNode) => {
    const render = modal ? modal[name] : undefined;
    if (render) {
      setRenderModal(render);
      setOpen(true);
      setTitle(title);
    }
  };

  const Items: ContextMenuItem<ModalType>[] = [
    {
      icon: <MdOutlinePiano />,
      text: "ซาวด์ฟ้อนท์",
      onClick: handleSelectContext,
      type: "SOUNDFONT_MODEL",
    },
    {
      icon: <TbDeviceMobileShare />,
      text: "ขอเพลง",
      onClick: handleSelectContext,
      type: "JOIN",
    },
    {
      icon: <VscSettings />,
      text: "ควบคุม",
      onClick: handleSelectContext,
      type: "SUPER_JOIN",
    },

    {
      icon: <MdOutlineTextFields />,
      text: "เนื้อเพลง",
      onClick: handleSelectContext,
      type: "LYRICS",
    },
    {
      icon: <TbMusicPlus />,
      text: "เพิ่มเพลง",
      onClick: handleSelectContext,
      type: "ADD_MUSIC",
    },
    {
      icon: <LuListMusic />,
      text: "รายชื่อเพลง",
      onClick: handleSelectContext,
      type: "SONG_LIST",
    },
    {
      icon: <SiMidi />,
      text: "Midi Output",
      onClick: handleSelectContext,
      type: "MIDI_SETTING",
    },
    {
      icon: <ImDatabase />,
      text: "ฐานข้อมูลเพลง",
      onClick: handleSelectContext,
      type: "MUSIC_STORE",
    },
    {
      icon: <FaImage />,
      text: "ภาพพื้นหลัง",
      onClick: handleSelectContext,
      type: "WALLPAPER",
    },
  ];

  return (
    <>
      <Modal
        title={title}
        isOpen={open}
        removeFooter={false}
        cancelText="ปิด"
        okButtonProps={{
          hidden: true,
        }}
        onClose={() => {
          setOpen(false);
        }}
      >
        {RenderModal}
      </Modal>

      <ContextMenuCommon
        leftClick={leftClick}
        className={className}
        items={Items}
      >
        {children}
      </ContextMenuCommon>
    </>
  );
};

export default ContextModal;
