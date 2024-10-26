import { CSSProperties, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IoMdClose } from "react-icons/io";
import Button from "./button/button";

// Component to create and manage modal container
const ModalContainer = ({ containerId = "modal-container" }) => {
  useEffect(() => {
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      container.style.position = "relative";
      container.style.zIndex = "99999";
      document
        .getElementById("your-fullscreen-wrapper-id")
        ?.appendChild(container);
    }
    return () => {
      container?.parentElement?.removeChild(container);
    };
  }, [containerId]);

  return null;
};

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
  height = "500px",
  footer,
  cancelText = "ยกเลิก",
  okText = "ตกลง",
  closable = true,
  removeFooter = true,
  overFlow = "overflow-hidden",
  containerId = "modal-container",
}: ModalProps & { containerId?: string }) {
  const [showModal, setShowModal] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(isOpen);
  var padding = "p-3";

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
      onClose?.();
      handleOpen(false);
    }, delay);
  };

  useEffect(() => {
    handleOpen(isOpen);
  }, [isOpen]);

  // Get modal container element
  const modalRoot = document.getElementById(containerId);
  if (!modalRoot) return null;

  const modal = (
    <>
      {isVisible && (
        <div
          className={`fixed inset-0 z-[99999] flex items-center justify-center px-5 ${
            showModal ? "opacity-100" : "opacity-0"
          } transition-opacity duration-300`}
        >
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={closable ? handleClose : undefined}
          ></div>
          <div
            style={{ width }}
            className={`relative bg-white rounded-lg shadow-lg z-10 transform overflow-hidden ${
              showModal ? "scale-100" : "scale-95"
            } transition-transform duration-300`}
          >
            <div
              className={`z-10 top-0 left-0 flex justify-between items-center bg-white shadow-sm ${padding}`}
            >
              <div className="text-lg">{title}</div>
              {closable && (
                <div onClick={handleClose} className="p-2 cursor-pointer">
                  <IoMdClose />
                </div>
              )}
            </div>
            <div
              style={{
                height: typeof height === "boolean" ? "fit-content" : height,
              }}
              className={`px-3 md:px-4 py-3 flex flex-col relative z-0 ${overFlow}`}
            >
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );

  return createPortal(modal, modalRoot);
}
