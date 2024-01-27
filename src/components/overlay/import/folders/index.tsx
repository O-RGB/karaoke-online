import React, { useEffect, useRef } from "react";
import useTestLoad from "../../../../hooks/useTestLoad";

interface ImportFoldersProps {
  rounded?: string;
  bgOverLay?: string;
  blur?: string;
  textColor?: string;
  borderColor?: string;
}

const ImportFolders: React.FC<ImportFoldersProps> = ({
  rounded,
  bgOverLay,
  blur,
  textColor,
  borderColor,
}) => {
  const ref = useRef<HTMLInputElement>(null);
  function buildFileTree(files: FileList): Folder {
    const fileTree: any = {};
    for (let i = 0; i < files.length; i++) {
      const pathArray = files[i].webkitRelativePath.split("/");
      let currentLevel = fileTree;

      for (let j = 0; j < pathArray.length; j++) {
        const segment = pathArray[j];

        if (!currentLevel[segment]) {
          if (j === pathArray.length - 1) {
            currentLevel[segment] = files[i];
          } else {
            currentLevel[segment] = {};
          }
        }

        currentLevel = currentLevel[segment];
      }
    }

    return fileTree;
  }

  const TestLoadFolder = useTestLoad();
  useEffect(() => {
    if (ref.current) {
      ref.current.setAttribute("directory", "");
      ref.current.setAttribute("webkitdirectory", "");
      ref.current.setAttribute("mozdirectory", "");
    }
  }, [ref]);

  return (
    <>
      <div
        className={`${rounded} ${bgOverLay} ${blur} ${textColor} ${borderColor} h-32 p-2 flex flex-col gap-2`}
      >
        <div>เลือกโฟลเดอร์ NCN</div>
        <input
          type="file"
          onChange={(evnet) => {
            if (evnet.target.files) {
              let folder = buildFileTree(evnet.target.files);

              TestLoadFolder.setFolderProgram(folder);
              folder = {};
              evnet.target.remove();
            }
          }}
          ref={ref}
        />
      </div>
    </>
  );
};

export default ImportFolders;
