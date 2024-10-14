"use client";
import React, { ReactNode, useState } from "react";
import { MdOutlinePiano } from "react-icons/md";
import Modal from "../common/modal";
import { TbDeviceMobileShare, TbMusicPlus } from "react-icons/tb";
import { VscSettings } from "react-icons/vsc";
import { FaRegImage } from "react-icons/fa";
import { SiMidi } from "react-icons/si";
import { LuDatabase } from "react-icons/lu";
import { ControlledMenu, Menu, MenuButton } from "@szhsin/react-menu";
import ContextMenuCommon from "../common/context-menu/context-menu";
import "@szhsin/react-menu/dist/index.css";
import { CgScreen } from "react-icons/cg";

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
        {
          icon: <SiMidi />,
          text: "Midi Output",
          onClick: handleSelectContext,
          type: "MIDI_SETTING",
        },
      ],
      name: "เสียง",
      icon: <></>,
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
          text: "จัดการเพลง",
          onClick: handleSelectContext,
          type: "ADD_MUSIC",
        },

        {
          icon: <LuDatabase />,
          text: "ฐานข้อมูลเพลง",
          onClick: handleSelectContext,
          type: "MUSIC_STORE",
        },
      ],
      name: "ที่เก็บข้อมูล",
      icon: <></>,
    },
    {
      contextMenus: [
        {
          icon: <CgScreen />,
          text: "หน้าจอ",
          onClick: handleSelectContext,
          type: "DISPLAY",
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
            className={`${className} `}
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
              // menuClassName={"!p-0 !bg-transparent"}
            >
              {/* <div className=" py-2 blur-overlay border blur-border rounded-md text-white"> */}
              <ContextMenuCommon items={ItemsGroup}></ContextMenuCommon>
              {/* </div> */}
            </ControlledMenu>
          </div>
        </>
      )}
    </>
  );
};

export default ContextModal;
