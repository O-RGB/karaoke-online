import React, { InputHTMLAttributes, useRef } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

interface UpdateFileProps {
  onSelectFile?: (file: File, filelist: FileList) => void;
  accept?: string;
  label?: string;
  className?: string;
  inputProps?: InputProps;
  children?: React.ReactNode;
}

const UpdateFile: React.FC<UpdateFileProps> = ({
  onSelectFile,
  accept,
  label,
  className,
  inputProps,
  children,
}) => {
  const inputRef = useRef<any>(null);

  const handleChildClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const selectFileHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    if (target.files && target.files.length > 0) {
      onSelectFile?.(target.files[0], target.files);
    }
  };

  return (
    <div className={className}>
      {label && <label>{label}</label>}
      <div>
        <div onClick={handleChildClick}>
          <input
            {...inputProps}
            ref={inputRef}
            onChange={selectFileHandler}
            type="file"
            accept={accept}
            style={{ display: "none" }} // ซ่อน input
          />
          {children}
        </div>
      </div>
    </div>
  );
};

export default UpdateFile;
