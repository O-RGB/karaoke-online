import Button from "@/components/common/button/button";
import Label from "@/components/common/display/label";
import Modal from "@/components/common/modal";
import ProgressBar from "@/components/common/progress-bar";
import useProgressStore from "@/features/progress/progress-store";
import React, { useEffect } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import { FaCheck } from "react-icons/fa";
import { ImWarning } from "react-icons/im";

interface ProcessingModalProps {
}

const Processing2Modal: React.FC<ProcessingModalProps> = ({ }) => {
  const process = useProgressStore((state) => state.progress)
  const show = useProgressStore((state) => state.progress?.show) ?? false
  const setProgress = useProgressStore((state) => state.setProgress)
  const close = useProgressStore((state) => state.close)

  useEffect(() => { }, [process, show]);

  const { error, loading, processing, progress, title, discription, cancel } = process ?? {}

  return (
    <Modal
      title="การประมวลผล"
      closable={false}
      removeFooter={false}
      width={400}
      height={180}
      isOpen={show}
      noMin
      noMove
      noResize
      noMax
    >
      {process && show && <div className="p-4 h-full flex flex-col justify-between">
        <div className="flex flex-col w-full pb-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center justify-between gap-1">
              {progress === 100 ? (
                <>
                  <Label>
                    <FaCheck className="pb-0.5"></FaCheck>
                  </Label>
                  <Label className="pb-0.5">
                    {title ? title : "เรียบร้อย"}
                  </Label>
                </>
              ) : (
                <>
                  <Label>
                    {error ? (
                      <ImWarning></ImWarning>
                    ) : (
                      <>
                        {loading ? (
                          <AiOutlineLoading className="animate-spin"></AiOutlineLoading>
                        ) : (
                          <FaCheck></FaCheck>
                        )}
                      </>
                    )}
                  </Label>
                  <Label className="pb-0.5">{title}</Label>
                </>
              )}
            </span>
          </div>
          <ProgressBar
            progress={progress ?? 0}
            title={processing}
          ></ProgressBar>

          {process?.error ? (
            <div className="pt-2">
              <Label className="flex items-center gap-1">
                ข้อความ: {process?.error}
              </Label>
            </div>
          ) : discription && <div className="pt-2">
            <Label className="flex items-center gap-1">
              รายละเอียด: {discription}
            </Label>
          </div>}
        </div>
        <div className="flex justify-end pt-1 gap-2">
          <Button
            disabled={error ? false : progress !== 100}
            onClick={() => setProgress(undefined)}
            padding={"p-1 w-16"}
            blur={false}
            color="blue"
            className="text-white "
          >
            ปิด
          </Button>
          {cancel && <Button
            onClick={() => setTimeout(() => close(), 100)}
            padding={"p-1 w-16"}
            blur={false}
            color="red"
            className="text-white"
          >
            ยกเลิก
          </Button>}
        </div>
      </div>}
    </Modal >
  );
};

export default Processing2Modal;
