import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useState,
} from "react";
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
  width,
  height,
  modalClassName = "",
  containerId = "modal-container",
  closable = true,
}: ModalProps) {
  const { isMobile, orientation } = useOrientation();
  const [showModal, setShowModal] = useState(isOpen);
  const [modalDimensions, setModalDimensions] = useState({
    width: 0,
    height: 0,
  });

  const [contentHeight, setContentHeight] = useState(0);

  const calculateDimensions = useCallback(() => {
    if (width && height) {
      return { width, height };
    }

    const defaultSizes = {
      desktop: {
        width: Math.min(window.innerWidth * 0.8, 1200),
        height: Math.min(window.innerHeight * 0.8, 800),
      },
      mobileLandscape: {
        width: Math.min(window.innerWidth * 0.9, 800),
        height: Math.min(window.innerHeight * 0.8, 600),
      },
      mobilePortrait: {
        width: Math.min(window.innerWidth * 0.95, 500),
        height: Math.min(window.innerHeight * 0.7, 700),
      },
    };

    let size;
    if (isMobile) {
      size =
        orientation === "landscape"
          ? defaultSizes.mobileLandscape
          : defaultSizes.mobilePortrait;
    } else {
      size = defaultSizes.desktop;
    }

    return {
      width: width || size.width,
      height: height || size.height,
    };
  }, [isMobile, orientation, width, height]);

  useEffect(() => {
    const updateDimensions = () => {
      setModalDimensions(calculateDimensions());
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, [calculateDimensions]);

  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      .winbox.modern {
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      }
      
      .winbox.blur-overlay::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0; 
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        z-index: -1;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      if (styleElement.parentNode === document.head) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  useEffect(() => {
    setShowModal(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setShowModal(false);
    if (onClose) onClose();
  };

  const handleResize = (width: number, height: number) => {
    const newContentHeight = height - 38;
    setContentHeight(newContentHeight);
  };

  if (!showModal) return null;

  let modalRoot = document.getElementById(containerId);
  if (!modalRoot) {
    modalRoot = document.createElement("div");
    modalRoot.id = containerId;
    document.body.appendChild(modalRoot);
  }

  const childrenWithHeight = isValidElement(children)
    ? cloneElement(children, { height: contentHeight } as any)
    : children;

  const modal = (
    <WinBox
      width={modalDimensions.width}
      height={modalDimensions.height}
      title={title}
      onResize={handleResize}
      onClose={handleClose}
      className={`modern ${modalClassName} blur-overlay !bg-black/30`}
      x="center"
      y="center"
      noFull={true}
      bottom={50}
      minWidth={200}
      noClose={!closable}
      background="transparent"
    >
      <>{childrenWithHeight}</>
    </WinBox>
  );

  return createPortal(modal, modalRoot);
}
