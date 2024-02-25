import { PropsWithChildren, useEffect, useState } from "react";
import useSynthesizer from "../../hooks/useSynthesizer";
import Midi from "../../interfaces/midi";
import SoundFont from "../../interfaces/soundfont";
import { wavFromAudioBuffer } from "../../utils/buffer.utils";
import { loadBinaryFromFile, loadBinaryFromURL } from "../../utils/file.utils";
import { MidiState, PlayerContext } from "./player-context";

export const PlayerProvider = ({ children }: PropsWithChildren) => {
  const { synthesizer } = useSynthesizer();

  // Midi and soundfont state.
  const [midi, setMidi] = useState<MidiState | null>(null);
  const [soundFont, setSoundFont] = useState<SoundFont | null>(null);
  const [lastFontLoaded, setLastFontLoaded] = useState<number | undefined>(-1);
  const [lyrics, setLyrics] = useState<string[] | null>(null);

  // Player state.
  const [playing, setPlaying] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [isRendering, setIsRendering] = useState(false);

  // Metadata.
  // const [bpm, setBPM] = useState(0);
  const [bpm, setBPM] = useState<number>(0);
  const [currentTick, setCurrentTick] = useState(0);
  const [totalTicks, setTotalTicks] = useState(0);

  // setting
  const [sound, setSoundSetting] = useState<IChannel[]>([
    {
      channel: 1,
      level: 127,
      instrumental: 0,
      callBack: () => {},
      velocity: 127,
    },
    {
      channel: 2,
      level: 127,
      instrumental: 0,
      callBack: () => {},
      velocity: 127,
    },
    {
      channel: 3,
      level: 127,
      instrumental: 0,
      callBack: () => {},
      velocity: 127,
    },
    {
      channel: 4,
      level: 127,
      instrumental: 0,
      callBack: () => {},
      velocity: 127,
    },
    {
      channel: 5,
      level: 127,
      instrumental: 0,
      callBack: () => {},
      velocity: 127,
    },
    {
      channel: 6,
      level: 127,
      instrumental: 0,
      callBack: () => {},
      velocity: 127,
    },
    {
      channel: 7,
      level: 127,
      instrumental: 0,
      callBack: () => {},
      velocity: 127,
    },
    {
      channel: 8,
      level: 127,
      instrumental: 0,
      callBack: () => {},
      velocity: 127,
    },
    {
      channel: 9,
      level: 127,
      instrumental: 0,
      callBack: () => {},
      velocity: 127,
    },
    {
      channel: 10,
      level: 127,
      instrumental: 0,
      callBack: () => {},
      velocity: 127,
    },
    {
      channel: 11,
      level: 127,
      instrumental: 0,
      callBack: () => {},
      velocity: 127,
    },
    {
      channel: 12,
      level: 127,
      instrumental: 0,
      callBack: () => {},
      velocity: 127,
    },
    {
      channel: 13,
      level: 127,
      instrumental: 0,
      callBack: () => {},
      velocity: 127,
    },
    {
      channel: 14,
      level: 127,
      instrumental: 0,
      callBack: () => {},
      velocity: 127,
    },
    {
      channel: 15,
      level: 127,
      instrumental: 0,
      callBack: () => {},
      velocity: 127,
    },
    {
      channel: 16,
      level: 127,
      instrumental: 0,
      callBack: () => {},
      velocity: 127,
    },
  ]);

  // Check if the source is a file.
  const isFile = (source: Midi | SoundFont | File): source is File => {
    return source instanceof File;
  };

  // Load the buffer from the source.
  const loadBuffer = async (source: Midi | SoundFont | File) => {
    if (isFile(source)) {
      return loadBinaryFromFile(source);
    } else {
      return loadBinaryFromURL(source.url);
    }
  };

  const loadLyrics = async (lyrics: File) => {
    if (lyrics) {
      setLyrics(null);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const contentArrayBuffer = e.target.result;
        const decoder = new TextDecoder("windows-874");
        const contentUtf8 = decoder.decode(contentArrayBuffer);
        const lines = contentUtf8.split("\r\n");
        setLyrics(lines);
      };
      reader.readAsArrayBuffer(lyrics);
    }
  };

  // Load the midi file.
  const loadMidi = async (resource: Midi | File) => {
    const buffer = await loadBuffer(resource);
    const midi: Midi = isFile(resource)
      ? { author: "unknown", url: "", name: resource.name }
      : resource;

    if (buffer) {
      await synthesizer?.resetPlayer();
      await synthesizer?.addSMFDataToPlayer(buffer);

      // const bpm = await synthesizer?.retrievePlayerBpm();
      // console.log(synthesizer);
      // console.log(bpm, "in load midi");
      // setBPM(bpm || 0);

      setMidi({ midi, buffer });
      return true;
    } else {
      return false;
    }
  };

  // Load the soundfont.
  const loadSoundFont = async (resource: SoundFont | File) => {
    if (lastFontLoaded !== -1 && lastFontLoaded !== undefined) {
      await synthesizer?.unloadSFontAsync(lastFontLoaded);
    }

    const buffer = await loadBuffer(resource);
    if (buffer) {
      const soundFont: SoundFont = isFile(resource)
        ? { url: "", name: resource.name }
        : resource;
      const font = await synthesizer?.loadSFont(buffer);
      setLastFontLoaded(font);
      setSoundFont(soundFont);
    }
  };

  const updateLevelControl = (channel: number, level: number) => {
    let clone = sound;
    clone[channel].level = level;
    setSoundSetting(clone);
  };

  const updateVelocityControl = (channel: number, velocity: number) => {
    let clone = sound;
    clone[channel].velocity = velocity;
    setSoundSetting(clone);
  };
  const updateInstrumentalControl = (channel: number, instrumental: number) => {
    let clone = sound;
    clone[channel].instrumental = instrumental;
    setSoundSetting(clone);
  };

  const resetLevelControl = () => {
    let clone = sound;
    clone.map((con) => (con.level = 127));
    setSoundSetting(clone);
  };

  const initCallBackControl = (channel: number, callBack: any) => {
    let clone = sound;
    clone[channel].callBack = callBack;
    setSoundSetting(clone);
  };

  // Seek the player to the given tick.
  const seekPlayer = (tick: number) => {
    console.log("tick", tick);
    synthesizer?.seekPlayer(tick);
    setCurrentTick(tick);
  };

  // Get the duration of the midi file.
  const getMidiDuration = () => {
    return (totalTicks / (bpm * 1000)) * 60;
  };

  // Allocate a new audio buffer.
  const buffAlloc = (
    duration: number,
    numberOfChannels: number,
    sampleRate: number
  ) => {
    const length = duration * sampleRate;
    return new AudioBuffer({ length, sampleRate, numberOfChannels });
  };

  // Render the player.
  const render = async () => {
    //setIsRendering(true);
    // seekPlayer(0);

    const bpm = (await synthesizer?.retrievePlayerBpm()) || 0;
    const ticks = (await synthesizer?.retrievePlayerTotalTicks()) || 0;
    const tempo = (await synthesizer?.retrievePlayerMIDITempo()) || 0;

    // const node = synthesizer?.createAudioNode(new AudioContext(), 8192);
    // const ctx = node?.context;
    // const sampleRate = ctx?.sampleRate || 44100;

    console.log("BPM:", bpm);
    console.log("Ticks:", ticks);
    // console.log("Sample Rate:", sampleRate);
    console.log("Tempo:", tempo);

    const duration = getMidiDuration();
    console.log("Duration:", duration);
    // const buffer = buffAlloc(duration, 2, sampleRate);
    // synthesizer?.render(buffer);

    // const wav = wavFromAudioBuffer(buffer);
    // const url = URL.createObjectURL(wav);

    const link = document.createElement("a");
    // link.href = url;
    link.download = "audio.wav";
    link.click();

    // setIsRendering(false);
  };

  // Reset the player when a new midi or soundfont is loaded.
  useEffect(() => {
    setPlaying(false);
    setCurrentTick(0);
  }, [midi, soundFont]);

  const testData = async (synthesizer: any) => {
    const _bpm = (await synthesizer?.retrievePlayerBpm()) || 0;
    const ticks = (await synthesizer?.retrievePlayerTotalTicks()) || 0;
    const tempo = (await synthesizer?.retrievePlayerMIDITempo()) || 0;

    const duration = (ticks / (_bpm * 1000)) * 60;
    setBPM(_bpm);
    // console.log("_bpm:", _bpm);
  };

  useEffect(() => {
    if (playing) {
      // resetLevelControl();
      // synthesizer?.setReverbOn(true)
      synthesizer?.hookPlayerMIDIEvents(function (s, type, event) {
        if (!bpm) {
        }
        testData(s);
        // if (event.getChannel() == 12) {
        console.log("TYPE == " + type);
        console.log("getChannel", event.getChannel());
        console.log("getValue", event.getValue());
        console.log("getVelocity", event.getVelocity());
        console.log("getControl", event.getControl());
        console.log("getProgram", event.getProgram());
        console.log("###########");
        // }

        const conrtol = event.getControl();
        const channel = event.getChannel();

        if (type === 192) {
          // เครื่องดนตรี
          updateInstrumentalControl(channel, event.getProgram());
        } else if (type == 176) {
          if (conrtol == 7) {
            //ระดับเสียง
            let getData = sound[channel];
            if (getData) {
              updateLevelControl(channel, event.getValue());
            }
          } else if (conrtol == 10) {
            // updateVelocityControl(channel, event.getVelocity());
          }
        }
        let nomalValue = event.getValue();
        let nomalVelocity = event.getVelocity();
        let ch = event.getChannel();

        let getData = sound[ch];
        if (getData) {
          let nValue = Math.ceil(
            (((nomalValue * nomalVelocity) / 127) * getData.level) / 100
          );
          event.setValue(nomalValue * (getData.level / 127));

          if(nomalVelocity == 0){
            event.setVelocity(0)
          }

          sound[ch].callBack(nValue);
        }
        return false;
      });
    } else {
      setBPM(0);
    }
  }, [playing, sound]);

  // Play or stop the player when the playing state changes.
  useEffect(() => {
    if (playing) {
      synthesizer?.seekPlayer(currentTick);
      synthesizer?.playPlayer();
    } else {
      synthesizer?.stopPlayer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  // Update the position of the player every second.
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!synthesizer) return;

      const totalTicks = await synthesizer?.retrievePlayerTotalTicks();
      setTotalTicks(totalTicks || 0);

      if (!playing) return;

      const currentTick = await synthesizer?.retrievePlayerCurrentTick();
      setCurrentTick(currentTick || 0);

      if (currentTick === undefined || currentTick >= totalTicks) {
        if (repeat) {
          seekPlayer(0);
          synthesizer?.playPlayer();
        } else {
          setPlaying(false);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [synthesizer, repeat, playing]);

  return (
    <PlayerContext.Provider
      value={{
        loadMidi,
        loadSoundFont,
        midi,
        playing,
        currentTick,
        totalTicks,
        seek: seekPlayer,
        settingSound: updateLevelControl,
        setSoundFun: initCallBackControl,
        setPlaying,
        sound,
        soundFont,
        repeat,
        setRepeat,
        render,
        isRendering,
        loadLyrics,
        lyrics,
        bpm,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
