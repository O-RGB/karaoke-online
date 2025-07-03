import React from "react";

interface ButtonCommonProps extends ButtonProps {
  blur?: boolean | string;
}

const Button: React.FC<ButtonCommonProps> = ({
  icon,
  color = "default",
  shape = true,
  iconPosition = "default",
  padding = "p-3",
  shadow = "shadow-md",
  border = "border",
  blur = false,

  ...props
}) => {
  var butStyle = `${padding} ${shadow} ${border} flex items-center justify-center gap-2 text-sm`;
  var colorStyle = "";
  var animation = "duration-300 transition-all";
  var shapeStyle = "";
  var position = "";

  if (shape) {
    shapeStyle = "rounded-md";
  }

  shapeStyle +=
    typeof blur === "boolean"
      ? blur
        ? " blur-overlay bg-white/10 hover:bg-white/20"
        : ""
      : ` ${blur}`;

  switch (color) {
    case "white":
      colorStyle =
        "bg-white hover:bg-blue-200/50 active:bg-white/80 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-white disabled:bg-gray-200! border border-blue-500 disabled:border-gray-200";
      break;
    case "blue":
      colorStyle =
        "text-white bg-blue-500 hover:bg-blue-500/80 active:bg-blue-500/80 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-blue-500!";
      break;
    case "green":
      colorStyle =
        "text-white bg-green-500 hover:bg-green-500/80 active:bg-green-500/80 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-green-500!";
      break;
    case "yellow":
      colorStyle =
        "text-white bg-yellow-500 hover:bg-yellow-500/80 active:bg-yellow-500/80 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-yellow-500!";
      break;
    case "amber":
      colorStyle =
        "text-white bg-amber-500 hover:bg-amber-500/80 active:bg-amber-500/80 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-amber-500!";
      break;
    case "red":
      colorStyle =
        "text-white bg-red-600 hover:bg-red-600/80 active:bg-red-500/80 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-red-500!";
      break;
    case "gray":
      colorStyle =
        "text-white bg-gray-500 hover:bg-gray-500/80 active:bg-gray-500/80 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-gray-500!";
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
    <button
      {...props}
      className={[
        butStyle,
        colorStyle,
        animation,
        shapeStyle,
        props.className,
        position,
        "z-30",
      ].join(" ")}
    >
      {icon && <div>{icon}</div>}
      {props.children}
    </button>
  );
};

export default Button;
