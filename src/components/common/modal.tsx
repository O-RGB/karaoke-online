import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IoMdClose } from "react-icons/io";
import { useOrientation } from "@/hooks/orientation-hook";
import Tabs from "./tabs";

const ANIMATION_DURATION = 200;

export default function Modal({
  isOpen,
  onClose,
  onOk,
  children,
  title,
  okButtonProps,
  cancelProps,
  width,
  height,
  footer,
  cancelText = "ยกเลิก",
  okText = "ตกลง",
  closable = true,
  removeFooter = true,
  overFlow = "overflow-auto",
  containerId = "modal-container",
  modalClassName = "",
}: ModalProps) {
  const { isMobile, orientation } = useOrientation();
  const [showModal, setShowModal] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(isOpen);

  // Calculate dynamic dimensions based on screen size and orientation
  const getModalDimensions = () => {
    if (isMobile) {
      if (orientation === "landscape") {
        return {
          width: "90vw",
          height: height ? `${height}px` : "80vh",
          maxWidth: "1200px",
        };
      }
      return {
        width: "95vw",
        height: height ? `${height}px` : "80vh",
        maxWidth: "600px",
      };
    }
    return {
      width: width ? `${width}px` : "90vw",
      height: height ? `${height}px` : "80vh",
      maxWidth: "800px",
    };
  };

  const handleOpen = (open: boolean) => {
    if (open) {
      setIsVisible(true);
      // Add class to prevent body scroll
      document.body.classList.add("overflow-hidden");
      setTimeout(() => setShowModal(true), ANIMATION_DURATION);
    } else {
      setShowModal(false);
      // Remove class to allow body scroll
      document.body.classList.remove("overflow-hidden");
      setTimeout(() => setIsVisible(false), ANIMATION_DURATION);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setTimeout(() => {
      onClose?.();
      handleOpen(false);
    }, ANIMATION_DURATION);
  };

  useEffect(() => {
    handleOpen(isOpen);

    // Cleanup function
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && closable) {
        handleClose();
      }
    };

    if (isVisible) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isVisible, closable]);

  const modalRoot = document.getElementById(containerId);
  if (!modalRoot) return null;

  const dimensions = getModalDimensions();

  const modal = (
    <>
      {isVisible && (
        <div
          className={`fixed inset-0 z-[99999] flex items-center justify-center p-4 ${
            showModal ? "opacity-100" : "opacity-0"
          } transition-all duration-300 ease-in-out`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50  "
            onClick={closable ? handleClose : undefined}
            aria-hidden="true"
          />

          {/* Modal Content */}
          <div
            style={{
              width: dimensions.width,
              height: dimensions.height,
              maxWidth: dimensions.maxWidth,
            }}
            className={`relative bg-white rounded-lg shadow-xl z-10 transform 
              ${
                showModal ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
              }
              transition-all duration-300 ease-in-out ${modalClassName}
              flex flex-col`} // Added flex container
          >
            {/* Header */}
            <div className="flex-none flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-semibold" id="modal-title">
                {title}
              </h2>
              {closable && (
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close modal"
                >
                  <IoMdClose className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Body - with flex-grow to take remaining space */}
            <div className={`${overFlow} p-4 h-full`}>{children}</div>
            {/* Footer - with flex-none to maintain size */}
            {/* {!removeFooter && (
              <div className="flex-none flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
                {footer || (
                  <>
                    <button
                      onClick={handleClose}
                      className="px-4 py-2 text-gray-700 bg-white border rounded-md hover:bg-gray-50 transition-colors"
                      {...cancelProps}
                    >
                      {cancelText}
                    </button>
                    <button
                      onClick={() => {
                        onOk?.();
                        handleClose();
                      }}
                      className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                      {...okButtonProps}
                    >
                      {okText}
                    </button>
                  </>
                )}
              </div>
            )} */}
          </div>
        </div>
      )}
    </>
  );

  return createPortal(modal, modalRoot);
}
