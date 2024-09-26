type ButtonProps = Partial<React.ButtonHTMLAttributes<HTMLButtonElement>> &
  CommonStyle &
  IconsProps;

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & CommonStyle;

type ColorType =
  | "default"
  | "white"
  | "blue"
  | "green"
  | "yellow"
  | "amber"
  | "red";
type IconPosition = "default" | "top" | "right" | "left" | "bottom";

type ModalType =
  | "SOUNDFONT_MODEL"
  | "JOIN"
  | "SUPER_JOIN"
  | "MUSIC_LOADED"
  | "MUSIC_STORE"
  | "ADD_MUSIC"
  | "WALLPAPER"
  | "LYRICS";

type ModalComponents = {
  [key in ModalType]?: React.ReactNode;
};

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onOk?: () => void;
  okButtonProps?: ButtonProps;
  cancelProps?: ButtonProps;
  children: React.ReactNode;
  title?: string | React.ReactNode;
  width?: string;
  footer?: React.ReactNode;
  cancelText?: string;
  okText?: string;
  closable?: boolean;
};

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

interface MapContextMenu {
  render: React.ReactNode;
  modalProps?: ModalProps;
  contextProps?: ContextMenuItem;
}

interface ContextMenuItem<T = any> {
  onClick?: (type: T, title: ReactNode) => void;
  type: T;
  text: string;
  icon?: React.ReactNode;
}

interface ContextMenuProps<T = any> {
  children?: React.ReactNode;
  items?: ContextMenuItem<T>[];
}

interface INotification {
  id: number;
  text: string;
}
