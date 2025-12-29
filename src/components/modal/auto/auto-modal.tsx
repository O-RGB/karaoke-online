import React, { useEffect, useState } from "react";
import Modal from "../../common/modal";
import DonateAutoModal from "./donate-auto-modal";
import AddApiSong from "../append-song/tabs/add-api";

interface AutoModalProps {
  title: string;
  auto?: boolean;
}

const AutoModal: React.FC<AutoModalProps> = ({ title, auto }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (auto) {
      setTimeout(() => {
        setOpen(auto);
      }, 5000);
    }
  }, [auto]);
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
        <DonateAutoModal></DonateAutoModal>
      </Modal>
    </>
  );
};

export default AutoModal;
