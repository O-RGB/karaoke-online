import React, { useEffect, useRef, useState } from "react";
import useTestLoad from "../../../../hooks/useTestLoad";
import InputCommon from "../../../common/input";
import { FaServer } from "react-icons/fa";
import { FaFileZipper } from "react-icons/fa6";
import { FaFolderOpen } from "react-icons/fa";
import { FaPython } from "react-icons/fa";
import { Modal } from "antd";
import ModalCommon from "../../../common/modal/modal";
import useConfig from "../../../../hooks/useConfig";
import { AiOutlineLoading } from "react-icons/ai";

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
  const config = useConfig();

  const handleFileChange = async (event: any) => {
    const file = event.target.files[0];

    if (file) {
      TestLoadFolder.setZipProgram(file);
    }
  };

  useEffect(() => {
    if (ref.current) {
      ref.current.setAttribute("directory", "");
      ref.current.setAttribute("webkitdirectory", "");
      ref.current.setAttribute("mozdirectory", "");
    }

    if (TestLoadFolder.songListLoading) {
      loadingModal();
    } else {
      handleCancel();
    }
  }, [ref, TestLoadFolder.songListLoading]);

  const loadingModal = () => {
    setModalKey("loading");
    setModalNode(
      <div className="flex gap-6 items-center justify-center">
        <ButtonStyle onClick={createSongList} title={"กำลังโหลด"}>
          <AiOutlineLoading className="animate-spin text-lg text-white"></AiOutlineLoading>
        </ButtonStyle>
      </div>
    );
    showModal();
  };

  function ButtonStyle({ children, title, full, onClick }: any) {
    return (
      <div
        onClick={onClick}
        className={`${rounded} ${bgOverLay}  ${textColor} ${borderColor} ${
          full ? "w-full h-24 md:h-32" : "w-20 md:w-32 h-24 md:h-32"
        } hover:bg-black/10 duration-300 cursor-pointer`}
      >
        <div className="flex gap-1 flex-col justify-center items-center h-full">
          <div className="text-white/80 text-3xl md:text-6xl ">{children}</div>
          <div className="text-center px-2 text-xs">{title}</div>
        </div>
      </div>
    );
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ModalNode, setModalNode] = useState(<></>);
  const [ModalKey, setModalKey] = useState<string | undefined>(undefined);
  const [ModalTitle, setModalTitle] = useState<string | undefined>(undefined);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = (value?: string) => {
    console.log(value);
    if (value == "SongList") {
      config.setApiServer("http://127.0.0.1:8080");
      TestLoadFolder.setApiProgram("http://127.0.0.1:8080");
    } else {
    }

    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const createSongList = () => {
    setModalNode(
      <div className="flex gap-6 items-center justify-center">
        <ButtonStyle
          onClick={createSongList}
          title={"create-json-song-list.py"}
        >
          <FaPython></FaPython>
        </ButtonStyle>
        <div>
          <div>โปรแกรมเตรียมเนื้อเพลง</div>
          <div>1.นำไฟล์ไปไว้ในโปรแกรม Karaoke</div>
          <div>2.กดเปิดโปรแกรม</div>
          <div>3.จะได้ไฟล์ song_list.json</div>
        </div>
      </div>
    );
    showModal();
  };
  const createServer = () => {
    setModalNode(
      <div className="flex gap-6 items-center justify-center">
        <ButtonStyle onClick={createSongList} title={"mini-karaoke-api.py"}>
          <FaPython></FaPython>
        </ButtonStyle>
        <div>
          <div>โปรแกรมสร้าง Server</div>
          <div>1.นำไฟล์ไปไว้ในโปรแกรม Karaoke</div>
          <div>2.กดเปิดโปรแกรม</div>
          <div>3.จะได้ URL สำหรับใส่ Input ด้านล่าง</div>
        </div>
      </div>
    );
    showModal();
  };

  const [InputApi, setInpuApi] = useState<string>("");
  const createInputServer = () => {
    setModalTitle("URL Server");
    setModalKey("SongList");
    setModalNode(
      <div className="flex gap-6 items-center justify-center">
        <InputCommon
        value={"http://127.0.0.1:8080"}
          placeholder="http://127.0.0.1:5000"
          onChange={(e) => {
            setInpuApi(e.target.value);
          }}
        ></InputCommon>
      </div>
    );
    showModal();
  };

  return (
    <>
      <ModalCommon
        title={ModalTitle}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        value={ModalKey}
      >
        {ModalNode}
      </ModalCommon>
      <div
        className={`${rounded} ${bgOverLay} ${blur} ${textColor} ${borderColor} p-6 px-8 flex flex-col gap-4`}
      >
        <div className="">ก่อน import ไฟล์</div>
        <div className="w-full flex gap-4 justify-center items-center  ">
          <ButtonStyle onClick={createSongList} title={"เตรียมเนื้อเพลง"}>
            <FaPython></FaPython>
          </ButtonStyle>
          <ButtonStyle onClick={createServer} title={"สร้าง Server เอง"}>
            <FaPython></FaPython>
          </ButtonStyle>
        </div>
        <hr />
        <div className="">เลือกไฟล์จาก</div>
        <div className="w-full flex gap-4 justify-center items-center  ">
          <ButtonStyle onClick={createInputServer} title={"Server"}>
            <FaServer></FaServer>
          </ButtonStyle>
          <ButtonStyle onClick={handleFileChange} title={"Zip File"}>
            <FaFileZipper></FaFileZipper>
          </ButtonStyle>
        </div>
        <ButtonStyle
          full
          title={
            <div className="text-center">
              <div>Folder</div>
              <div className="text-xs">(คอมพิวเตอร์เท่านั้น)</div>
            </div>
          }
        >
          <FaFolderOpen></FaFolderOpen>
        </ButtonStyle>

        {/* <div>เลือกโฟลเดอร์ NCN</div>
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
        /> */}
        {/* <div>เลือก .Zip NCN</div>
        <input type="file" onChange={handleFileChange} accept=".zip" />

        <div>Read File in mini AIP</div>
        <button
          onClick={() => {
            TestLoadFolder.setApiProgram();
          }}
        >
          test get file
        </button> */}
      </div>
    </>
  );
};

export default ImportFolders;
