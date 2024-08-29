import { ExtractFile } from "@/lib/zip";
import React, { useEffect } from "react";
import { useState } from "react";
import { FaFile } from "react-icons/fa";

interface FetchFileComponentProps {
  onSelectSong?: SearchResult;
  onLoadSong?: (value: SongFiles) => void;
}

const FetchFileComponent: React.FC<FetchFileComponentProps> = ({
  onSelectSong,
  onLoadSong,
}) => {
  const [apiUrl, setApiUrl] = useState<string>("http://127.0.0.1:5000");
  const [extractedFiles, setExtractedFiles] = useState<string[]>([]);

  const fetchFile = async (obj: SearchResult) => {
    if (!apiUrl) {
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/get-file`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: obj.type,
          fileId: obj.fileId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const blob = await response.blob();
      console.log("decoding");
      var decoded = await ExtractFile(new File([blob], obj.fileId));
      var filenames: string[] = [];
      var song: Partial<SongFiles> = {};
      decoded.map((file) => {
        console.log(file);
        if (file.name.endsWith("mid")) {
          song.mid = file;
        } else if (file.name.endsWith("cur")) {
          song.cur = file;
        } else if (file.name.endsWith("lyr")) {
          song.lyr = file;
        }
        filenames.push(file.name);
      });
      console.log("decoded", decoded);

      onLoadSong?.(song as SongFiles);
      setExtractedFiles(filenames);
    } catch (error) {
      console.error("Error fetching file:", error);
    }
  };

  const onEventGetSong = () => {
    if (onSelectSong) {
      fetchFile(onSelectSong);
    }
  };

  useEffect(() => {
    console.log("song change", onSelectSong);
    onEventGetSong();
  }, [onSelectSong]);

  return (
    <div className="bg-white p-2 flex flex-col gap-1 w-full">
      <label htmlFor="" className="text-sm text-gray-500">
        API URL:
      </label>
      <input
        className="border"
        defaultValue={"http://127.0.0.1:5000"}
        onChange={(e) => setApiUrl(e.target.value)}
      />
      Extracted File:
      <div className="p-2 border">
        {extractedFiles.map((data, index) => {
          return (
            <React.Fragment key={`extracted-file-${index}`}>
              <div className="flex gap-1 items-center ">
                <FaFile className="text-lg"></FaFile>
                {data}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default FetchFileComponent;
