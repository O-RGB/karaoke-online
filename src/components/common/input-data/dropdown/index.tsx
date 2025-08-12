// import React, { useEffect, useRef } from "react";
// import DropdownContainer from "./dropdown";

// interface DropdownProps {
//   dropdownRef?: React.RefObject<HTMLDivElement>;
//   options: IOptions[];
//   onClickItem: (value: IOptions) => void;
//   resetOption?: () => void;
//   className?: string;
//   textColor?: string;
//   itemHoverColor?: string;
//   children?: React.ReactNode;
//   inputContainerRef?: React.RefObject<HTMLDivElement>; // เพิ่ม prop นี้
// }

// const Dropdown: React.FC<DropdownProps> = ({
//   dropdownRef,
//   options,
//   onClickItem,
//   resetOption,
//   className,
//   itemHoverColor,
//   textColor,
//   children,
//   inputContainerRef,
// }) => {
//   const Ref = dropdownRef ? dropdownRef : useRef<HTMLDivElement>(null);

//   const handleClickOutside = (event: MouseEvent) => {
//     if (Ref.current && !Ref.current.contains(event.target as Node)) {
//       resetOption?.();
//     }
//   };

//   useEffect(() => {
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   return (
//     <>
//       <div ref={Ref}>{children}</div>

//       <DropdownContainer
//         options={options}
//         onClickItem={onClickItem}
//         className={className}
//         textColor={textColor}
//         itemHoverColor={itemHoverColor}
//         inputContainerRef={inputContainerRef} // ส่งต่อ ref
//       />
//     </>
//   );
// };

// export default Dropdown;
