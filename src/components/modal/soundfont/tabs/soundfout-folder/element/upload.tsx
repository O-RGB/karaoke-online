import Label from "@/components/common/display/label";
import UpdateFile from "@/components/common/input-data/upload";
import { SoundfontPlayerManager } from "@/utils/indexedDB/db/player/table";
import { TbMusicPlus } from "react-icons/tb";

const soundfontDb = new SoundfontPlayerManager();

export const SoundfontUpload: React.FC<{
  setLoading: (isLoad: boolean) => void;
  onUploadComplete: () => Promise<void>;
}> = ({ setLoading, onUploadComplete }) => (
  <div className="space-y-1">
    <Label>เพิ่ม Soundfont</Label>
    <UpdateFile
      accept=".sf2"
      className="border border-blue-500 p-3 rounded-md hover:bg-gray-50 duration-300"
      onSelectFile={async (file) => {
        setLoading(true);
        await soundfontDb.add({ file, createdAt: new Date() });
        await onUploadComplete();
        setLoading(false);
      }}
    >
      <span className="w-full text-sm flex items-center gap-2">
        <TbMusicPlus className="text-blue-500" />
        <span>อัปโหลดไฟล์</span>
        <Label>ไม่เกิน 2 Gb.</Label>
      </span>
    </UpdateFile>
  </div>
);
