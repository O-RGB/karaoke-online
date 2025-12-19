import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useState,
  useRef, // เพิ่ม useRef
} from "react";
import { createPortal } from "react-dom";
import WinBox from "react-winbox";
import { useOrientation } from "@/hooks/orientation-hook";
import useKeyboardStore from "@/features/keyboard-state";
import "winbox/dist/css/winbox.min.css";
import "winbox/dist/css/themes/white.min.css";

// คุณอาจต้อง import Type ของ WinBox ถ้า TypeScript ฟ้อง
// หรือใช้ any ถ้าระบุ Type ยากใน setup ปัจจุบัน

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
  isAlert = false,
}: ModalProps) {
  const { isMobile, orientation } = useOrientation();
  const setPaused = useKeyboardStore((state) => state.setPaused);
  const [showModal, setShowModal] = useState(isOpen);
  const [modalDimensions, setModalDimensions] = useState({
    width: 0,
    height: 0,
  });

  const [contentHeight, setContentHeight] = useState(0);

  // 1. สร้าง Ref เพื่อเข้าถึง Instance ของ React-WinBox
  const winboxRef = useRef<WinBox>(null);

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
    if (isOpen) {
      console.log("is modal opended");
      if (!isAlert) setPaused(true);
    }
  }, [isOpen]);

  // 2. เพิ่ม useEffect เพื่อย้าย DOM ของ WinBox เข้าไปใน modalRoot
  useEffect(() => {
    if (showModal && winboxRef.current) {
      // ใช้ setTimeout เล็กน้อยเพื่อให้แน่ใจว่า WinBox ถูกสร้างใน DOM แล้ว
      const timer = setTimeout(() => {
        try {
          // ดึง ID ของ WinBox window
          const winboxId = winboxRef.current?.getId();
          if (winboxId) {
            const winboxElement = document.getElementById(winboxId);
            const modalRootElement = document.getElementById("modal-root");

            // ถ้าย้ายได้ และยังไม่ได้อยู่ที่นั่น ให้ย้ายเข้าไป
            if (
              winboxElement &&
              modalRootElement &&
              winboxElement.parentElement !== modalRootElement
            ) {
              modalRootElement.appendChild(winboxElement);

              // (Optional) อาจจะต้องสั่ง forceUpdate หรือ resize ถ้าตำแหน่งเพี้ยน
              // แต่ปกติ WinBox จะจัดการตัวเองได้ถ้า container เป็น full width/height
            }
          }
        } catch (e) {
          console.error("Error moving WinBox to modal root:", e);
        }
      }, 50); // Delay 50ms

      return () => clearTimeout(timer);
    }
  }, [showModal]); // ทำงานเมื่อ showModal เปลี่ยนเป็น true

  const handleClose = () => {
    setShowModal(false);
    if (!isAlert) setPaused(false);
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
      ref={winboxRef} // 3. ผูก Ref เข้ากับ Component
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
      // top={5}
      bottom={50}
      // left={5}
      // right={5}
      minWidth={200}
      noClose={!closable}
      background="transparent"
      // เอา root={modalRoot} ออก เพราะ Type ไม่รองรับ
    >
      <div style={{ height: contentHeight, overflow: "hidden" }}>
        {childrenWithHeight}
      </div>
    </WinBox>,
    modalRoot
  );
}
