import React, { useEffect, useState } from "react";
import Modal from "../common/modal";

interface SongStorageProcessorProps {
  filesSong?: Map<string, File>;
}

const SongStorageProcessor: React.FC<SongStorageProcessorProps> = ({
  filesSong,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [oneTime, setOneTime] = useState<number>(0);
  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (oneTime !== 1) {
      setOpen(true);
      setOneTime(1);
    }
  }, [filesSong]);

  return (
    <Modal
      title="เก็บเพลงไว้ในเบราว์เซอร์?"
      isOpen={open}
      onClose={handleClose}
    >
      <></>
    </Modal>
  );
};

export default SongStorageProcessor;
