import React, { useState } from "react";
import Upload from "../common/input-data/upload";
import {
  addTracklistToDatabase,
  jsonTracklistToDatabase,
} from "@/lib/storage/tracklist";

const LargeJsonEditor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="container mx-auto p-4">
      <Upload
        onSelectFile={(e) => {
          jsonTracklistToDatabase(e);
        }}
      >
        test
      </Upload>
    </div>
  );
};

export default LargeJsonEditor;
