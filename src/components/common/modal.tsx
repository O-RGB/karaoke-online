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
  width,
  height,
  maxWidth,
  modalClassName = "",
  containerId = "modal-root",
  closable = true,
  noMin,
  noMove,
  noResize,
  noFull = true,
  noMax,
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
        width: Math.min(window.innerWidth * 0.8, maxWidth || 1200),
        height: Math.min(window.innerHeight * 0.8, 800),
      },
      mobileLandscape: {
        width: Math.min(window.innerWidth * 0.9, maxWidth || 800),
        height: Math.min(window.innerHeight * 0.8, 600),
      },
      mobilePortrait: {
        width: Math.min(window.innerWidth * 0.95, maxWidth || 500),
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
  }, [isMobile, orientation, width, height, maxWidth]);

  useEffect(() => {
    const updateDimensions = () => {
      const dimensions = calculateDimensions();
      setModalDimensions(dimensions);

      setContentHeight(dimensions.height - 38);
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
      
      /* ป้องกัน scroll bar ใน modal content */
      .winbox .wb-body {
        overflow: hidden !important;
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

  const handleResize = (_: number, height: number) => {
    const newContentHeight = height - 38;
    setContentHeight(newContentHeight);
  };

  if (!showModal) return null;

  let modalRoot = document.getElementById("modal-root");
  if (!modalRoot) {
    modalRoot = document.createElement("div");
    modalRoot.id = "modal-root";
    document.body.appendChild(modalRoot);
  }

  const childrenWithHeight = isValidElement(children)
    ? cloneElement(children, { height: contentHeight } as any)
    : children;

  return createPortal(
    <WinBox
      width={modalDimensions.width}
      height={modalDimensions.height}
      title={title}
      noMin={noMin}
      noMove={noMove}
      noResize={noResize}
      noFull={noFull}
      noMax={noMax}
      onResize={handleResize}
      onClose={handleClose}
      className={`modern ${modalClassName} blur-overlay !bg-black/30`}
      x="center"
      y="center"
      bottom={50}
      minWidth={200}
      noClose={!closable}
      background="transparent"
    >
      <div style={{ height: contentHeight, overflow: "hidden" }}>
        {childrenWithHeight}
      </div>
    </WinBox>,
    modalRoot
  );
}
