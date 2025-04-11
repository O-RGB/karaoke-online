import React from "react";

interface LabelProps {
  children: React.ReactNode;
  className?: string;
  headClass?: string;
  textSize?: number;
  textColor?: string;
  description?: React.ReactNode;
}

const Label: React.FC<LabelProps> = ({
  children,
  className,
  headClass,
  textSize = 12,
  textColor = "text-gray-400",
  description,
}) => {
  return (
    <span>
      <span
        style={{
          fontSize: textSize,
        }}
        className={`${textColor} flex gap-1.5 items-center`}
      >
        {headClass && (
          <span
            className={`inline-block w-[7px] h-[7px] rounded-full ${headClass} `}
          ></span>
        )}

        <span className={`${className}`}>{children}</span>
      </span>
      {description && (
        <span
          className={`flex text-xs -mt-1.5 text-gray-400 py-2 ${
            headClass ? "pl-[13px]" : ""
          }`}
        >
          {description}
        </span>
      )}
    </span>
  );
};

export default Label;
