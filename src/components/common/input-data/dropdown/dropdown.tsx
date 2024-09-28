import React from "react";

interface DropdownContainerProps {
  options: IOptions[];
  onClickItem: (value: IOptions) => void;
  className?: string;
  textColor?: string;
  itemHoverColor?: string;
}

const DropdownContainer: React.FC<DropdownContainerProps> = ({
  options,
  onClickItem,
  className,
  textColor = "text-white",
  itemHoverColor = "hover:bg-white/30",
}) => {
  return (
    <div
      className={`border divide-y divide-white/30 rounded-md ${textColor} ${className} ${
        options.length > 0 ? "max-h-[245px]" : "max-h-0 border-transparent"
      } duration-300 overflow-auto`}
    >
      {options.map((data, index) => (
        <div
          onClick={() => onClickItem(data)}
          key={`search-result-${index}`}
          className={`flex items-center gap-2 p-2 ${itemHoverColor} cursor-pointer duration-300`}
        >
          {data.render}
        </div>
      ))}
    </div>
  );
};

export default DropdownContainer;
