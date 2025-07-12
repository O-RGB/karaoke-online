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
    <div>
      <div
        style={{
          fontSize: textSize,
        }}
        className={`${textColor} flex gap-2 `}
      >
        {headClass && (
          <div>
            <div
              className={`inline-block w-[7px] h-[7px] rounded-full mt-2 ${headClass} `}
            ></div>
          </div>
        )}

        <span className={`${className}`}>{children}</span>
      </div>
      {description && (
        <span
          className={`flex text-xs -mt-1.5 text-gray-400 py-2 ${
            headClass ? "pl-[13px]" : ""
          }`}
        >
          {description}
        </span>
      )}
    </div>
  );
};

export default Label;
