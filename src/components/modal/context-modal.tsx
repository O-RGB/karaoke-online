"use client";
import React, { ReactNode, useState } from "react";
import { MdOutlinePiano } from "react-icons/md";
import { Synthetizer } from "spessasynth_lib";
import ContextMenuCommon from "../common/context-menu/context-menu";
import Modal from "../common/modal";
import { TbDeviceMobileShare } from "react-icons/tb";
import { VscSettings } from "react-icons/vsc";

interface ContextModalProps {
  children?: ReactNode;
  modal?: Map<ModalType, ReactNode>;
}

const ContextModal: React.FC<ContextModalProps> = ({ children, modal }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [RenderModal, setRenderModal] = useState<React.ReactNode>();
  const [title, setTitle] = useState<ReactNode>();
  const handleSelectContext = (name: ModalType, title: ReactNode) => {
    const render = modal?.get(name);
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
  ];
  return (
    <>
      <Modal
        title={title}
        isOpen={open}
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
      <ContextMenuCommon items={Items}>{children}</ContextMenuCommon>
    </>
  );
};

export default ContextModal;
