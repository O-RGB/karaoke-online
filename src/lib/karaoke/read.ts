import { parseEMKFile } from "./songs/emk";
import { readCursorFile, readLyricsFile } from "./ncn";
import {
  ITrackData,
  KaraokeExtension,
  MusicLoadAllData,
} from "@/features/songs/types/songs.type";
import { cursorToTicks } from "./cursors";
import {
  curToArrayRange,
  convertLyricsMapping,
  xmlToArrayRange,
} from "./lyrics";
import { parseMidi } from "./songs/midi/reader";
import { DEFAULT_SONG_INFO, IMidiParseResult } from "./songs/midi/types";
import { readMp3 } from "./songs/mp3/read";
import { SoundSystemMode } from "@/features/config/types/config.type";
import { ParsedSongData } from "./songs/shared/types";
import { MusicFileType, MusicSubType } from "./songs/types";
import { readYkrFile } from "./songs/ykr/reader";
import {
  gorupLyricWordDataToLyrics,
  groupWordDataToEvents,
} from "./lyrics/xml-event/convert";

const convertToTrackData = (
  baseName: string,
  musicType: MusicFileType,
  musicSubType: MusicSubType,
  metadata: ParsedSongData,
  system: SoundSystemMode = "DATABASE_FILE_SYSTEM"
): ITrackData => {
  const nameOnly = baseName.replace(/\.[^.]+$/, "");

  if (metadata.lyricsRaw) {
    const [
      title,
      artist,
      key,
      space,
      lyr1,
      lyr2,
      lyr3,
      lyr4,
      lyr5,
      lyr6,
      lyr7,
    ] = metadata.lyricsRaw ?? [];

    return {
      CODE: nameOnly,
      LYRIC_TITLE: `${lyr1} ${lyr2} ${lyr3} ${lyr4} ${lyr5} ${lyr6} ${lyr7}`,
      TYPE: musicType,
      SUB_TYPE: musicSubType,
      VERSION: "1.1",
      SOURCE: "",
      TIME_FORMAT: "",
      TITLE: title,
      ARTIST: artist,
      LANGUAGE: "DEFAULT",
      VOCAL_CHANNEL: "9",
      _originalIndex: 0,
      _system: system,
    };
  } else {
    const [l1, l2, l3, l4, l5, l6, l7] = metadata.lyrics ?? [];
    const jo = (x: any[]) => x.map((y) => y?.text).join("");
    const lyricsTitle = `${l1 && jo(l1)} ${l2 && jo(l2)} ${l3 && jo(l3)} ${
      l4 && jo(l4)
    } ${l5 && jo(l5)} ${l6 && jo(l6)} ${l7 && jo(l7)}`;

    return {
      ...metadata?.info,
      CODE: nameOnly,
      LYRIC_TITLE: lyricsTitle,
      TYPE: musicType,
      SUB_TYPE: musicSubType,
      _originalIndex: 0,
      _system: system,
    };
  }
};

export const musicProcessGroup = async (
  files: KaraokeExtension,
  full: boolean = true
): Promise<MusicLoadAllData> => {
  let group: MusicLoadAllData = {
    baseName: "",
    files,
    musicType: "MIDI",
    fileType: "",
    duration: 0,
    trackData: {
      ...DEFAULT_SONG_INFO,
      CODE: "",
      TYPE: "NCN",
      SUB_TYPE: "MID",
      _originalIndex: 0,
      _system: "DATABASE_FILE_SYSTEM",
    },
  };
  if ((files.lyr && !files.cur) || (!files.lyr && files.cur)) {
    group.isError = true;
    return group;
  }

  const hasLyrics = (group: MusicLoadAllData): boolean =>
    !!group.metadata?.lyrics;

  // 🔹 LYR + CUR + MID
  if (files.lyr && files.cur && files.midi) {
    group.musicType = "MIDI";
    group.fileType = "midi";
    group.baseName = files.midi.name;

    try {
      group.metadata = await parseMidi(files.midi);
      const lyrStr = await readLyricsFile(files.lyr);

      if (full) {
        const curTick = await readCursorFile(files.cur);
        let tempos = (group.metadata as IMidiParseResult).tempos;
        let ppq = (group.metadata as IMidiParseResult).ticksPerBeat;
        let duration = (group.metadata as IMidiParseResult).duration;
        let realCur = cursorToTicks(curTick, ppq);

        group.lyricsRange = curToArrayRange(lyrStr.slice(3), realCur);
        group.tempoRange = tempos;
        group.duration = duration;
      }

      group.musicType = "MIDI";
      group.fileType = "midi";
      group.metadata.lyricsRaw = lyrStr;
      group.trackData = convertToTrackData(
        group.baseName,
        "NCN",
        "MID",
        group.metadata
      );
    } catch (error) {
      group.isError = true;
      return group;
    }

    console.log("Three File MIDI: ", group.lyricsRange);
  }

  // 🔹 MIDI only
  else if (files.midi) {
    group.musicType = "MIDI";
    group.fileType = "midi";
    group.baseName = files.midi.name;
    group.metadata = await parseMidi(files.midi);
    if (!hasLyrics(group)) {
      group.isError = true;
      console.log(`MIDI Group ${group.baseName} ไม่มี lyrics ❌ ลบออก`);
      return group;
    }

    if (full) {
      let tempos = (group.metadata as IMidiParseResult).tempos;
      let ppq = (group.metadata as IMidiParseResult).ticksPerBeat;
      let duration = (group.metadata as IMidiParseResult).duration;
      const { convertedChords, finalWords } = convertLyricsMapping(
        group.metadata,
        "MIDI",
        ppq,
        tempos
      );
      group.tempoRange = tempos;
      group.duration = duration;
      group.lyricsRange = xmlToArrayRange(finalWords, ppq, "MIDI");
    }

    group.trackData = convertToTrackData(
      group.baseName,
      "NCN",
      "MID",
      group.metadata
    );
    group.musicType = "MIDI";
    group.fileType = "midi";
  }

  // 🔹 EMK
  else if (files.emk) {
    group.musicType = "MIDI";
    group.fileType = "emk";
    group.baseName = files.emk.name;
    const decoded = await parseEMKFile(files.emk);
    if (decoded?.mid && decoded?.cur && decoded.lyr) {
      const mid = decoded.mid;
      const cur = decoded.cur;
      const lyr = decoded.lyr;

      group.metadata = await parseMidi(mid);

      group.files.midi = mid;
      group.files.cur = cur;
      group.files.lyr = lyr;

      const lyrStr = await readLyricsFile(lyr);

      if (full) {
        const curTick = await readCursorFile(cur);

        let tempos = (group.metadata as IMidiParseResult).tempos;
        let ppq = (group.metadata as IMidiParseResult).ticksPerBeat;
        let duration = (group.metadata as IMidiParseResult).duration;
        let realCur = cursorToTicks(curTick, ppq);

        group.lyricsRange = curToArrayRange(lyrStr.slice(3), realCur);
        group.tempoRange = tempos;
        group.duration = duration;
      }
      group.metadata.lyricsRaw = lyrStr;
      group.trackData = convertToTrackData(
        group.baseName,
        "EMK",
        "EMK",
        group.metadata
      );

      console.log(group);
    }
  }

  // 🔹 MP3
  else if (files.mp3) {
    group.musicType = "MP3";
    group.fileType = "mp3";
    group.baseName = files.mp3.name;
    let parsedDataMp3 = await readMp3(files.mp3);
    group.metadata = parsedDataMp3.parsedData;
    group.duration = parsedDataMp3.parsedData.duration ?? 0;

    if (!hasLyrics(group)) {
      group.isError = true;
      console.log(`MP3 Group ${group.baseName} ไม่มี lyrics ❌ ลบออก`);
      return group;
    }

    if (full) {
      const { convertedChords, finalWords } = convertLyricsMapping(
        parsedDataMp3.parsedData,
        "MP3",
        0
      );
      group.lyricsRange = xmlToArrayRange(finalWords, 0, "MP3");
    }
    group.trackData = convertToTrackData(
      group.baseName,
      "MP3",
      "MP3",
      group.metadata
    );

    console.log("MP3", group);
  }

  // 🔹 MP4
  else if ((files as any).mp4) {
    console.log(`MP4 Group ${group.baseName} -> TODO`);
  }

  // 🔹 YOUTUBE
  else if (files.ykr) {
    group.musicType = "YOUTUBE";
    group.fileType = "youtube";
    group.baseName = files.ykr.name;
    let parsedDataYoutube = await readYkrFile(files.ykr);
    group.metadata = {
      chords: parsedDataYoutube.data.chordsData,
      info: parsedDataYoutube.data.metadata,
      lyrics: groupWordDataToEvents(parsedDataYoutube.data.lyricsData),
      lyricsRaw: gorupLyricWordDataToLyrics(
        parsedDataYoutube.data.lyricsData,
        parsedDataYoutube.data.metadata
      ),
    };
    group.duration = parsedDataYoutube.data.playerState.duration ?? 0;

    if (!hasLyrics(group)) {
      group.isError = true;
      console.log(`YOUTUBE Group ${group.baseName} ไม่มี lyrics ❌ ลบออก`);
      return group;
    }

    let lyricsData = parsedDataYoutube.data.lyricsData.flat();

    console.log("lyricsData", lyricsData);

    group.lyricsRange = xmlToArrayRange(lyricsData, 0, "YOUTUBE");

    console.log("group.metadata", group.metadata);
    group.trackData = convertToTrackData(
      group.baseName,
      "YOUTUBE",
      "YOUTUBE",
      group.metadata
    );

    group.youtubeId = parsedDataYoutube.data.playerState.youtubeId;

    console.log("YOUTUBE", group);
  }

  return group;
};

const getBaseName = (file: File): string => {
  const lastDot = file.name.lastIndexOf(".");
  return lastDot !== -1 ? file.name.substring(0, lastDot) : file.name;
};

export const groupFilesByBaseName = (
  input: FileList | File[]
): KaraokeExtension[] => {
  const filesArray: File[] =
    input instanceof FileList ? Array.from(input) : input;
  const grouped: Record<string, KaraokeExtension> = {};

  filesArray.forEach((file) => {
    const baseName = getBaseName(file);

    if (!grouped[baseName]) {
      grouped[baseName] = {
        emk: undefined,
        midi: undefined,
        lyr: undefined,
        cur: undefined,
        mp3: undefined,
        mp4: undefined,
        ykr: undefined,
      };
    }

    const ext = file.name.split(".").pop()?.toLowerCase();

    switch (ext) {
      case "emk":
        grouped[baseName].emk = file;
        break;
      case "mid":
      case "midi":
        grouped[baseName].midi = file;
        break;
      case "lyr":
        grouped[baseName].lyr = file;
        break;
      case "cur":
        grouped[baseName].cur = file;
        break;
      case "mp3":
        grouped[baseName].mp3 = file;
        break;
      case "mp4":
        grouped[baseName].mp4 = file;
        break;
      case "ykr":
        grouped[baseName].ykr = file;
        break;
    }
  });

  return Object.values(grouped);
};
