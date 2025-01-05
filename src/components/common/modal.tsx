import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import WinBox from "react-winbox";
import { useOrientation } from "@/hooks/orientation-hook";
import "winbox/dist/css/winbox.min.css";
import "winbox/dist/css/themes/white.min.css";

export default function WinboxModal({
  isOpen,
  onClose,
  children,
  title,
  icons,
  width = 800,
  modalClassName = "",
  containerId = "modal-container",
  closable,
}: ModalProps) {
  const { isMobile, orientation } = useOrientation();
  const [showModal, setShowModal] = useState(isOpen);

  useEffect(() => {
    const styleElement = document.createElement("style");
    document.head.appendChild(styleElement);

    return () => {
      if (styleElement.parentNode === document.head) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  const getModalDimensions = () => {
    if (isMobile) {
      if (orientation === "landscape") {
        return {
          width: Math.min(window.innerWidth * 0.9, 1200),
          height: window.innerHeight * 0.8,
        };
      }
      return {
        width: Math.min(window.innerWidth * 0.95, 600),
        height: window.innerHeight * 0.8,
      };
    }
    return {
      width: width || window.innerWidth * 0.9,
      height: window.innerHeight * 0.8,
    };
  };

  const dimensions = getModalDimensions();

  useEffect(() => {
    setShowModal(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setShowModal(false);
    onClose?.();
  };

  if (!showModal) return null;
  const modalRoot = document.getElementById(containerId);
  if (!modalRoot) return null;

  const modal = (
    <WinBox
      width={dimensions.width}
      height={dimensions.height}
      title={title}
      onClose={handleClose}
      className={`modern ${modalClassName} rounded-lg blur-overlay !bg-black/30`}
      x="center"
      y="center"
      noFull={true}
      bottom={50}
      minWidth={200}
      noClose={closable}
      background="transparent"
    >
      <div className="p-4">{children}</div>
    </WinBox>
  );

  return createPortal(modal, modalRoot);
}
