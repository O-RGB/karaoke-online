import React, { useState, useEffect, useRef } from "react";
import { RecordingsManager } from "@/utils/indexedDB/db/display/table";
import { IRecordingsDisplay } from "@/utils/indexedDB/db/display/types";
import Button from "@/components/common/button/button";
import {
  FaPlay,
  FaPause,
  FaTrash,
  FaDownload,
  FaMusic,
  FaMicrophone,
} from "react-icons/fa";
import { BiTime } from "react-icons/bi";
import moment from "moment";
import { IAlertCommon } from "@/components/common/alert/types/alert.type";

interface RecordingsModalProps extends IAlertCommon {
  height?: number;
}

const RecordingsModal: React.FC<RecordingsModalProps> = ({ setAlert }) => {
  const recordingsManager = new RecordingsManager();
  const [recordings, setRecordings] = useState<IRecordingsDisplay[]>([]);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecordings();

    // Cleanup function to revoke URL when component unmounts or URL changes
    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, []);

  const loadRecordings = async () => {
    try {
      setLoading(true);
      const data = await recordingsManager.getAll();
      setRecordings(
        data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      );
    } catch (error) {
      console.error("Error loading recordings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = (recording: IRecordingsDisplay) => {
    if (playingId === recording.id) {
      // Pause current playback
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      // Stop previous playback and cleanup URL
      if (audioRef.current && currentUrl) {
        audioRef.current.pause();
        URL.revokeObjectURL(currentUrl);
      }

      // Play new recording
      const url = URL.createObjectURL(recording.file);
      setCurrentUrl(url);

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current
          .play()
          .catch((e) => console.error("Error playing audio:", e));
      }
      setPlayingId(recording.id);
    }
  };

  const handleDelete = (id: number, fileName: string) => {
    setAlert?.({
      title: "ยืนยันการลบ",
      description: `คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์ "${fileName}"?`,
      variant: "warning",
      onOk: async () => {
        try {
          if (playingId === id && audioRef.current) {
            audioRef.current.pause();
            setPlayingId(null);
          }
          await recordingsManager.delete(id);
          await loadRecordings();
        } catch (error) {
          console.error("Error deleting recording:", error);
          setAlert?.({
            title: "เกิดข้อผิดพลาด",
            description: "ไม่สามารถลบไฟล์ได้ กรุณาลองใหม่อีกครั้ง",
            variant: "error",
          });
        }
      },
    });
  };

  const handleDownload = (recording: IRecordingsDisplay) => {
    const url = URL.createObjectURL(recording.file);
    const a = document.createElement("a");
    a.href = url;
    a.download = recording.file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getRecordingType = (fileName: string) => {
    // Assuming the file naming convention indicates the type
    if (fileName.includes("vocal") || fileName.includes("mic")) {
      return {
        icon: FaMicrophone,
        label: "เสียงร้อง + ดนตรี",
        color: "text-blue-500",
      };
    }
    return { icon: FaMusic, label: "เฉพาะดนตรี", color: "text-green-500" };
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => setPlayingId(null);
      const handleError = () => {
        console.error("Error playing audio");
        setPlayingId(null);
      };

      audio.addEventListener("ended", handleEnded);
      audio.addEventListener("error", handleError);

      return () => {
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("error", handleError);
      };
    }
  }, [audioRef.current]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">กำลังโหลดไฟล์บันทึกเสียง...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] max-h-[80vh]">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <FaMusic className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">ไฟล์บันทึกเสียง</h2>
            <p className="text-sm text-gray-600">
              {recordings.length} ไฟล์ทั้งหมด
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {recordings.length > 0 ? (
          <div className="h-full overflow-y-auto p-4">
            <div className="space-y-3">
              {recordings.map((rec, index) => {
                const recordingType = getRecordingType(rec.file.name);
                const IconComponent = recordingType.icon;

                return (
                  <div
                    key={rec.id}
                    className={`group relative bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
                      playingId === rec.id
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:border-gray-300"
                    }`}
                  >
                    {/* Playing indicator */}
                    {playingId === rec.id && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500">
                        <div className="h-full bg-blue-600 animate-pulse"></div>
                      </div>
                    )}

                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 mr-4">
                          {/* File info header */}
                          <div className="flex items-center gap-2 mb-2">
                            <IconComponent
                              className={`text-sm ${recordingType.color}`}
                            />
                            <span
                              className={`text-xs font-medium ${recordingType.color}`}
                            >
                              {recordingType.label}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">
                              #
                              {String(recordings.length - index).padStart(
                                2,
                                "0"
                              )}
                            </span>
                          </div>

                          {/* File name */}
                          <h3 className="font-medium text-gray-800 truncate text-sm mb-1">
                            {rec.file.name.replace(/\.[^/.]+$/, "")}
                          </h3>

                          {/* Meta info */}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <BiTime className="text-xs" />
                              <span>
                                {moment(rec.createdAt).format("DD/MM/YY HH:mm")}
                              </span>
                            </div>
                            <span>{formatFileSize(rec.file.size)}</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handlePlayPause(rec)}
                            className={`w-9 h-9 rounded-full transition-all ${
                              playingId === rec.id
                                ? "bg-blue-500 hover:bg-blue-600 text-white"
                                : "bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-600"
                            }`}
                            padding=""
                            border=""
                            shadow=""
                            blur={false}
                            shape={false}
                            icon={
                              playingId === rec.id ? (
                                <FaPause className="text-xs" />
                              ) : (
                                <FaPlay className="text-xs ml-0.5" />
                              )
                            }
                          />

                          <Button
                            onClick={() => handleDownload(rec)}
                            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-600 transition-all"
                            padding=""
                            border=""
                            shadow=""
                            blur={false}
                            shape={false}
                            icon={<FaDownload className="text-xs" />}
                          />

                          <Button
                            onClick={() => handleDelete(rec.id, rec.file.name)}
                            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-600 transition-all"
                            padding=""
                            border=""
                            shadow=""
                            blur={false}
                            shape={false}
                            icon={<FaTrash className="text-xs" />}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FaMusic className="text-2xl text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              ยังไม่มีไฟล์บันทึกเสียง
            </h3>
            <p className="text-sm text-center text-gray-500 max-w-xs">
              เริ่มบันทึกเสียงเพื่อดูไฟล์ของคุณที่นี่
            </p>
          </div>
        )}
      </div>

      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default RecordingsModal;
