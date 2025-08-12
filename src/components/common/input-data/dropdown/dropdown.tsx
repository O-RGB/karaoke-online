import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const PortalDropdownContainer: React.FC<{
  options: IOptions[];
  onClickItem: (value: IOptions) => void;
  className?: string;
  textColor?: string;
  itemHoverColor?: string;
  position: { top: number; left: number; width: number };
  isOpen: boolean;
  dropdownContainerRef: React.RefObject<HTMLDivElement>;
  portalTargetId: string;
}> = ({
  options,
  onClickItem,
  className,
  textColor = "text-white",
  itemHoverColor = "hover:bg-white/30",
  position,
  isOpen,
  dropdownContainerRef,
  portalTargetId,
}) => {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const targetElement = document.getElementById(portalTargetId);
    if (targetElement) {
      setPortalRoot(targetElement);
    } else {
      console.warn(
        `Portal target with id "#${portalTargetId}" not found. Falling back to document.body.`
      );
      setPortalRoot(document.body);
    }
  }, [portalTargetId]);

  if (!isOpen || options.length === 0 || !portalRoot) return null;

  return createPortal(
    <div
      ref={dropdownContainerRef}
      className={`
        ${
          className || "blur-overlay border divide-y divide-white/30 rounded-md"
        }
        ${textColor}
        fixed z-[9999] max-h-[245px] overflow-auto
      `}
      style={{
        top: position.top + "px",
        left: position.left + "px",
        width: position.width + "px",
      }}
    >
      {options.map((data, index) => (
        <div
          onClick={() => onClickItem(data)}
          key={`search-result-${index}`}
          className={`flex items-center gap-2 p-2 ${itemHoverColor} cursor-pointer duration-300`}
        >
          {data.render || data.label}
        </div>
      ))}
    </div>,
    portalRoot
  );
};
interface DropdownProps {
  dropdownRef?: React.RefObject<HTMLDivElement>;
  options: IOptions[];
  onClickItem: (value: IOptions) => void;
  resetOption?: () => void;
  className?: string;
  textColor?: string;
  itemHoverColor?: string;
  children?: React.ReactNode;
  inputContainerRef?: React.RefObject<HTMLDivElement>;
}

export const Dropdown: React.FC<DropdownProps> = ({
  dropdownRef,
  options,
  onClickItem,
  resetOption,
  className,
  itemHoverColor,
  textColor,
  children,
}) => {
  const Ref = dropdownRef ? dropdownRef : useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const [isOpen, setIsOpen] = useState(false);

  const updatePosition = () => {
    if (Ref.current) {
      const rect = Ref.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    if (options.length > 0) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [options]);

  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) updatePosition();
    };
    const handleResize = () => {
      if (isOpen) updatePosition();
    };

    if (isOpen) {
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [isOpen]);

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node;
    const clickedInInput = Ref.current && Ref.current.contains(target);
    const clickedInPortal =
      portalRef.current && portalRef.current.contains(target);

    if (!clickedInInput && !clickedInPortal) {
      resetOption?.();
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleItemClick = (data: IOptions) => {
    onClickItem(data);
    setIsOpen(false);
  };

  return (
    <>
      <div ref={Ref}>{children}</div>

      <PortalDropdownContainer
        portalTargetId="screen-panel"
        dropdownContainerRef={portalRef}
        options={options}
        onClickItem={handleItemClick}
        className={className}
        textColor={textColor}
        itemHoverColor={itemHoverColor}
        position={dropdownPosition}
        isOpen={isOpen}
      />
    </>
  );
};
