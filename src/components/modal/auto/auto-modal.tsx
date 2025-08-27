import React, { useEffect, useState } from "react";
import Modal from "../../common/modal";
import DonateModal from "../donate-modal";
import Tabs from "../../common/tabs";
import DonateAutoModal from "./donate-auto-modal";

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
