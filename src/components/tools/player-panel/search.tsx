import Button from "@/components/common/button/button";
import useKeyboardStore from "@/features/keyboard-state";
import React from "react";
import { FaSearch } from "react-icons/fa";

interface SearchButtonProps {}

const SearchButton: React.FC<SearchButtonProps> = ({}) => {
  const setOpenSearchBox = useKeyboardStore().setOpenSearchBox;

  const buttonStyle: any = {
    className: "!rounded-none aspect-square",
    size: "xs",
    color: "white",
    variant: "ghost",
  };
  return (
    <>
      <Button
        {...buttonStyle}
        className="hidden lg:block !rounded-none"
        onClick={() => {
          setOpenSearchBox?.(true);
        }}
        icon={<FaSearch className="" />}
      ></Button>
    </>
  );
};

export default SearchButton;
