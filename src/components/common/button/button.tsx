import React, { ButtonHTMLAttributes } from "react";

type buttonProps = ButtonHTMLAttributes<HTMLButtonElement>;
type ColorType = "default" | "white";
type IconPosition = "default" | "top" | "right" | "left" | "bottom";

interface ButtonProps extends buttonProps {
  icon?: React.ReactNode;
  color?: ColorType;
  iconPosition?: IconPosition;
  shape?: boolean;
  padding?: string;
  shadow?: string;
}

const Button: React.FC<ButtonProps> = ({
  icon,
  color = "default",
  shape = true,
  iconPosition = "default",
  padding = "p-3",
  shadow = "shadow-md",
  ...props
}) => {
  var butStyle = `${padding} ${shadow} flex items-center justify-center gap-2`;
  var colorStyle = ""; //bg-blue-500 hover:bg-blue-500/90 active:bg-blue-500/80
  var animation = "duration-300 transition-all";
  var shapeStyle = "blur-overlay";
  var position = "";

  if (shape) {
    shapeStyle = "rounded-md";
  }

  switch (color) {
    case "white":
      colorStyle = "bg-white hover:bg-gray-200/50 active:bg-white/90 disabled:bg-white";
      break;

    default:
      break;
  }

  switch (iconPosition) {
    case "top":
      position = "flex-col";
      break;
    case "left":
      position = "flex-row";
      break;
    case "right":
      position = "flex-row-reverse";
      break;
    case "bottom":
      position = "flex-col-reverse";
      break;

    default:
      position = "flex-col";
      break;
  }

  return (
    <>
      <button
        {...props}
        className={[
          butStyle,
          colorStyle,
          animation,
          shapeStyle,
          props.className,
          position,
          "",
        ].join(" ")}
      >
        <span>{icon}</span>
        {props.children}
      </button>
    </>
  );
};

export default Button;
