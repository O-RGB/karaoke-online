import { INSTRUMENTS } from "@/config/value";
import {
  FaBell,
  FaBomb,
  FaChurch,
  FaCloud,
  FaCloudRain,
  FaDove,
  FaDrum,
  FaDrumSteelpan,
  FaGem,
  FaGhost,
  FaGuitar,
  FaHelicopter,
  FaKeyboard,
  FaMicrophone,
  FaMusic,
  FaPhone,
  FaRobot,
  FaSun,
  FaUsers,
  FaWater,
  FaWind,
} from "react-icons/fa";
import { FaHandsClapping } from "react-icons/fa6";
import { MdPiano } from "react-icons/md";

export function getIconInstruments(id: number) {
  const icon = INSTRUMENTS[id];
  if (icon) {
    switch (icon.icon) {
      case "FaBell":
        return { name: icon.name, icon: <FaBell /> };
      case "FaGuitar":
        return { name: icon.name, icon: <FaGuitar /> };
      case "FaMusic":
        return { name: icon.name, icon: <FaMusic /> };
      case "FaChurch":
        return { name: icon.name, icon: <FaChurch /> };
      case "FaKeyboard":
        return { name: icon.name, icon: <FaKeyboard /> };
      case "FaDrum":
        return { name: icon.name, icon: <FaDrum /> };
      case "FaUsers":
        return { name: icon.name, icon: <FaUsers /> };
      case "FaMicrophone":
        return { name: icon.name, icon: <FaMicrophone /> };
      case "FaCloudRain":
        return { name: icon.name, icon: <FaCloudRain /> };
      case "FaGem":
        return { name: icon.name, icon: <FaGem /> };
      case "FaCloud":
        return { name: icon.name, icon: <FaCloud /> };
      case "FaSun":
        return { name: icon.name, icon: <FaSun /> };
      case "FaGhost":
        return { name: icon.name, icon: <FaGhost /> };
      case "FaRobot":
        return { name: icon.name, icon: <FaRobot /> };
      case "FaDrumSteelpan":
        return { name: icon.name, icon: <FaDrumSteelpan /> };
      case "FaWind":
        return { name: icon.name, icon: <FaWind /> };
      case "FaWater":
        return { name: icon.name, icon: <FaWater /> };
      case "FaDove":
        return { name: icon.name, icon: <FaDove /> };
      case "FaPhone":
        return { name: icon.name, icon: <FaPhone /> };
      case "FaHelicopter":
        return { name: icon.name, icon: <FaHelicopter /> };
      case "FaHandsClapping":
        return { name: icon.name, icon: <FaHandsClapping /> };
      case "FaBomb":
        return { name: icon.name, icon: <FaBomb /> };
      case "MdPiano":
        return { name: icon.name, icon: <MdPiano /> };
      default:
        return null;
    }
  }
}
