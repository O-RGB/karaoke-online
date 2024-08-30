import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IoMdClose } from "react-icons/io";

const delay = 100;

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
};

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
}: ModalProps) {
  const [showModal, setShowModal] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(isOpen);
  var padding = "p-6";

  const handleOpen = (open: boolean) => {
    if (open) {
      setIsVisible(true);
      setTimeout(() => setShowModal(true), delay);
    } else {
      setShowModal(false);
      setTimeout(() => setIsVisible(false), delay);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setTimeout(() => {
      onClose();
      handleOpen(false);
    }, delay);
  };

  useEffect(() => {
    handleOpen(isOpen);
  }, [isOpen]);

  return createPortal(
    <>
      {isVisible && (
        <div
          className={`fixed inset-0 z-[99999] flex items-center justify-center ${
            showModal ? "opacity-100" : "opacity-0"
          } transition-opacity duration-300`}
        >
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={handleClose}
          ></div>
          <div
            className={`relative bg-white rounded-lg shadow-lg z-10 transform min-w-[90%] lg:min-w-[800px] max-h-[90%] overflow-auto ${
              showModal ? "scale-100" : "scale-95"
            } transition-transform duration-300`}
          >
            <div
              className={`sticky top-0 left-0 p-6 flex justify-between items-center ${padding}`}
            >
              <div className="text-lg">{title}</div>
              <div onClick={handleClose} className="p-2 cursor-pointer ">
                <IoMdClose></IoMdClose>
              </div>
            </div>
            <hr />
            <div className={`${padding} h-full`}>{children}</div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
