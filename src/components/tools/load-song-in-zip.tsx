import { ExtractFile } from "@/lib/extract-file";
import { FileWithDirectoryAndFileHandle } from "browser-fs-access";
import React, { useEffect } from "react";

interface LoadSongInZipProps {
  onSelectSong?: SearchResult;
  onLoadSong?: (value: SongFiles) => void;
  songStore: Map<string, FileWithDirectoryAndFileHandle>;
}

const LoadSongInZip: React.FC<LoadSongInZipProps> = ({
  onSelectSong,
  onLoadSong,
  songStore,
}) => {
  const generatedPatn = () => {
    let super_zip = undefined;
    let filename = undefined;
    let super_id = undefined;
    let filename_id = undefined;
    if (onSelectSong) {
      const path = onSelectSong.fileId.split("/");
      if (path.length === 2) {
        super_id = path[0];
        filename_id = path[1];
        super_zip = `${path[0]}.zip`;
        filename = `${path[1]}.zip`;
      }
    }

    return { super_zip, filename, super_id, filename_id };
  };

  const load = async () => {
    const { super_zip, filename, super_id, filename_id } = generatedPatn();

    if (super_zip && filename && super_id && filename_id) {
      console.log(super_id);
      const super_file = songStore.get(super_id);
      if (super_file) {
        const super_unzip = await ExtractFile(super_file);
        const zip = super_unzip[parseInt(filename_id)];
        const song_unzip = await ExtractFile(zip);

        var filenames: string[] = [];
        var song: Partial<SongFiles> = {};
        song_unzip.map((file) => {
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
        onLoadSong?.(song as SongFiles);
      }
    }
  };
  useEffect(() => {
    load();
  }, [onSelectSong]);
  return <> </>;
};

export default LoadSongInZip;
