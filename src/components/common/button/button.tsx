import React from "react";

interface ButtonCommonProps extends ButtonProps {
  blur?: boolean;
}

const Button: React.FC<ButtonCommonProps> = ({
  icon,
  color = "default",
  shape = true,
  iconPosition = "default",
  padding = "p-3",
  shadow = "shadow-md",
  border = "border",
  blur = true,

  ...props
}) => {
  var butStyle = `${padding} ${shadow} ${border} flex items-center justify-center gap-2`;
  var colorStyle = ""; //bg-blue-500 hover:bg-blue-500/90 active:bg-blue-500/80
  var animation = "duration-300 transition-all";
  var shapeStyle = "";
  var position = "";

  if (shape) {
    shapeStyle = "rounded-md";
  }

  shapeStyle += blur ? " blur-overlay bg-white/10 hover:bg-white/20" : "";

  switch (color) {
    case "white":
      colorStyle =
        "bg-white hover:bg-gray-200/50 active:bg-white/90 disabled:bg-white ";
      break;
    case "blue":
      colorStyle =
        "bg-blue-500 hover:bg-blue-500/80 active:bg-blue-500 disabled:bg-gray-200";
      break;
    case "green":
      colorStyle =
        "bg-green-500 hover:bg-green-500/80 active:bg-green-500 disabled:bg-gray-200";
      break;
    case "yellow":
      colorStyle =
        "bg-yellow-500 hover:bg-yellow-500/80 active:bg-yellow-500 disabled:bg-gray-200";
      break;
    case "amber":
      colorStyle =
        "bg-amber-500 hover:bg-amber-500/80 active:bg-amber-500 disabled:bg-gray-200";
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
        "",
      ].join(" ")}
    >
      {icon && <span>{icon}</span>}
      {props.children}
    </button>
  );
};

export default Button;
