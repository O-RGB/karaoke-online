import Button from "@/components/common/button/button";
import Label from "@/components/common/display/label";
import Modal from "@/components/common/modal";
import ProgressBar from "@/components/common/progress-bar";
import React, { useEffect, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import { FaCheck } from "react-icons/fa";
import { ImWarning } from "react-icons/im";

interface ProcessingModalProps {
  process?: IProgressBar;
  onClose?: () => void;
}

const ProcessingModal: React.FC<ProcessingModalProps> = ({
  process,
  onClose,
}) => {
  const [open, setOpen] = useState<boolean>(false);

  const onCloseModal = () => {
    setOpen(false);
    onClose?.();
  };

  useEffect(() => {
    setOpen(process?.show ?? false);
  }, [process?.show]);
  return (
    <>
      <Modal
        title="การประมวลผล"
        closable={false}
        removeFooter={false}
        width={400}
        height={180}
        isOpen={open}
      >
        <div className="p-2">
          <div className="flex flex-col w-full pb-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center justify-between gap-1">
                {process?.progress === 100 ? (
                  <>
                    <Label>
                      <FaCheck className="pb-0.5"></FaCheck>
                    </Label>
                    <Label className="pb-0.5">
                      {process.title ? process.title : "เรียบร้อย"}
                    </Label>
                  </>
                ) : (
                  <>
                    <Label>
                      {process?.error ? (
                        <ImWarning></ImWarning>
                      ) : (
                        <>
                          {process?.loading ? (
                            <AiOutlineLoading className="animate-spin"></AiOutlineLoading>
                          ) : (
                            <FaCheck></FaCheck>
                          )}
                        </>
                      )}
                    </Label>
                    <Label className="pb-0.5">{process?.title}</Label>
                  </>
                )}
              </span>
            </div>
            <ProgressBar
              progress={process?.progress ?? 0}
              title={process?.processing}
            ></ProgressBar>

            {process?.error && (
              <div className="pt-2">
                <Label className="flex items-center gap-1">
                  ข้อความ: {process?.error}
                </Label>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-1">
            <Button
              disabled={process?.error ? false : process?.progress !== 100}
              onClick={onCloseModal}
              padding={"p-1 w-16"}
              blur={false}
              color="blue"
              className="text-white "
            >
              ปิด
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ProcessingModal;
