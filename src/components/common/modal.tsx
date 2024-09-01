import { CSSProperties, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IoMdClose } from "react-icons/io";
import Button from "./button/button";

const delay = 100;

export default function Modal({
  isOpen,
  onClose,
  onOk,
  children,
  title,
  okButtonProps,
  cancelProps,
  width = "800px",
  footer,
  cancelText = "ยกเลิก",
  okText = "ตกลง",
  closable = true,
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
          className={`fixed inset-0 z-[99999] flex items-center justify-center px-5 ${
            showModal ? "opacity-100" : "opacity-0"
          } transition-opacity duration-300`}
        >
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={handleClose}
          ></div>
          <div
            style={{ width }}
            className={`relative bg-white rounded-lg shadow-lg z-10 transform max-h-[70dvh] overflow-auto ${
              showModal ? "scale-100" : "scale-95"
            } transition-transform duration-300`}
          >
            <div
              className={`sticky z-10 top-0 left-0 p-6 flex justify-between items-center bg-white shadow-sm ${padding}`}
            >
              <div className="text-lg">{title}</div>
              {closable && (
                <div onClick={handleClose} className="p-2 cursor-pointer ">
                  <IoMdClose></IoMdClose>
                </div>
              )}
            </div>
            <div className={`${padding} h-full relative z-0`}>{children}</div>
            <div
              className={`sticky bottom-0 flex gap-2 justify-end bg-white p-6 border-t border-t-gray-100`}
            >
              {footer ? (
                footer
              ) : (
                <>
                  {!cancelProps?.hidden && (
                    <Button
                      {...cancelProps}
                      onClick={handleClose}
                      shadow=""
                      padding={"p-2 px-4"}
                    >
                      {cancelText}
                    </Button>
                  )}
                  {!okButtonProps?.hidden && (
                    <Button
                      {...okButtonProps}
                      onClick={onOk}
                      shadow=""
                      color="blue"
                      className="text-white px-6"
                    >
                      {okText}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
