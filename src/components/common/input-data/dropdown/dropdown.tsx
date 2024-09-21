import React from "react";

interface DropdownContainerProps {
  options: IOptions[];
  onClickItem: (value: IOptions) => void;
}

const DropdownContainer: React.FC<DropdownContainerProps> = ({
  options,
  onClickItem,
}) => {
  return (
    <div
      className={`border divide-y divide-white/30 text-white rounded-md ${
        options.length > 0 ? "max-h-[245px]" : "max-h-0 border-transparent"
      } duration-300 overflow-auto`}
    >
      {options.map((data, index) => (
        <div
          onClick={() => onClickItem(data)}
          key={`search-result-${index}`}
          className="flex items-center gap-2 p-2 hover:bg-white/30 cursor-pointer duration-300"
        >
          {data.render}
        </div>
      ))}
    </div>
  );
};

export default DropdownContainer;
