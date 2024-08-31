type ButtonProps = Partial<React.ButtonHTMLAttributes<HTMLButtonElement>> &
  CommonStyle &
  IconsProps;

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & CommonStyle;

type ColorType = "default" | "white" | "blue";
type IconPosition = "default" | "top" | "right" | "left" | "bottom";

interface CommonStyle {
  color?: ColorType;
  shape?: boolean | string;
  padding?: boolean | string;
  shadow?: boolean | string;
  border?: boolean | string;
}

interface IconsProps {
  icon?: React.ReactNode;
  iconPosition?: IconPosition;
}

interface IOptions<T = any> {
  label: string | React.ReactNode;
  value: string;
  render?: React.ReactNode;
  option?: T;
}

interface IProgressBar {
  progress?: number;
  processing?: string;
  error?: string;
}
