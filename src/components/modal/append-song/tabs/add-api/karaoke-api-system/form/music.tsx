"use client";

import React, { useState, useEffect, FormEvent } from "react";
import FileImageEncoder from "../dashboard/file-image";
import ImageDecoderFromUrl from "../dashboard/image-file";
import Button from "@/components/common/button/button";
import LabelCommon from "../common/label";
import Upload from "@/components/common/input-data/upload";
import { groupFilesByBaseName, musicProcessGroup } from "@/lib/karaoke/read";
import { useNotification } from "../common/notification-provider";
import { extractFile, zipFiles } from "@/lib/zip";
import { ITrackData } from "@/features/songs/types/songs.type";
import { FaSave } from "react-icons/fa";
import { MusicCreate } from "../types";
import { BiUpload } from "react-icons/bi";
import InputCommon from "@/components/common/data-input/input";
import { generateMidiSignature } from "@/lib/karaoke/songs/midi/midi-signature";

interface MusicFormProps {
  value?: MusicCreate;
  onSubmit?: (data: MusicCreate) => Promise<void>;
}

const MusicForm: React.FC<MusicFormProps> = ({ value, onSubmit }) => {
  const { notify } = useNotification();
  const [onUpload, setUpload] = useState<File>();
  const [correctData, setCorrectData] = useState<ITrackData>();

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [musicCode, setMusicCode] = useState("");
  const [signature, setSignature] = useState("");

  const [urlIsCorrect, setUrlIsCorrect] = useState<boolean>(false);
  const [directLink, setDirectLink] = useState("");
  const [imageUrl, setImageUrl] = useState<string>();
  const [directLinkMessage, setDirectLinkMessage] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (value) {
      setTitle(value.title || "");
      setArtist(value.artist || "");
      setAlbum(value.album || "");
      setMusicCode(value.music_code || "");
      setDirectLink(value.direct_link || "");
    }
  }, [value]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const response = await onSubmit?.({
      title,
      artist,
      album,
      music_code: musicCode,
      direct_link: directLink,
      signature,
    });
    setLoading(false);
  };

  const onUploadImage = async (files: FileList) => {
    const gorups = groupFilesByBaseName(files);
    if (gorups.length === 1) {
      const folder: File[] = [];
      const gorup = gorups[0];
      const { cur, emk, lyr, midi, mp3, mp4 } = gorup;
      const process = await musicProcessGroup(gorup);
      const trackData = process.trackData;
      if (mp3) {
        notify({ type: "warning", text: "ไม่รองรับไฟล์ mp3" });
        return;
      } else {
        if (cur) folder.push(cur);
        if (emk) folder.push(emk);
        if (lyr) folder.push(lyr);
        if (midi) folder.push(midi);
        const zip = await zipFiles(folder, trackData.TITLE);
        setUpload(zip);
        setTitle(trackData.TITLE);
        setArtist(trackData.ARTIST);
        setAlbum(trackData.ALBUM ?? "");
        setMusicCode(trackData.CODE);
        setCorrectData(trackData);
      }
    } else {
      notify({ type: "warning", text: "คุณจะต้องอัปโหลดทีละเพลงเท่านั้น" });
      return;
    }
  };

  function isEqual(obj1: Record<string, any>, obj2: Record<string, any>) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    return keys1.every((key) => obj1[key] === obj2[key]);
  }

  const onImageDecoded = async (file: File) => {
    if (!correctData) return notify({ type: "error", text: "ไม่มีข้อมูลจริง" });

    try {
      const files = await extractFile(file);
      const gorups = groupFilesByBaseName(files);
      if (gorups.length === 1) {
        const gorup = gorups[0];
        const process = await musicProcessGroup(gorup);
        const trackData = process.trackData;
        const midi = process.files.midi;

        if (isEqual(trackData, correctData) && midi) {
          const signature = await generateMidiSignature(midi);
          if (signature) {
            setSignature(signature);
            setUrlIsCorrect(true);
          }
        } else {
          notify({ type: "error", text: "ข้อมูลที่ได้ไม่ตรงกัน" });
        }
      } else {
        notify({ type: "warning", text: "ข้อมูลที่ได้ไม่ถูกต้อง" });
      }
    } catch (error) {
      notify({ type: "warning", text: JSON.stringify(error) });
    }
  };

  function getDirectFileUrl(url: string): string | null {
    setImageUrl(undefined);
    setDirectLink(url);
    try {
      const parsedUrl = new URL(url);
      const domain = parsedUrl.hostname;

      if (domain === "drive.google.com") {
        // if (!parsedUrl.pathname.endsWith("usp=sharing")) {
        //   setDirectLinkMessage("เปิดแชร์ไฟล์ให้ ทุกคนที่มีลิงก์");
        //   return null;
        // }

        const match = parsedUrl.pathname.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (!match) {
          setDirectLinkMessage("ไม่พบ fileId หรือ sharing ไม่ถูกต้อง");
          return null;
        }

        const fileId = match[1];

        if (!parsedUrl.searchParams.has("usp")) {
          setDirectLinkMessage("ไม่ได้เปิด sharing");
          return null;
        }
        setImageUrl(`https://lh3.googleusercontent.com/d/${fileId}`);
        setDirectLinkMessage("");
        return `https://lh3.googleusercontent.com/d/${fileId}`;
      } else if (domain === "lh3.googleusercontent.com") {
        setDirectLinkMessage("");
        setImageUrl(url);
        return url;
      } else if (domain === "example.com") {
        setDirectLinkMessage("");
        setImageUrl(url);
        return url;
      } else {
        setImageUrl(url);
        setDirectLinkMessage("");
        return null;
      }
    } catch (e) {
      setDirectLinkMessage("URL ไม่ถูกต้อง:" + e);
      return null;
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <LabelCommon>.mid (มีเนื้อร้อง) | .emk | .mid, .lyr, .cur</LabelCommon>
        <Upload
          inputProps={{ multiple: true }}
          onSelectFile={(_, filelist) => onUploadImage(filelist)}
        >
          <Button icon={<BiUpload></BiUpload>}>อัปโหลดไฟล์</Button>
        </Upload>
      </div>
      <FileImageEncoder fileToEncode={onUpload}></FileImageEncoder>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div>
          <LabelCommon>Title</LabelCommon>
          <InputCommon
            type="text"
            disabled={!onUpload}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <LabelCommon>Artist</LabelCommon>
          <InputCommon
            type="text"
            disabled={!onUpload}
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <LabelCommon>Album</LabelCommon>
          <InputCommon
            type="text"
            disabled={!onUpload}
            value={album}
            onChange={(e) => setAlbum(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <LabelCommon>Music Code</LabelCommon>
          <InputCommon
            type="text"
            disabled={!onUpload}
            value={musicCode}
            onChange={(e) => setMusicCode(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <LabelCommon>Direct Link</LabelCommon>
          <InputCommon
            placeholder="https://drive.google.com/drive/u..."
            type="url"
            disabled={!onUpload || urlIsCorrect}
            value={urlIsCorrect ? imageUrl : directLink}
            onChange={(e) => getDirectFileUrl(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
          {imageUrl && (
            <span className="text-green-500 text-xs">
              ลิงก์ถูกต้อง {signature}
            </span>
          )}
          <span className="text-red-500 text-xs">{directLinkMessage}</span>
          {imageUrl && (
            <ImageDecoderFromUrl
              imageUrl={imageUrl}
              onDecoded={onImageDecoded}
              onFail={(text) => {
                setUrlIsCorrect(false);
                notify({ type: "error", text });
                setDirectLinkMessage(text);
                setImageUrl(undefined);
              }}
            ></ImageDecoderFromUrl>
          )}
        </div>

        <Button
          isLoading={loading}
          icon={<FaSave></FaSave>}
          iconPosition="right"
          //   color={!onUpload || !urlIsCorrect ? "white" : "primary"}
          type="submit"
          disabled={!onUpload || !urlIsCorrect}
        >
          {value ? "Update Music" : "Add Music"}
        </Button>
      </form>
    </div>
  );
};

export default MusicForm;
