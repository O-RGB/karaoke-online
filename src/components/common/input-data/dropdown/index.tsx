import React, { useEffect, useRef } from "react";
import DropdownContainer from "./dropdown";

interface DropdownProps {
  dropdownRef?: React.RefObject<HTMLDivElement>;
  options: IOptions[];
  onClickItem: (value: IOptions) => void;
  resetOption?: () => void;
  children?: React.ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({
  dropdownRef,
  options,
  onClickItem,
  resetOption,
  children,
}) => {
  const Ref = dropdownRef ? dropdownRef : useRef<HTMLDivElement>(null);
  const handleClickOutside = (event: MouseEvent) => {
    if (Ref.current && !Ref.current.contains(event.target as Node)) {
      resetOption?.();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <>
      <div>{children}</div>
      <DropdownContainer
        options={options}
        onClickItem={onClickItem}
      ></DropdownContainer>
    </>
  );
};

export default Dropdown;
