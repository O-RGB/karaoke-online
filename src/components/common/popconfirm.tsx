// components/Popconfirm.tsx
import React, { useState, useEffect } from "react";

interface PopconfirmProps {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  children: React.ReactNode;
}

const Popconfirm: React.FC<PopconfirmProps> = ({
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // ใช้สำหรับ fade

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => setIsVisible(true), 50); // หน่วงเวลาเล็กน้อยให้เกิดการ fade-in
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setIsOpen(false), 300); // ให้ fade-out ก่อนค่อยซ่อน
  };

  const handleConfirm = () => {
    onConfirm();
    handleClose();
  };

  return (
    <div className="relative inline-block ">
      <div onClick={handleOpen} className="cursor-pointer">
        {children}
      </div>

      {isOpen && (
        <div>
          {/* Overlay with fade-in/out */}
          <div
            className={`fixed z-50 inset-0 bg-gray-800 bg-opacity-50 transition-opacity duration-300 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={handleClose}
          ></div>

          {/* Popconfirm Box with fade-in/out */}
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
              className={`bg-white border border-gray-300 shadow-lg p-6 rounded-lg max-w-sm w-full transform transition-all duration-300 ${
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-sm text-gray-600 mb-4">{description}</p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Popconfirm;
