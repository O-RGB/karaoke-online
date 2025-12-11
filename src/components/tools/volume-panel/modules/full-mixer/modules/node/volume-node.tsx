import React, { useEffect, useId, useState } from "react";
import ChannelVolumeRender from "../../../../renders/volume-meter";
import { SynthChannel } from "@/features/engine/modules/instrumentals/channel";
import { lowercaseToReadable } from "@/lib/general";
import { InstrumentType } from "@/features/engine/modules/instrumentals/types/node.type";
import SliderCommon from "@/components/common/input-data/slider";
import { InstrumentalNode } from "@/features/engine/modules/instrumentals/instrumental";
import WinboxModal from "@/components/common/modal";
import EQNode from "@/components/ui/eqnode";
import Button from "@/components/common/button/button";
import useConfigStore from "@/features/config/config-store";
import { EQConfig } from "@/features/engine/modules/equalizer/types/equalizer.type";

function connectToMIDIOutput(instrumental: InstrumentalNode) {
  // ตรวจสอบการรองรับ Web MIDI API
  if (!navigator.requestMIDIAccess) {
    console.error("Web MIDI API ไม่รองรับในเบราว์เซอร์นี้");
    return;
  }

  navigator
    .requestMIDIAccess()
    .then((midiAccess) => {
      // แสดงรายการ MIDI output ports ที่มีให้เลือก
      const outputs = Array.from(midiAccess.outputs.values());
      if (outputs.length === 0) {
        console.warn("ไม่พบ MIDI output ports");
        return;
      }

      // เชื่อมต่อกับ MIDI output port แรก (หรือให้ผู้ใช้เลือก)
      instrumental.connectMIDIOutput(outputs[0]);
    })
    .catch((error) => {
      console.error("เกิดข้อผิดพลาดในการเข้าถึง MIDI devices:", error);
    });
}

interface InstrumentalVolumeNodeProps {
  indexKey: number;
  type: InstrumentType;
  instrumental: InstrumentalNode;
}

const InstrumentalVolumeNode: React.FC<InstrumentalVolumeNodeProps> = ({
  indexKey,
  type,
  instrumental,
}) => {
  const componentId = useId();
  const [groupCh, setGroupCh] = useState<SynthChannel[]>([]);
  const [expression, setExpression] = useState<number>(100);
  const text = lowercaseToReadable(type);
  const config = useConfigStore((state) => state.config);
  const [eqConfig, setQeConfig] = useState<EQConfig>({
    enabled: false,
    gains: [0, 0, 0],
    boostLevel: 100,
    inputVolume: 1,
    outputVolume: 1,
    volumeCompensation: 1,
  });
  const [isOutput, setOutput] = useState<boolean>(false);

  const [eqOpen, setEqOpen] = useState<boolean>(false);

  const [open, setOpen] = useState<boolean>(false);
  const openEq = () => {
    setOpen(!open);
  };

  const onValueChange = (value: number) => {
    instrumental.setExpression(type, value, indexKey);
    setExpression(value);
  };

  const connectMIDI = () => {
    connectToMIDIOutput(instrumental);
  };

  useEffect(() => {
    instrumental.expression[indexKey].on(
      ["EXPRESSION", "CHANGE"],
      (v) => setExpression(v.value),
      componentId
    );
    instrumental.equalizer[indexKey].on(
      ["EQUALIZER", "CHANGE"],
      (v) => {
        console.log("setQeConfig(v.value)", v);
        setEqOpen(v.value.enabledEq);
        setQeConfig(v.value);
      },
      componentId
    );
    instrumental.linkEvent(
      [type, "CHANGE"],
      indexKey,
      (v: Map<number, SynthChannel>) => {
        setGroupCh(Array.from(v.values()));
      },
      componentId
    );
    return () => {
      instrumental.expression[indexKey].off(
        ["EXPRESSION", "CHANGE"],
        componentId
      );
      instrumental.equalizer[indexKey].off(
        ["EQUALIZER", "CHANGE"],
        componentId
      );
      instrumental.unlinkEvent([type, "CHANGE"], indexKey, componentId);
    };
  }, [indexKey, instrumental]);
  return (
    <>
      <WinboxModal
        onClose={() => setOpen(false)}
        title={text + " Equalizer"}
        width={400}
        isOpen={open}
      >
        <EQNode
          eqConfig={eqConfig}
          name={text}
          onEnabled={() => setEqOpen(true)}
          onDisabled={() => setEqOpen(false)}
          instrumental={instrumental}
          indexKey={indexKey}
          node={groupCh}
        ></EQNode>
      </WinboxModal>

      <div className="relative flex flex-col gap-2 min-w-12 w-12 max-w-12 overflow-hidden border-b pb-2">
        {/* {config.sound?.equalizer && (
          <Button
            size="xs"
            onClick={openEq}
            color={eqConfig.enabled ? "primary" : "white"}
          >
            EQ
          </Button>
        )} */}
        <div className="px-0.5">
          <div className="text-[10px] text-center break-all text-nowrap">
            {text}
          </div>
        </div>
        <div className="relative bg-black">
          <ChannelVolumeRender
            max={127}
            node={groupCh}
            className="z-0 w-full absolute bottom-0 left-0 h-full"
          ></ChannelVolumeRender>
          <div className="relative h-32 flex py-4 z-50">
            <SliderCommon
              max={127}
              value={expression}
              vertical
              className="m-auto"
              color="#ffffff"
              step={5}
              onChange={onValueChange}
            ></SliderCommon>
          </div>
        </div>
        <div className="p-0.5 ">
          <img
            src={`/icon/instrument/${type}.png`}
            className="w-[50px] h-[30px] object-contain"
            alt=""
          />
        </div>
      </div>
    </>
  );
};

export default InstrumentalVolumeNode;
