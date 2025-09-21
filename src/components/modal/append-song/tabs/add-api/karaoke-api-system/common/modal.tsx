"use client";

import React, { ReactNode } from "react";

interface ModalServerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}

const ModalServer: React.FC<ModalServerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
}) => {
  if (!isOpen) return null;

  return (
    // 🔹 เปลี่ยน fixed → absolute เพื่อยึดตาม parent ที่ relative
    <div className="absolute inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative max-h-[90%] max-w-[90%] min-w-[80%] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden p-4">
        {/* Header */}
        {title && (
          <div className="flex justify-between items-center bg-white pb-3 border-b flex-shrink-0">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              onClick={onClose}
            >
              ×
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-2 pt-3 border-t">{footer}</div>
        )}
      </div>
    </div>
  );
};

export default ModalServer;
