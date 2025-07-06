import { AlertDialogProps } from "../notification";
import { ProcessingDialogProps } from "../processing";

export interface IAlertCommon {
  setAlert?: (props: AlertDialogProps) => void;
  closeAlert?: () => void;
  setProcessing?: (props: ProcessingDialogProps) => void;
  closeProcessing?: () => void;
}
