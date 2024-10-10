"use client";
import React, { ReactNode, useState } from "react";
import { MdOutlinePiano, MdOutlineTextFields } from "react-icons/md";
import Modal from "../common/modal";
import { TbDeviceMobileShare, TbMusicPlus } from "react-icons/tb";
import { VscSettings } from "react-icons/vsc";
import { FaGoogleDrive, FaImage, FaRegImage } from "react-icons/fa";
import { ImDatabase } from "react-icons/im";
import { SiMidi } from "react-icons/si";
import { LuDatabase, LuListMusic } from "react-icons/lu";
import { ControlledMenu, Menu, MenuButton } from "@szhsin/react-menu";
import ContextMenuCommon from "../common/context-menu/context-menu";
import "@szhsin/react-menu/dist/index.css";

interface ContextModalProps {
  children?: ReactNode;
  modal?: ModalComponents;
  className?: string | undefined;
  buttonMenu?: ReactNode;
}
const ContextModal: React.FC<ContextModalProps> = ({
  children,
  modal,
  buttonMenu,
  className = "fixed z-0 left-0 top-0 w-screen h-screen",
}) => {
  const [isContextMenuOpen, setContextMenuOpen] = useState(false);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });

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

  const ItemsGroup: IContextMenuGroup<ModalType>[] = [
    {
      contextMenus: [
        {
          icon: <MdOutlinePiano />,
          text: "ซาวด์ฟ้อนท์",
          onClick: handleSelectContext,
          type: "SOUNDFONT_MODEL",
        },
      ],
    },
    {
      contextMenus: [
        {
          icon: <SiMidi />,
          text: "Midi Output",
          onClick: handleSelectContext,
          type: "MIDI_SETTING",
        },
      ],
    },
    {
      contextMenus: [
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
      ],
      name: "ผ่านมือถือ",
      icon: <></>,
    },
    {
      contextMenus: [
        {
          icon: <TbMusicPlus />,
          text: "เพิ่มเพลง",
          onClick: handleSelectContext,
          type: "ADD_MUSIC",
        },
        // {
        //   icon: <LuListMusic />,
        //   text: "รายชื่อเพลง",
        //   onClick: handleSelectContext,
        //   type: "SONG_LIST",
        // },
        {
          icon: <LuDatabase />,
          text: "ฐานข้อมูลเพลง",
          onClick: handleSelectContext,
          type: "MUSIC_STORE",
        },
        // {
        //   icon: <FaGoogleDrive />,
        //   text: "เชื่อมต่อ Google Drive",
        //   onClick: handleSelectContext,
        //   type: "DRIVE_SETTING",
        // },
      ],
      name: "ที่เก็บข้อมูล",
      icon: <></>,
    },
    {
      contextMenus: [
        {
          icon: <MdOutlineTextFields />,
          text: "เนื้อเพลง",
          onClick: handleSelectContext,
          type: "LYRICS",
        },
        {
          icon: <FaRegImage />,
          text: "ภาพพื้นหลัง",
          onClick: handleSelectContext,
          type: "WALLPAPER",
        },
      ],
      name: "ปรับแต่ง",
      icon: <></>,
    },
  ];

  const Items: IContextMenuItem<ModalType>[] = [
    {
      icon: <MdOutlinePiano />,
      text: "ซาวด์ฟ้อนท์",
      onClick: handleSelectContext,
      type: "SOUNDFONT_MODEL",
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

      {buttonMenu ? (
        <Menu
          boundingBoxPadding="10 10 10 10"
          menuButton={<MenuButton>{buttonMenu}</MenuButton>}
        >
          <ContextMenuCommon items={ItemsGroup}></ContextMenuCommon>
        </Menu>
      ) : (
        <>
          <div
            className={className}
            onContextMenu={(e) => {
              if (
                typeof document.hasFocus === "function" &&
                !document.hasFocus()
              )
                return;

              e.preventDefault();
              setAnchorPoint({ x: e.clientX, y: e.clientY });
              setContextMenuOpen(true);
            }}
          >
            {children}
            <ControlledMenu
              transition={true}
              anchorPoint={anchorPoint}
              state={isContextMenuOpen ? "open" : "closed"}
              direction="right"
              onClose={() => setContextMenuOpen(false)}
              boundingBoxPadding="10 10 10 10"
            >
              <ContextMenuCommon items={ItemsGroup}></ContextMenuCommon>
            </ControlledMenu>
          </div>
        </>
      )}
    </>
  );
};

export default ContextModal;
