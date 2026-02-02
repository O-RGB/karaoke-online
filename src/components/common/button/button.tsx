"use client";

import React, { forwardRef } from "react";
import { FaSpinner } from "react-icons/fa";

export type ButtonSize = "xs" | "sm" | "md" | "lg";
export type ButtonVariant = "solid" | "outline" | "ghost";
export type ButtonColor =
  | "primary"
  | "secondary"
  | "danger"
  | "warning"
  | "success"
  | "gray"
  | "white";

export interface ButtonBlur {
  border?: boolean;
  color?: ButtonColor;
  backgroundColor?: ButtonColor;
}

export interface ButtonCommonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  color?: ButtonColor;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isRounded?: boolean;
  isFullWidth?: boolean;
  circle?: boolean;
  outline?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
  hidden?: boolean;
  childrenClassName?: string;
  blur?: ButtonBlur | boolean;
}

const colorStyles: Record<ButtonColor, Record<ButtonVariant, string>> = {
  primary: {
    solid:
      "bg-blue-500 text-white md:hover:bg-blue-600 active:bg-blue-700 disabled:bg-blue-500/50 shadow-sm",
    outline:
      "border-2 border-blue-500 text-blue-500 md:hover:bg-blue-50 active:bg-blue-100 disabled:border-blue-500/50 disabled:text-blue-500/50",
    ghost:
      "text-blue-500 md:hover:bg-blue-50 active:bg-blue-100 disabled:text-blue-500/50",
  },
  secondary: {
    solid:
      "bg-purple-500 text-white md:hover:bg-purple-600 active:bg-purple-700 disabled:bg-purple-500/50 shadow-sm",
    outline:
      "border-2 border-purple-500 text-purple-500 md:hover:bg-purple-50 active:bg-purple-100 disabled:border-purple-500/50 disabled:text-purple-500/50",
    ghost:
      "text-purple-500 md:hover:bg-purple-50 active:bg-purple-100 disabled:text-purple-500/50",
  },
  danger: {
    solid:
      "bg-red-500 text-white md:hover:bg-red-600 active:bg-red-700 disabled:bg-red-500/50 shadow-sm",
    outline:
      "border-2 border-red-500 text-red-500 md:hover:bg-red-50 active:bg-red-100 disabled:border-red-500/50 disabled:text-red-500/50",
    ghost:
      "text-red-500 md:hover:bg-red-50 active:bg-red-100 disabled:text-red-500/50",
  },
  warning: {
    solid:
      "bg-yellow-500 text-white md:hover:bg-yellow-600 active:bg-yellow-700 disabled:bg-yellow-500/50 shadow-sm",
    outline:
      "border-2 border-yellow-500 text-yellow-500 md:hover:bg-yellow-50 active:bg-yellow-100 disabled:border-yellow-500/50 disabled:text-yellow-500/50",
    ghost:
      "text-yellow-500 md:hover:bg-yellow-50 active:bg-yellow-100 disabled:text-yellow-500/50",
  },
  success: {
    solid:
      "bg-green-500 text-white md:hover:bg-green-600 active:bg-green-700 disabled:bg-green-500/50 shadow-sm",
    outline:
      "border-2 border-green-500 text-green-500 md:hover:bg-green-50 active:bg-green-100 disabled:border-green-500/50 disabled:text-green-500/50",
    ghost:
      "text-green-500 md:hover:bg-green-50 active:bg-green-100 disabled:text-green-500/50",
  },
  gray: {
    solid:
      "bg-gray-500 text-white md:hover:bg-gray-600 active:bg-gray-700 disabled:bg-gray-500/50 shadow-sm",
    outline:
      "border-2 border-gray-500 text-gray-500 md:hover:bg-gray-50 active:bg-gray-100 disabled:border-gray-500/50 disabled:text-gray-500/50",
    ghost:
      "text-gray-500 md:hover:bg-gray-50 active:bg-gray-100 disabled:text-gray-500/50",
  },
  white: {
    solid:
      "text-gray-800 md:hover:text-blue-500 active:bg-blue-50 active:border-blue-600 disabled:text-gray-400 disabled:bg-white/70 shadow-sm",
    outline:
      "border-2 border-white text-white md:hover:bg-white/20 active:bg-white/30 disabled:border-white/50 disabled:text-white/50",
    ghost:
      "text-white md:hover:bg-white/20 active:bg-white/30 disabled:text-white/50",
  },
};

const blurBackgroundStyles: Record<ButtonColor, string> = {
  primary: "md:hover:!bg-white/20 active:!bg-white/60",
  secondary:
    "!bg-purple-500/50 md:hover:!bg-purple-500/50 active:!bg-purple-500/60",
  danger: "!bg-red-500/80 md:hover:!bg-red-500/50 active:!bg-red-500/60",
  warning:
    "!bg-yellow-500/80 md:hover:!bg-yellow-500/50 active:!bg-yellow-500/60",
  success: "!bg-green-500/80 md:hover:!bg-green-500/50 active:!bg-green-500/60",
  gray: "!bg-gray-500/80 md:hover:!bg-gray-500/50 active:!bg-gray-500/60",
  white: "md:hover:!bg-white/30 active:!bg-white/60",
};

const blurTextStyles: Record<ButtonColor, string> = {
  primary: "text-blue-500 border-blue-500 md:hover:text-blue-400",
  secondary: "text-purple-500 border-purple-500 md:hover:text-purple-400",
  danger: "text-red-500 border-red-500 md:hover:text-red-400",
  warning: "text-yellow-500 border-yellow-500 md:hover:text-yellow-400",
  success: "text-green-500 border-green-500 md:hover:text-green-400",
  gray: "text-gray-500 border-gray-500 md:hover:text-gray-400",
  white: "text-white border-white/50 md:hover:text-white/90",
};

const getBlurClasses = (blur: ButtonCommonProps["blur"]) => {
  if (!blur) return "";

  if (typeof blur === "boolean") {
    return `blur-overlay ${blurTextStyles.white} md:hover:!bg-white/20 active:!bg-white/30`;
  }

  const textClass = blur.color
    ? blurTextStyles[blur.color]
    : blurTextStyles.white;

  let backgroundClass = "";
  if (blur.backgroundColor) {
    backgroundClass = blurBackgroundStyles[blur.backgroundColor];
  } else {
    backgroundClass = "md:hover:!bg-white/20 active:!bg-white/30";
  }

  const borderClass = blur.border ? " border" : "";

  return `blur-overlay ${textClass} ${backgroundClass} ${borderClass}`;
};

const SIZE_VALUES = {
  regular: {
    xs: "px-3 py-1.5 text-xs",
    sm: "px-3.5 py-2 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-4 py-2 text-base",
    auto: "px-3.5 py-2 text-sm sm:px-4 sm:py-2 sm:text-base lg:px-4 lg:py-2",
  },
  circle: {
    xs: "p-1.5",
    sm: "p-2",
    md: "p-2.5",
    lg: "p-2.5",
    auto: "p-2 sm:p-2.5 lg:p-2.5",
  },
};

const getSizeClasses = (size?: ButtonSize, circle?: boolean) => {
  return size
    ? SIZE_VALUES[circle ? "circle" : "regular"][size]
    : SIZE_VALUES[circle ? "circle" : "regular"].auto;
};

const getShapeClasses = (
  circle?: boolean,
  isRounded?: boolean,
  isFullWidth?: boolean
) => {
  const shape = circle
    ? "rounded-full"
    : isRounded
    ? "rounded-full"
    : "rounded-lg";
  const width = !circle && isFullWidth ? "w-full" : "";
  return `${shape} ${width}`;
};

const ButtonCommon = forwardRef<HTMLButtonElement, ButtonCommonProps>(
  (
    {
      children,
      color = "primary",
      variant = "solid",
      size,
      isRounded = false,
      isFullWidth = false,
      circle = false,
      outline = false,
      icon,
      iconPosition = "left",
      isLoading = false,
      disabled,
      className = "",
      childrenClassName,
      blur = false,
      ...props
    },
    ref
  ) => {
    if (props.hidden) return null;

    const finalVariant = outline ? "outline" : variant;

    const appliedSize = getSizeClasses(size, circle);
    const shapeClasses = getShapeClasses(circle, isRounded, isFullWidth);
    const blurClasses = getBlurClasses(blur);

    const buttonClasses = `
      transition-all duration-200 flex items-center justify-center gap-2
      disabled:cursor-not-allowed
      ${shapeClasses}
      ${appliedSize}
      ${
        blur
          ? blurClasses
          : colorStyles[color]?.[finalVariant] || colorStyles.primary.solid
      }
      ${className}
      group-[.no-hover]:md:hover:!bg-transparent
      group-[.no-hover]:md:hover:!text-inherit
      group-[.no-hover]:md:hover:!border-inherit
    `.trim();

    const renderContent = () => (
      <>
        {isLoading && <FaSpinner className="animate-spin h-5 w-5" />}
        {!isLoading && icon && iconPosition === "left" && <div>{icon}</div>}
        {children && <>{children}</>}
        {!isLoading && icon && iconPosition === "right" && <div>{icon}</div>}
      </>
    );

    return (
      <button
        ref={ref}
        {...props}
        disabled={disabled || isLoading}
        className={buttonClasses}
      >
        {renderContent()}
      </button>
    );
  }
);

ButtonCommon.displayName = "ButtonCommon";

export default React.memo(ButtonCommon);